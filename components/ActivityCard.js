import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { WarmClearTheme } from '../theme';

const categoryColors = {
  exercise:      '#3b82f6',
  cooking:       '#f59e0b',
  social:        '#ec4899',
  volunteer:     '#ef4444',
  merit:         '#f97316',
  learning:      '#8b5cf6',
  entertainment: '#06b6d4',
};

export default function ActivityCard({ activity, onJoin, isOwner = false }) {
  const [detailVisible, setDetailVisible] = useState(false);
  const [registered, setRegistered]       = useState(false);
  const t    = WarmClearTheme;
  const tint = categoryColors[activity.category] || t.colors.primary;

  const handleJoin = () => {
    setRegistered(true);
    setDetailVisible(false);
    onJoin(activity);
  };

  return (
    <>
      {/* ── MINIMAL CARD — กดที่ไหนก็ได้เพื่อดูรายละเอียด ── */}
      <Pressable style={[styles.card, isOwner && styles.cardOwner]} onPress={() => setDetailVisible(true)}>
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

        {/* Owner badge */}
        {isOwner ? (
          <View style={styles.ownerBadge}>
            <Ionicons name="star" size={14} color="#92400e" />
            <Text style={styles.ownerBadgeText}>กิจกรรมของฉัน</Text>
          </View>
        ) : null}

        {/* Title + Mode Badge */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{activity.title}</Text>
          <View style={[styles.modeBadge, activity.mode === 'online' ? styles.modeBadgeOnline : styles.modeBadgeOnsite]}>
            <Text style={[styles.modeBadgeText, activity.mode === 'online' ? styles.modeBadgeTextOnline : styles.modeBadgeTextOnsite]}>
              {activity.mode === 'online' ? 'Online' : 'Onsite'}
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationBox}>
          <Text style={styles.locationText}>📍 {activity.location} • {activity.distance}</Text>
        </View>

        {/* Time */}
        <View style={styles.timeBox}>
          <Ionicons name="time-outline" size={15} color={t.colors.textSub} />
          <Text style={styles.timeText}>{activity.time}</Text>
        </View>

        {/* Detail Button / Registered Badge */}
        {registered ? (
          <View style={styles.registeredBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#065f46" />
            <Text style={styles.registeredText}>ลงทะเบียนแล้ว</Text>
          </View>
        ) : (
          <View style={styles.detailButton}>
            <Text style={styles.detailButtonText}>รายละเอียด</Text>
          </View>
        )}
      </Pressable>

      {/* ── FULL DETAIL MODAL ── */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailVisible(false)}
      >
        {/* กดพื้นที่นอก sheet เพื่อปิด */}
        <Pressable style={styles.modalOverlay} onPress={() => setDetailVisible(false)}>
          {/* ป้องกันการปิดเมื่อกดใน sheet */}
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            {/* Close button */}
            <Pressable style={styles.closeBtn} onPress={() => setDetailVisible(false)}>
              <Ionicons name="close" size={22} color={t.colors.text} />
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              {/* Hero */}
              <LinearGradient
                colors={[t.colors.cardGradientStart, t.colors.cardGradientEnd]}
                style={styles.modalHero}
              >
                {activity.image ? (
                  <Image source={activity.image} style={styles.heroImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.heroIcon}>{activity.icon}</Text>
                )}
              </LinearGradient>

              {/* Title + Mode */}
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
                  <Text style={styles.secondaryValue}>{activity.participants}/{activity.maxParticipants} คน</Text>
                </View>
                <View style={styles.secondaryInfoItem}>
                  <Text style={styles.secondaryLabel}>เวลา</Text>
                  <Text style={styles.secondaryValue}>{activity.time}</Text>
                </View>
              </View>

              {/* Organizer */}
              <Text style={styles.organizerText}>ผู้จัด: {activity.organizer.name}</Text>

              {/* Join Button or Registered */}
              {registered ? (
                <View style={styles.registeredFull}>
                  <Ionicons name="checkmark-circle" size={22} color="#065f46" />
                  <Text style={styles.registeredFullText}>ลงทะเบียนกิจกรรมนี้แล้ว</Text>
                </View>
              ) : (
                <Pressable style={styles.joinButton} onPress={handleJoin}>
                  <Text style={styles.joinButtonText}>ลงทะเบียนเข้าร่วม</Text>
                </Pressable>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Minimal Card ──
  card: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  cardOwner: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  ownerBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#92400e',
  },
  hero: {
    height: 132,
    borderRadius: WarmClearTheme.radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroIcon:  { fontSize: 64 },
  heroImage: { width: '100%', height: '100%' },
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
  modeBadge:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexShrink: 0, alignSelf: 'flex-start' },
  modeBadgeOnline:     { backgroundColor: '#d1fae5', borderWidth: 1, borderColor: '#10b981' },
  modeBadgeOnsite:     { backgroundColor: '#fdf2e4', borderWidth: 1, borderColor: '#E8340A' },
  modeBadgeText:       { fontSize: 12, fontWeight: '800' },
  modeBadgeTextOnline: { color: '#065f46' },
  modeBadgeTextOnsite: { color: '#E8340A' },
  locationBox: { marginBottom: 8 },
  locationText: { fontSize: 15, fontWeight: '700', color: WarmClearTheme.colors.text },
  timeBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  timeText: { fontSize: 14, fontWeight: '700', color: WarmClearTheme.colors.textSub },

  detailButton: {
    borderWidth: 1.5,
    borderColor: WarmClearTheme.colors.primary,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailButtonText: { fontSize: 16, fontWeight: '900', color: WarmClearTheme.colors.primary },

  // registered badge (on card)
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#d1fae5',
    borderWidth: 1.5,
    borderColor: '#6ee7b7',
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 12,
  },
  registeredText: { fontSize: 16, fontWeight: '900', color: '#065f46' },

  // ── Modal Sheet ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 16,
    ...WarmClearTheme.shadows.bar,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginBottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent:  { padding: 16, paddingBottom: 40 },
  modalHero: {
    height: 160,
    borderRadius: WarmClearTheme.radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  tagRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag:       { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: WarmClearTheme.colors.surface },
  tagText:   { fontSize: 14, fontWeight: '800' },
  description: { fontSize: 16, color: WarmClearTheme.colors.textSub, marginBottom: 10, lineHeight: 22, fontWeight: '600' },
  secondaryInfoGrid: {
    flexDirection: 'row', gap: 12,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderRadius: WarmClearTheme.radii.control,
    padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: WarmClearTheme.colors.border,
  },
  secondaryInfoItem: { flex: 1 },
  secondaryLabel:    { fontSize: 14, color: WarmClearTheme.colors.text, marginBottom: 4, fontWeight: '900' },
  secondaryValue:    { fontSize: 16, fontWeight: '800', color: WarmClearTheme.colors.text },
  organizerText:     { fontSize: 14, fontWeight: '700', color: WarmClearTheme.colors.textSub, marginBottom: 12 },

  joinButton: {
    backgroundColor: WarmClearTheme.colors.accent,
    borderRadius: WarmClearTheme.radii.control,
    minHeight: 52, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  joinButtonText: { fontSize: 18, fontWeight: '900', color: '#000000' },

  // registered full (in modal)
  registeredFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#d1fae5',
    borderWidth: 1.5,
    borderColor: '#6ee7b7',
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 16,
  },
  registeredFullText: { fontSize: 17, fontWeight: '900', color: '#065f46' },
});