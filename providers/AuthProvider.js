import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

async function fetchProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    // If RLS is misconfigured you will see it here.
    throw error;
  }

  return data ?? null;
}

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        // Still mark as initialized so UI can show an error.
        if (mounted) {
          setInitialized(true);
          setSession(null);
        }
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

  useEffect(() => {
    let mounted = true;
    const userId = session?.user?.id ?? null;

    async function load() {
      setProfileError(null);
      if (!userId) {
        setProfile(null);
        return;
      }

      setProfileLoading(true);
      try {
        const nextProfile = await fetchProfile(userId);
        if (mounted) setProfile(nextProfile);
      } catch (err) {
        if (mounted) {
          setProfile(null);
          setProfileError(err);
        }
      } finally {
        if (mounted) setProfileLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  const value = useMemo(() => {
    const user = session?.user ?? null;

    return {
      initialized,
      session,
      user,

      profile,
      profileLoading,
      profileError,

      async signInWithPassword({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return data;
      },

      async signUp({ email, password }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
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
        if (!userId) {
          setProfile(null);
          return null;
        }
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
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
