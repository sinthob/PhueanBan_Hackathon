import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';

import { activities } from '../../data/mockData';
import { caregiverUser, monitoringSnapshot } from '../../data/caregiverMock';
import { useAuth } from '../../providers/providers';
import { WarmClearTheme } from '../../theme';

// ─────────────────────────────────────────────
// ── ข้อมูลคงที่
// ─────────────────────────────────────────────
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

function buildCategoryStats(acts) {
  const counts = {};
  acts.forEach((a) => { counts[a.category] = (counts[a.category] || 0) + 1; });
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

function levelStyle(level) {
  if (level === 'ok')    return { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', dot: '#10b981' };
  if (level === 'watch') return { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', dot: '#f59e0b' };
  return { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', dot: '#ef4444' };
}

function lonelinessColor(s) {
  if (s < 40) return '#10b981';
  if (s < 65) return '#f59e0b';
  return '#ef4444';
}
function lonelinessLabel(s) {
  if (s < 40) return 'ดี — มีสังคมที่ดี';
  if (s < 65) return 'ปานกลาง — ควรติดตาม';
  return 'น่าเป็นห่วง — ควรพูดคุย';
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// ── PieChart — pie segments ถูกต้อง (View + clip + rotate)
// หลักการ: rotate container ทั้งก้อน แล้ว clip เฉพาะครึ่งขวา
// ─────────────────────────────────────────────
function PieChart({ stats, size = 160 }) {
  if (!stats || stats.length === 0) return null;
  const half = size / 2;

  // ── Thin-slice approach ──
  // วาดทีละ 2° แต่ละ slice เป็นสี่เหลี่ยมผืนผ้าบาง ๆ
  // Formula ที่ verified แล้ว:
  //   center ของ slice = pie_center + direction(midAngle) * sliceH/2
  //   cx = half + sin(midAngle°) * sliceH/2
  //   cy = half - cos(midAngle°) * sliceH/2
  //   rotate = midAngle°
  // ไม่มีปัญหา clipping หรือ z-order เลย แม่นยำ 100%
  const STEP = 2;

  let cursor = -90;
  const segs = stats.map((c) => {
    const deg = (c.pct / 100) * 360;
    const s = { ...c, startDeg: cursor, endDeg: cursor + deg };
    cursor += deg;
    return s;
  });

  const slices = [];
  segs.forEach((seg) => {
    let a = seg.startDeg;
    while (a < seg.endDeg - 0.01) {
      const span = Math.min(STEP, seg.endDeg - a);
      const midAngle = a + span / 2;
      const rad = (midAngle * Math.PI) / 180;
      const sliceW = (span / 360) * Math.PI * size + 1.5; // arc width + small overlap
      const sliceH = half;

      // center position: pie_center + direction * sliceH/2
      const cx = half + Math.sin(rad) * sliceH / 2;
      const cy = half - Math.cos(rad) * sliceH / 2;

      slices.push(
        <View
          key={`${seg.cat}-${a.toFixed(2)}`}
          style={{
            position: 'absolute',
            width: sliceW,
            height: sliceH,
            left: cx - sliceW / 2,
            top: cy - sliceH / 2,
            backgroundColor: seg.color,
            transform: [{ rotate: `${midAngle}deg` }],
          }}
        />
      );
      a += span;
    }
  });

  return (
    <View style={{ alignItems: 'center', marginBottom: 20 }}>
      <View style={{
        width: size,
        height: size,
        borderRadius: half,
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
      }}>
        {slices}
        {/* Donut hole — อยู่ใน parent เดียวกัน เพื่อให้ center ตรง */}
        <View style={{
          position: 'absolute',
          width: size * 0.55,
          height: size * 0.55,
          borderRadius: (size * 0.55) / 2,
          backgroundColor: '#fff',
          top: (size - size * 0.55) / 2,
          left: (size - size * 0.55) / 2,
        }} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// ── Mock ผู้สูงอายุ 2 คน
// ─────────────────────────────────────────────
const ELDERS = [
  {
    id: 'e1',
    name: 'คุณสมชาย ใจดี',
    age: 65,
    avatar: '👨‍🦳',
    phone: '081-234-5678',
    lonelinessScore: 32,
    streak: 28,
    friends: 12,
    activitiesCompleted: 45,
    signals: monitoringSnapshot.safetySignals ?? [],
    categoryStats: buildCategoryStats(activities),
    recentOutings: [
      {
        id: 'e1-1', date: '2026-02-21', label: 'ศูนย์ชุมชนบางกะปิ', time: '09:00',
        participants: [
          { id: 'f1', name: 'คุณสมหมาย ใจดี',   avatar: '👴', isFriend: true  },
          { id: 'f2', name: 'ป้าบัวใหญ่',         avatar: '👵', isFriend: true  },
          { id: 'x1', name: 'คุณวิชัย นามสมมติ',  avatar: '🧓', isFriend: false },
        ],
      },
      {
        id: 'e1-2', date: '2026-02-23', label: 'สวนลุมพินี', time: '06:30',
        participants: [
          { id: 'f3', name: 'คุณนิด สุขใจ', avatar: '👩', isFriend: true  },
          { id: 'x2', name: 'อาจารย์มานะ',  avatar: '🧑', isFriend: false },
        ],
      },
      {
        id: 'e1-3', date: '2026-02-25', label: 'วัดพระแก้ว', time: '07:00',
        participants: [{ id: 'x3', name: 'คุณลุงแดง', avatar: '👨', isFriend: false }],
      },
      {
        id: 'e1-4', date: '2026-02-27', label: 'ตลาดนัดสวนจตุจักร', time: '08:00',
        participants: [
          { id: 'f2', name: 'ป้าบัวใหญ่',  avatar: '👵', isFriend: true  },
          { id: 'f4', name: 'คุณประยงค์',  avatar: '👴', isFriend: true  },
          { id: 'x4', name: 'เพื่อนบ้าน',  avatar: '🧓', isFriend: false },
        ],
      },
    ],
  },
  {
    id: 'e2',
    name: 'คุณมาลี รักดี',
    age: 70,
    avatar: '👩‍🦳',
    phone: '089-876-5432',
    lonelinessScore: 58,
    streak: 10,
    friends: 6,
    activitiesCompleted: 21,
    signals: [
      { id: 's2', level: 'ok',    title: 'เช็คอินล่าสุดปกติ',        detail: 'เช็คอินเมื่อวาน เวลา 07:00' },
      { id: 's1', level: 'watch', title: 'ช่วงบ่ายออกข้างนอกน้อย',  detail: 'สัปดาห์นี้ออกข้างนอกเฉลี่ย 1 ครั้ง/วัน' },
    ],
    categoryStats: [
      { cat: 'cooking',  label: 'ทำอาหาร',              count: 8, pct: 40, color: '#f59e0b' },
      { cat: 'merit',    label: 'ทำบุญ',                 count: 7, pct: 35, color: '#f97316' },
      { cat: 'social',   label: 'สังคม',                 count: 3, pct: 15, color: '#ec4899' },
      { cat: 'exercise', label: 'สุขภาพ/ออกกำลังกาย',   count: 2, pct: 10, color: '#3b82f6' },
    ],
    recentOutings: [
      {
        id: 'e2-1', date: '2026-02-22', label: 'วัดใกล้บ้าน', time: '06:30',
        participants: [{ id: 'n1', name: 'แม่บ้านข้างๆ', avatar: '👵', isFriend: false }],
      },
      {
        id: 'e2-2', date: '2026-02-26', label: 'ตลาดสดบางเขน', time: '07:00',
        participants: [{ id: 'f5', name: 'น้าสุดา', avatar: '👩', isFriend: true }],
      },
    ],
  },
];

const TABS = [
  { key: 'loneliness', label: 'สุขภาพความเหงา', icon: 'heart'      },
  { key: 'activity',   label: 'กิจกรรมที่ชอบ',  icon: 'pie-chart'  },
  { key: 'outing',     label: 'กิจกรรมล่าสุด',  icon: 'location'   },
];

// ─────────────────────────────────────────────
// ── Screen
// ─────────────────────────────────────────────
export default function CaregiverDashboardScreen() {
  const { signOut } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab]   = useState(0);
  const [outingOpen, setOutingOpen] = useState(false);

  const elder  = useMemo(() => ELDERS.find((e) => e.id === selectedId) ?? null, [selectedId]);
  const lColor = elder ? lonelinessColor(elder.lonelinessScore) : '#10b981';

  return (
    <>
      {/* ── ซ่อน "caregiver/index" header ── */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* ══════════════ HEADER ══════════════ */}
        <LinearGradient colors={['#3a9e8f', '#1f7a6e']} style={styles.header}>

          {/* แถวบน: avatar + logout */}
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              <View style={styles.cgAvatar}>
                <Text style={styles.cgAvatarText}>{caregiverUser.avatar}</Text>
              </View>
              <View>
                <Text style={styles.welcomeText}>โหมดผู้ดูแล</Text>
                <Text style={styles.userName}>{caregiverUser.name}</Text>
              </View>
            </View>
            <Pressable
              onPress={async () => {
                try { await signOut(); }
                catch (e) { Alert.alert('ออกจากระบบไม่สำเร็จ', e?.message ?? 'กรุณาลองใหม่'); }
              }}
              style={styles.logoutBtn}
            >
              <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.85)" />
            </Pressable>
          </View>

          {/* เลือกผู้สูงอายุ */}
          <Text style={styles.selectHint}>เลือกผู้สูงอายุที่ต้องการดูข้อมูล</Text>
          <View style={styles.elderPickerCol}>
            {ELDERS.map((e) => {
              const on = selectedId === e.id;
              return (
                <Pressable
                  key={e.id}
                  onPress={() => { setSelectedId(e.id); setActiveTab(0); setOutingOpen(false); }}
                  style={[styles.elderCard, on && styles.elderCardActive]}
                >
                  <Text style={styles.elderCardEmoji}>{e.avatar}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.elderCardName, on && styles.elderCardNameOn]} numberOfLines={1}>
                      {e.name}
                    </Text>
                    <Text style={[styles.elderCardAge, on && styles.elderCardAgeOn]}>
                      อายุ {e.age} ปี
                    </Text>
                  </View>
                  {on && <Ionicons name="checkmark-circle" size={22} color="#ffffff" />}
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>

        {/* ══════════════ ยังไม่เลือก ══════════════ */}
        {!elder ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👆</Text>
            <Text style={styles.emptyText}>กรุณาเลือกผู้สูงอายุด้านบนเพื่อดูข้อมูล</Text>
          </View>
        ) : (
          <>
            {/* ══════════════ ชื่อ + ติดต่อ ══════════════ */}
            <View style={styles.elderDetailCard}>
              {/* Layer 1: emoji + ชื่อ */}
              <View style={styles.elderDetailTop}>
                <Text style={styles.elderDetailEmoji}>{elder.avatar}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.elderDetailName} numberOfLines={1} adjustsFontSizeToFit>
                    {elder.name}
                  </Text>
                  <Text style={styles.elderDetailAge}>อายุ {elder.age} ปี</Text>
                </View>
              </View>
              {/* Layer 2: ปุ่มเต็มแถว */}
              <View style={styles.contactRow}>
                <Pressable
                  onPress={() => Alert.alert('พิกัดปัจจุบัน (Mock)', `${elder.name}\nละติจูด: 13.7563° N\nลองจิจูด: 100.5018° E\nแม่นยำ ±50 ม.\n\nตำแหน่งโดยประมาณจากเช็คอินล่าสุด`)}
                  style={[styles.actionBtn, { backgroundColor: '#7c3aed' }]}
                >
                  <Ionicons name="location-outline" size={15} color="#fff" />
                  <Text style={styles.actionBtnText}>พิกัด</Text>
                </Pressable>
                <Pressable
                  onPress={() => Alert.alert('โทร', elder.phone)}
                  style={[styles.actionBtn, { backgroundColor: WarmClearTheme.colors.primary }]}
                >
                  <Ionicons name="call-outline" size={15} color="#fff" />
                  <Text style={styles.actionBtnText}>โทร</Text>
                </Pressable>
                <Pressable
                  onPress={() => Alert.alert('โทรฉุกเฉิน', '1669')}
                  style={[styles.actionBtn, { backgroundColor: '#dc2626' }]}
                >
                  <Ionicons name="medical" size={15} color="#fff" />
                  <Text style={styles.actionBtnText}>1669</Text>
                </Pressable>
              </View>
            </View>

            {/* ══════════════ TAB BAR ══════════════ */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabScroll}
              contentContainerStyle={styles.tabContent}
            >
              {TABS.map((tab, idx) => {
                const on = activeTab === idx;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => { setActiveTab(idx); setOutingOpen(false); }}
                    style={[styles.tabBtn, on && styles.tabBtnOn]}
                  >
                    <Ionicons name={tab.icon} size={16} color={on ? '#fff' : WarmClearTheme.colors.textSub} />
                    <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* ══════════════ TAB 0: สุขภาพความเหงา ══════════════ */}
            {activeTab === 0 && (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={[styles.cardIconCircle, { backgroundColor: lColor + '22' }]}>
                    <Ionicons name="heart" size={22} color={lColor} />
                  </View>
                  <Text style={styles.cardTitle}>สุขภาพความเหงา</Text>
                </View>

                {/* ระดับสุขภาพ — ไม่แสดงตัวเลข, ใช้ระบบหลังบ้าน */}
                <View style={styles.lonelinessTagRow}>
                  <View style={[styles.lonelinessTag, { borderColor: lColor, backgroundColor: lColor + '18' }]}>
                    <Text style={[styles.lonelinessTagLabel, { color: lColor }]}>ระดับสุขภาพความเหงาปัจจุบัน</Text>
                    <Text style={[styles.lonelinessTagValue, { color: lColor }]}>
                      {elder.lonelinessScore < 40 ? 'ดี' : elder.lonelinessScore < 65 ? 'ปานกลาง' : 'น่าเป็นห่วง'}
                    </Text>
                  </View>
                  <View style={[styles.lonelinessTag, { borderColor: '#8b5cf6', backgroundColor: '#8b5cf618' }]}>
                    <Text style={[styles.lonelinessTagLabel, { color: '#7c3aed' }]}>การเข้าสังคม</Text>
                    <Text style={[styles.lonelinessTagValue, { color: '#7c3aed' }]}>
                      {elder.lonelinessScore < 40 ? 'ดี' : elder.lonelinessScore < 65 ? 'ปานกลาง' : 'น้อย'}
                    </Text>
                  </View>
                </View>

                <View style={styles.scoreSubRow}>
                  {[
                    { val: elder.streak,              lbl: 'วันติดต่อกัน' },
                    { val: elder.friends,             lbl: 'เพื่อนในระบบ' },
                    { val: elder.activitiesCompleted, lbl: 'กิจกรรมสะสม'  },
                  ].map((item) => (
                    <View key={item.lbl} style={styles.scoreSubItem}>
                      <Text style={styles.scoreSubValue}>{item.val}</Text>
                      <Text style={styles.scoreSubLabel}>{item.lbl}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.signalList}>
                  {elder.signals.map((s) => {
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
            )}

            {/* ══════════════ TAB 1: กิจกรรมที่ชอบ (Donut) ══════════════ */}
            {activeTab === 1 && (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={[styles.cardIconCircle, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="pie-chart" size={22} color="#2563eb" />
                  </View>
                  <Text style={styles.cardTitle}>กิจกรรมที่ชอบทำ</Text>
                </View>

                {/* วงกลมเดียว — อันดับ 1 */}
                <PieChart stats={elder.categoryStats} size={180} />

                {/* รายละเอียด bar */}
                <View style={styles.donutDetailSection}>
                  <Text style={styles.donutDetailTitle}>รายละเอียดแต่ละประเภท</Text>
                  {elder.categoryStats.map((c) => (
                    <View key={c.cat} style={styles.donutDetailRow}>
                      <View style={[styles.donutDetailDot, { backgroundColor: c.color }]} />
                      <Text style={styles.donutDetailName}>{c.label}</Text>
                      <View style={styles.donutDetailBarWrap}>
                        <View style={[styles.donutDetailBar, { width: c.pct + '%', backgroundColor: c.color }]} />
                      </View>
                      <Text style={[styles.donutDetailPct, { color: c.color }]}>{c.pct}%</Text>
                      <Text style={styles.donutDetailCnt}>{c.count} ครั้ง</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ══════════════ TAB 2: กิจกรรมล่าสุด ══════════════ */}
            {activeTab === 2 && (
              <View style={[styles.card, styles.cardGreen]}>
                <View style={styles.cardRow}>
                  <View style={[styles.cardIconCircle, { backgroundColor: '#d1fae5' }]}>
                    <Ionicons name="location" size={22} color="#059669" />
                  </View>
                  <Text style={styles.cardTitle}>กิจกรรมที่ออกไปล่าสุด</Text>
                </View>

                {elder.recentOutings.length === 0 ? (
                  <Text style={styles.emptyTabText}>ยังไม่มีข้อมูลกิจกรรม</Text>
                ) : (() => {
                  const latest = elder.recentOutings[elder.recentOutings.length - 1];
                  return (
                    <>
                      <Text style={styles.cardBodyLarge}>{latest.label}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaPill}>
                          <Text style={styles.metaText}>{latest.date}  {latest.time}</Text>
                        </View>
                        <View style={styles.metaPillMuted}>
                          <Text style={styles.metaMutedText}>เช็คอินจากกิจกรรม</Text>
                        </View>
                      </View>

                      <Pressable onPress={() => setOutingOpen((v) => !v)} style={styles.expandBtn}>
                        <Text style={styles.expandBtnText}>{outingOpen ? 'ย่อ ▲' : 'ดูทั้งหมด ▼'}</Text>
                      </Pressable>

                      {outingOpen && (
                        <View style={styles.outingList}>
                          <Text style={styles.outingListTitle}>กิจกรรมย้อนหลังทั้งหมด</Text>
                          {elder.recentOutings.map((outing) => {
                            const fc = outing.participants.filter((p) => p.isFriend).length;
                            return (
                              <View key={outing.id} style={styles.outingItem}>
                                <View style={styles.outingHeader}>
                                  <Ionicons name="location-outline" size={14} color="#059669" />
                                  <Text style={styles.outingLabel}>{outing.label}</Text>
                                  <Text style={styles.outingDate}>{outing.date}</Text>
                                </View>
                                <View style={styles.participantRow}>
                                  {outing.participants.map((p) => (
                                    <View key={p.id} style={[styles.pChip, p.isFriend ? styles.pChipFriend : styles.pChipOther]}>
                                      <Text>{p.avatar}</Text>
                                      <Text style={[styles.pChipName, p.isFriend && styles.pChipNameFriend]}>{p.name}</Text>
                                    </View>
                                  ))}
                                </View>
                                {fc > 0 && (
                                  <Text style={styles.friendNote}>🤝 ไปกับเพื่อนในระบบ {fc} คน</Text>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            )}
          </>
        )}

      </ScrollView>
    </>
  );
}

// ─────────────────────────────────────────────
// ── Styles
// ─────────────────────────────────────────────
const T = WarmClearTheme;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.background },
  content:   { paddingBottom: 110 },

  // Header
  header:       { paddingTop: 54, paddingBottom: 24, paddingHorizontal: 20 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cgAvatar:     { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  cgAvatarText: { fontSize: 26 },
  welcomeText:  { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  userName:     { fontSize: 17, fontWeight: '900', color: '#fff' },
  logoutBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.18)', alignItems: 'center', justifyContent: 'center' },

  // Elder picker
  selectHint:        { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.70)', marginBottom: 10 },
  elderPickerCol:    { gap: 10 },
  elderCard:         { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: 'transparent' },
  elderCardActive:   { backgroundColor: 'rgba(255,255,255,0.28)', borderColor: '#fff' },
  elderCardEmoji:    { fontSize: 30 },
  elderCardName:     { fontSize: 15, fontWeight: '900', color: 'rgba(255,255,255,0.82)' },
  elderCardNameOn:   { color: '#fff' },
  elderCardAge:      { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.58)' },
  elderCardAgeOn:    { color: 'rgba(255,255,255,0.85)' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 64, gap: 14 },
  emptyEmoji: { fontSize: 52 },
  emptyText:  { fontSize: 16, fontWeight: '800', color: T.colors.textSub, textAlign: 'center', paddingHorizontal: 32 },

  // Elder detail + contact
  elderDetailCard: {
    marginTop: 14, marginHorizontal: 16,
    backgroundColor: T.colors.surface,
    borderRadius: T.radii.card, padding: 14,
    borderWidth: 1, borderColor: T.colors.border,
    flexDirection: 'column', gap: 10,
    ...T.shadows.card,
  },
  elderDetailTop:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  elderDetailEmoji: { fontSize: 40 },
  elderDetailName:  { fontSize: 17, fontWeight: '900', color: T.colors.text },
  elderDetailAge:   { fontSize: 13, fontWeight: '700', color: T.colors.textSub },
  contactRow:       { flexDirection: 'row', gap: 8 },
  actionBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: T.radii.control, paddingVertical: 10, ...T.shadows.button },
  actionBtnText:    { fontSize: 14, fontWeight: '900', color: '#fff' },

  // Tab bar
  tabScroll:   { marginTop: 14, marginHorizontal: 16 },
  tabContent:  { gap: 8, paddingRight: 4 },
  tabBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: T.colors.surface, borderWidth: 1.5, borderColor: T.colors.border },
  tabBtnOn:    { backgroundColor: T.colors.primary, borderColor: T.colors.primary },
  tabLabel:    { fontSize: 14, fontWeight: '900', color: T.colors.textSub },
  tabLabelOn:  { color: '#fff' },

  // Card
  card: {
    marginTop: 14, marginHorizontal: 16,
    backgroundColor: T.colors.surface,
    borderRadius: T.radii.card, padding: 16,
    borderWidth: 1, borderColor: T.colors.border,
    ...T.shadows.card,
  },
  cardGreen:       { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  cardRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardIconCircle:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle:       { flex: 1, fontSize: 17, fontWeight: '900', color: T.colors.text },
  cardBodyLarge:   { fontSize: 20, fontWeight: '900', color: T.colors.text, marginBottom: 8 },

  // Loneliness
  lonelinessTagRow:  { flexDirection: 'row', gap: 10, marginBottom: 16 },
  lonelinessTag:     { flex: 1, borderWidth: 1.5, borderRadius: 14, padding: 12, gap: 4 },
  lonelinessTagLabel:{ fontSize: 11, fontWeight: '800', opacity: 0.75 },
  lonelinessTagValue:{ fontSize: 18, fontWeight: '900' },
  scoreBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  scoreBarBg:   { flex: 1, height: 10, borderRadius: 5, backgroundColor: '#e5e7eb' },
  scoreBarFill: { height: 10, borderRadius: 5 },
  scoreNum:     { fontSize: 18, fontWeight: '900', minWidth: 54, textAlign: 'right' },
  scoreLabel:   { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  scoreSubRow:  { flexDirection: 'row', gap: 8, marginBottom: 14 },
  scoreSubItem: { flex: 1, backgroundColor: T.colors.surfaceSoft, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: T.colors.border },
  scoreSubValue:{ fontSize: 22, fontWeight: '900', color: T.colors.text },
  scoreSubLabel:{ fontSize: 12, fontWeight: '700', color: T.colors.textSub, textAlign: 'center' },
  signalList:   { gap: 8 },
  signalItem:   { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 12, borderWidth: 1 },
  signalDot:    { width: 9, height: 9, borderRadius: 999, marginTop: 4 },
  signalTitle:  { fontSize: 15, fontWeight: '900', marginBottom: 2 },
  signalDetail: { fontSize: 13, fontWeight: '700', color: T.colors.textSub, lineHeight: 18 },

  // Donut
  donutGrid:    { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', gap: 16, marginBottom: 20 },
  donutItem:    { alignItems: 'center', gap: 4, width: 96 },
  donutWrap:    { position: 'relative', width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  donutCenter:  { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  donutCenterPct: { fontSize: 17, fontWeight: '900' },
  donutLabel:   { fontSize: 11, fontWeight: '800', color: T.colors.textSub, textAlign: 'center' },
  donutCount:   { fontSize: 12, fontWeight: '900' },
  donutDetailSection: { borderTopWidth: 1, borderTopColor: T.colors.border, paddingTop: 14, gap: 10 },
  donutDetailTitle:   { fontSize: 14, fontWeight: '900', color: T.colors.text, marginBottom: 4 },
  donutDetailRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  donutDetailDot:     { width: 10, height: 10, borderRadius: 5 },
  donutDetailName:    { fontSize: 13, fontWeight: '800', color: T.colors.text, width: 112 },
  donutDetailBarWrap: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 },
  donutDetailBar:     { height: 8, borderRadius: 4 },
  donutDetailPct:     { fontSize: 13, fontWeight: '900', width: 36, textAlign: 'right' },
  donutDetailCnt:     { fontSize: 12, fontWeight: '700', color: T.colors.textSub, width: 40, textAlign: 'right' },

  // Outing
  metaRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  metaPill:      { backgroundColor: '#d1fae5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#6ee7b7' },
  metaText:      { fontSize: 13, fontWeight: '900', color: '#065f46' },
  metaPillMuted: { backgroundColor: T.colors.surfaceSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: T.colors.border },
  metaMutedText: { fontSize: 13, fontWeight: '700', color: T.colors.textSub },
  expandBtn:     { marginTop: 12, alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: T.colors.primarySoft, borderWidth: 1, borderColor: T.colors.primarySoftBorder },
  expandBtnText: { fontSize: 13, fontWeight: '900', color: T.colors.primaryDark },
  outingList:      { marginTop: 14, borderTopWidth: 1, borderTopColor: '#bbf7d0', paddingTop: 14, gap: 12 },
  outingListTitle: { fontSize: 14, fontWeight: '800', color: '#065f46' },
  outingItem:      { backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#bbf7d0', gap: 8 },
  outingHeader:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  outingLabel:     { flex: 1, fontSize: 15, fontWeight: '900', color: T.colors.text },
  outingDate:      { fontSize: 12, fontWeight: '700', color: T.colors.textMuted },
  participantRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pChip:           { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  pChipFriend:     { backgroundColor: '#d1fae5', borderColor: '#6ee7b7' },
  pChipOther:      { backgroundColor: T.colors.surfaceSoft, borderColor: T.colors.border },
  pChipName:       { fontSize: 12, fontWeight: '700', color: T.colors.textSub },
  pChipNameFriend: { color: '#065f46' },
  friendNote:      { fontSize: 12, fontWeight: '800', color: '#059669' },
  emptyTabText:    { fontSize: 15, fontWeight: '700', color: T.colors.textSub, textAlign: 'center', paddingVertical: 24 },
});