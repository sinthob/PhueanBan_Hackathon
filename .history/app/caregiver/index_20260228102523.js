import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { currentUser } from '../../data/mockData';
import { caregiverUser, monitoringSnapshot } from '../../data/caregiverMock';
import { useAuth } from '../../providers/providers';
import { WarmClearTheme } from '../../theme';

function levelStyle(level) {
  if (level === 'ok') {
    return {
      bg: WarmClearTheme.colors.primarySoft,
      border: WarmClearTheme.colors.primarySoftBorder,
      text: WarmClearTheme.colors.primaryDark,
      dot: WarmClearTheme.colors.primary,
    };
  }
  if (level === 'watch') {
    return {
      bg: WarmClearTheme.colors.warningSoft,
      border: WarmClearTheme.colors.warningSoftBorder,
      text: WarmClearTheme.colors.warningText,
      dot: WarmClearTheme.colors.accentDark,
    };
  }
  return {
    bg: WarmClearTheme.colors.dangerSoft,
    border: WarmClearTheme.colors.dangerSoftBorder,
    text: WarmClearTheme.colors.danger,
    dot: WarmClearTheme.colors.danger,
  };
}

export default function CaregiverDashboardScreen() {
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const { signOut } = useAuth();

  const signals = useMemo(() => monitoringSnapshot.safetySignals ?? [], []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header - ขาวตามภาพ */}
      <View style={styles.header}>
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
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color={WarmClearTheme.colors.text} />
          </Pressable>
        </View>

        {/* Who is who */}
        <View style={styles.whoRow}>
          <View style={styles.whoCard}>
            <Text style={styles.whoLabel}>ผู้สูงอายุที่ดูแล</Text>
            <Text style={styles.whoValue}>{currentUser.avatar} {currentUser.name}</Text>
          </View>
        </View>

        {/* Logout button */}
        <Pressable
          onPress={async () => {
            try {
              await signOut();
            } catch (err) {
              Alert.alert('ออกจากระบบไม่สำเร็จ', err?.message ?? 'กรุณาลองใหม่');
            }
          }}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={20} color={WarmClearTheme.colors.text} />
          <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
        </Pressable>
      </View>

      {/* Privacy Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>ความเป็นส่วนตัวและขอบเขตข้อมูล</Text>
          <Pressable onPress={() => setPrivacyExpanded((v) => !v)} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>{privacyExpanded ? 'ย่อ' : 'ดูรายละเอียด'}</Text>
          </Pressable>
        </View>
        <Text style={styles.cardBody}>
          แสดงเฉพาะข้อมูลที่จำเป็นต่อความปลอดภัย ไม่แสดง GPS แบบเรียลไทม์ และไม่มีการติดตามต่อเนื่อง
        </Text>
        {privacyExpanded ? (
          <View style={styles.scopeBox}>
            <Text style={styles.scopeTitle}>แชร์ให้ดูได้:</Text>
            {monitoringSnapshot.consent.scope.map((item, idx) => (
              <Text key={`scope-${idx}`} style={styles.scopeItem}>• {item}</Text>
            ))}
            <Text style={styles.scopeMeta}>อัปเดตล่าสุด: {monitoringSnapshot.consent.updatedAt}</Text>
          </View>
        ) : null}
      </View>

      {/* Location Card - ใช้สี teal อ่อน */}
      <View style={[styles.card, styles.locationCard]}>
        <View style={styles.cardIconRow}>
          <View style={styles.cardIcon}>
            <Ionicons name="location" size={24} color={WarmClearTheme.colors.primary} />
          </View>
          <Text style={styles.cardTitle}>ล่าสุดออกไปไหน (แบบคร่าวๆ)</Text>
        </View>
        <Text style={styles.cardBodyLarge}>
          {monitoringSnapshot.lastKnown.label}
        </Text>
        <Text style={styles.cardBodySub}>
          {monitoringSnapshot.lastKnown.district}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaText}>อัปเดต {monitoringSnapshot.lastKnown.updatedAt}</Text>
          </View>
          <View style={styles.metaPillMuted}>
            <Text style={styles.metaMutedText}>ที่มา: {monitoringSnapshot.lastKnown.source}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => Alert.alert('แชร์พิกัด (ไม่ทำ)', 'ตัวอย่างนี้ไม่แชร์ GPS แบบละเอียด เพื่อความเป็นส่วนตัว')}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>ดูแบบละเอียด (ปิดไว้)</Text>
        </Pressable>
      </View>

      {/* Activity Trend Card */}
      <View style={styles.card}>
        <View style={styles.cardIconRow}>
          <View style={styles.cardIcon}>
            <Ionicons name="trending-up" size={24} color={WarmClearTheme.colors.primary} />
          </View>
          <Text style={styles.cardTitle}>ช่วงนี้ออกไปข้างนอกทำกิจกรรมแค่ไหน?</Text>
        </View>
        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringSnapshot.activityTrend.last7Days.joinedActivities}</Text>
            <Text style={styles.statLabel}>กิจกรรม (7 วัน)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringSnapshot.activityTrend.last7Days.outdoorDays}</Text>
            <Text style={styles.statLabel}>วันที่ออกนอกบ้าน</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringSnapshot.activityTrend.last30Days.joinedActivities}</Text>
            <Text style={styles.statLabel}>กิจกรรม (30 วัน)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringSnapshot.activityTrend.last30Days.consistency}</Text>
            <Text style={styles.statLabel}>ความสม่ำเสมอ</Text>
          </View>
        </View>
        <Text style={styles.helperText}>
          *เป็นข้อมูลสรุปรวม ไม่ใช่การติดตามตำแหน่งตลอดเวลา
        </Text>
      </View>

      {/* Safety Signals Card */}
      <View style={styles.card}>
        <View style={styles.cardIconRow}>
          <View style={styles.cardIcon}>
            <Ionicons name="shield-checkmark" size={24} color={WarmClearTheme.colors.primary} />
          </View>
          <Text style={styles.cardTitle}>สัญญาณเพื่อความปลอดภัย</Text>
        </View>
        <Text style={styles.cardBody}>
          AI/ระบบจะแสดงเป็น “สัญญาณรวม” เพื่อช่วยสังเกต ไม่ใช่ข้อสรุปทางการแพทย์
        </Text>

        <View style={styles.signalList}>
          {signals.map((s) => {
            const theme = levelStyle(s.level);
            return (
              <View key={s.id} style={[styles.signalItem, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <View style={[styles.signalDot, { backgroundColor: theme.dot }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.signalTitle, { color: theme.text }]}>{s.title}</Text>
                  <Text style={styles.signalDetail}>{s.detail}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Emergency Contact Card */}
      <View style={styles.card}>
        <View style={styles.cardIconRow}>
          <View style={styles.cardIcon}>
            <Ionicons name="call" size={24} color={WarmClearTheme.colors.tabBarIcon} />
          </View>
          <Text style={styles.cardTitle}>ติดต่อด่วน</Text>
        </View>
        <Text style={styles.cardBody}>
          แนะนำให้ผู้สูงอายุยินยอมก่อนแชร์เบอร์/ช่องทางติดต่อ และใช้เมื่อจำเป็น
        </Text>
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => Alert.alert('โทร', monitoringSnapshot.quickContacts[0].value)}
            style={styles.primaryButton}
          >
            <Ionicons name="call-outline" size={20} color={WarmClearTheme.colors.surface} />
            <Text style={styles.primaryButtonText}>โทรหาผู้สูงอายุ</Text>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('โทรฉุกเฉิน', monitoringSnapshot.quickContacts[1].value)}
            style={styles.dangerButton}
          >
            <Ionicons name="medical" size={20} color={WarmClearTheme.colors.surface} />
            <Text style={styles.dangerButtonText}>โทร 1669</Text>
          </Pressable>
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
    paddingBottom: 100,
  },

  // Header - ขาว
  header: {
    backgroundColor: WarmClearTheme.colors.surface,
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: WarmClearTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
  },
  welcomeText: {
    fontSize: 16,
    color: WarmClearTheme.colors.textMuted,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    color: WarmClearTheme.colors.text,
    fontWeight: '900',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Who row
  whoRow: {
    marginBottom: 16,
  },
  whoCard: {
    backgroundColor: WarmClearTheme.colors.cardGradientStart,
    borderRadius: WarmClearTheme.radii.control,
    padding: 14,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  whoLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.textMuted,
    marginBottom: 6,
  },
  whoValue: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },

  // Logout button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },

  // Cards
  card: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  locationCard: {
    backgroundColor: WarmClearTheme.colors.cardGradientStart,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  cardBody: {
    fontSize: 16,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
  },
  cardBodyLarge: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 4,
  },
  cardBodySub: {
    fontSize: 16,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
  },
  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },

  // Scope box
  scopeBox: {
    marginTop: 12,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  scopeTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  scopeItem: {
    fontSize: 16,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
  },
  scopeMeta: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: WarmClearTheme.colors.textMuted,
  },

  // Meta pills
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  metaPill: {
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderRadius: WarmClearTheme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },
  metaPillMuted: {
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  metaMutedText: {
    fontSize: 14,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
  },

  // Buttons
  secondaryButton: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },

  // Stats grid
  statGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    width: '48%',
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    textAlign: 'center',
  },
  helperText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: WarmClearTheme.colors.textMuted,
  },

  // Signals
  signalList: {
    marginTop: 12,
    gap: 10,
  },
  signalItem: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  signalDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 4,
  },
  signalTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  signalDetail: {
    fontSize: 14,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 20,
  },

  // Action buttons
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.primary,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...WarmClearTheme.shadows.button,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.surface,
  },
  dangerButton: {
    paddingHorizontal: 16,
    backgroundColor: WarmClearTheme.colors.tabBarIcon,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...WarmClearTheme.shadows.button,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.surface,
  },
});