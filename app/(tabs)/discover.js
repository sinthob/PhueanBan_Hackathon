import React, { useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ActivityCard from '../../components/ActivityCard';
import { activities, categories, currentUser } from '../../data/mockData';
import { getActivityProfile } from '../../data/aiProfileStore';
import { WarmClearTheme } from '../../theme';

function parseDistanceKm(distanceText) {
  if (typeof distanceText !== 'string') {
    return Number.NaN;
  }
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
    if (keywords.some((kw) => text.includes(kw))) {
      prefs.add(category);
    }
  });

  return prefs;
}

function scoreActivity(activity, preferredCategories, promptText, profile) {
  let score = 0;
  const prompt = (promptText || '').toLowerCase();

  if (preferredCategories?.size && preferredCategories.has(activity.category)) {
    score += 30;
  }

  if (activity.difficulty === 'ง่าย') {
    score += 16;
  } else if (activity.difficulty === 'ปานกลาง') {
    score += 8;
  }

  const distanceKm = parseDistanceKm(activity.distance);
  if (Number.isFinite(distanceKm)) {
    score += Math.max(0, 15 - distanceKm * 5);

    if (profile?.distancePref === 'near') {
      score += distanceKm <= 1.0 ? 10 : -10;
    }
    if (profile?.distancePref === 'medium') {
      score += distanceKm <= 2.5 ? 6 : -6;
    }
  }

  if (typeof activity.participants === 'number' && typeof activity.maxParticipants === 'number') {
    const ratio = activity.maxParticipants > 0 ? activity.participants / activity.maxParticipants : 1;
    score += Math.max(0, (1 - ratio) * 10);
  }

  if (profile?.groupPref === 'small' && typeof activity.maxParticipants === 'number') {
    score += activity.maxParticipants <= 12 ? 8 : -8;
  }
  if (profile?.groupPref === 'medium' && typeof activity.maxParticipants === 'number') {
    score += activity.maxParticipants <= 20 ? 4 : -4;
  }

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

  if (preferredCategories?.size && preferredCategories.has(activity.category)) {
    reasons.push('ตรงกับความสนใจที่บอกไว้');
  }

  const distanceKm = parseDistanceKm(activity.distance);
  if (Number.isFinite(distanceKm) && distanceKm <= 1.2) {
    reasons.push('ใกล้บ้าน เดินทางสะดวก');
  }

  if (profile?.distancePref === 'near' && Number.isFinite(distanceKm) && distanceKm <= 1.0) {
    reasons.push('ตรงเงื่อนไข: ใกล้มาก');
  }

  if (activity.difficulty === 'ง่าย') {
    reasons.push('ระดับง่าย เหมาะเริ่มต้น');
  }

  if (typeof activity.maxParticipants === 'number' && activity.maxParticipants <= 12) {
    reasons.push('กลุ่มไม่ใหญ่ ดูแลกันทั่วถึง');
  }

  if (profile?.groupPref === 'small' && typeof activity.maxParticipants === 'number' && activity.maxParticipants <= 12) {
    reasons.push('ตรงเงื่อนไข: กลุ่มเล็ก');
  }

  const tags = Array.isArray(activity.tags) ? activity.tags : [];
  if (tags.some((t) => t.includes('ฟรี'))) {
    reasons.push('ค่าใช้จ่ายไม่สูง/ฟรี');
  }
  if (tags.some((t) => t.includes('ในร่ม')) && prompt.includes('ในร่ม')) {
    reasons.push('ทำในร่ม เหมาะกับอากาศร้อน');
  }

  return reasons.slice(0, 3);
}

function buildAiRecommendations({ promptText, sourceActivities, profile }) {
  const preferred = extractPreferredCategories(promptText);

  const scored = sourceActivities
    .map((activity) => ({
      activity,
      score: scoreActivity(activity, preferred, promptText, profile),
    }))
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 3).map(({ activity }) => ({
    activity,
    reasons: buildReasons(activity, preferred, promptText, profile),
  }));

  return top;
}

