/**
 * app/(tabs)/tabs_index.js
 *
 * เมื่อผู้ใช้กด check-in → เรียก trackCheckinSuccess() เบื้องหลัง
 * เมื่อผู้ใช้ join กิจกรรม → เรียก trackActivityJoined() เบื้องหลัง
 */

import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import ActivityCard from '../../components/ActivityCard';
import { activities } from '../../data/mockData';
import { WarmClearTheme } from '../../theme';

import {
  trackCheckinSuccess,
  trackActivityJoined,
} from '../../loneliness/loneliness';

export default function HomeScreen() {
  const nearbyActivities = activities.slice(0, 3);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckin = async () => {
    if (checkedIn) return;
    setCheckedIn(true);
    trackCheckinSuccess().catch(() => {});
    Alert.alert('เช็คอินสำเร็จ', 'ดีใจที่ได้เจอคุณวันนี้');
  };

  const handleJoin = async (activity) => {
    trackActivityJoined().catch(() => {});
    Alert.alert('ลงทะเบียนแล้ว', `คุณได้ลงทะเบียน "${activity.title}" เรียบร้อย`);
  };

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

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>กิจกรรมเด่นใกล้คุณ</Text>
          <Text style={styles.sectionLink}>ดูทั้งหมด</Text>
        </View>
        {nearbyActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} onJoin={handleJoin} />
        ))}
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
});