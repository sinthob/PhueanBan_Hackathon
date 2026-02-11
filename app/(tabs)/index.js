import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import ActivityCard from '../../components/ActivityCard';
import { activities } from '../../data/mockData';

export default function HomeScreen() {
  const nearbyActivities = activities.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={['#10b981', '#059669']} style={styles.header}>
        <Text style={styles.headerTitle}>กิจกรรมเด่นใกล้คุณ</Text>
        <Text style={styles.headerSubtitle}>คัดมาให้เฉพาะกิจกรรมยอดนิยมในละแวกนี้</Text>
      </LinearGradient>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>กิจกรรมเด่นใกล้คุณ</Text>
          <Text style={styles.sectionLink}>ดูทั้งหมด</Text>
        </View>
        {nearbyActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} onJoin={() => {}} />
        ))}
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
    paddingBottom: 120,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
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
    fontWeight: '700',
    color: '#111827',
  },
  sectionLink: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
});
