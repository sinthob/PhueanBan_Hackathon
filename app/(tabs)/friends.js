import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { friends } from '../../data/mockData';

export default function FriendsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>เพื่อนและชุมชน</Text>
        <Text style={styles.subtitle}>คนใกล้ตัวที่คุณคุ้นเคยในกิจกรรม</Text>
      </View>

      {friends.map((friend) => (
        <View key={friend.id} style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatar}>{friend.avatar}</Text>
              <View
                style={[
                  styles.statusDot,
                  friend.status === 'online' ? styles.statusOnline : styles.statusOffline,
                ]}
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.name}>{friend.name}</Text>
              <Text style={styles.meta}>{friend.lastActive}</Text>
            </View>
            <View style={styles.distancePill}>
              <Text style={styles.distanceText}>{friend.distance}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{friend.commonActivities}</Text>
              <Text style={styles.statLabel}>กิจกรรมร่วม</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{friend.streak}</Text>
              <Text style={styles.statLabel}>วันติดต่อกัน</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    fontSize: 36,
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  statusOnline: {
    backgroundColor: '#10b981',
  },
  statusOffline: {
    backgroundColor: '#9ca3af',
  },
  cardBody: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#6b7280',
  },
  distancePill: {
    backgroundColor: '#f0fdf4',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});
