/**
 * caregiver/index.js
 *
 * หน้า Dashboard ของผู้ดูแล (caregiver)
 * แสดง Loneliness Score + Alerts ที่ AI คำนวณเบื้องหลัง
 * Theme: ตาม design - header ขาว, cards teal อ่อน, ปุ่มเหลือง
 */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../providers/AuthProvider';
import { useLoneliness } from '../providers/LonelinessProvider';
import { WarmClearTheme as T } from '../theme';

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function ScoreRing({ score, riskLevel }) {
  const color = riskLevel === 'safe'
    ? '#2ABFAC'  // teal
    : riskLevel === 'watch'
      ? '#F59E0B'   // yellow-600
      : '#E05A1E';  // orange-red

  const bgColor = riskLevel === 'safe'
    ? '#C8EEE9'  // teal อ่อน
    : riskLevel === 'watch'
      ? '#FFF3CD'  // yellow อ่อน
      : '#FFE5E5';  // red อ่อน

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
      <Text style={styles.ringLabel}>คะแนนความเหงา</Text>
      <View style={[styles.ringBadge, { backgroundColor: color }]}>
        <Text style={styles.ringBadgeText}>{label}</Text>
      </View>
    </View>
  );
}

function TrendPill({ trend }) {
  if (!trend || trend === 'stable') return null;
  
  const isUp = trend === 'up';
  const color = isUp ? '#E05A1E' : '#2ABFAC';
  const borderColor = isUp ? '#FFE5E5' : '#C8EEE9';
  const icon = isUp ? 'trending-up' : 'trending-down';
  const text = isUp ? 'เพิ่มขึ้น' : 'ลดลง';

  return (
    <View style={[styles.trendPill, { borderColor }]}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.trendText, { color }]}>{text}</Text>
    </View>
  );
}

