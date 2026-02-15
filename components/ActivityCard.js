import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { WarmClearTheme } from '../theme';

const categoryColors = {
  exercise: '#3b82f6',
  cooking: '#f59e0b',
  social: '#ec4899',
  volunteer: '#ef4444',
  learning: '#8b5cf6',
  entertainment: '#06b6d4',
};

export default function ActivityCard({ activity, onJoin }) {
  const t = WarmClearTheme;
  const tint = categoryColors[activity.category] || t.colors.primary;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[t.colors.primarySoft, t.colors.surface]}
        style={styles.hero}
      >
        <Text style={styles.heroIcon}>{activity.icon}</Text>
      </LinearGradient>

      <View style={styles.headerRow}>
        <View style={styles.headerBody}>
          <Text style={styles.title}>{activity.title}</Text>
          <View style={styles.tagRow}>
            {activity.tags.map((tag, idx) => (
              <View key={`${activity.id}-${idx}`} style={[styles.tag, { borderColor: tint }]}> 
                <Text style={[styles.tagText, { color: tint }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.keyInfoBox}>
        <View style={styles.keyInfoRow}>
          <View style={styles.keyInfoItem}>
            <Text style={styles.keyLabel}>เวลา</Text>
            <Text style={styles.keyValue}>{activity.time}</Text>
          </View>
          <View style={styles.keyInfoItem}>
            <Text style={styles.keyLabel}>สถานที่</Text>
            <Text style={styles.keyValue}>
              {activity.location} • {activity.distance}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{activity.description}</Text>

      <View style={styles.secondaryInfoGrid}>
        <View style={styles.secondaryInfoItem}>
          <Text style={styles.secondaryLabel}>ผู้เข้าร่วม</Text>
          <Text style={styles.secondaryValue}>
            {activity.participants}/{activity.maxParticipants} คน
          </Text>
        </View>
        <View style={styles.secondaryInfoItem}>
          <Text style={styles.secondaryLabel}>ระดับ</Text>
          <Text style={styles.secondaryValue}>{activity.difficulty}</Text>
        </View>
      </View>

      <View style={styles.organizerRow}>
        <Text style={styles.organizerAvatar}>{activity.organizer.avatar}</Text>
        <View>
          <Text style={styles.organizerLabel}>ผู้จัด</Text>
          <Text style={styles.organizerName}>{activity.organizer.name}</Text>
        </View>
      </View>

      <Pressable style={styles.joinButton} onPress={() => onJoin(activity)}>
        <Text style={styles.joinButtonText}>✓ ลงทะเบียนเข้าร่วม</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  hero: {
    height: 132,
    borderRadius: WarmClearTheme.radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroIcon: {
    fontSize: 64,
  },
  headerRow: {
    marginBottom: 12,
  },
  headerBody: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: WarmClearTheme.colors.surface,
    minHeight: 40,
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 16,
    fontWeight: '800',
  },
  keyInfoBox: {
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.control,
    padding: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
    marginBottom: 12,
  },
  keyInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  keyInfoItem: {
    width: '48%',
  },
  keyLabel: {
    fontSize: 16,
    color: WarmClearTheme.colors.text,
    fontWeight: '900',
    marginBottom: 4,
  },
  keyValue: {
    fontSize: 18,
    color: WarmClearTheme.colors.text,
    fontWeight: '800',
    lineHeight: 24,
  },
  description: {
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    marginBottom: 14,
    lineHeight: 24,
    fontWeight: '700',
  },
  secondaryInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.control,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  secondaryInfoItem: {
    flex: 1,
    minWidth: '48%',
  },
  secondaryLabel: {
    fontSize: 16,
    color: WarmClearTheme.colors.text,
    marginBottom: 4,
    fontWeight: '900',
  },
  secondaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
    lineHeight: 24,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderRadius: WarmClearTheme.radii.control,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  organizerAvatar: {
    fontSize: 24,
  },
  organizerLabel: {
    fontSize: 16,
    color: WarmClearTheme.colors.text,
    fontWeight: '900',
  },
  organizerName: {
    fontSize: 18,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
  },
  joinButton: {
    backgroundColor: WarmClearTheme.colors.primary,
    borderRadius: WarmClearTheme.radii.control,
    minHeight: 48,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
});
