import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { categories, currentUser } from '../../data/mockData';
import { useAuth } from '../../providers/providers';
import {
  clearActivityProfile,
  getActivityProfile,
  setActivityProfile,
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
  const existingProfile = useMemo(() => getActivityProfile(), []);
  const [activityProfile, setLocalProfile] = useState(existingProfile);
  const [editingProfile, setEditingProfile] = useState(!existingProfile);

  const [distancePref, setDistancePref] = useState(activityProfile?.distancePref || 'near');
  const [placePref, setPlacePref] = useState(activityProfile?.placePref || 'any');
  const [groupPref, setGroupPref] = useState(activityProfile?.groupPref || 'small');
  const [timePref, setTimePref] = useState(activityProfile?.timePref || 'morning');
  const [categoryPrefs, setCategoryPrefs] = useState(activityProfile?.categoryPrefs || ['exercise']);


  const profileSummary = useMemo(
    () => buildActivityProfileSummary(activityProfile),
    [activityProfile]
  );

  const availableCategories = useMemo(
    () => categories.filter((c) => c.value !== 'all'),
    []
  );

  const toggleCategory = (value) => {
    setCategoryPrefs((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      const arr = Array.from(next);
      return arr.length ? arr : prev;
    });
  };

  const saveProfile = () => {
    const next = {
      distancePref,
      placePref,
      groupPref,
      timePref,
      categoryPrefs,
      createdAt: new Date().toISOString(),
    };
    setActivityProfile(next);
    setLocalProfile(next);
    setEditingProfile(false);
    Alert.alert('บันทึกแล้ว (mock)', 'สร้างโปรไฟล์กิจกรรมเพื่อใช้กับ AI เรียบร้อย');
  };

  const resetProfile = () => {
    clearActivityProfile();
    setLocalProfile(null);
    setEditingProfile(true);
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
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>โปรไฟล์กิจกรรม</Text>
          {activityProfile && !editingProfile ? (
            <Pressable onPress={() => setEditingProfile(true)} style={styles.linkButton}>
              <Text style={styles.linkButtonText}>แก้ไข</Text>
            </Pressable>
          ) : null}
        </View>

        {activityProfile && !editingProfile ? (
          <>
            <Text style={styles.cardBody}>สรุปโปรไฟล์: {profileSummary}</Text>
            <View style={styles.actionRow}>
              <Pressable onPress={resetProfile} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>รีเซ็ต</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.cardBody}>
              ตอบคำถามสั้นๆ เพื่อให้ AI แนะนำกิจกรรมที่เหมาะกับคุณตั้งแต่วันแรก (mock)
            </Text>

            <Text style={styles.questionTitle}>ระยะทางที่ชอบ</Text>
            <View style={styles.chipRow}>
              {[
                { value: 'near', label: 'ใกล้มาก (< 1 กม.)' },
                { value: 'medium', label: 'ใกล้ (≤ 2.5 กม.)' },
                { value: 'any', label: 'ไม่จำกัด' },
              ].map((opt) => {
                const active = distancePref === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setDistancePref(opt.value)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.questionTitle}>สถานที่ที่สบาย</Text>
            <View style={styles.chipRow}>
              {[
                { value: 'indoor', label: 'ในร่ม' },
                { value: 'outdoor', label: 'กลางแจ้ง' },
                { value: 'any', label: 'ได้หมด' },
              ].map((opt) => {
                const active = placePref === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setPlacePref(opt.value)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.questionTitle}>ขนาดกลุ่ม</Text>
            <View style={styles.chipRow}>
              {[
                { value: 'small', label: 'กลุ่มเล็ก (≤ 12 คน)' },
                { value: 'medium', label: 'กลุ่มกลาง (≤ 20 คน)' },
                { value: 'any', label: 'ได้หมด' },
              ].map((opt) => {
                const active = groupPref === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setGroupPref(opt.value)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.questionTitle}>ช่วงเวลาที่สะดวก</Text>
            <View style={styles.chipRow}>
              {[
                { value: 'morning', label: 'เช้า' },
                { value: 'afternoon', label: 'บ่าย' },
                { value: 'evening', label: 'เย็น' },
                { value: 'any', label: 'ได้หมด' },
              ].map((opt) => {
                const active = timePref === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setTimePref(opt.value)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.questionTitle}>หมวดที่สนใจ</Text>
            <View style={styles.chipRow}>
              {availableCategories.map((c) => {
                const active = categoryPrefs.includes(c.value);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => toggleCategory(c.value)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actionRow}>
              <Pressable onPress={saveProfile} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>สร้างโปรไฟล์กิจกรรม</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>เป้าหมายรายสัปดาห์</Text>
        <Text style={styles.cardBody}>เข้าร่วมกิจกรรมอย่างน้อย 2 ครั้ง</Text>
      </View>
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
    fontSize: 22,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  heroMeta: {
    marginTop: 6,
    fontSize: 16,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '800',
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
  activityList: {
    marginTop: 12,
    gap: 12,
  },
  activityMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: WarmClearTheme.radii.card,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surface,
    ...WarmClearTheme.shadows.subtle,
  },
  activityMiniIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.accent,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  activityMiniIcon: {
    fontSize: 22,
  },
  activityMiniBody: {
    flex: 1,
  },
  activityMiniTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  activityMiniMeta: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
  },
  activityMiniAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.accent,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  activityMiniActionText: {
    fontSize: 26,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginTop: -2,
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
    fontSize: 17,
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
  helperText: {
    marginTop: 10,
    fontSize: 16,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '800',
  },
  questionTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
  },
  chipRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.chip,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  chipActive: {
    backgroundColor: WarmClearTheme.colors.primary,
    borderColor: WarmClearTheme.colors.primary,
  },
  chipText: {
    fontSize: 16,
    color: WarmClearTheme.colors.text,
    fontWeight: '900',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.primary,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: WarmClearTheme.radii.control,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surface,
    ...WarmClearTheme.shadows.subtle,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
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
  planWrap: {
    marginTop: 12,
    gap: 10,
  },
  planItem: {
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 12,
    ...WarmClearTheme.shadows.subtle,
  },
  planItemActive: {
    borderColor: WarmClearTheme.colors.primary,
    backgroundColor: WarmClearTheme.colors.primarySoft,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  planDay: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  planReason: {
    fontSize: 14,
    color: WarmClearTheme.colors.primaryDark,
    fontWeight: '900',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 2,
  },
  planMeta: {
    fontSize: 16,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '800',
  },
  prepBox: {
    marginTop: 12,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.card,
    padding: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  postBox: {
    marginTop: 14,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  prepTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  prepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.surface,
  },
  checkboxChecked: {
    borderColor: WarmClearTheme.colors.primary,
    backgroundColor: WarmClearTheme.colors.primary,
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: '900',
    color: 'transparent',
  },
  checkboxTextChecked: {
    color: '#ffffff',
  },
  prepText: {
    flex: 1,
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '800',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 999,
    backgroundColor: WarmClearTheme.colors.border,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: WarmClearTheme.colors.primary,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: WarmClearTheme.colors.surface,
    transform: [{ translateX: 0 }],
  },
  toggleKnobOn: {
    transform: [{ translateX: 18 }],
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  reminderSub: {
    marginTop: 2,
    fontSize: 14,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '800',
  },
  insightBox: {
    marginTop: 10,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderRadius: WarmClearTheme.radii.card,
    padding: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    ...WarmClearTheme.shadows.subtle,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
    marginBottom: 6,
  },
  insightBody: {
    fontSize: 16,
    color: WarmClearTheme.colors.primaryDark,
    fontWeight: '800',
    lineHeight: 22,
  },
});