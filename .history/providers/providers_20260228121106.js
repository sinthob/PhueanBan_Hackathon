/**
 * providers/providers.js  ← รวม AuthProvider.js + LonelinessProvider.js เข้าด้วยกัน
 *
 * Export:
 *   - AuthProvider      + useAuth()
 *   - LonelinessProvider + useLoneliness()
 *   - AppProviders      (wrapper ครอบทั้งสองพร้อมกัน — ใช้ใน _layout.js)
 *
 * การใช้งานใน app/_layout.js:
 *   import { AppProviders } from '../providers/providers';
 *   <AppProviders>{children}</AppProviders>
 *
 * หรือถ้าอยากแยก:
 *   import { AuthProvider, useAuth } from '../providers/providers';
 *   import { LonelinessProvider, useLoneliness } from '../providers/providers';
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { supabase } from '../lib/supabase';
import {
  computeLonelinessScore,
  computeTrend,
  buildCaregiverAlerts,
  readBehaviorSnapshot,
  savePreviousScore,
  trackAppOpen,
  trackSessionEnd,
} from '../loneliness/loneliness';

// ══════════════════════════════════════════════
// AUTH PROVIDER
// ══════════════════════════════════════════════

const AuthContext = createContext(null);

async function fetchProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

async function ensureProfileFromMetadata(session) {
  const userId = session?.user?.id ?? null;
  if (!userId) return null;

  const meta = session?.user?.user_metadata ?? {};
  const metaRole = meta?.role ?? null;
  if (metaRole !== 'elder' && metaRole !== 'caregiver') return null;

  const profileName = typeof meta?.profile_name === 'string' ? meta.profile_name.trim() : '';
  const avatarUrl = typeof meta?.avatar_url === 'string' ? meta.avatar_url.trim() : '';

  const payload = {
    id: userId,
    email: session?.user?.email ?? null,
    role: metaRole,
    profile_name: profileName || null,
    display_name: profileName || null,
    avatar_url: avatarUrl || null,
    health_category: meta?.health_category ?? null,
    activity_interests: Array.isArray(meta?.activity_interests) ? meta.activity_interests : [],
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, role, display_name, created_at, updated_at')
    .single();
  if (error) throw error;
  return data;
}

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Init session
  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        if (mounted) { setInitialized(true); setSession(null); }
        return;
      }
      if (!mounted) return;
      setSession(data.session ?? null);
      setInitialized(true);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Load profile on session change
  useEffect(() => {
    let mounted = true;
    const userId = session?.user?.id ?? null;

    async function load() {
      setProfileError(null);
      if (!userId) { setProfile(null); return; }
      setProfileLoading(true);
      try {
        const nextProfile = await fetchProfile(userId);
        if (nextProfile) {
          if (mounted) setProfile(nextProfile);
          return;
        }

        // If email confirmation is enabled, users may reach the app with a session
        // but without a profiles row yet. If signup stored metadata, provision here.
        const provisioned = await ensureProfileFromMetadata(session);
        if (mounted) setProfile(provisioned);
      } catch (err) {
        if (mounted) { setProfile(null); setProfileError(err); }
      } finally {
        if (mounted) setProfileLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [session?.user?.id]);

  const value = useMemo(() => {
    const user = session?.user ?? null;
    return {
      initialized, session, user,
      profile, profileLoading, profileError,

      async signInWithPassword({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      },

      async signUp({ email, password, options } = {}) {
        const { data, error } = await supabase.auth.signUp({ email, password, options });
        if (error) throw error;
        return data;
      },

      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },

      async upsertProfileRole(role, { displayName } = {}) {
        const userId = user?.id;
        if (!userId) throw new Error('Not signed in');
        const payload = {
          id: userId,
          role,
          display_name: displayName ?? null,
          updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' })
          .select('id, role, display_name, created_at, updated_at')
          .single();
        if (error) throw error;
        setProfile(data);
        return data;
      },

      async refreshProfile() {
        const userId = user?.id;
        if (!userId) { setProfile(null); return null; }
        const nextProfile = await fetchProfile(userId);
        setProfile(nextProfile);
        return nextProfile;
      },
    };
  }, [initialized, session, profile, profileLoading, profileError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

// ══════════════════════════════════════════════
// LONELINESS PROVIDER
// ══════════════════════════════════════════════

/**
 * Context ที่รัน AI Loneliness Engine เบื้องหลัง
 *
 * — ผู้ใช้ (elder) ไม่เห็น score นี้เลย
 * — ผู้ดูแล (caregiver) อ่าน score ผ่าน useLoneliness()
 * — Engine รัน:
 *     1) ทันทีที่ provider mount
 *     2) ทุก 30 นาที (interval)
 *     3) เมื่อ refreshScore() ถูกเรียก
 */

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 นาที

const LonelinessContext = createContext({
  score: null,
  riskLevel: null,
  trend: 'stable',
  caregiverAlerts: [],
  factors: null,
  loading: true,
  lastCalculatedAt: null,
  refreshScore: async () => {},
});

export function LonelinessProvider({ children }) {
  const [score, setScore] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [trend, setTrend] = useState('stable');
  const [caregiverAlerts, setCaregiverAlerts] = useState([]);
  const [factors, setFactors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCalculatedAt, setLastCalculatedAt] = useState(null);

  const intervalRef = useRef(null);
  const sessionStartRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);

  const calculate = useCallback(async () => {
    try {
      const snap = await readBehaviorSnapshot();
      const result = computeLonelinessScore(snap);
      const trendValue = computeTrend(result.score, snap.previousScore);
      const alerts = buildCaregiverAlerts({ ...result, factors: result.factors });

      setScore(result.score);
      setRiskLevel(result.riskLevel);
      setTrend(trendValue);
      setCaregiverAlerts(alerts);
      setFactors(result.factors);
      setLastCalculatedAt(new Date().toISOString());

      await savePreviousScore(result.score);
    } catch (_) {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshScore = useCallback(async () => {
    setLoading(true);
    await calculate();
  }, [calculate]);

  // Mount: track app open + initial calculation + interval
  useEffect(() => {
    trackAppOpen();
    calculate();
    intervalRef.current = setInterval(calculate, REFRESH_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [calculate]);

  // AppState: track session duration
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (appStateRef.current.match(/active/) && nextState.match(/inactive|background/)) {
        const durationMin = (Date.now() - sessionStartRef.current) / (1000 * 60);
        await trackSessionEnd(durationMin);
      }
      if (nextState === 'active') {
        sessionStartRef.current = Date.now();
        await trackAppOpen();
        calculate();
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, [calculate]);

  return (
    <LonelinessContext.Provider
      value={{ score, riskLevel, trend, caregiverAlerts, factors, loading, lastCalculatedAt, refreshScore }}
    >
      {children}
    </LonelinessContext.Provider>
  );
}

/** ใช้ใน caregiver screen เท่านั้น */
export function useLoneliness() {
  return useContext(LonelinessContext);
}

// ══════════════════════════════════════════════
// APP PROVIDERS — ครอบทั้งสองพร้อมกัน
// ══════════════════════════════════════════════

/**
 * ใช้แทน AuthProvider + LonelinessProvider ใน app/_layout.js
 *
 * @example
 * import { AppProviders } from '../providers/providers';
 * <AppProviders><Stack /></AppProviders>
 */
export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <LonelinessProvider>
        {children}
      </LonelinessProvider>
    </AuthProvider>
  );
}