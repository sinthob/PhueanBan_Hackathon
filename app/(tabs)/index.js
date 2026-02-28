import React, { useMemo, useState, useEffect } from 'react';
import {
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
import { activities, categories } from '../../data/mockData';
import { WarmClearTheme } from '../../theme';

import {
  trackCheckinSuccess,
  trackActivityJoined,
} from '../../loneliness/loneliness';

const STORAGE_KEY = 'dailyPopup_lastShown';

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

// วันหยุดและวันสำคัญไทย (MM-DD)
const THAI_SPECIAL_DAYS = {
  '01-01': 'วันขึ้นปีใหม่ 🎊',
  '02-14': 'วันวาเลนไทน์ 💝',
  '04-06': 'วันจักรี 👑',
  '04-13': 'วันสงกรานต์ 💦',
  '04-14': 'วันสงกรานต์ 💦',
  '04-15': 'วันสงกรานต์ 💦',
  '05-01': 'วันแรงงานแห่งชาติ 👷',
  '05-05': 'วันฉัตรมงคล 👑',
  '06-03': 'วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี 👸',
  '07-28': 'วันเฉลิมพระชนมพรรษา ร.10 🎂',
  '08-12': 'วันแม่แห่งชาติ 👩',
  '10-13': 'วันคล้ายวันสวรรคต ร.9 🙏',
  '10-23': 'วันปิยมหาราช 🙏',
  '12-05': 'วันพ่อแห่งชาติ 👨',
  '12-10': 'วันรัฐธรรมนูญ 📜',
  '12-31': 'วันสิ้นปี 🎆',
};

// วันพระ (8, 15, 23, 29/30 ของเดือนจันทรคติ — ประมาณด้วย offset)
function isWanPhra(date) {
  // ใช้ lunar approximation: วันพระตกทุก ~7 วัน จาก epoch
  const lunarEpoch = new Date('2000-01-06'); // วันพระ reference
  const diff = Math.floor((date - lunarEpoch) / (1000 * 60 * 60 * 24));
  return diff % 7 === 0;
}

function getTodayInfo() {
  const now = new Date();
  const dayName = THAI_DAYS[now.getDay()];
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const key = `${mm}-${dd}`;

  let specialDay = THAI_SPECIAL_DAYS[key] || null;
  if (!specialDay && isWanPhra(now)) {
    specialDay = 'วันพระ 🙏';
  }

  return { dayName, specialDay };
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [checkedIn, setCheckedIn] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const { dayName, specialDay } = getTodayInfo();

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
    } catch (_) {}
  };

  const handleCheckin = async () => {
    if (checkedIn) return;
    setCheckedIn(true);
    handleClosePopup();
    try {
      await trackCheckinSuccess();
    } catch (_) {}
  };

  const handleJoin = async (_activity) => {
    try {
      await trackActivityJoined();
    } catch (_) {}
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
              colors={['#5ecfbf', '#3a9e8f', '#1f7a6e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitleTop}>สวัสดีวัน{dayName}</Text>
              <Text style={styles.modalTitleBottom}>วันนี้เป็นอย่างไรบ้าง?</Text>
              {specialDay ? (
                <View style={styles.specialDayBadge}>
                  <Text style={styles.specialDayText}>{specialDay}</Text>
                </View>
              ) : null}
              <Text style={styles.modalSubtitle}>
                กิจกรรมเด่นใกล้คุณ คัดมาเฉพาะละแวกนี้
              </Text>

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
  specialDayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 4,
  },
  specialDayText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
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
});