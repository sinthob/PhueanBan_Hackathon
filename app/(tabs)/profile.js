import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { currentUser } from '../../data/mockData';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentUser.name}</Text>
        <Text style={styles.subtitle}>
          อายุ {currentUser.age} ปี | {currentUser.location.district}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentUser.activitiesCompleted}</Text>
          <Text style={styles.statLabel}>กิจกรรม</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentUser.friends}</Text>
          <Text style={styles.statLabel}>เพื่อน</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentUser.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>เป้าหมายรายสัปดาห์</Text>
        <Text style={styles.cardBody}>เข้าร่วมกิจกรรมอย่างน้อย 2 ครั้ง</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Loneliness Check</Text>
        <Text style={styles.cardBody}>สถานะ: ปกติ | ค่าความเสี่ยงต่ำ</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10b981',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  cardBody: {
    marginTop: 8,
    fontSize: 15,
    color: '#4b5563',
  },
});
