import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { getActivityProfile } from '../../data/aiProfileStore';
import { addUserActivity } from '../../data/userActivitiesStore';
import { WarmClearTheme } from '../../theme';

// ── Thai helpers ──
const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

// ── Date Picker Modal ──
function DatePickerModal({ visible, onClose, onConfirm }) {
  const now = new Date();
  const [day, setDay] = useState(now.getDate());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const daysInMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, daysInMonth);
  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() + i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pStyles.overlay} onPress={onClose}>
        <Pressable style={pStyles.panel} onPress={(e) => e.stopPropagation()}>
          <Text style={pStyles.title}>เลือกวันที่</Text>

          <Text style={pStyles.label}>ปี พ.ศ.</Text>
          <View style={pStyles.chipRow}>
            {years.map((y) => (
              <Pressable key={y} onPress={() => setYear(y)}
                style={[pStyles.chip, year === y && pStyles.chipActive]}>
                <Text style={[pStyles.chipText, year === y && pStyles.chipTextActive]}>
                  {y + 543}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={pStyles.label}>เดือน</Text>
          <View style={pStyles.chipRow}>
            {THAI_MONTHS.map((m, idx) => (
              <Pressable key={idx} onPress={() => setMonth(idx + 1)}
                style={[pStyles.chip, month === idx + 1 && pStyles.chipActive]}>
                <Text style={[pStyles.chipText, month === idx + 1 && pStyles.chipTextActive]}>
                  {m.slice(0, 3)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={pStyles.label}>วันที่</Text>
          <View style={pStyles.dayGrid}>
            {days.map((d) => (
              <Pressable key={d} onPress={() => setDay(d)}
                style={[pStyles.dayChip, safeDay === d && pStyles.chipActive]}>
                <Text style={[pStyles.dayChipText, safeDay === d && pStyles.chipTextActive]}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={pStyles.confirmBtn}
            onPress={() => onConfirm({ day: safeDay, month, year })}>
            <Text style={pStyles.confirmText}>ถัดไป: เลือกเวลา ›</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Time Picker Modal ──
function TimePickerModal({ visible, onClose, onConfirm, dateLabel }) {
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pStyles.overlay} onPress={onClose}>
        <Pressable style={pStyles.panel} onPress={(e) => e.stopPropagation()}>
          <Text style={pStyles.title}>เลือกเวลา</Text>
          {dateLabel ? <Text style={pStyles.dateLabel}>{dateLabel}</Text> : null}

          <Text style={pStyles.label}>ชั่วโมง</Text>
          <View style={pStyles.dayGrid}>
            {hours.map((h) => (
              <Pressable key={h} onPress={() => setHour(h)}
                style={[pStyles.dayChip, hour === h && pStyles.chipActive]}>
                <Text style={[pStyles.dayChipText, hour === h && pStyles.chipTextActive]}>
                  {String(h).padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[pStyles.label, { marginTop: 14 }]}>นาที</Text>
          <View style={pStyles.chipRow}>
            {minutes.map((m) => (
              <Pressable key={m} onPress={() => setMinute(m)}
                style={[pStyles.chip, minute === m && pStyles.chipActive]}>
                <Text style={[pStyles.chipText, minute === m && pStyles.chipTextActive]}>
                  {String(m).padStart(2, '0')}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={pStyles.confirmBtn}
            onPress={() => onConfirm({ hour, minute })}>
            <Text style={pStyles.confirmText}>ยืนยัน</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const pStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 20,
    width: '100%',
    maxHeight: '88%',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: WarmClearTheme.radii.control,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
  },
  chipActive: {
    backgroundColor: WarmClearTheme.colors.primary,
    borderColor: WarmClearTheme.colors.primary,
  },
  chipText: { fontSize: 16, fontWeight: '800', color: WarmClearTheme.colors.text },
  chipTextActive: { color: '#ffffff' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  dayChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
  },
  dayChipText: { fontSize: 16, fontWeight: '800', color: WarmClearTheme.colors.text },
  confirmBtn: {
    marginTop: 8,
    backgroundColor: WarmClearTheme.colors.primary,
    borderRadius: WarmClearTheme.radii.control,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { fontSize: 18, fontWeight: '900', color: '#ffffff' },
});

// ── Segment Button ──
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
  groupPref: 'small',
  timePref: 'morning',
};

const ONSITE_PRESETS = [
  { label: 'สวนสาธารณะใกล้บ้าน (mock)', latitude: 13.7563, longitude: 100.5018 },
  { label: 'ศูนย์ชุมชน (mock)', latitude: 13.7456, longitude: 100.5349 },
  { label: 'ตลาดใกล้บ้าน (mock)', latitude: 13.7383, longitude: 100.5609 },
];

function clampLat(lat) {
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

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  // Date/Time picker
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pendingDate, setPendingDate] = useState(null);

  const [activityMode, setActivityMode] = useState('online');
  const [onsiteLocation, setOnsiteLocation] = useState(null);
  const [onsitePresetIndex, setOnsitePresetIndex] = useState(0);
  const [placeQuery, setPlaceQuery] = useState('');
  const [mapLoadError, setMapLoadError] = useState(false);

  // AI description generation
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(''); // ข้อความที่ AI เจนมา

  const generateAiDescription = async (activityTitle) => {
    if (!activityTitle.trim()) return;
    setAiGenerating(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: `เขียนคำอธิบายกิจกรรม "${activityTitle}" สั้นๆ 1-2 ประโยค ภาษาไทย เป็นกันเอง เหมาะสำหรับผู้สูงอายุ ไม่ต้องมีคำนำหน้า ตอบแค่คำอธิบายเท่านั้น`,
          }],
        }),
      });
      const data = await response.json();
      const text = data?.content?.[0]?.text?.trim() || '';
      if (text) {
        setAiGenerated(text);
        setDetails(text);
      }
    } catch (e) {
      Alert.alert('ไม่สามารถเชื่อมต่อ AI ได้', 'ลองพิมพ์รายละเอียดเองได้เลยครับ');
    } finally {
      setAiGenerating(false);
    }
  };

  const startAtLabel = useMemo(() => {
    if (!selectedDate) return '';
    const d = selectedDate;
    const dateStr = `${d.day} ${THAI_MONTHS[d.month - 1]} ${d.year + 543}`;
    if (!selectedTime) return dateStr;
    return `${dateStr}  ${String(selectedTime.hour).padStart(2, '0')}:${String(selectedTime.minute).padStart(2, '0')} น.`;
  }, [selectedDate, selectedTime]);

  const mapBaseLocation = useMemo(() => {
    return onsiteLocation || ONSITE_PRESETS[onsitePresetIndex] || ONSITE_PRESETS[0];
  }, [onsiteLocation, onsitePresetIndex]);

  const mapTileUris = useMemo(() => {
    return getOsmTileGrid(mapBaseLocation);
  }, [mapBaseLocation]);

  const onSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณาใส่ชื่อกิจกรรม');
      return;
    }
    if (!selectedDate) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณาเลือกวันที่และเวลา');
      return;
    }
    if (activityMode === 'onsite' && !onsiteLocation) {
      Alert.alert('เลือกตำแหน่ง', 'กรุณาเลือกตำแหน่งบนแผนที่');
      return;
    }

    const newActivity = {
      id: `user_${Date.now()}`,
      title: trimmedTitle,
      description: details.trim() || aiGenerated || `กิจกรรม${trimmedTitle} ร่วมสนุกด้วยกัน`,
      category: 'social',
      icon: '⭐',
      time: startAtLabel,
      location: activityMode === 'onsite' && onsiteLocation ? onsiteLocation.label : 'ออนไลน์',
      distance: '0 กม.',
      participants: 1,
      maxParticipants: 20,
      mode: activityMode,
      difficulty: 'ง่าย',
      tags: ['กิจกรรมของฉัน'],
      organizer: { name: 'คุณ (ผู้สร้าง)', avatar: '👤' },
      isOwner: true,
    };

    addUserActivity(newActivity);

    // Reset form
    setTitle('');
    setDetails('');
    setAiGenerated('');
    setSelectedDate(null);
    setSelectedTime(null);
    setOnsiteLocation(null);
    setPlaceQuery('');
    setActivityMode('online');

    Alert.alert('สร้างกิจกรรมแล้ว! 🎉', `"${trimmedTitle}" ปรากฏในหน้าหลักแล้วครับ`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Date Picker */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(d) => {
          setPendingDate(d);
          setShowDatePicker(false);
          setShowTimePicker(true);
        }}
      />

      {/* Time Picker */}
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        dateLabel={
          pendingDate
            ? `${pendingDate.day} ${THAI_MONTHS[pendingDate.month - 1]} ${pendingDate.year + 543}`
            : ''
        }
        onConfirm={(t) => {
          setSelectedDate(pendingDate);
          setSelectedTime(t);
          setShowTimePicker(false);
        }}
      />

      {/* ── ข้อมูลพื้นฐาน ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ข้อมูลกิจกรรม</Text>

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
          onChangeText={(t) => { setDetails(t); setAiGenerated(''); }}
          placeholder="ไม่เขียนก็ได้ — กด AI ช่วยเขียน ด้านล่าง"
          placeholderTextColor={WarmClearTheme.colors.textMuted}
          style={[styles.input, styles.textArea, aiGenerated && details === aiGenerated && styles.inputAiGenerated]}
          multiline
        />
        <Pressable
          onPress={() => generateAiDescription(title)}
          disabled={aiGenerating || !title.trim()}
          style={[styles.aiDescBtn, (aiGenerating || !title.trim()) && styles.aiDescBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="ให้ AI ช่วยเขียนคำอธิบาย"
        >
          {aiGenerating ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.aiDescBtnText}>AI กำลังเขียน...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={18} color={aiGenerated ? '#065f46' : '#ffffff'} />
              <Text style={[styles.aiDescBtnText, aiGenerated && styles.aiDescBtnTextDone]}>
                {aiGenerated ? 'AI เขียนแล้ว ✓' : 'ให้ AI ช่วยเขียน'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.cardSpacing} />

      {/* ── วันที่และเวลา + รูปแบบ ── */}
      <View style={styles.card}>
        <Section title="วันที่และเวลากิจกรรม" description="แตะเพื่อเลือกวันและเวลาที่ต้องการ">
          <Pressable
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel="เลือกวันและเวลา"
            style={[styles.input, styles.datePickerBtn]}
          >
            {startAtLabel ? (
              <Text style={styles.datePickerValueText}>{startAtLabel}</Text>
            ) : (
              <Text style={styles.datePickerPlaceholder}>แตะเพื่อเลือกวันและเวลา</Text>
            )}
            <Ionicons name="calendar-outline" size={22} color={WarmClearTheme.colors.primary} />
          </Pressable>
          {startAtLabel ? (
            <Pressable
              onPress={() => { setSelectedDate(null); setSelectedTime(null); }}
              style={styles.clearDateBtn}
            >
              <Text style={styles.clearDateText}>ล้างวันที่</Text>
            </Pressable>
          ) : null}
        </Section>

        <View style={styles.sectionSpacer} />

        {/* รูปแบบกิจกรรม */}
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
                  accessibilityLabel="แผนที่ แตะเพื่อเลือกตำแหน่ง"
                  style={styles.mapTap}
                >
                  {mapLoadError ? (
                    <View style={styles.mapFallback}>
                      <Ionicons name="map" size={28} color={WarmClearTheme.colors.textSub} />
                      <Text style={styles.mapFallbackText}>แผนที่ยังโหลดไม่ได้</Text>
                      <Text style={styles.mapFallbackSubText}>แตะเพื่อสลับตำแหน่งตัวอย่าง</Text>
                    </View>
                  ) : (
                    <View style={styles.mapTileGrid}>
                      <View style={styles.mapTileRow}>
                        <Image source={{ uri: mapTileUris[0] }} resizeMode="cover" style={styles.mapTile} onError={() => setMapLoadError(true)} />
                        <Image source={{ uri: mapTileUris[1] }} resizeMode="cover" style={styles.mapTile} onError={() => setMapLoadError(true)} />
                      </View>
                      <View style={styles.mapTileRow}>
                        <Image source={{ uri: mapTileUris[2] }} resizeMode="cover" style={styles.mapTile} onError={() => setMapLoadError(true)} />
                        <Image source={{ uri: mapTileUris[3] }} resizeMode="cover" style={styles.mapTile} onError={() => setMapLoadError(true)} />
                      </View>
                    </View>
                  )}
                  <View pointerEvents="none" style={styles.mapPinOverlay}>
                    <Ionicons name="location-sharp" size={26} color={WarmClearTheme.colors.primary} />
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
                      setOnsiteLocation({ label: `${trimmed} (mock)`, latitude: base.latitude, longitude: base.longitude });
                    }}
                  />
                  <Pressable
                    onPress={() => {
                      const trimmed = placeQuery.trim();
                      if (!trimmed) { Alert.alert('ค้นหาสถานที่', 'กรุณาพิมพ์ชื่อสถานที่'); return; }
                      const base = onsiteLocation || ONSITE_PRESETS[onsitePresetIndex] || ONSITE_PRESETS[0];
                      setOnsiteLocation({ label: `${trimmed} (mock)`, latitude: base.latitude, longitude: base.longitude });
                      setMapLoadError(false);
                    }}
                    accessibilityRole="button"
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
      </View>

      {/* ── ปุ่มสร้าง ── */}
      <View style={styles.actions}>
        <Pressable
          onPress={onSave}
          accessibilityRole="button"
          accessibilityLabel="สร้างกิจกรรม"
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>สร้างกิจกรรม</Text>
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
  inputAiGenerated: {
    borderColor: WarmClearTheme.colors.primary,
    backgroundColor: '#f0fdf4',
  },
  aiDescBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: WarmClearTheme.colors.primary,
    borderRadius: WarmClearTheme.radii.control,
    minHeight: 48,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    ...WarmClearTheme.shadows.button,
  },
  aiDescBtnDisabled: {
    opacity: 0.5,
  },
  aiDescBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  aiDescBtnTextDone: {
    color: '#ffffff',
  },

  // Date picker
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
    flex: 1,
  },
  datePickerPlaceholder: {
    fontSize: 18,
    fontWeight: '800',
    color: WarmClearTheme.colors.textMuted,
    flex: 1,
  },
  clearDateBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    fontSize: 15,
    fontWeight: '800',
    color: WarmClearTheme.colors.primary,
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

  // Primary button — สีเดียวกับปุ่ม + bar (#E8A020 amber/orange)
  primaryButton: {
    minHeight: 60,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: '#E8A020',
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  actions: {
    marginTop: 14,
  },

  // Map
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
  mapTap: { minHeight: 220 },
  mapTileGrid: { width: '100%', height: 220 },
  mapTileRow: { flex: 1, flexDirection: 'row' },
  mapTile: { flex: 1 },
  mapPinOverlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  mapFallback: {
    width: '100%', height: 220,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  mapFallbackText: { fontSize: 16, fontWeight: '900', color: WarmClearTheme.colors.textSub },
  mapFallbackSubText: { fontSize: 14, fontWeight: '800', color: WarmClearTheme.colors.textMuted },
  mapSearchOverlay: {
    position: 'absolute', top: 12, left: 12, right: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.control,
    borderWidth: 1, borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  mapSearchInput: {
    flex: 1, minHeight: 52, paddingHorizontal: 14,
    fontSize: 18, fontWeight: '800', color: WarmClearTheme.colors.text,
  },
  mapSearchButton: {
    minHeight: 52, width: 56, alignItems: 'center', justifyContent: 'center',
    borderLeftWidth: 1, borderLeftColor: WarmClearTheme.colors.border,
  },
  mapSelectedText: {
    fontSize: 16, fontWeight: '800',
    color: WarmClearTheme.colors.textSub, lineHeight: 22,
  },
});