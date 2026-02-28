/**
 * caregiver/index.js
 *
 * หน้า Dashboard ของผู้ดูแล (caregiver)
 * แสดง Loneliness Score + Alerts ที่ AI คำนวณเบื้องหลัง
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useAuth, useLoneliness } from '../providers/providers';
import { WarmClearTheme as T } from '../theme';

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function ScoreRing({ score, riskLevel }) {
  const color = riskLevel === 'safe'
    ? T.colors.primary
    : riskLevel === 'watch'
      ? '#D97706'   // amber-600
      : T.colors.danger;

  const bgColor = riskLevel === 'safe'
    ? T.colors.primarySoft
    : riskLevel === 'watch'
      ? '#FFFBEB'
      : T.colors.dangerSoft;

  const label = riskLevel === 'safe'
    ? 'ปลอดภัย'
    : riskLevel === 'watch'
      ? 'เฝ้าระวัง'
      : 'ต้องการความช่วยเหลือ';

  return (
    <View style={[styles.ringWrap, { backgroundColor: bgColor }]}>
      <Text style={[styles.ringScore, { color }]}>
        {score ?? '—'}
      </Text>
      <Text style={styles.ringMax}>/100</Text>
      <View style={[styles.ringBadge, { backgroundColor: color }]}>
        <Text style={styles.ringBadgeText}>{label}</Text>
      </View>
    </View>
  );
}

function TrendBadge({ trend }) {
  const map = {
    improving: { label: 'ดีขึ้น', icon: 'trending-down', color: T.colors.primary },
    stable: { label: 'คงที่', icon: 'remove', color: T.colors.textMuted },
    worsening: { label: 'แย่ลง', icon: 'trending-up', color: T.colors.danger },
  };
  const item = map[trend] ?? map.stable;

  return (
    <View style={[styles.trendPill, { borderColor: item.color + '40' }]}>
      <Ionicons name={item.icon} size={16} color={item.color} />
      <Text style={[styles.trendText, { color: item.color }]}>{item.label}</Text>
    </View>
  );
}

function FactorBar({ label, value }) {
  // value: 0.0–1.0 (0 = ดี, 1 = แย่สุด)
  const pct = Math.round((value ?? 0) * 100);
  const barColor = pct < 40
    ? T.colors.primary
    : pct < 65
      ? '#D97706'
      : T.colors.danger;

  return (
    <View style={styles.factorRow}>
      <Text style={styles.factorLabel}>{label}</Text>
      <View style={styles.factorBarBg}>
        <View style={[styles.factorBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.factorPct, { color: barColor }]}>{pct}%</Text>
    </View>
  );
}

function AlertCard({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <View style={styles.alertCardSafe}>
        <Ionicons name="checkmark-circle" size={22} color={T.colors.primary} />
        <Text style={styles.alertSafeText}>ไม่มีสัญญาณน่าเป็นห่วงในขณะนี้</Text>
      </View>
    );
  }

  return (
    <View style={styles.alertCardWarn}>
      <View style={styles.alertHeaderRow}>
        <Ionicons name="warning" size={20} color={T.colors.danger} />
        <Text style={styles.alertTitle}>สัญญาณที่ตรวจพบ</Text>
      </View>
      {alerts.map((a, i) => (
        <View key={i} style={styles.alertItem}>
          <View style={styles.alertDot} />
          <Text style={styles.alertText}>{a}</Text>
        </View>
      ))}
    </View>
  );
}

// ──────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────

export default function CaregiverDashboard() {
  const { signOut } = useAuth();
  const {
    score,
    riskLevel,
    trend,
    caregiverAlerts,
    factors,
    loading,
    lastCalculatedAt,
    refreshScore,
  } = useLoneliness();

  const lastCalcText = lastCalculatedAt
    ? new Date(lastCalculatedAt).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  // mock elder name (จริงๆ ดึงจาก profile relationship)
  const elderName = 'คุณสมศรี (ผู้ดูแล)';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <LinearGradient
        colors={[T.colors.primary, T.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>แดชบอร์ดผู้ดูแล</Text>
            <Text style={styles.heroSubtitle}>{elderName}</Text>
          </View>
          <Pressable
            onPress={signOut}
            style={styles.signOutBtn}
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.9)" />
          </Pressable>
        </View>

        <View style={styles.heroMeta}>
          <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.65)" />
          <Text style={styles.heroMetaText}>
            AI อัปเดตล่าสุด {lastCalcText}
          </Text>
          <Pressable
            onPress={refreshScore}
            disabled={loading}
            style={styles.refreshBtn}
          >
            <Ionicons
              name="refresh"
              size={16}
              color={loading ? 'rgba(255,255,255,0.4)' : '#ffffff'}
            />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Score card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeaderRow}>
          <Text style={styles.scoreCardTitle}>Loneliness Score</Text>
          <TrendBadge trend={trend} />
        </View>
        <Text style={styles.scoreCardSub}>
          ยิ่งสูงยิ่งเสี่ยง — คำนวณจากพฤติกรรมการใช้งานแอปเบื้องหลัง
        </Text>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={T.colors.primary} />
            <Text style={styles.loadingText}>กำลังวิเคราะห์…</Text>
          </View>
        ) : (
          <ScoreRing score={score} riskLevel={riskLevel} />
        )}
      </View>

      {/* Factor breakdown */}
      {!loading && score != null ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>วิเคราะห์ปัจจัย</Text>
          <Text style={styles.cardSub}>
            ค่ายิ่งสูง = ปัจจัยนั้นส่งผลเชิงลบมากขึ้น
          </Text>

          <View style={styles.factorList}>
            <FactorBar label="ความไม่ได้ใช้งานแอป (35%)"     value={factors?.inactivity ?? 0} />
            <FactorBar label="พลาด Check-in ติดต่อกัน (30%)"  value={factors?.checkinMiss ?? 0} />
            <FactorBar label="เวลาใช้งานต่อครั้งลดลง (20%)"   value={factors?.sessionDrop ?? 0} />
            <FactorBar label="กิจกรรมชุมชนลดลง (15%)"         value={factors?.activityDrop ?? 0} />
          </View>

          <View style={styles.formulaBox}>
            <Text style={styles.formulaTitle}>สูตรคำนวณ (Hybrid Rule)</Text>
            <Text style={styles.formulaBody}>
              Score = 0.35×inactivity + 0.30×missed_checkin
            </Text>
            <Text style={styles.formulaBody}>
              {'       '}+ 0.20×session_drop + 0.15×activity_drop
            </Text>
          </View>
        </View>
      ) : null}

      {/* Alerts */}
      {!loading ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>การแจ้งเตือน</Text>
          <AlertCard alerts={caregiverAlerts} />
        </View>
      ) : null}

      {/* Action */}
      {!loading && riskLevel === 'alert' ? (
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>แนะนำให้ดำเนินการ</Text>
          <Text style={styles.actionBody}>
            Score อยู่ในระดับวิกฤต ควรติดต่อหรือไปเยี่ยมโดยเร็ว
          </Text>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="call" size={18} color="#ffffff" />
              <Text style={styles.actionBtnText}>โทรหาเลย</Text>
            </Pressable>
            <Pressable style={styles.actionBtnSecondary}>
              <Ionicons name="chatbubble-outline" size={18} color={T.colors.primary} />
              <Text style={styles.actionBtnSecondaryText}>ส่งข้อความ</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Note */}
      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>ความเป็นส่วนตัว</Text>
        <Text style={styles.noteBody}>
          Score นี้คำนวณเฉพาะจากพฤติกรรมการใช้แอป ไม่อ่านเนื้อหาการสนทนา
          ผู้สูงอายุจะไม่เห็น score นี้
        </Text>
      </View>
    </ScrollView>
  );
}

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.colors.background,
  },
  content: {
    paddingBottom: 80,
  },

  // Hero
  hero: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...T.shadows.bar,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.80)',
    fontWeight: '700',
  },
  signOutBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 4,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  heroMetaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '700',
    flex: 1,
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // Score card
  scoreCard: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: T.colors.surface,
    borderRadius: T.radii.card,
    padding: 20,
    borderWidth: 1,
    borderColor: T.colors.border,
    ...T.shadows.card,
  },
  scoreHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scoreCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: T.colors.text,
  },
  scoreCardSub: {
    fontSize: 14,
    color: T.colors.textMuted,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 20,
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: T.colors.textMuted,
    fontWeight: '700',
  },

  // Ring
  ringWrap: {
    alignSelf: 'center',
    borderRadius: 80,
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  ringScore: {
    fontSize: 52,
    fontWeight: '900',
    lineHeight: 58,
  },
  ringMax: {
    fontSize: 16,
    fontWeight: '700',
    color: T.colors.textMuted,
  },
  ringBadge: {
    marginTop: 8,
    borderRadius: T.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  ringBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },

  // Trend
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: T.radii.pill,
    borderWidth: 1,
    backgroundColor: T.colors.surface,
    ...T.shadows.subtle,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '900',
  },

  // Card
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: T.colors.surface,
    borderRadius: T.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: T.colors.border,
    ...T.shadows.card,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: T.colors.text,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: T.colors.textMuted,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 16,
  },

  // Factor bars
  factorList: {
    gap: 12,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  factorLabel: {
    fontSize: 13,
    color: T.colors.textMuted,
    fontWeight: '700',
    width: 190,
  },
  factorBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: T.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  factorPct: {
    fontSize: 13,
    fontWeight: '900',
    width: 36,
    textAlign: 'right',
  },

  // Formula
  formulaBox: {
    marginTop: 16,
    backgroundColor: T.colors.surfaceSoft,
    borderRadius: T.radii.card,
    padding: 12,
    borderWidth: 1,
    borderColor: T.colors.border,
  },
  formulaTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: T.colors.textMuted,
    marginBottom: 6,
  },
  formulaBody: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: T.colors.primaryDark,
    fontWeight: '700',
    lineHeight: 20,
  },

  // Alerts
  alertCardSafe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: T.colors.primarySoft,
    borderRadius: T.radii.card,
    borderWidth: 1,
    borderColor: T.colors.primarySoftBorder,
    marginTop: 8,
  },
  alertSafeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: T.colors.primaryDark,
  },
  alertCardWarn: {
    marginTop: 8,
    padding: 14,
    backgroundColor: T.colors.dangerSoft,
    borderRadius: T.radii.card,
    borderWidth: 1,
    borderColor: T.colors.dangerSoftBorder,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: T.colors.danger,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  alertDot: {
    marginTop: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.colors.danger,
    flexShrink: 0,
  },
  alertText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: T.colors.danger,
    lineHeight: 22,
  },

  // Action
  actionCard: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: T.colors.dangerSoft,
    borderRadius: T.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: T.colors.dangerSoftBorder,
    ...T.shadows.card,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: T.colors.danger,
    marginBottom: 6,
  },
  actionBody: {
    fontSize: 15,
    fontWeight: '700',
    color: T.colors.danger,
    lineHeight: 22,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: T.colors.danger,
    borderRadius: T.radii.control,
    paddingVertical: 14,
    minHeight: 48,
    ...T.shadows.button,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: T.colors.surface,
    borderRadius: T.radii.control,
    paddingVertical: 14,
    minHeight: 48,
    borderWidth: 1,
    borderColor: T.colors.border,
    ...T.shadows.subtle,
  },
  actionBtnSecondaryText: {
    fontSize: 16,
    fontWeight: '900',
    color: T.colors.primary,
  },

  // Note
  noteBox: {
    margin: 16,
    backgroundColor: T.colors.warningSoft,
    borderRadius: T.radii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: T.colors.warningSoftBorder,
    ...T.shadows.subtle,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: T.colors.warningText,
    marginBottom: 4,
  },
  noteBody: {
    fontSize: 14,
    fontWeight: '700',
    color: T.colors.warningText,
    lineHeight: 20,
  },
});