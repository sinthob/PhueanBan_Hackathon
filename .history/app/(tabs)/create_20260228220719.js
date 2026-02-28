import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

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

function clampLat(lat) {
  // Web Mercator valid range
  return Math.max(-85.05112878, Math.min(85.05112878, lat));
}

function latLngToTileXY(latitude, longitude, zoom) {
  const lat = clampLat(Number(latitude) || 13.7563);
  const lng = Number(longitude) || 100.5018;
  const z = Number.isFinite(zoom) ? zoom : 13;
  const n = 2 ** z;

  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );

  return { x, y, z, n };
}

function wrapX(x, n) {
  const mod = x % n;
  return mod < 0 ? mod + n : mod;
}

function getOsmTileUrl(z, x, y, n) {
  const safeX = wrapX(x, n);
  const safeY = Math.max(0, Math.min(n - 1, y));
  return `https://tile.openstreetmap.org/${z}/${safeX}/${safeY}.png`;
}

function getOsmTileGrid({ latitude, longitude, zoom = 13 }) {
  const { x, y, z, n } = latLngToTileXY(latitude, longitude, zoom);
  return [
    getOsmTileUrl(z, x, y, n),
    getOsmTileUrl(z, x + 1, y, n),
    getOsmTileUrl(z, x, y + 1, n),
    getOsmTileUrl(z, x + 1, y + 1, n),
  ];
}

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
  const [placeQuery, setPlaceQuery] = useState('');
  const [mapLoadError, setMapLoadError] = useState(false);

  const [distancePref, setDistancePref] = useState(existing?.distancePref || DEFAULTS.distancePref);
  const [placePref, setPlacePref] = useState(existing?.placePref || DEFAULTS.placePref);
  const [groupPref, setGroupPref] = useState(existing?.groupPref || DEFAULTS.groupPref);
  const [timePref, setTimePref] = useState(existing?.timePref || DEFAULTS.timePref);
  const [categoryPrefs, setCategoryPrefs] = useState(existing?.categoryPrefs || DEFAULTS.categoryPrefs);

  const mapBaseLocation = useMemo(() => {
    return onsiteLocation || ONSITE_PRESETS[onsitePresetIndex] || ONSITE_PRESETS[0];
  }, [onsiteLocation, onsitePresetIndex]);

  const mapTileUris = useMemo(() => {
    return getOsmTileGrid(mapBaseLocation);
  }, [mapBaseLocation]);

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
                setPlaceQuery('');
              }}
            />
            <SegmentButton
              label={activityMode === 'onsite' ? '✓ ออนไซต์' : 'ออนไซต์'}
              active={activityMode === 'onsite'}
              onPress={() => setActivityMode('onsite')}
            />
          </View>

          {activityMode === 'onsite' ? (
            <View style={styles.onsiteWrap}>
              <View style={styles.mapFrame}>
                <Pressable
                  onPress={() => {
                    const nextIdx = (onsitePresetIndex + 1) % ONSITE_PRESETS.length;
                    setOnsitePresetIndex(nextIdx);
                    setOnsiteLocation(ONSITE_PRESETS[nextIdx]);
                    setMapLoadError(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="แผนที่ (mock) แตะเพื่อเลือกตำแหน่ง"
                  style={styles.mapTap}
                >
                  {mapLoadError ? (
                    <View style={styles.mapFallback}>
                      <Ionicons name="map" size={28} color={WarmClearTheme.colors.textSub} />
                      <Text style={styles.mapFallbackText}>แผนที่ยังโหลดไม่ได้ (mock)</Text>
                      <Text style={styles.mapFallbackSubText}>แตะเพื่อสลับตำแหน่งตัวอย่าง</Text>
                    </View>
                  ) : (
                    <View style={styles.mapTileGrid}>
                      <View style={styles.mapTileRow}>
                        <Image
                          source={{ uri: mapTileUris[0] }}
                          resizeMode="cover"
                          style={styles.mapTile}
                          onError={() => setMapLoadError(true)}
                          accessibilityLabel="แผนที่ตัวอย่าง (tile 1)"
                        />
                        <Image
                          source={{ uri: mapTileUris[1] }}
                          resizeMode="cover"
                          style={styles.mapTile}
                          onError={() => setMapLoadError(true)}
                          accessibilityLabel="แผนที่ตัวอย่าง (tile 2)"
                        />
                      </View>
                      <View style={styles.mapTileRow}>
                        <Image
                          source={{ uri: mapTileUris[2] }}
                          resizeMode="cover"
                          style={styles.mapTile}
                          onError={() => setMapLoadError(true)}
                          accessibilityLabel="แผนที่ตัวอย่าง (tile 3)"
                        />
                        <Image
                          source={{ uri: mapTileUris[3] }}
                          resizeMode="cover"
                          style={styles.mapTile}
                          onError={() => setMapLoadError(true)}
                          accessibilityLabel="แผนที่ตัวอย่าง (tile 4)"
                        />
                      </View>
                    </View>
                  )}

                  <View pointerEvents="none" style={styles.mapPinOverlay}>
                    <Ionicons
                      name="location-sharp"
                      size={26}
                      color={WarmClearTheme.colors.primary}
                    />
                  </View>
                </Pressable>

                <View style={styles.mapSearchOverlay}>
                  <TextInput
                    value={placeQuery}
                    onChangeText={setPlaceQuery}
                    placeholder="ค้นหาสถานที่"
                    placeholderTextColor={WarmClearTheme.colors.textMuted}
                    style={styles.mapSearchInput}
                    returnKeyType="search"
                    onSubmitEditing={() => {
                      const trimmed = placeQuery.trim();
                      if (!trimmed) return;
                      const base = onsiteLocation || ONSITE_PRESETS[onsitePresetIndex] || ONSITE_PRESETS[0];
                      setOnsiteLocation({
                        label: `${trimmed} (mock)`,
                        latitude: base.latitude,
                        longitude: base.longitude,
                      });
                    }}
                  />
                  <Pressable
                    onPress={() => {
                      const trimmed = placeQuery.trim();
                      if (!trimmed) {
                        Alert.alert('ค้นหาสถานที่', 'กรุณาพิมพ์ชื่อสถานที่');
                        return;
                      }

                      const base = onsiteLocation || ONSITE_PRESETS[onsitePresetIndex] || ONSITE_PRESETS[0];
                      setOnsiteLocation({
                        label: `${trimmed} (mock)`,
                        latitude: base.latitude,
                        longitude: base.longitude,
                      });
                      setMapLoadError(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="ค้นหาสถานที่"
                    style={styles.mapSearchButton}
                  >
                    <Ionicons name="search" size={22} color={WarmClearTheme.colors.text} />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.mapSelectedText}>
                {onsiteLocation ? `📍 ${onsiteLocation.label}` : 'ยังไม่ได้เลือกตำแหน่ง'}
              </Text>
            </View>
          ) : null}
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
  onsiteWrap: {
    marginTop: 14,
    gap: 12,
  },
  mapFrame: {
    borderRadius: WarmClearTheme.radii.card,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    overflow: 'hidden',
    ...WarmClearTheme.shadows.subtle,
  },
  mapTap: {
    minHeight: 220,
  },
  mapTileGrid: {
    width: '100%',
    height: 220,
  },
  mapTileRow: {
    flex: 1,
    flexDirection: 'row',
  },
  mapTile: {
    flex: 1,
  },
  mapPinOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFallback: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mapFallbackText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.textSub,
  },
  mapFallbackSubText: {
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.textMuted,
  },
  mapSearchOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.control,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  mapSearchInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
  },
  mapSearchButton: {
    minHeight: 52,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: WarmClearTheme.colors.border,
  },
  mapSelectedText: {
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
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