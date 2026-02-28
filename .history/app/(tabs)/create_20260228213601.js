import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { categories } from '../../data/mockData';
import { getActivityProfile } from '../../data/aiProfileStore';
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

function Section({ title, description, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
      {children}
    </View>
  );
}

const DEFAULTS = {
  distancePref: 'near',
  placePref: 'any',
  groupPref: 'small',
  timePref: 'morning',
  categoryPrefs: ['exercise'],
};

export default function CreateActivityScreen() {
  const existing = useMemo(() => getActivityProfile(), []);
  const availableCategories = useMemo(
    () => categories.filter((c) => c.value !== 'all'),
    []
  );

  const [step, setStep] = useState(1);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const [distancePref, setDistancePref] = useState(existing?.distancePref || DEFAULTS.distancePref);
  // Intentionally hidden from UI (reduced cognitive load), but kept in the draft shape for compatibility.
  const [placePref, setPlacePref] = useState(existing?.placePref || DEFAULTS.placePref);
  const [groupPref, setGroupPref] = useState(existing?.groupPref || DEFAULTS.groupPref);
  const [timePref, setTimePref] = useState(existing?.timePref || DEFAULTS.timePref);
  const [categoryPrefs, setCategoryPrefs] = useState(existing?.categoryPrefs || DEFAULTS.categoryPrefs);

  const toggleCategory = (value) => {
    setCategoryPrefs((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      const arr = Array.from(next);
      return arr.length ? arr : prev;
    });
  };

  const goNext = () => {
    if (step === 1) {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณาใส่ชื่อกิจกรรม');
        return;
      }
    }

    if (step === 3) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => {
    if (step === 1) return;
    setStep((s) => Math.max(1, s - 1));
  };

  const onSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณาใส่ชื่อกิจกรรม');
      return;
    }

    if (!categoryPrefs?.length) {
      Alert.alert('เลือกหมวดกิจกรรม', 'กรุณาเลือกอย่างน้อย 1 หมวด');
      return;
    }

    const activityDraft = {
      title: trimmedTitle,
      details: details.trim(),
      distancePref,
      placePref,
      groupPref,
      timePref,
      categoryPrefs,
      createdAt: new Date().toISOString(),
    };

    const catLabel = (val) => availableCategories.find((c) => c.value === val)?.label || val;
    const summaryLines = [
      `ชื่อ: ${activityDraft.title}`,
      activityDraft.details ? `รายละเอียด: ${activityDraft.details}` : null,
      `ระยะทาง: ${activityDraft.distancePref}`,
      `สถานที่: ${activityDraft.placePref}`,
      `กลุ่ม: ${activityDraft.groupPref}`,
      `เวลา: ${activityDraft.timePref}`,
      `หมวด: ${activityDraft.categoryPrefs.map(catLabel).join(', ')}`,
    ].filter(Boolean);

    Alert.alert('บันทึกกิจกรรมแล้ว (mock)', summaryLines.join('\n'));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>สร้างกิจกรรม</Text>
        <Text style={styles.stepPill}>ขั้นตอน {step}/3</Text>
        <Text style={styles.subtitle}>ทำทีละขั้นตอน เพื่อใช้งานง่ายขึ้น</Text>
      </View>

      {step === 1 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ข้อมูลพื้นฐาน</Text>

          <Text style={styles.label}>ชื่อกิจกรรม</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="เช่น เดินเล่นตอนเช้า"
            placeholderTextColor={WarmClearTheme.colors.textMuted}
            style={styles.input}
            returnKeyType="next"
          />

          <Text style={[styles.label, { marginTop: 14 }]}>รายละเอียด (ไม่บังคับ)</Text>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="เช่น นัดเจอหน้าสวน 6 โมง เดินช้าๆ คุยสบายๆ"
            placeholderTextColor={WarmClearTheme.colors.textMuted}
            style={[styles.input, styles.textArea]}
            multiline
          />

          <View style={styles.actionsSingle}>
            <Pressable
              onPress={goNext}
              accessibilityRole="button"
              accessibilityLabel="ไปขั้นตอนถัดไป"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>ถัดไป</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ตั้งค่ากิจกรรม</Text>

          <Section title="ระยะทาง" description="เลือกคร่าวๆ ว่าอยากชวนคนไกลแค่ไหน">
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

          <View style={styles.sectionSpacer} />

          <Section title="ช่วงเวลา" description="เลือกช่วงเวลาที่เหมาะกับกิจกรรมนี้">
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

          <View style={styles.navRow}>
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="ย้อนกลับ"
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>ย้อนกลับ</Text>
            </Pressable>
            <Pressable
              onPress={goNext}
              accessibilityRole="button"
              accessibilityLabel="ไปขั้นตอนถัดไป"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>ถัดไป</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>เลือกหมวดกิจกรรม</Text>
          <Text style={styles.helperText}>เลือกได้หลายข้อ (อย่างน้อย 1 หมวด)</Text>

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

          <View style={styles.navColumn}>
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="ย้อนกลับ"
              style={styles.secondaryButtonFull}
            >
              <Text style={styles.secondaryButtonText}>ย้อนกลับ</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              accessibilityRole="button"
              accessibilityLabel="สร้างกิจกรรม"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>สร้างกิจกรรม</Text>
            </Pressable>

            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>หมายเหตุ (mock)</Text>
              <Text style={styles.hintBody}>
                ตอนนี้ยังไม่บันทึกลงฐานข้อมูลจริง ระบบจะแสดงสรุปค่าที่เลือกเป็นตัวอย่าง
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  stepPill: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: WarmClearTheme.radii.pill,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '800',
    lineHeight: 26,
  },
  card: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 18,
    ...WarmClearTheme.shadows.subtle,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 52,
    fontSize: 18,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  section: {
    backgroundColor: WarmClearTheme.colors.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
    marginBottom: 12,
  },
  sectionSpacer: {
    height: 18,
  },
  helperText: {
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
    marginBottom: 14,
  },
  segmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: WarmClearTheme.colors.surface,
  },
  actionsSingle: {
    marginTop: 18,
  },
  primaryButton: {
    flex: 1,
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
    flex: 1,
    minHeight: 56,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  secondaryButtonFull: {
    minHeight: 56,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
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
  navRow: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 12,
  },
  navColumn: {
    marginTop: 22,
    gap: 12,
  },
  hintBox: {
    backgroundColor: WarmClearTheme.colors.warningSoft,
    borderRadius: WarmClearTheme.radii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.warningSoftBorder,
    ...WarmClearTheme.shadows.subtle,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.warningText,
    marginBottom: 6,
  },
  hintBody: {
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.warningText,
    lineHeight: 20,
  },
});