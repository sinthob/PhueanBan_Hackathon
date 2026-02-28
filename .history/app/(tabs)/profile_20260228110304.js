import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { activities, categories, currentUser } from '../../data/mockData';
import { useAuth } from '../../providers/providers';
import {
  getActivityProfile,
} from '../../data/aiProfileStore';
import { WarmClearTheme } from '../../theme';

// Alert.alert ไม่ทำงานบน Web — ใช้ฟังก์ชันนี้แทนในทุก confirm dialog
function confirmAction(title, message, onConfirm) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ยืนยัน', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

function buildActivityProfileSummary(profile) {
  if (!profile) return '';
  const chips = [];
  if (profile.distancePref === 'near') chips.push('ใกล้มาก');
  if (profile.distancePref === 'medium') chips.push('ใกล้');
  if (profile.distancePref === 'any') chips.push('ระยะทางได้หมด');

  if (profile.placePref === 'indoor') chips.push('เน้นในร่ม');
  if (profile.placePref === 'outdoor') chips.push('เน้นกลางแจ้ง');
  if (profile.placePref === 'any') chips.push('ใน/นอกได้หมด');

  if (profile.groupPref === 'small') chips.push('กลุ่มเล็ก');
  if (profile.groupPref === 'medium') chips.push('กลุ่มกลาง');
  if (profile.groupPref === 'any') chips.push('ขนาดกลุ่มได้หมด');

  if (profile.timePref === 'morning') chips.push('สะดวกช่วงเช้า');
  if (profile.timePref === 'afternoon') chips.push('สะดวกช่วงบ่าย');
  if (profile.timePref === 'evening') chips.push('สะดวกช่วงเย็น');
  if (profile.timePref === 'any') chips.push('เวลาได้หมด');

  if (Array.isArray(profile.categoryPrefs) && profile.categoryPrefs.length) {
    const labels = profile.categoryPrefs
      .map((value) => categories.find((c) => c.value === value)?.label)
      .filter(Boolean);
    if (labels.length) {
      chips.push(`สนใจ: ${labels.slice(0, 3).join(' / ')}${labels.length > 3 ? '…' : ''}`);
    }
  }

  return chips.join(' • ');
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [activityProfile, setLocalProfile] = useState(() => getActivityProfile());
  const [statusKey, setStatusKey] = useState('ready');

  useFocusEffect(
    useCallback(() => {
      setLocalProfile(getActivityProfile());
    }, [])
  );

  const nextActivity = useMemo(() => activities[0] ?? null, []);

  const statusMeta = useMemo(() => {
    if (statusKey === 'resting') {
      return {
        label: 'พักผ่อน',
        dotColor: WarmClearTheme.colors.warningText,
        pillBg: WarmClearTheme.colors.warningSoft,
        pillBorder: WarmClearTheme.colors.warningSoftBorder,
        textColor: WarmClearTheme.colors.warningText,
      };
    }
    if (statusKey === 'need_help') {
      return {
        label: 'ต้องการความช่วยเหลือ',
        dotColor: WarmClearTheme.colors.danger,
        pillBg: WarmClearTheme.colors.dangerSoft,
        pillBorder: WarmClearTheme.colors.dangerSoftBorder,
        textColor: WarmClearTheme.colors.danger,
      };
    }
    return {
      label: 'พร้อมทำกิจกรรม',
      dotColor: WarmClearTheme.colors.primary,
      pillBg: WarmClearTheme.colors.primarySoft,
      pillBorder: WarmClearTheme.colors.primarySoftBorder,
      textColor: WarmClearTheme.colors.primaryDark,
    };
  }, [statusKey]);

  const profileSummary = useMemo(
    () => buildActivityProfileSummary(activityProfile),
    [activityProfile]
  );

  const onEmergencyContact = () => {
    Alert.alert(
      'Emergency Contact (mock)',
      'โทรหาเบอร์ฉุกเฉิน/ครอบครัวที่ตั้งค่าไว้\n\nตัวอย่าง: 191 หรือ 1669'
    );
  };

  const cycleStatus = () => {
    setStatusKey((prev) => {
      if (prev === 'ready') return 'resting';
      if (prev === 'resting') return 'need_help';
      return 'ready';
    });
  };

  const goToPreferences = () => {
    router.push('/(tabs)/activity-preferences');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topChrome}>
        <View style={styles.headerBar}>
          <View style={styles.chromeIcon}>
            <Text style={styles.chromeIconText}>≡</Text>
          </View>

          <Text style={styles.headerBarTitle}>โปรไฟล์</Text>

          <Pressable
            onPress={() => {
              confirmAction(
                'ออกจากระบบ',
                'คุณต้องการออกจากระบบใช่หรือไม่?',
                async () => {
                  try {
                    await signOut();
                  } catch (err) {
                    Alert.alert('ออกจากระบบไม่สำเร็จ', err?.message ?? 'กรุณาลองใหม่');
                  }
                }
              );
            }}
            style={styles.chromeIcon}
          >
            <Text style={styles.chromeIconText}>⎋</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{currentUser.avatar}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{currentUser.name}</Text>
          <Text style={styles.heroMeta}>
            อายุ {currentUser.age} ปี • {currentUser.location.district}
          </Text>

          <View style={styles.heroActions}>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: statusMeta.pillBg,
                  borderColor: statusMeta.pillBorder,
                },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusMeta.dotColor }]} />
              <Text style={[styles.statusText, { color: statusMeta.textColor }]}>
                {statusMeta.label}
              </Text>
            </View>

            <Pressable
              onPress={onEmergencyContact}
              accessibilityRole="button"
              accessibilityLabel="ติดต่อฉุกเฉิน"
              style={styles.emergencyButton}
            >
              <Ionicons name="call" size={20} color={WarmClearTheme.colors.accentText} />
              <Text style={styles.emergencyButtonText}>ติดต่อฉุกเฉิน</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBubble}>
          <Text style={styles.metricIcon}>📅</Text>
          <Text style={styles.metricValue}>{currentUser.activitiesCompleted}</Text>
          <Text style={styles.metricLabel}>กิจกรรม</Text>
        </View>

        <View style={[styles.metricBubble, styles.metricBubbleMain]}>
          <Text style={styles.metricValueMain}>{currentUser.socialHealthScore}</Text>
          <Text style={styles.metricLabel}>คะแนนสังคม</Text>
        </View>

        <View style={styles.metricBubble}>
          <Text style={styles.metricIcon}>👥</Text>
          <Text style={styles.metricValue}>{currentUser.friends}</Text>
          <Text style={styles.metricLabel}>เพื่อน</Text>
        </View>
      </View>

      <View style={styles.dotsRow}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <View key={`dot-${idx}`} style={[styles.dot, idx === 2 && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>กิจกรรมถัดไป</Text>
        {nextActivity ? (
          <>
            <Text style={styles.nextActivityTitle}>{nextActivity.icon} {nextActivity.title}</Text>
            <Text style={styles.nextActivityMeta}>เวลา: {nextActivity.time}</Text>
            <Text style={styles.nextActivityMeta}>สถานที่: {nextActivity.location}</Text>
            <Text style={styles.nextActivityMeta}>ระยะทาง: {nextActivity.distance}</Text>

            <Pressable
              onPress={() => Alert.alert('ดูรายละเอียด (mock)', nextActivity.description)}
              accessibilityRole="button"
              accessibilityLabel="ดูรายละเอียดกิจกรรมถัดไป"
              style={styles.primaryButtonLarge}
            >
              <Text style={styles.primaryButtonLargeText}>ดูรายละเอียด</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.cardBody}>ยังไม่มีกิจกรรมถัดไป</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>เมนูด่วน</Text>

        <Pressable
          onPress={() => router.push('/(tabs)/discover')}
          accessibilityRole="button"
          accessibilityLabel="ค้นหากิจกรรมใกล้เคียง"
          style={styles.quickAction}
        >
          <Ionicons name="location" size={22} color={WarmClearTheme.colors.primaryDark} />
          <Text style={styles.quickActionText}>ค้นหากิจกรรมใกล้เคียง</Text>
        </Pressable>

        <Pressable
          onPress={cycleStatus}
          accessibilityRole="button"
          accessibilityLabel="อัปเดตสถานะ"
          style={styles.quickAction}
        >
          <Ionicons name="heart" size={22} color={WarmClearTheme.colors.primaryDark} />
          <Text style={styles.quickActionText}>อัปเดตสถานะ</Text>
        </Pressable>

        <Pressable
          onPress={() => Alert.alert('ติดต่อครอบครัว (mock)', 'กำลังโทร/ส่งข้อความหาครอบครัว...')}
          accessibilityRole="button"
          accessibilityLabel="ติดต่อครอบครัว"
          style={styles.quickAction}
        >
          <Ionicons name="people" size={22} color={WarmClearTheme.colors.primaryDark} />
          <Text style={styles.quickActionText}>ติดต่อครอบครัว</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Activity Preferences</Text>
          <Pressable onPress={goToPreferences} style={styles.linkButtonLarge}>
            <Text style={styles.linkButtonLargeText}>ตั้งค่า</Text>
          </Pressable>
        </View>
        <Text style={styles.cardBodyStrong}>
          {activityProfile ? `สรุป: ${profileSummary}` : 'ยังไม่ได้ตั้งค่าความชอบกิจกรรม'}
        </Text>
      </View>

      <Pressable
        onPress={() => {
          confirmAction(
            'ออกจากระบบ',
            'คุณต้องการออกจากระบบใช่หรือไม่?',
            async () => {
              try {
                await signOut();
              } catch (err) {
                Alert.alert('ออกจากระบบไม่สำเร็จ', err?.message ?? 'กรุณาลองใหม่');
              }
            }
          );
        }}
        accessibilityRole="button"
        accessibilityLabel="ออกจากระบบ"
        style={styles.signOutButtonLarge}
      >
        <Text style={styles.signOutButtonLargeText}>ออกจากระบบ</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  topChrome: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 60,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...WarmClearTheme.shadows.bar,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBarTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  chromeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  chromeIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  hero: {
    marginTop: 14,
    alignItems: 'center',
  },
  avatarRing: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: WarmClearTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  avatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  avatarText: {
    fontSize: 56,
  },
  heroName: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  heroMeta: {
    marginTop: 6,
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '800',
  },
  heroActions: {
    marginTop: 12,
    width: '100%',
    gap: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '900',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.danger,
    ...WarmClearTheme.shadows.button,
  },
  emergencyButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.surface,
  },
  metricsRow: {
    marginTop: -36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  metricBubble: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    ...WarmClearTheme.shadows.subtle,
  },
  metricBubbleMain: {
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderColor: WarmClearTheme.colors.primary,
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  metricValueMain: {
    fontSize: 28,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 13,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '900',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: WarmClearTheme.colors.primarySoftBorder,
    opacity: 0.45,
  },
  dotActive: {
    backgroundColor: WarmClearTheme.colors.primary,
    opacity: 1,
  },
  card: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    marginBottom: 14,
    ...WarmClearTheme.shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  cardBody: {
    marginTop: 8,
    fontSize: 18,
    color: WarmClearTheme.colors.textMuted,
    lineHeight: 24,
    fontWeight: '700',
  },
  cardBodyStrong: {
    marginTop: 10,
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    lineHeight: 26,
    fontWeight: '800',
  },
  nextActivityTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  nextActivityMeta: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
  },
  primaryButtonLarge: {
    marginTop: 14,
    backgroundColor: WarmClearTheme.colors.primary,
    borderRadius: WarmClearTheme.radii.control,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  primaryButtonLargeText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.surface,
  },
  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    ...WarmClearTheme.shadows.subtle,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    marginTop: 12,
    ...WarmClearTheme.shadows.subtle,
  },
  quickActionText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  linkButtonLarge: {
    paddingHorizontal: 14,
    minHeight: 48,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  linkButtonLargeText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.surface,
  },
  signOutButtonLarge: {
    marginTop: 4,
    minHeight: 56,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  signOutButtonLargeText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
});