import React, { useMemo, useState, useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { currentUser, activities, friends } from '../../data/mockData';
import { caregiverUser, monitoringSnapshot } from '../../data/caregiverMock';
import { useAuth } from '../../providers/providers';
import { WarmClearTheme } from '../../theme';

// ── ประเภทกิจกรรม → ไทย ──
const CATEGORY_LABELS = {
  exercise:      'สุขภาพ/ออกกำลังกาย',
  cooking:       'ทำอาหาร',
  social:        'สังคม',
  volunteer:     'จิตอาสา',
  merit:         'ทำบุญ',
  learning:      'เรียนรู้',
  entertainment: 'บันเทิง',
};
const CATEGORY_COLORS = {
  exercise:      '#3b82f6',
  cooking:       '#f59e0b',
  social:        '#ec4899',
  volunteer:     '#ef4444',
  merit:         '#f97316',
  learning:      '#8b5cf6',
  entertainment: '#06b6d4',
};

// ── คำนวณสัดส่วนกิจกรรม จาก mockData ──
function buildCategoryStats(acts) {
  const counts = {};
  acts.forEach((a) => {
    counts[a.category] = (counts[a.category] || 0) + 1;
  });
  const total = acts.length || 1;
  return Object.entries(counts)
    .map(([cat, count]) => ({
      cat,
      label: CATEGORY_LABELS[cat] || cat,
      count,
      pct: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[cat] || '#aaa',
    }))
    .sort((a, b) => b.pct - a.pct);
}

// ── level badge ──
function levelStyle(level) {
  if (level === 'ok')    return { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', dot: '#10b981' };
  if (level === 'watch') return { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', dot: '#f59e0b' };
  return                  { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', dot: '#ef4444' };
}

// ── Loneliness score mock (0-100, ต่ำ = ดี) ──
const LONELINESS_SCORE = 32; // mock
function lonelinessColor(score) {
  if (score < 40) return '#10b981';
  if (score < 65) return '#f59e0b';
  return '#ef4444';
}
function lonelinessLabel(score) {
  if (score < 40) return 'ดี — มีสังคมที่ดี';
  if (score < 65) return 'ปานกลาง — ควรติดตาม';
  return 'น่าเป็นห่วง — ควรพูดคุย';
}

export default function CaregiverDashboardScreen() {
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const { signOut } = useAuth();

  const signals      = useMemo(() => monitoringSnapshot.safetySignals ?? [], []);
  const categoryStats = useMemo(() => buildCategoryStats(activities), []);
  const topCat       = categoryStats[0];
  const lColor       = lonelinessColor(LONELINESS_SCORE);

  // รายการกิจกรรมที่ออกไปล่าสุด 7 วัน (mock)
  const recentOutings = useMemo(() => [
    {
      id: '1',
      date: '2026-02-21',
      label: 'ศูนย์ชุมชนบางกะปิ',
      time: '09:00',
      participants: [
        { id: 'f1', name: 'คุณสมหมาย ใจดี', avatar: '👴', isFriend: true },
        { id: 'f2', name: 'ป้าบัวใหญ่', avatar: '👵', isFriend: true },
        { id: 'x1', name: 'คุณวิชัย นามสมมติ', avatar: '🧓', isFriend: false },
      ],
    },
    {
      id: '2',
      date: '2026-02-23',
      label: 'สวนลุมพินี',
      time: '06:30',
      participants: [
        { id: 'f3', name: 'คุณนิด สุขใจ', avatar: '👩', isFriend: true },
        { id: 'x2', name: 'อาจารย์มานะ', avatar: '🧑', isFriend: false },
      ],
    },
    {
      id: '3',
      date: '2026-02-25',
      label: 'วัดพระแก้ว',
      time: '07:00',
      participants: [
        { id: 'x3', name: 'คุณลุงแดง', avatar: '👨', isFriend: false },
      ],
    },
    {
      id: '4',
      date: '2026-02-27',
      label: 'ตลาดนัดสวนจตุจักร',
      time: '08:00',
      participants: [
        { id: 'f2', name: 'ป้าบัวใหญ่', avatar: '👵', isFriend: true },
        { id: 'f4', name: 'คุณประยงค์', avatar: '👴', isFriend: true },
        { id: 'x4', name: 'เพื่อนบ้าน', avatar: '🧓', isFriend: false },
      ],
    },
  ], []);

  const latestOuting = recentOutings[recentOutings.length - 1];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── HEADER ── */}
      <LinearGradient colors={['#3a9e8f', '#1f7a6e']} style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{caregiverUser.avatar}</Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>โหมดผู้ดูแล</Text>
              <Text style={styles.userName}>{caregiverUser.name}</Text>
            </View>
          </View>
          <Pressable
            onPress={async () => { try { await signOut(); } catch (e) { Alert.alert('ออกจากระบบไม่สำเร็จ', e?.message ?? 'กรุณาลองใหม่'); } }}
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </View>

        {/* ผู้สูงอายุที่ดูแล */}
        <View style={styles.elderRow}>
          <Text style={styles.elderEmoji}>{currentUser.avatar}</Text>
          <View>
            <Text style={styles.elderLabel}>ผู้สูงอายุที่ดูแล</Text>
            <Text style={styles.elderName}>{currentUser.name}  •  อายุ {currentUser.age} ปี</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── LONELINESS HEALTH ── */}
      <View style={styles.card}>
        <View style={styles.cardIconRow}>
          <View style={[styles.cardIcon, { backgroundColor: lColor + '22' }]}>
            <Ionicons name="heart" size={22} color={lColor} />
          </View>
          <Text style={styles.cardTitle}>สุขภาพความเหงา</Text>
        </View>

        {/* Score bar */}
        <View style={styles.scoreBarWrap}>
          <View style={styles.scoreBarBg}>
            <View style={[styles.scoreBarFill, { width: LONELINESS_SCORE + '%', backgroundColor: lColor }]} />
          </View>
          <Text style={[styles.scoreNum, { color: lColor }]}>{LONELINESS_SCORE}/100</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: lColor }]}>{lonelinessLabel(LONELINESS_SCORE)}</Text>

        <View style={styles.scoreSubRow}>
          <View style={styles.scoreSubItem}>
            <Text style={styles.scoreSubValue}>{currentUser.streak}</Text>
            <Text style={styles.scoreSubLabel}>วันติดต่อกัน</Text>
          </View>
          <View style={styles.scoreSubItem}>
            <Text style={styles.scoreSubValue}>{currentUser.friends}</Text>
            <Text style={styles.scoreSubLabel}>เพื่อนในระบบ</Text>
          </View>
          <View style={styles.scoreSubItem}>
            <Text style={styles.scoreSubValue}>{currentUser.activitiesCompleted}</Text>
            <Text style={styles.scoreSubLabel}>กิจกรรมสะสม</Text>
          </View>
        </View>

        {/* Safety signals */}
        <View style={styles.signalList}>
          {signals.map((s) => {
            const t = levelStyle(s.level);
            return (
              <View key={s.id} style={[styles.signalItem, { backgroundColor: t.bg, borderColor: t.border }]}>
                <View style={[styles.signalDot, { backgroundColor: t.dot }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.signalTitle, { color: t.text }]}>{s.title}</Text>
                  <Text style={styles.signalDetail}>{s.detail}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── ACTIVITY STATS ── */}
      <View style={styles.card}>
        <View style={styles.cardIconRow}>
          <View style={[styles.cardIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="bar-chart" size={22} color="#2563eb" />
          </View>
          <Text style={styles.cardTitle}>กิจกรรมที่ชอบทำ</Text>
        </View>

        {/* top category highlight */}
        {topCat && (
          <View style={[styles.topCatBox, { borderColor: topCat.color }]}>
            <Text style={styles.topCatLabel}>ชอบมากที่สุด</Text>
            <Text style={[styles.topCatName, { color: topCat.color }]}>{topCat.label}</Text>
            <Text style={[styles.topCatPct, { color: topCat.color }]}>{topCat.pct}%</Text>
          </View>
        )}

        {/* bar chart แต่ละประเภท */}
        <View style={styles.catList}>
          {categoryStats.map((c) => (
            <View key={c.cat} style={styles.catRow}>
              <Text style={styles.catName}>{c.label}</Text>
              <View style={styles.catBarWrap}>
                <View style={[styles.catBar, { width: c.pct + '%', backgroundColor: c.color }]} />
              </View>
              <Text style={[styles.catPct, { color: c.color }]}>{c.pct}%</Text>
            </View>
          ))}
        </View>

        {/* activity trend numbers */}
        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringSnapshot.activityTrend.last7Days.joinedActivities}</Text>
            <Text style={styles.statLabel}>กิจกรรม 7 วัน</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringSnapshot.activityTrend.last7Days.outdoorDays}</Text>
            <Text style={styles.statLabel}>วันออกนอกบ้าน</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringSnapshot.activityTrend.last30Days.joinedActivities}</Text>
            <Text style={styles.statLabel}>กิจกรรม 30 วัน</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringSnapshot.activityTrend.last30Days.consistency}</Text>
            <Text style={styles.statLabel}>ความสม่ำเสมอ</Text>
          </View>
        </View>
      </View>

      {/* ── RECENT OUTINGS (7 วัน) ── */}
      <View style={[styles.card, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
        <View style={styles.cardIconRow}>
          <View style={[styles.cardIcon, { backgroundColor: '#d1fae5' }]}>
            <Ionicons name="location" size={22} color="#059669" />
          </View>
          <Text style={styles.cardTitle}>กิจกรรมที่ออกไปล่าสุด</Text>
          <Pressable onPress={() => setActivityExpanded((v) => !v)} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>{activityExpanded ? 'ย่อ' : 'ดูเพิ่มเติม'}</Text>
          </Pressable>
        </View>

        {/* แสดงกิจกรรมล่าสุด */}
        <Text style={styles.cardBodyLarge}>{latestOuting.label}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>{latestOuting.date}  {latestOuting.time}</Text>
          </View>
          <View style={styles.metaPillMuted}>
            <Text style={styles.metaMutedText}>เช็คอินจากกิจกรรม</Text>
          </View>
        </View>

        {/* ส่วนขยาย: กิจกรรม 7 วันย้อนหลัง */}
        {activityExpanded && (
          <View style={styles.outingExpandedBox}>
            <Text style={styles.outingExpandedTitle}>กิจกรรมย้อนหลัง 7 วัน</Text>
            {recentOutings.map((outing) => {
              const friendCount = outing.participants.filter((p) => p.isFriend).length;
              return (
                <View key={outing.id} style={styles.outingItem}>
                  <View style={styles.outingHeader}>
                    <Ionicons name="location-outline" size={15} color="#059669" />
                    <Text style={styles.outingLabel}>{outing.label}</Text>
                    <Text style={styles.outingDate}>{outing.date}</Text>
                  </View>
                  <View style={styles.participantList}>
                    {outing.participants.map((p) => (
                      <View key={p.id} style={[styles.participantChip, p.isFriend ? styles.participantChipFriend : styles.participantChipOther]}>
                        <Text style={styles.participantAvatar}>{p.avatar}</Text>
                        <Text style={[styles.participantName, p.isFriend && styles.participantNameFriend]}>{p.name}</Text>
                        {p.isFriend && (
                          <View style={styles.friendBadge}>
                            <Ionicons name="people" size={11} color="#059669" />
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                  {friendCount > 0 && (
                    <Text style={styles.friendCountNote}>🤝 ไปกับเพื่อนในระบบ {friendCount} คน</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* ── PRIVACY ── */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Ionicons name="lock-closed" size={18} color={WarmClearTheme.colors.textMuted} />
          <Text style={[styles.cardTitle, { fontSize: 15, color: WarmClearTheme.colors.textSub }]}>ความเป็นส่วนตัว</Text>
          <Pressable onPress={() => setPrivacyExpanded((v) => !v)} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>{privacyExpanded ? 'ย่อ' : 'รายละเอียด'}</Text>
          </Pressable>
        </View>
        {privacyExpanded && (
          <View style={styles.scopeBox}>
            {monitoringSnapshot.consent.scope.map((item, idx) => (
              <Text key={idx} style={styles.scopeItem}>• {item}</Text>
            ))}
          </View>
        )}
      </View>

      {/* ── EMERGENCY ── */}
      <View style={styles.card}>
        <View style={styles.cardIconRow}>
          <View style={[styles.cardIcon, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="call" size={22} color="#dc2626" />
          </View>
          <Text style={styles.cardTitle}>ติดต่อด่วน</Text>
        </View>
        <View style={styles.actionRow}>
          <Pressable onPress={() => Alert.alert('โทร', monitoringSnapshot.quickContacts[0].value)} style={styles.primaryButton}>
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>โทรหาผู้สูงอายุ</Text>
          </Pressable>
          <Pressable onPress={() => Alert.alert('โทรฉุกเฉิน', monitoringSnapshot.quickContacts[1].value)} style={styles.dangerButton}>
            <Ionicons name="medical" size={20} color="#fff" />
            <Text style={styles.dangerButtonText}>1669</Text>
          </Pressable>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WarmClearTheme.colors.background },
  content:   { paddingBottom: 100 },

  // Header
  header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:       { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 26 },
  welcomeText:  { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  userName:     { fontSize: 17, fontWeight: '900', color: '#ffffff' },
  logoutBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  elderRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14 },
  elderEmoji:   { fontSize: 32 },
  elderLabel:   { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.70)' },
  elderName:    { fontSize: 16, fontWeight: '900', color: '#ffffff' },

  // Cards
  card: {
    marginTop: 14, marginHorizontal: 16,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    borderWidth: 1, borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  cardIconRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardIcon:      { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle:     { flex: 1, fontSize: 17, fontWeight: '900', color: WarmClearTheme.colors.text },
  cardBodyLarge: { fontSize: 20, fontWeight: '900', color: WarmClearTheme.colors.text, marginBottom: 8 },
  helperText:    { marginTop: 10, fontSize: 13, fontWeight: '700', color: WarmClearTheme.colors.textMuted },

  // Loneliness score
  scoreBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  scoreBarBg:   { flex: 1, height: 10, borderRadius: 5, backgroundColor: '#e5e7eb' },
  scoreBarFill: { height: 10, borderRadius: 5 },
  scoreNum:     { fontSize: 18, fontWeight: '900', minWidth: 54, textAlign: 'right' },
  scoreLabel:   { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  scoreSubRow:  { flexDirection: 'row', gap: 8, marginBottom: 14 },
  scoreSubItem: { flex: 1, backgroundColor: WarmClearTheme.colors.surfaceSoft, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: WarmClearTheme.colors.border },
  scoreSubValue:{ fontSize: 22, fontWeight: '900', color: WarmClearTheme.colors.text },
  scoreSubLabel:{ fontSize: 12, fontWeight: '700', color: WarmClearTheme.colors.textSub, textAlign: 'center' },

  // Signals
  signalList:   { gap: 8 },
  signalItem:   { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 12, borderWidth: 1 },
  signalDot:    { width: 9, height: 9, borderRadius: 999, marginTop: 4 },
  signalTitle:  { fontSize: 15, fontWeight: '900', marginBottom: 2 },
  signalDetail: { fontSize: 13, fontWeight: '700', color: WarmClearTheme.colors.textSub, lineHeight: 18 },

  // Category stats
  topCatBox:  { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderRadius: 14, padding: 14, marginBottom: 14 },
  topCatLabel:{ fontSize: 13, fontWeight: '700', color: WarmClearTheme.colors.textSub, flex: 1 },
  topCatName: { fontSize: 16, fontWeight: '900' },
  topCatPct:  { fontSize: 26, fontWeight: '900' },
  catList:    { gap: 8, marginBottom: 14 },
  catRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catName:    { fontSize: 13, fontWeight: '800', color: WarmClearTheme.colors.textSub, width: 110 },
  catBarWrap: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 },
  catBar:     { height: 8, borderRadius: 4 },
  catPct:     { fontSize: 13, fontWeight: '900', width: 34, textAlign: 'right' },

  // Stat grid
  statGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  statItem:   { width: '48%', backgroundColor: WarmClearTheme.colors.primarySoft, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: WarmClearTheme.colors.primarySoftBorder },
  statValue:  { fontSize: 26, fontWeight: '900', color: WarmClearTheme.colors.primaryDark },
  statLabel:  { marginTop: 2, fontSize: 13, fontWeight: '800', color: WarmClearTheme.colors.textSub, textAlign: 'center' },

  // Friends
  friendRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: WarmClearTheme.colors.border },
  friendAvatarWrap:{ position: 'relative', width: 42, height: 42 },
  friendAvatar:    { fontSize: 30 },
  friendOnlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#fff' },
  friendName:      { fontSize: 15, fontWeight: '900', color: WarmClearTheme.colors.text },
  friendMeta:      { fontSize: 13, fontWeight: '700', color: WarmClearTheme.colors.textSub },
  friendStreakBadge:{ backgroundColor: WarmClearTheme.colors.primarySoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: WarmClearTheme.colors.primarySoftBorder },
  friendStreakText: { fontSize: 13, fontWeight: '900', color: WarmClearTheme.colors.primaryDark },

  // Location meta
  metaRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  metaPill:     { backgroundColor: '#d1fae5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#6ee7b7' },
  metaText:     { fontSize: 13, fontWeight: '900', color: '#065f46' },
  metaPillMuted:{ backgroundColor: WarmClearTheme.colors.surfaceSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: WarmClearTheme.colors.border },
  metaMutedText:{ fontSize: 13, fontWeight: '700', color: WarmClearTheme.colors.textSub },

  // Privacy
  linkButton:     { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: WarmClearTheme.colors.primarySoft, borderWidth: 1, borderColor: WarmClearTheme.colors.primarySoftBorder },
  linkButtonText: { fontSize: 13, fontWeight: '900', color: WarmClearTheme.colors.primaryDark },
  scopeBox:       { marginTop: 10, backgroundColor: WarmClearTheme.colors.surfaceSoft, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: WarmClearTheme.colors.border, gap: 6 },
  scopeItem:      { fontSize: 14, fontWeight: '700', color: WarmClearTheme.colors.textSub, lineHeight: 20 },

  // Outing expanded
  outingExpandedBox:   { marginTop: 14, borderTopWidth: 1, borderTopColor: '#bbf7d0', paddingTop: 14, gap: 14 },
  outingExpandedTitle: { fontSize: 14, fontWeight: '800', color: '#065f46', marginBottom: 4 },
  outingItem:          { backgroundColor: '#ffffff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#bbf7d0', gap: 8 },
  outingHeader:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  outingLabel:         { flex: 1, fontSize: 15, fontWeight: '900', color: WarmClearTheme.colors.text },
  outingDate:          { fontSize: 12, fontWeight: '700', color: WarmClearTheme.colors.textMuted },
  participantList:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  participantChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  participantChipFriend: { backgroundColor: '#d1fae5', borderColor: '#6ee7b7' },
  participantChipOther:  { backgroundColor: WarmClearTheme.colors.surfaceSoft, borderColor: WarmClearTheme.colors.border },
  participantAvatar:   { fontSize: 14 },
  participantName:     { fontSize: 12, fontWeight: '700', color: WarmClearTheme.colors.textSub },
  participantNameFriend:{ color: '#065f46' },
  friendBadge:         { width: 16, height: 16, borderRadius: 8, backgroundColor: '#a7f3d0', alignItems: 'center', justifyContent: 'center' },
  friendCountNote:     { fontSize: 12, fontWeight: '800', color: '#059669' },

  // Action buttons
  actionRow:         { flexDirection: 'row', gap: 10, marginTop: 4 },
  primaryButton:     { flex: 1, backgroundColor: WarmClearTheme.colors.primary, borderRadius: WarmClearTheme.radii.control, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...WarmClearTheme.shadows.button },
  primaryButtonText: { fontSize: 15, fontWeight: '900', color: '#fff' },
  dangerButton:      { paddingHorizontal: 20, backgroundColor: '#dc2626', borderRadius: WarmClearTheme.radii.control, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, ...WarmClearTheme.shadows.button },
  dangerButtonText:  { fontSize: 15, fontWeight: '900', color: '#fff' },
});