function ActivityCard({ activity }) {
  const {
    title,
    time,
    location,
    description,
    participants,
    maxParticipants,
    difficulty,
    tags = [],
    icon = '🏃',
  } = activity;

  return (
    <View style={styles.activityCard}>
      {/* Hero gradient with icon */}
      <LinearGradient
        colors={['#C8EEE9', '#E0F5F2']}
        style={styles.activityHero}
      >
        <Text style={styles.activityIcon}>{icon}</Text>
      </LinearGradient>

      {/* Content */}
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{title}</Text>
          <Text style={styles.activityTime}>เวลา {time}</Text>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        <Text style={styles.activityDesc}>{description}</Text>

        {/* Location */}
        <View style={styles.activityLocation}>
          <Ionicons name="location" size={16} color="#2ABFAC" />
          <Text style={styles.activityLocationText}>{location}</Text>
        </View>

        {/* Info Grid */}
        <View style={styles.activityInfoGrid}>
          <View style={styles.activityInfoItem}>
            <Text style={styles.infoLabel}>ผู้เข้าร่วม</Text>
            <Text style={styles.infoValue}>{participants}/{maxParticipants}</Text>
          </View>
          <View style={styles.activityInfoItem}>
            <Text style={styles.infoLabel}>ระดับ</Text>
            <Text style={styles.infoValue}>{difficulty}</Text>
          </View>
        </View>

        {/* Register Button */}
        <Pressable style={styles.registerButton}>
          <Text style={styles.registerButtonText}>ลงทะเบียน</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AlertItem({ alert }) {
  const iconMap = {
    warning: 'warning',
    info: 'information-circle',
    critical: 'alert-circle',
  };

  const colorMap = {
    warning: '#F59E0B',
    info: '#2ABFAC',
    critical: '#E05A1E',
  };

  const bgMap = {
    warning: '#FFF3CD',
    info: '#C8EEE9',
    critical: '#FFE5E5',
  };

  const icon = iconMap[alert.severity] || 'information-circle';
  const color = colorMap[alert.severity] || '#2ABFAC';
  const bg = bgMap[alert.severity] || '#C8EEE9';

  return (
    <View style={[styles.alertItem, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={24} color={color} />
      <View style={styles.alertContent}>
        <Text style={[styles.alertTitle, { color }]}>{alert.title}</Text>
        <Text style={styles.alertMessage}>{alert.message}</Text>
        <Text style={styles.alertTime}>{alert.timestamp}</Text>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const { scoreData, alerts, loading, refetch } = useLoneliness();

  const score = scoreData?.lonelinessScore;
  const riskLevel = scoreData?.riskLevel || 'safe';
  const trend = scoreData?.trend;
  const factors = scoreData?.factors || [];

  // Mock activities สำหรับ demo
  const mockActivities = [
    {
      id: 1,
      title: 'วิ่งเช้าสวนลุม',
      time: '07:00 - 09:00 น.',
      location: 'สวนสุขภัย',
      description: 'เดินชมธรรมชาติ ออกซิเจนเต็มปอด พูดคุยแลกเปลี่ยน',
      participants: 5,
      maxParticipants: 10,
      difficulty: 'ง่าย',
      tags: ['เหมาะมือใหม่', 'ฟรี', 'กลุ่มเล็ก'],
      icon: '🏃',
    },
    {
      id: 2,
      title: 'เต้นบุญร่วมกัน',
      time: '08:00 - 09:00 น.',
      location: 'ปทุมวันมารามฯ',
      description: 'ทำบุญให้ชีวิตใส เดิมจากรมใช้โม่ พูดคุยเรื่องธรรม',
      participants: 3,
      maxParticipants: 5,
      difficulty: 'ง่าย',
      tags: ['เหมาะมือใหม่', 'ฟรี', 'กลุ่มเล็ก'],
      icon: '🧘',
    },
    {
      id: 3,
      title: 'เต้นลีลาศ',
      time: '08:00 - 09:00 น.',
      location: 'บ้านคลาง',
      description: 'ทำบุญให้ชีวิตใส เดิมจากรมใช้โม่ พูดคุยเรื่องธรรม',
      participants: 8,
      maxParticipants: 15,
      difficulty: 'ปานกลาง',
      tags: ['เหมาะมือใหม่', 'ฟรี'],
      icon: '💃',
    },
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={T.colors.primary} />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header - ขาวตามภาพ */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👴</Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome 👋</Text>
              <Text style={styles.userName}>สบาย ใจดี</Text>
            </View>
          </View>
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color={T.colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>กิจกรรมใกล้ฉัน</Text>
      </View>

      {/* Activities */}
      <View style={styles.activitiesSection}>
        {mockActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </View>

      {/* Original Score Section - ซ่อนไว้ก่อน */}
      {false && (
        <>
          {/* Score Ring */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreSectionHeader}>
              <Text style={styles.scoreSectionTitle}>สถานะความเหงา</Text>
              <TrendPill trend={trend} />
            </View>
            <ScoreRing score={score} riskLevel={riskLevel} />
          </View>

          {/* Factors */}
          {factors.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>ปัจจัยที่มีผล</Text>
              <Text style={styles.cardSub}>
                ระบบวิเคราะห์จากพฤติกรรมการใช้แอปและกิจกรรมต่างๆ
              </Text>
              <View style={styles.factorList}>
                {factors.map((f, idx) => {
                  const pct = Math.round(f.weight * 100);
                  const color = f.impact === 'positive' ? T.colors.primary : T.colors.danger;
                  return (
                    <View key={idx} style={styles.factorRow}>
                      <Text style={styles.factorLabel}>{f.factor}</Text>
                      <View style={styles.factorBarBg}>
                        <View
                          style={[styles.factorBarFill, { width: `${pct}%`, backgroundColor: color }]}
                        />
                      </View>
                      <Text style={[styles.factorPct, { color }]}>{pct}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Alerts */}
          {alerts.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>การแจ้งเตือน</Text>
              <Text style={styles.cardSub}>ข้อมูลเชิงลึกจากการวิเคราะห์</Text>
              <View style={styles.alertList}>
                {alerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

// ──────────────────────────────────────────────
// Styles - ปรับตามภาพ
// ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.colors.background,
  },
  content: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.colors.background,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: T.colors.textMuted,
    fontWeight: '700',
  },

  // Header - ขาว
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD84D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
  },
  welcomeText: {
    fontSize: 16,
    color: T.colors.textMuted,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    color: T.colors.text,
    fontWeight: '900',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title Section
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: T.colors.text,
  },

  // Activities Section
  activitiesSection: {
    paddingHorizontal: 16,
    gap: 16,
  },

  // Activity Card - teal อ่อนตามภาพ
  activityCard: {
    backgroundColor: '#C8EEE9',  // teal อ่อน
    borderRadius: 20,
    overflow: 'hidden',
    ...T.shadows.card,
  },
  activityHero: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 48,
  },
  activityContent: {
    padding: 16,
    backgroundColor: '#C8EEE9',
  },
  activityHeader: {
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: T.colors.text,
    marginBottom: 6,
  },
  activityTime: {
    fontSize: 16,
    fontWeight: '700',
    color: T.colors.textSub,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '700',
    color: T.colors.textSub,
  },
  activityDesc: {
    fontSize: 16,
    fontWeight: '700',
    color: T.colors.textSub,
    lineHeight: 22,
    marginBottom: 12,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  activityLocationText: {
    fontSize: 16,
    fontWeight: '700',
    color: T.colors.text,
  },
  activityInfoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  activityInfoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: T.colors.text,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '800',
    color: T.colors.text,
  },
  registerButton: {
    backgroundColor: '#FFD84D',  // เหลืองตามภาพ
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...T.shadows.button,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: T.colors.accentText,
  },

  // Original components - เก็บไว้ใช้ภายหลัง
  scoreSection: {
    margin: 16,
  },
  scoreSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreSectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: T.colors.text,
  },
  ringWrap: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: T.radii.card,
    borderWidth: 1,
    borderColor: T.colors.border,
    ...T.shadows.card,
  },
  ringScore: {
    fontSize: 64,
    fontWeight: '900',
    marginBottom: 8,
  },
  ringLabel: {
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
  alertList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: T.radii.control,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '700',
    color: T.colors.textSub,
    lineHeight: 20,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: T.colors.textMuted,
    fontWeight: '700',
  },
});