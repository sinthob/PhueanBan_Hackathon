import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { categories } from '../../data/mockData';
import {
  clearActivityProfile,
  getActivityProfile,
  setActivityProfile,
} from '../../data/aiProfileStore';
import { WarmClearTheme } from '../../theme';

function SegmentButton({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.segment, active ? styles.segmentActive : null]}
    >
      <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function ActivityPreferencesScreen() {
  const router = useRouter();

  const existing = useMemo(() => getActivityProfile(), []);

  const [distancePref, setDistancePref] = useState(existing?.distancePref || 'near');
  const [placePref, setPlacePref] = useState(existing?.placePref || 'any');
  const [groupPref, setGroupPref] = useState(existing?.groupPref || 'small');
  const [timePref, setTimePref] = useState(existing?.timePref || 'morning');
  const [categoryPrefs, setCategoryPrefs] = useState(existing?.categoryPrefs || ['exercise']);

  const availableCategories = useMemo(
    () => categories.filter((c) => c.value !== 'all'),
    []
  );

  const toggleCategory = (value) => {
    setCategoryPrefs((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      const arr = Array.from(next);
      return arr.length ? arr : prev;
    });
  };

  const onSave = () => {
    const next = {
      distancePref,
      placePref,
      groupPref,
      timePref,
      categoryPrefs,
      createdAt: new Date().toISOString(),
    };

    setActivityProfile(next);
    Alert.alert('บันทึกแล้ว (mock)', 'อัปเดตความชอบกิจกรรมเรียบร้อย');
    router.back();
  };

  const onReset = () => {
    clearActivityProfile();
    setDistancePref('near');
    setPlacePref('any');
    setGroupPref('small');
    setTimePref('morning');
    setCategoryPrefs(['exercise']);
    Alert.alert('รีเซ็ตแล้ว (mock)', 'ล้างค่าความชอบกิจกรรมเรียบร้อย');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Activity Preferences</Text>
      <Text style={styles.subtitle}>
        ตั้งค่าความชอบเพื่อให้แนะนำกิจกรรมได้เหมาะกับคุณ
      </Text>

      <Section title="ระยะทางที่ชอบ">
        <View style={styles.segmentGrid}>
          <SegmentButton
            label="ใกล้มาก"
            active={distancePref === 'near'}
            onPress={() => setDistancePref('near')}
          />
          <SegmentButton
            label="ใกล้"
            active={distancePref === 'medium'}
            onPress={() => setDistancePref('medium')}
          />
          <SegmentButton
            label="ไม่จำกัด"
            active={distancePref === 'any'}
            onPress={() => setDistancePref('any')}
          />
        </View>
      </Section>

      <Section title="สถานที่ที่สบาย">
        <View style={styles.segmentGrid}>
          <SegmentButton
            label="ในร่ม"
            active={placePref === 'indoor'}
            onPress={() => setPlacePref('indoor')}
          />
          <SegmentButton
            label="กลางแจ้ง"
            active={placePref === 'outdoor'}
            onPress={() => setPlacePref('outdoor')}
          />
          <SegmentButton
            label="ได้หมด"
            active={placePref === 'any'}
            onPress={() => setPlacePref('any')}
          />
        </View>
      </Section>

      <Section title="ขนาดกลุ่ม">
        <View style={styles.segmentGrid}>
          <SegmentButton
            label="กลุ่มเล็ก"
            active={groupPref === 'small'}
            onPress={() => setGroupPref('small')}
          />
          <SegmentButton
            label="กลุ่มกลาง"
            active={groupPref === 'medium'}
            onPress={() => setGroupPref('medium')}
          />
          <SegmentButton
            label="ได้หมด"
            active={groupPref === 'any'}
            onPress={() => setGroupPref('any')}
          />
        </View>
      </Section>

      <Section title="ช่วงเวลาที่สะดวก">
        <View style={styles.segmentGrid}>
          <SegmentButton
            label="เช้า"
            active={timePref === 'morning'}
            onPress={() => setTimePref('morning')}
          />
          <SegmentButton
            label="บ่าย"
            active={timePref === 'afternoon'}
            onPress={() => setTimePref('afternoon')}
          />
          <SegmentButton
            label="เย็น"
            active={timePref === 'evening'}
            onPress={() => setTimePref('evening')}
          />
          <SegmentButton
            label="ได้หมด"
            active={timePref === 'any'}
            onPress={() => setTimePref('any')}
          />
        </View>
      </Section>

      <Section title="หมวดที่สนใจ (เลือกได้หลายข้อ)">
        <View style={styles.segmentGrid}>
          {availableCategories.map((c) => {
            const active = categoryPrefs.includes(c.value);
            return (
              <SegmentButton
                key={c.id}
                label={c.label}
                active={active}
                onPress={() => toggleCategory(c.value)}
              />
            );
          })}
        </View>
      </Section>

      <View style={styles.actions}>
        <Pressable
          onPress={onSave}
          accessibilityRole="button"
          accessibilityLabel="บันทึกความชอบกิจกรรม"
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>บันทึก</Text>
        </Pressable>

        <Pressable
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="รีเซ็ตความชอบกิจกรรม"
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>รีเซ็ต</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Alert.alert('ยกเลิก', 'กลับไปหน้าโปรไฟล์');
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="กลับไปหน้าโปรไฟล์"
          style={styles.ghostButton}
        >
          <Text style={styles.ghostButtonText}>กลับ</Text>
        </Pressable>
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 26,
  },
  section: {
    marginTop: 18,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 12,
  },
  segmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  segment: {
    flexGrow: 1,
    minWidth: '47%',
    minHeight: 56,
    paddingHorizontal: 12,
    borderRadius: WarmClearTheme.radii.control,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  segmentActive: {
    backgroundColor: WarmClearTheme.colors.primary,
    borderColor: WarmClearTheme.colors.primary,
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: WarmClearTheme.colors.surface,
  },
  actions: {
    marginTop: 18,
    gap: 12,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.surface,
  },
  secondaryButton: {
    minHeight: 56,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  ghostButton: {
    minHeight: 56,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  ghostButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },
});
