import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const categoryColors = {
  exercise: '#3b82f6',
  cooking: '#f59e0b',
  social: '#ec4899',
  volunteer: '#ef4444',
  learning: '#8b5cf6',
  entertainment: '#06b6d4',
};

export default function ActivityCard({ activity, onJoin }) {
  const tint = categoryColors[activity.category] || '#10b981';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{activity.icon}</Text>
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

      <Text style={styles.description}>{activity.description}</Text>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>เวลา</Text>
          <Text style={styles.infoValue}>{activity.time}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>สถานที่</Text>
          <Text style={styles.infoValue}>{activity.distance}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>ผู้เข้าร่วม</Text>
          <Text style={styles.infoValue}>
            {activity.participants}/{activity.maxParticipants} คน
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>ระดับ</Text>
          <Text style={styles.infoValue}>{activity.difficulty}</Text>
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  icon: {
    fontSize: 36,
  },
  headerBody: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoItem: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  organizerAvatar: {
    fontSize: 24,
  },
  organizerLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  joinButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
