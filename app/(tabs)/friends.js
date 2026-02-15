import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { friends } from '../../data/mockData';
import { WarmClearTheme } from '../../theme';

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
              <Text style={styles.statLabel}>สถิติการเจอกัน</Text>
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
    fontSize: 26,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '700',
    lineHeight: 24,
  },
  card: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
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
    borderColor: WarmClearTheme.colors.surface,
  },
  statusOnline: {
    backgroundColor: WarmClearTheme.colors.primary,
  },
  statusOffline: {
    backgroundColor: '#9ca3af',
  },
  cardBody: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 4,
  },
  meta: {
    fontSize: 16,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '700',
  },
  distancePill: {
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  distanceText: {
    fontSize: 16,
    color: WarmClearTheme.colors.primaryDark,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  statLabel: {
    fontSize: 16,
    color: WarmClearTheme.colors.textSub,
    marginTop: 2,
    fontWeight: '800',
  },
});
