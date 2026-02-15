import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { currentUser } from '../../data/mockData';
import { caregiverUser, monitoringSnapshot } from '../../data/caregiverMock';
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
      dot: WarmClearTheme.colors.warning,
    };
  }
  return {
    bg: WarmClearTheme.colors.dangerSoft,
    border: WarmClearTheme.colors.dangerSoftBorder,
    text: WarmClearTheme.colors.dangerText,
    dot: WarmClearTheme.colors.danger,
  };
}

export default function CaregiverDashboardScreen() {
  const [privacyExpanded, setPrivacyExpanded] = useState(false);

  const signals = useMemo(() => monitoringSnapshot.safetySignals ?? [], []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[WarmClearTheme.colors.primary, WarmClearTheme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>โหมดลูกหลาน/ผู้ดูแล</Text>
            <Text style={styles.headerSubtitle}>ดูข้อมูลจำเป็นแบบเคารพความเป็นส่วนตัว (mock)</Text>
          </View>
          <Pressable onPress={() => router.replace('/')} style={styles.switchButton}>
            <Text style={styles.switchButtonText}>สลับโหมด</Text>
          </Pressable>
        </View>

        <View style={styles.whoRow}>
          <View style={styles.whoCard}>
            <Text style={styles.whoLabel}>ผู้ดูแล</Text>
            <Text style={styles.whoValue}>{caregiverUser.avatar} {caregiverUser.name}</Text>
          </View>
          <View style={styles.whoCard}>
            <Text style={styles.whoLabel}>ผู้สูงอายุ</Text>
            <Text style={styles.whoValue}>{currentUser.avatar} {currentUser.name}</Text>
          </View>
        </View>
      </LinearGradient>

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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ล่าสุดออกไปไหน (แบบคร่าวๆ)</Text>
        <Text style={styles.cardBody}>
          {monitoringSnapshot.lastKnown.label} • {monitoringSnapshot.lastKnown.district}
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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ช่วงนี้ออกไปข้างนอกทำกิจกรรมแค่ไหน?</Text>
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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>สัญญาณเพื่อความปลอดภัย</Text>
        <Text style={styles.cardBody}>
          AI/ระบบจะแสดงเป็น “สัญญาณรวม” เพื่อช่วยสังเกต ไม่ใช่ข้อสรุปทางการแพทย์ (mock)
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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ติดต่อด่วน (mock)</Text>
        <Text style={styles.cardBody}>
          แนะนำให้ผู้สูงอายุยินยอมก่อนแชร์เบอร์/ช่องทางติดต่อ และใช้เมื่อจำเป็น
        </Text>
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => Alert.alert('โทร (mock)', monitoringSnapshot.quickContacts[0].value)}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>โทรหาผู้สูงอายุ</Text>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('โทรฉุกเฉิน (mock)', monitoringSnapshot.quickContacts[1].value)}
            style={styles.dangerButton}
          >
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
    paddingBottom: 120,
  },
  header: {
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...WarmClearTheme.shadows.bar,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 22,
  },
  switchButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  whoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  whoCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: WarmClearTheme.radii.control,
    padding: 12,
  },
  whoLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 6,
  },
  whoValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  cardBody: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.textMuted,
    lineHeight: 22,
  },
  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    ...WarmClearTheme.shadows.subtle,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },
  scopeBox: {
    marginTop: 12,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.card,
    padding: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  scopeTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  scopeItem: {
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
  },
  scopeMeta: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  metaPill: {
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    ...WarmClearTheme.shadows.subtle,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },
  metaPillMuted: {
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  metaMutedText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.textSub,
  },
  secondaryButton: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  statGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.card,
    padding: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  statItem: {
    width: '48%',
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.primary,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.textSub,
  },
  helperText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
  },
  signalList: {
    marginTop: 12,
    gap: 10,
  },
  signalItem: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: WarmClearTheme.radii.card,
    padding: 12,
    borderWidth: 1,
    ...WarmClearTheme.shadows.subtle,
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
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 20,
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.primary,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  dangerButton: {
    paddingHorizontal: 14,
    backgroundColor: WarmClearTheme.colors.danger,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
});
