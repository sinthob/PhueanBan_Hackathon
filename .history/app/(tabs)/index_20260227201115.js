import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ActivityCard from '../../components/ActivityCard';
import { activities, categories } from '../../data/mockData';
import { WarmClearTheme } from '../../theme';

import {
  trackCheckinSuccess,
  trackActivityJoined,
} from '../../loneliness/loneliness';

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckin = async () => {
    if (checkedIn) return;
    setCheckedIn(true);
    try {
      await trackCheckinSuccess();
    } catch (_) {
      // best-effort tracking only
    }
  };

  const handleJoin = async (_activity) => {
    try {
      await trackActivityJoined();
    } catch (_) {
      // best-effort tracking only
    }
  };

  const filteredActivities = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return activities.filter((activity) => {
      const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
      if (!query) {
        return matchesCategory;
      }

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[WarmClearTheme.colors.primary, WarmClearTheme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>สวัสดี วันนี้เป็นอย่างไรบ้าง?</Text>
        <Text style={styles.headerSubtitle}>กิจกรรมเด่นใกล้คุณ คัดมาเฉพาะละแวกนี้</Text>

        <Pressable
          onPress={handleCheckin}
          style={[styles.checkinBtn, checkedIn && styles.checkinBtnDone]}
        >
          <Text style={styles.checkinBtnText}>
            {checkedIn ? 'เช็คอินแล้ว' : 'เช็คอินวันนี้'}
          </Text>
        </Pressable>
      </LinearGradient>

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
          <Text style={styles.sectionTitle}>{showFiltered ? 'ผลการค้นหา' : 'กิจกรรมเด่นใกล้คุณ'}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.background,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: WarmClearTheme.radii.card,
    borderBottomRightRadius: WarmClearTheme.radii.card,
    ...WarmClearTheme.shadows.bar,
    gap: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    lineHeight: 22,
  },
  checkinBtn: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  checkinBtnDone: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.20)',
  },
  checkinBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  searchWrap: {
    marginTop: 14,
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
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.textSub,
  },
  categoryChipTextActive: {
    color: WarmClearTheme.colors.primaryDark,
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