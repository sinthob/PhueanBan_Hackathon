import React, { useMemo, useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ActivityCard from '../../components/ActivityCard';
import { activities, categories, currentUser } from '../../data/mockData';
import { getActivityProfile } from '../../data/aiProfileStore';
import { WarmClearTheme } from '../../theme';

// ── AI helpers (ย้ายมาจาก discover.js) ──
function parseDistanceKm(distanceText) {
  if (typeof distanceText !== 'string') return Number.NaN;
  const numeric = Number.parseFloat(distanceText.replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : Number.NaN;
}

function extractPreferredCategories(inputText) {
  const text = (inputText || '').toLowerCase();
  const prefs = new Set();
  const keywordMap = [
    { keywords: ['เดิน', 'วิ่ง', 'ออกกำลัง', 'โยคะ', 'ยืดเหยียด'], category: 'exercise' },
    { keywords: ['ทำอาหาร', 'ทำขนม', 'ขนม', 'ครัว'], category: 'cooking' },
    { keywords: ['เพื่อน', 'คุย', 'ชุมชน', 'ตลาด', 'พบปะ'], category: 'social' },
    { keywords: ['จิตอาสา', 'อาสา', 'ปลูกต้นไม้', 'ปลูก'], category: 'volunteer' },
    { keywords: ['หนัง', 'ภาพยนตร์', 'ดูหนัง', 'บันเทิง'], category: 'entertainment' },
    { keywords: ['เรียน', 'ฝึก', 'อ่าน', 'เวิร์กช็อป'], category: 'learning' },
  ];
  keywordMap.forEach(({ keywords, category }) => {
    if (keywords.some((kw) => text.includes(kw))) prefs.add(category);
  });
  return prefs;
}

function scoreActivity(activity, preferredCategories, promptText, profile) {
  let score = 0;
  const prompt = (promptText || '').toLowerCase();
  if (preferredCategories?.size && preferredCategories.has(activity.category)) score += 30;
  if (activity.difficulty === 'ง่าย') score += 16;
  else if (activity.difficulty === 'ปานกลาง') score += 8;
  const distanceKm = parseDistanceKm(activity.distance);
  if (Number.isFinite(distanceKm)) {
    score += Math.max(0, 15 - distanceKm * 5);
    if (profile?.distancePref === 'near') score += distanceKm <= 1.0 ? 10 : -10;
    if (profile?.distancePref === 'medium') score += distanceKm <= 2.5 ? 6 : -6;
  }
  if (typeof activity.participants === 'number' && typeof activity.maxParticipants === 'number') {
    const ratio = activity.maxParticipants > 0 ? activity.participants / activity.maxParticipants : 1;
    score += Math.max(0, (1 - ratio) * 10);
  }
  if (profile?.groupPref === 'small' && typeof activity.maxParticipants === 'number')
    score += activity.maxParticipants <= 12 ? 8 : -8;
  if (profile?.groupPref === 'medium' && typeof activity.maxParticipants === 'number')
    score += activity.maxParticipants <= 20 ? 4 : -4;
  const tags = Array.isArray(activity.tags) ? activity.tags.join(' ') : '';
  if (tags.includes('กลุ่มเล็ก')) score += 8;
  if (tags.includes('ฟรี')) score += 6;
  if (tags.includes('ในร่ม') && prompt.includes('ในร่ม')) score += 6;
  if (tags.includes('สบาย') && prompt.includes('สบาย')) score += 4;
  return score;
}

function buildReasons(activity, preferredCategories, promptText, profile) {
  const reasons = [];
  const prompt = (promptText || '').toLowerCase();
  if (preferredCategories?.size && preferredCategories.has(activity.category))
    reasons.push('ตรงกับความสนใจที่บอกไว้');
  const distanceKm = parseDistanceKm(activity.distance);
  if (Number.isFinite(distanceKm) && distanceKm <= 1.2) reasons.push('ใกล้บ้าน เดินทางสะดวก');
  if (profile?.distancePref === 'near' && Number.isFinite(distanceKm) && distanceKm <= 1.0)
    reasons.push('ตรงเงื่อนไข: ใกล้มาก');
  if (activity.difficulty === 'ง่าย') reasons.push('ระดับง่าย เหมาะเริ่มต้น');
  if (typeof activity.maxParticipants === 'number' && activity.maxParticipants <= 12)
    reasons.push('กลุ่มไม่ใหญ่ ดูแลกันทั่วถึง');
  if (profile?.groupPref === 'small' && typeof activity.maxParticipants === 'number' && activity.maxParticipants <= 12)
    reasons.push('ตรงเงื่อนไข: กลุ่มเล็ก');
  const tags = Array.isArray(activity.tags) ? activity.tags : [];
  if (tags.some((t) => t.includes('ฟรี'))) reasons.push('ค่าใช้จ่ายไม่สูง/ฟรี');
  if (tags.some((t) => t.includes('ในร่ม')) && prompt.includes('ในร่ม'))
    reasons.push('ทำในร่ม เหมาะกับอากาศร้อน');
  return reasons.slice(0, 3);
}

function buildAiRecommendations({ promptText, sourceActivities, profile }) {
  const preferred = extractPreferredCategories(promptText);
  const scored = sourceActivities
    .map((activity) => ({ activity, score: scoreActivity(activity, preferred, promptText, profile) }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(({ activity }) => ({
    activity,
    reasons: buildReasons(activity, preferred, promptText, profile),
  }));
}

import {
  trackCheckinSuccess,
  trackActivityJoined,
} from '../../loneliness/loneliness';

const STORAGE_KEY = 'dailyPopup_lastShown';

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

// วันหยุดและวันสำคัญไทย (MM-DD)
const THAI_SPECIAL_DAYS = {
  '01-01': 'วันขึ้นปีใหม่',
  '02-14': 'วันวาเลนไทน์',
  '04-06': 'วันจักรี',
  '04-13': 'วันสงกรานต์',
  '04-14': 'วันสงกรานต์',
  '04-15': 'วันสงกรานต์',
  '05-01': 'วันแรงงานแห่งชาติ',
  '05-05': 'วันฉัตรมงคล',
  '06-03': 'วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี',
  '07-28': 'วันเฉลิมพระชนมพรรษา ร.10',
  '08-12': 'วันแม่แห่งชาติ',
  '10-13': 'วันคล้ายวันสวรรคต ร.9',
  '10-23': 'วันปิยมหาราช',
  '12-05': 'วันพ่อแห่งชาติ',
  '12-10': 'วันรัฐธรรมนูญ',
  '12-31': 'วันสิ้นปี',
};

// วันพระ (8, 15, 23, 29/30 ของเดือนจันทรคติ — ประมาณด้วย offset)
function isWanPhra(date) {
  // ใช้ lunar approximation: วันพระตกทุก ~7 วัน จาก epoch
  const lunarEpoch = new Date('2000-01-06'); // วันพระ reference
  const diff = Math.floor((date - lunarEpoch) / (1000 * 60 * 60 * 24));
  return diff % 7 === 0;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

// ── รูปภาพสำหรับวันพิเศษ (DEV mockup) ──
// เพิ่ม key ให้ตรงกับ THAI_SPECIAL_DAYS แล้ว require รูปที่ต้องการ
const SPECIAL_DAY_IMAGES = {
  '08-12': require('../../assets/images/MotherDays.jpg'), // วันแม่
  // '12-05': require('../../assets/images/FatherDay.jpg'),
  // '01-01': require('../../assets/images/NewYear.jpg'),
  // '04-13': require('../../assets/images/Songkran.jpg'),
};

// ── รูปภาพสำหรับวันปกติ แยกตามวันในสัปดาห์ ──
// ลบ // หน้าวันที่มีรูปแล้ว วันที่ยังไม่มีรูปให้คง // ไว้ (ไม่งั้น build error)
const NORMAL_DAY_IMAGES = {
  // 0: require('../../assets/images/Sunday.jpg'),    // อาทิตย์
  1: require('../../assets/images/Monday.jpg'),       // จันทร์
  // 2: require('../../assets/images/Tuesday.jpg'),   // อังคาร
  3: require('../../assets/images/Wednesday.jpg'), // พุธ
  // 4: require('../../assets/images/Thursday.jpg'),  // พฤหัสบดี
  // 5: require('../../assets/images/Friday.jpg'),    // ศุกร์
  6: require('../../assets/images/Saturday.jpg'),     // เสาร์
};


// ── gradient สีตามวันในสัปดาห์ ──
const DAY_GRADIENTS = {
  0: ['#c084fc', '#9333ea', '#6b21a8'], // อาทิตย์ — ม่วง
  1: ['#facc15', '#ca8a04', '#854d0e'], // จันทร์   — เหลือง
  2: ['#f87171', '#dc2626', '#991b1b'], // อังคาร   — แดง
  3: ['#4ade80', '#16a34a', '#14532d'], // พุธ      — เขียว
  4: ['#fb923c', '#ea580c', '#9a3412'], // พฤหัส   — ส้ม
  5: ['#60a5fa', '#2563eb', '#1e3a8a'], // ศุกร์    — ฟ้า
  6: ['#e879f9', '#a21caf', '#701a75'], // เสาร์    — ม่วงชมพู
};

// ข้อความอวยพรสำหรับวันปกติ (สุ่มแสดง)
const DAILY_BLESSINGS = [
  'ขอให้วันนี้เป็นวันที่ดีและเต็มไปด้วยรอยยิ้มนะ',
  'วันใหม่ โอกาสใหม่ ขอให้วันนี้สดใสนะ',
  'ขอให้มีพลังงานดีๆ ตลอดทั้งวันเลย',
  'วันนี้ขอให้ทุกอย่างราบรื่นและมีความสุขนะ',
  'ยิ้มแย้มแจ่มใสไว้ วันนี้จะเป็นวันที่ดีแน่นอน',
];

function getDailyBlessing(date) {
  const idx = date.getDate() % DAILY_BLESSINGS.length;
  return DAILY_BLESSINGS[idx];
}

function getNextSpecialDay(now) {
  const year = now.getFullYear();
  let closest = null;
  let closestDiff = Infinity;
  for (const [key, label] of Object.entries(THAI_SPECIAL_DAYS)) {
    const [mm, dd] = key.split('-').map(Number);
    let candidate = new Date(year, mm - 1, dd);
    if (candidate - now <= 0) candidate = new Date(year + 1, mm - 1, dd);
    const diff = candidate - now;
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = { label, dd, month: THAI_MONTHS[mm - 1] };
    }
  }
  return closest;
}

function getTodayInfo() {
  // DEV: ลบ // เพื่อทดสอบวันพิเศษ
  const now = new Date('2025-08-12'); // วันแม่แห่งชาติ 👩
  // const now = new Date(); // ใช้วันจริงใน Production
  const dayName = THAI_DAYS[now.getDay()];
  const dd = now.getDate();
  const month = THAI_MONTHS[now.getMonth()];
  const buddhistYear = now.getFullYear() + 543;
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const ddStr = String(dd).padStart(2, '0');
  const key = `${mm}-${ddStr}`;

  let specialDay = THAI_SPECIAL_DAYS[key] || null;
  if (!specialDay && isWanPhra(now)) specialDay = 'วันพระ 🙏';

  const nextSpecial = !specialDay ? getNextSpecialDay(now) : null;

  const blessing = !specialDay ? getDailyBlessing(now) : null;
  const imageSource = SPECIAL_DAY_IMAGES[key] ?? NORMAL_DAY_IMAGES[now.getDay()] ?? null;
  const dayOfWeek = now.getDay();
  return { dayName, dd, month, buddhistYear, specialDay, nextSpecial, blessing, imageSource, dayOfWeek };
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [checkedIn, setCheckedIn] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const { dayName, dd, month, buddhistYear, specialDay, nextSpecial, blessing, imageSource, dayOfWeek } = getTodayInfo();
  const polite = currentUser.gender === 'female' ? 'ค่ะ' : 'ครับ';
  const firstName = currentUser.name.replace('คุณ', '').trim().split(' ')[0];

  // DEV MODE: แสดง popup ทุกครั้ง
  useEffect(() => {
    setPopupVisible(true); // comment บรรทัดนี้ไว้ถ้าเปิดใช้ Production
  }, []);

  // PRODUCTION: แสดง popup ครั้งเดียวต่อวัน
  // useEffect(() => {
  //   async function checkPopup() {
  //     try {
  //       const lastShown = await AsyncStorage.getItem(STORAGE_KEY);
  //       const today = getTodayString();
  //       if (lastShown !== today) {
  //         setPopupVisible(true);
  //       }
  //     } catch (_) {
  //       setPopupVisible(true);
  //     }
  //   }
  //   checkPopup();
  // }, []);

  const handleClosePopup = async () => {
    setPopupVisible(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, getTodayString());
    } catch (_) { }
  };

  const handleCheckin = async () => {
    if (checkedIn) return;
    setCheckedIn(true);
    handleClosePopup();
    try {
      await trackCheckinSuccess();
    } catch (_) { }
  };

  const handleJoin = async (_activity) => {
    try {
      await trackActivityJoined();
    } catch (_) { }
  };

  const runAiMock = () => {
    setAiLoading(true);
    setAiResults([]);
    setTimeout(() => {
      const profile = getActivityProfile();
      const profileText = profile
        ? `ระยะทาง:${profile.distancePref} กลุ่ม:${profile.groupPref} เวลา:${profile.timePref}`
        : '';
      const promptText = aiPrompt.trim() || `${currentUser.interests?.join(' ') ?? ''} ${profileText}`.trim();
      const recommendations = buildAiRecommendations({
        promptText,
        sourceActivities: activities,
        profile,
      });
      setAiResults(recommendations);
      setAiLoading(false);
    }, 650);
  };

  const filteredActivities = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return activities.filter((activity) => {
      const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
      if (!query) return matchesCategory;
      const inTitle = activity.title.toLowerCase().includes(query);
      const inDescription = activity.description.toLowerCase().includes(query);
      const inTags = activity.tags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && (inTitle || inDescription || inTags);
    });
  }, [searchText, selectedCategory]);

  const showFiltered = searchText.trim().length > 0 || selectedCategory !== 'all';
  const featuredActivities = activities.slice(0, 3);
  const visibleActivities = showFiltered ? filteredActivities : featuredActivities;

  return (
    <View style={styles.flex}>
      {/* ── Daily Popup Modal ── */}
      <Modal
        visible={popupVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClosePopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={specialDay ? ['#e8a020', '#c47010', '#9a5000'] : DAY_GRADIENTS[dayOfWeek]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.modalGradient}
            >
              {/* รูปภาพวันพิเศษ หรือรูปตามวันในสัปดาห์ */}
              {imageSource ? (
                <Image source={imageSource} style={styles.modalHeroImage} resizeMode="cover" />
              ) : (
                <View style={styles.modalImagePlaceholder} />
              )}

              <Text style={styles.modalTitleTop}>{dd} {month} พ.ศ. {buddhistYear}</Text>

              {specialDay ? (
                <>
                  <Text style={styles.modalTitleBottom}>
                    สวัสดีวัน{dayName}{polite} คุณ{firstName}
                  </Text>
                  <View style={styles.specialDayBadge}>
                    <Text style={styles.specialDayText}>วันนี้เป็น{specialDay}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.modalTitleBottom}>
                    สวัสดีวัน{dayName}{polite} คุณ{firstName}
                  </Text>
                  <View style={styles.specialDayBadge}>
                    <Text style={styles.specialDayText}>{blessing}{polite} คุณ{firstName}</Text>
                    {nextSpecial ? (
                      <View style={styles.nextSpecialRow}>
                        <View style={styles.nextSpecialBar} />
                        <Text style={styles.nextSpecialText}>
                          วันพิเศษใกล้สุด: {nextSpecial.label} — {nextSpecial.dd} {nextSpecial.month}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </>
              )}

              <Pressable
                onPress={handleCheckin}
                style={[styles.checkinBtn, checkedIn && styles.checkinBtnDone]}
              >
                <Text style={styles.checkinBtnText}>
                  {checkedIn ? 'เช็คอินแล้ว ✓' : 'เช็คอินวันนี้'}
                </Text>
              </Pressable>

            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* ── Main Content ── */}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={WarmClearTheme.colors.textMuted} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="ค้นหากิจกรรม"
            placeholderTextColor={WarmClearTheme.colors.textMuted}
            style={styles.searchInput}
          />
          {searchText.trim().length ? (
            <Pressable
              onPress={() => setSearchText('')}
              accessibilityRole="button"
              accessibilityLabel="ล้างคำค้นหา"
              style={styles.clearButton}
            >
              <Ionicons name="close" size={18} color={WarmClearTheme.colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat.value;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.value)}
                style={[styles.categoryChip, active ? styles.categoryChipActive : null]}
                accessibilityRole="button"
                accessibilityLabel={`หมวดหมู่ ${cat.label}`}
              >
                <Text style={[styles.categoryChipText, active ? styles.categoryChipTextActive : null]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.section}>
          {/* ── กล่อง AI แนะนำ ── */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeaderRow}>
              <Ionicons name="sparkles-outline" size={22} color={WarmClearTheme.colors.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>AI แนะนำกิจกรรมสำหรับคุณ</Text>
                <Text style={styles.aiSubtitle}>ใส่ความต้องการสั้นๆ แล้วให้ AI ช่วยคัดให้</Text>
              </View>
            </View>

            <TextInput
              value={aiPrompt}
              onChangeText={setAiPrompt}
              placeholder="เช่น อยากขยับร่างกายเบาๆ ใกล้บ้าน"
              placeholderTextColor={WarmClearTheme.colors.textMuted}
              style={styles.aiInput}
            />

            <View style={styles.aiActionRow}>
              <Pressable
                onPress={runAiMock}
                disabled={aiLoading}
                style={[styles.aiButton, aiLoading && { opacity: 0.7 }]}
              >
                <Text style={styles.aiButtonText}>{aiLoading ? 'กำลังคิด...' : 'ให้ AI แนะนำ'}</Text>
              </Pressable>
              <Pressable
                onPress={() => { setAiPrompt(''); setAiResults([]); }}
                disabled={aiLoading}
                style={styles.aiSecondaryButton}
              >
                <Text style={styles.aiSecondaryButtonText}>ล้าง</Text>
              </Pressable>
            </View>

            {aiLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
                <ActivityIndicator color={WarmClearTheme.colors.primary} />
                <Text style={styles.aiSubtitle}>กำลังจัดชุดกิจกรรมที่เหมาะกับคุณ…</Text>
              </View>
            ) : null}

            {aiResults.length > 0 ? (
              <View style={{ marginTop: 14 }}>
                <Text style={styles.aiResultsTitle}>แนะนำ 3 กิจกรรม</Text>
                {aiResults.map((rec) => (
                  <View key={`ai-${rec.activity.id}`} style={{ marginBottom: 4 }}>
                    <View style={styles.reasonRow}>
                      {rec.reasons.map((reason, idx) => (
                        <View key={`${rec.activity.id}-r-${idx}`} style={styles.reasonChip}>
                          <Text style={styles.reasonText}>{reason}</Text>
                        </View>
                      ))}
                    </View>
                    <ActivityCard activity={rec.activity} onJoin={handleJoin} />
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {showFiltered ? 'ผลการค้นหา' : 'กิจกรรมเด่นใกล้คุณ'}
            </Text>
            {!showFiltered ? <Text style={styles.sectionLink}>ดูทั้งหมด</Text> : null}
          </View>
          {visibleActivities.length ? (
            visibleActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} onJoin={handleJoin} />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>ไม่พบกิจกรรม</Text>
              <Text style={styles.emptyBody}>ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นดูนะ</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    paddingTop: 16,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: WarmClearTheme.radii.card,
    overflow: 'hidden',
    ...WarmClearTheme.shadows.bar,
  },
  modalGradient: {
    padding: 24,
    gap: 8,
  },
  modalTitleTop: {
    fontSize: 20,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 0,
  },
  modalTitleBottom: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  checkinBtn: {
    marginTop: 8,
    backgroundColor: '#F5C518',
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 0,
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginBottom: 4,
  },
  modalHeroImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 4,
  },
  specialDayBadge: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
    gap: 4,
  },
  specialDayText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  nextSpecialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    backgroundColor: 'rgba(0,0,0,0.20)',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  nextSpecialBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: '#FFB347',
  },
  nextSpecialText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFB347',
    flex: 1,
  },
  checkinBtnDone: {
    backgroundColor: '#d4a900',
  },
  checkinBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1a1a1a',
  },


  // ── Search ──
  searchWrap: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    borderRadius: WarmClearTheme.radii.control,
    ...WarmClearTheme.shadows.subtle,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },

  // ── Categories ──
  categoryRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
    gap: 10,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: WarmClearTheme.radii.chip,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderColor: WarmClearTheme.colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.textSub,
  },
  categoryChipTextActive: {
    color: WarmClearTheme.colors.primaryDark,
  },

  // ── Section ──
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  sectionLink: {
    fontSize: 14,
    color: WarmClearTheme.colors.primary,
    fontWeight: '900',
  },
  emptyCard: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 16,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
  },

  // ── AI Card ──
  aiCard: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    marginBottom: 20,
    ...WarmClearTheme.shadows.card,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 15,
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
    fontWeight: '700',
  },
  aiInput: {
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.control,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    marginBottom: 12,
    color: WarmClearTheme.colors.text,
    fontWeight: '700',
  },
  aiActionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  aiButton: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.primary,
    borderRadius: WarmClearTheme.radii.control,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  aiSecondaryButton: {
    paddingHorizontal: 14,
    minHeight: 48,
    borderRadius: WarmClearTheme.radii.control,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSecondaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  aiResultsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 10,
  },
  reasonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  reasonChip: {
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderRadius: WarmClearTheme.radii.chip,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  reasonText: {
    fontSize: 14,
    color: WarmClearTheme.colors.primaryDark,
    fontWeight: '900',
  },
});