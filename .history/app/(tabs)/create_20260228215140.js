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

const ONSITE_PRESETS = [
  { label: 'สวนสาธารณะใกล้บ้าน (mock)', latitude: 13.7563, longitude: 100.5018 },
  { label: 'ศูนย์ชุมชน (mock)', latitude: 13.7456, longitude: 100.5349 },
  { label: 'ตลาดใกล้บ้าน (mock)', latitude: 13.7383, longitude: 100.5609 },
];

export default function CreateActivityScreen() {
  const existing = useMemo(() => getActivityProfile(), []);
  const availableCategories = useMemo(
    () => categories.filter((c) => c.value !== 'all'),
    []
  );

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [startAt, setStartAt] = useState('');

  const [activityMode, setActivityMode] = useState('online');
  const [onsiteLocation, setOnsiteLocation] = useState(null);
  const [onsitePresetIndex, setOnsitePresetIndex] = useState(0);

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

  const onSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณาใส่ชื่อกิจกรรม');
      return;
    }

    if (!startAt.trim()) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณาใส่เวลาเริ่มกิจกรรม');
      return;
    }

    if (activityMode === 'onsite' && !onsiteLocation) {
      Alert.alert('เลือกตำแหน่ง', 'กรุณาเลือกตำแหน่งบนแผนที่ (mock)');
      return;
    }

    if (!categoryPrefs?.length) {
      Alert.alert('เลือกหมวดกิจกรรม', 'กรุณาเลือกอย่างน้อย 1 หมวด');
      return;
    }

    const activityDraft = {
      title: trimmedTitle,
      details: details.trim(),
      startAt: startAt.trim(),
      activityMode,
      onsiteLocation,
      distancePref,
      placePref,
      groupPref,
      timePref,
      categoryPrefs,
      createdAt: new Date().toISOString(),
    };

    const catLabel = (val) => availableCategories.find((c) => c.value === val)?.label || val;
    const modeText = activityDraft.activityMode === 'onsite' ? 'ออนไซต์' : 'ออนไลน์';
    const summaryLines = [
      `ชื่อ: ${activityDraft.title}`,
      activityDraft.details ? `รายละเอียด: ${activityDraft.details}` : null,
      `เวลาเริ่ม: ${activityDraft.startAt}`,
      `รูปแบบ: ${modeText}`,
      activityDraft.activityMode === 'onsite' && activityDraft.onsiteLocation
        ? `สถานที่: ${activityDraft.onsiteLocation.label}`
        : null,
      `ระยะทาง: ${activityDraft.distancePref}`,
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
        <Text style={styles.subtitle}>กรอกข้อมูลสั้นๆ เพื่อสร้างกิจกรรมได้ทันที</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ข้อมูลพื้นฐาน</Text>

        <Text style={styles.label}>ชื่อกิจกรรม</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="เช่น เดินเล่นตอนเช้า"
          placeholderTextColor={WarmClearTheme.colors.textMuted}
          style={styles.input}
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
      </View>

      <View style={styles.cardSpacing} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ตั้งค่ากิจกรรม</Text>

        <Section title="เวลาเริ่มกิจกรรม" description="พิมพ์เวลาที่ต้องการเริ่ม (mock)">
          <TextInput
            value={startAt}
            onChangeText={setStartAt}
            placeholder="เช่น 2026-03-01 08:30 หรือ วันนี้ 18:00"
            placeholderTextColor={WarmClearTheme.colors.textMuted}
            style={styles.input}
          />
        </Section>

        <View style={styles.sectionSpacer} />

        <Section title="รูปแบบกิจกรรม" description="เลือกว่าจะทำออนไลน์หรือเจอกันจริง">
          <View style={styles.segmentGrid}>
            <SegmentButton
              label={activityMode === 'online' ? '✓ ออนไลน์' : 'ออนไลน์'}
              active={activityMode === 'online'}
              onPress={() => {
                setActivityMode('online');
                setOnsiteLocation(null);
              }}
            />
            <SegmentButton
              label={activityMode === 'onsite' ? '✓ ออนไซต์' : 'ออนไซต์'}
              active={activityMode === 'onsite'}
              onPress={() => setActivityMode('onsite')}
            />
          </View>

          {activityMode === 'onsite' ? (
            <View style={styles.mapCard}>
              <Text style={styles.mapTitle}>เลือกสถานที่บนแผนที่ (mock)</Text>
              <Text style={styles.mapBody}>
                {onsiteLocation
                  ? `📍 ${onsiteLocation.label}\n(${onsiteLocation.latitude.toFixed(4)}, ${onsiteLocation.longitude.toFixed(4)})`
                  : 'ยังไม่ได้เลือกตำแหน่ง'}
              </Text>

              <Pressable
                onPress={() => {
                  const nextIdx = (onsitePresetIndex + 1) % ONSITE_PRESETS.length;
                  setOnsitePresetIndex(nextIdx);
                  setOnsiteLocation(ONSITE_PRESETS[nextIdx]);
                }}
                accessibilityRole="button"
                accessibilityLabel="เลือกตำแหน่งบนแผนที่"
                style={styles.mapPickButton}
              >
                <Text style={styles.mapPickButtonText}>แตะเพื่อเลือกตำแหน่ง (mock)</Text>
              </Pressable>
            </View>
          ) : null}
        </Section>

        <View style={styles.sectionSpacer} />

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
      </View>

      <View style={styles.cardSpacing} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>หมวดกิจกรรม</Text>
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
      </View>

      <View style={styles.actions}>
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
  cardSpacing: {
    height: 14,
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
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  actions: {
    marginTop: 14,
    gap: 12,
  },
  mapCard: {
    marginTop: 14,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  mapBody: {
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
    marginBottom: 12,
  },
  mapPickButton: {
    minHeight: 56,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  mapPickButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.surface,
    textAlign: 'center',
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
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.warningText,
    lineHeight: 22,
  },
});