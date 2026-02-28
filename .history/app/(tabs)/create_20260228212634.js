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

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const [distancePref, setDistancePref] = useState(existing?.distancePref || DEFAULTS.distancePref);
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

  const applyFromPreferences = () => {
    const profile = getActivityProfile();
    if (!profile) {
      Alert.alert('ยังไม่มีค่า Preferences', 'กรุณาตั้งค่าในหน้า Activity Preferences ก่อน');
      return;
    }

    setDistancePref(profile.distancePref || DEFAULTS.distancePref);
    setPlacePref(profile.placePref || DEFAULTS.placePref);
    setGroupPref(profile.groupPref || DEFAULTS.groupPref);
    setTimePref(profile.timePref || DEFAULTS.timePref);
    setCategoryPrefs(profile.categoryPrefs?.length ? profile.categoryPrefs : DEFAULTS.categoryPrefs);
    Alert.alert('โหลดแล้ว (mock)', 'นำค่าจาก Activity Preferences มาใส่ในฟอร์มแล้ว');
  };

  const resetForm = () => {
    setTitle('');
    setDetails('');
    setDistancePref(existing?.distancePref || DEFAULTS.distancePref);
    setPlacePref(existing?.placePref || DEFAULTS.placePref);
    setGroupPref(existing?.groupPref || DEFAULTS.groupPref);
    setTimePref(existing?.timePref || DEFAULTS.timePref);
    setCategoryPrefs(existing?.categoryPrefs || DEFAULTS.categoryPrefs);
  };

  const onSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณาใส่ชื่อกิจกรรม');
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
        <Text style={styles.subtitle}>ข้อมูลในฟอร์มนี้อิงจากหน้า Activity Preferences</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>รายละเอียดกิจกรรม</Text>

        <Text style={styles.label}>ชื่อกิจกรรม</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="เช่น เดินเล่นตอนเช้า"
          placeholderTextColor={WarmClearTheme.colors.textMuted}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>รายละเอียด (ไม่บังคับ)</Text>
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder="เช่น นัดเจอหน้าสวน 6 โมง เดินช้าๆ คุยสบายๆ"
          placeholderTextColor={WarmClearTheme.colors.textMuted}
          style={[styles.input, styles.textArea]}
          multiline
        />

        <View style={styles.inlineActions}>
          <Pressable
            onPress={applyFromPreferences}
            accessibilityRole="button"
            accessibilityLabel="ใช้ค่าจาก Activity Preferences"
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>ใช้ค่าจาก Preferences</Text>
          </Pressable>

          <Pressable
            onPress={resetForm}
            accessibilityRole="button"
            accessibilityLabel="ล้างฟอร์ม"
            style={styles.ghostButton}
          >
            <Text style={styles.ghostButtonText}>ล้างฟอร์ม</Text>
          </Pressable>
        </View>
      </View>

      <Section title="ระยะทางที่อยากชวน" description="เลือกให้ตรงกับกลุ่มเพื่อนที่อยากชวนเข้าร่วม">
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

      <Section title="รูปแบบสถานที่" description="ช่วยให้คนที่สนใจตัดสินใจง่ายขึ้น">
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

      <Section title="ขนาดกลุ่ม" description="เลือกว่ากิจกรรมนี้อยากให้คนเยอะประมาณไหน">
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

      <Section title="ช่วงเวลาที่สะดวก" description="เลือกช่วงเวลาโดยรวมของกิจกรรมนี้">
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

      <Section title="หมวดกิจกรรม" description="เลือกได้หลายข้อ (ต้องมีอย่างน้อย 1 หมวด)">
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
          accessibilityLabel="บันทึกกิจกรรม"
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>บันทึกกิจกรรม</Text>
        </Pressable>

        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>หมายเหตุ (mock)</Text>
          <Text style={styles.hintBody}>
            ตอนนี้ยังไม่บันทึกลงฐานข้อมูลจริง ระบบจะแสดงสรุปค่าที่เลือกเป็นตัวอย่าง
          </Text>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '700',
    lineHeight: 24,
  },
  card: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
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
    minHeight: 48,
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  inlineActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    marginTop: 16,
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
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 20,
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
    flex: 1,
    minHeight: 48,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  ghostButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  ghostButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
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