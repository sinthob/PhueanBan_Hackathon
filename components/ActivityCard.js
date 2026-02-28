import React from 'react';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { WarmClearTheme } from '../theme';

const categoryColors = {
  exercise: '#3b82f6',
  cooking: '#f59e0b',
  social: '#ec4899',
  volunteer: '#ef4444',
  merit: '#f97316',
  learning: '#8b5cf6',
  entertainment: '#06b6d4',
};

export default function ActivityCard({ activity, onJoin }) {
  const t = WarmClearTheme;
  const tint = categoryColors[activity.category] || t.colors.primary;

  return (
    <View style={styles.card}>
      {/* Hero Image */}
      <LinearGradient
        colors={[t.colors.cardGradientStart, t.colors.cardGradientEnd]}
        style={styles.hero}
      >
        {activity.image ? (
          <Image source={activity.image} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <Text style={styles.heroIcon}>{activity.icon}</Text>
        )}
      </LinearGradient>

      {/* Title + Mode Badge */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{activity.title}</Text>
        <View style={[styles.modeBadge, activity.mode === 'online' ? styles.modeBadgeOnline : styles.modeBadgeOnsite]}>
          <Text style={[styles.modeBadgeText, activity.mode === 'online' ? styles.modeBadgeTextOnline : styles.modeBadgeTextOnsite]}>
            {activity.mode === 'online' ? 'Online' : 'Onsite'}
          </Text>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagRow}>
        {activity.tags.map((tag, idx) => (
          <View key={`${activity.id}-${idx}`} style={[styles.tag, { borderColor: tint }]}>
            <Text style={[styles.tagText, { color: tint }]}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      <Text style={styles.description}>{activity.description}</Text>

      {/* Location */}
      <View style={styles.locationBox}>
        <Text style={styles.locationText}>📍 {activity.location} • {activity.distance}</Text>
      </View>

      {/* Participants + Time */}
      <View style={styles.secondaryInfoGrid}>
        <View style={styles.secondaryInfoItem}>
          <Text style={styles.secondaryLabel}>ผู้เข้าร่วม</Text>
          <Text style={styles.secondaryValue}>
            {activity.participants}/{activity.maxParticipants} คน
          </Text>
        </View>
        <View style={styles.secondaryInfoItem}>
          <Text style={styles.secondaryLabel}>เวลา</Text>
          <Text style={styles.secondaryValue}>{activity.time}</Text>
        </View>
      </View>

      {/* Organizer (no avatar) */}
      <Text style={styles.organizerText}>ผู้จัด: {activity.organizer.name}</Text>

      {/* Join Button */}
      <Pressable style={styles.joinButton} onPress={() => onJoin(activity)}>
        <Text style={styles.joinButtonText}>ลงทะเบียนเข้าร่วม</Text>
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
  heroImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    flex: 1,
  },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  modeBadgeOnline: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  modeBadgeOnsite: {
    backgroundColor: '#fdf2e4',
    borderWidth: 1,
    borderColor: '#E8340A',
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modeBadgeTextOnline: {
    color: '#065f46',
  },
  modeBadgeTextOnsite: {
    color: '#e8800a',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: WarmClearTheme.colors.surface,
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '800',
  },
  description: {
    fontSize: 16,
    color: WarmClearTheme.colors.textSub,
    marginBottom: 10,
    lineHeight: 22,
    fontWeight: '600',
  },
  locationBox: {
    marginBottom: 12,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: WarmClearTheme.colors.text,
  },
  secondaryInfoGrid: {
    flexDirection: 'row',
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
  },
  secondaryLabel: {
    fontSize: 14,
    color: WarmClearTheme.colors.text,
    marginBottom: 4,
    fontWeight: '900',
  },
  secondaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
  },
  organizerText: {
    fontSize: 14,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: WarmClearTheme.colors.accent,
    borderRadius: WarmClearTheme.radii.control,
    minHeight: 52,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
  },
});