export default function DiscoverScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);

  const filteredActivities = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return activities.filter((activity) => {
      const matchesCategory =
        selectedCategory === 'all' || activity.category === selectedCategory;
      if (!query) {
        return matchesCategory;
      }
      const inTitle = activity.title.toLowerCase().includes(query);
      const inDescription = activity.description.toLowerCase().includes(query);
      const inTags = activity.tags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && (inTitle || inDescription || inTags);
    });
  }, [searchText, selectedCategory]);

  const aiSourceActivities = useMemo(() => {
    if (filteredActivities.length > 0) {
      return filteredActivities;
    }
    return activities;
  }, [filteredActivities]);

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
        sourceActivities: aiSourceActivities,
        profile,
      });
      setAiResults(recommendations);
      setAiLoading(false);
    }, 650);
  };

  const handleJoinMock = (activity) => {
    Alert.alert('ลงทะเบียนแล้ว (ตัวอย่าง)', `คุณได้ลงทะเบียน “${activity.title}” เรียบร้อย`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>ค้นหากิจกรรม</Text>
        <Text style={styles.subtitle}>กิจกรรมใกล้คุณและตรงกับความสนใจ</Text>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="ค้นหากิจกรรม หรือคำที่สนใจ"
          placeholderTextColor="#6b7280"
          style={styles.searchInput}
        />
        <Pressable
          onPress={() =>
            Alert.alert('สั่งด้วยเสียง (mock)', 'ฟีเจอร์สั่งด้วยเสียงกำลังพัฒนา')
          }
          style={styles.micButton}
          accessibilityRole="button"
          accessibilityLabel="สั่งด้วยเสียง"
        >
          <Ionicons name="mic" size={28} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((category) => {
          const isActive = category.value === selectedCategory;
          return (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategory(category.value)}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
            >
              <Text
                style={[styles.categoryText, isActive && styles.categoryTextActive]}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.aiCard}>
        <View style={styles.aiHeaderRow}>
          <Ionicons name="sparkles-outline" size={22} color={WarmClearTheme.colors.primary} style={styles.aiIconImg} />
          <View style={styles.aiHeaderBody}>
            <Text style={styles.aiTitle}>AI แนะนำกิจกรรมสำหรับคุณ</Text>
            <Text style={styles.aiSubtitle}>
              ใส่ความต้องการสั้นๆ แล้วให้ AI ช่วยคัดให้
            </Text>
          </View>
        </View>

        <TextInput
          value={aiPrompt}
          onChangeText={setAiPrompt}
          placeholder="เช่น อยากขยับร่างกายเบาๆ ใกล้บ้าน ไม่ชอบคนเยอะ"
          placeholderTextColor="#6b7280"
          style={styles.aiInput}
        />

        <View style={styles.aiActionRow}>
          <Pressable
            onPress={runAiMock}
            disabled={aiLoading}
            style={[styles.aiButton, aiLoading && styles.aiButtonDisabled]}
          >
            <Text style={styles.aiButtonText}>{aiLoading ? 'กำลังคิด...' : 'ให้ AI แนะนำ'}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setAiPrompt('');
              setAiResults([]);
            }}
            disabled={aiLoading}
            style={styles.aiSecondaryButton}
          >
            <Text style={styles.aiSecondaryButtonText}>ล้าง</Text>
          </Pressable>
        </View>

        {aiLoading ? (
          <View style={styles.aiLoadingRow}>
            <ActivityIndicator color={WarmClearTheme.colors.primary} />
            <Text style={styles.aiLoadingText}>กำลังจัดชุดกิจกรรมที่เหมาะกับคุณ…</Text>
          </View>
        ) : null}

        {aiResults.length > 0 ? (
          <View style={styles.aiResultsWrap}>
            <Text style={styles.aiResultsTitle}>แนะนำ 3 กิจกรรม</Text>
            {aiResults.map((rec) => (
              <View key={`ai-${rec.activity.id}`} style={styles.aiResultItem}>
                <View style={styles.reasonRow}>
                  {rec.reasons.map((reason, idx) => (
                    <View key={`${rec.activity.id}-reason-${idx}`} style={styles.reasonChip}>
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
                <ActivityCard activity={rec.activity} onJoin={handleJoinMock} />
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {filteredActivities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} onJoin={handleJoinMock} />
      ))}
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
    fontSize: 28,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '700',
    lineHeight: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 8,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.bar,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: WarmClearTheme.radii.control,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    fontSize: 18,
    borderWidth: 0,
    color: WarmClearTheme.colors.text,
    fontWeight: '700',
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  categoryRow: {
    paddingBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 48,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.chip,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    marginRight: 8,
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  categoryChipActive: {
    backgroundColor: WarmClearTheme.colors.primary,
    borderColor: WarmClearTheme.colors.primary,
  },
  categoryText: {
    fontSize: 18,
    color: WarmClearTheme.colors.text,
    fontWeight: '900',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  aiCard: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    marginBottom: 16,
    ...WarmClearTheme.shadows.card,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  aiIconImg: {
    marginTop: 2,
  },
  aiHeaderBody: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    lineHeight: 24,
    fontWeight: '700',
  },
  aiInput: {
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.control,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
    fontSize: 18,
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
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  aiButtonDisabled: {
    opacity: 0.7,
  },
  aiButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  aiSecondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: WarmClearTheme.radii.control,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surface,
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  aiSecondaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  aiLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  aiLoadingText: {
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '800',
  },
  aiResultsWrap: {
    marginTop: 14,
  },
  aiResultsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 10,
  },
  aiResultItem: {
    marginBottom: 4,
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
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    ...WarmClearTheme.shadows.subtle,
  },
  reasonText: {
    fontSize: 16,
    color: WarmClearTheme.colors.primaryDark,
    fontWeight: '900',
  },
});