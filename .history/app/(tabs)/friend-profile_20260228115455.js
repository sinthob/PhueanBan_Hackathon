import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { friends } from '../../data/mockData';
import { WarmClearTheme } from '../../theme';

function getStatusLabel(friend) {
  if (!friend) return '';
  if (friend.status === 'online') return 'ออนไลน์';
  return `ใช้งานล่าสุด: ${friend.lastActive}`;
}

export default function FriendProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const friendId = typeof params.friendId === 'string' ? params.friendId : '';

  const friend = useMemo(() => friends.find((f) => f.id === friendId) ?? null, [friendId]);

  const metAtLabel = useMemo(() => {
    const byId = {
      f1: 'เดินเช้าสวนลุมพินี',
      f2: 'ทำขนมไทยโบราณ',
      f3: 'ตลาดนัดเกษตรกร',
      f4: 'ชมภาพยนตร์ร่วมกัน',
    };
    return byId[friendId] ?? 'กิจกรรมชุมชน';
  }, [friendId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topChrome}>
        <View style={styles.headerBar}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="ย้อนกลับ"
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color={WarmClearTheme.colors.text} />
          </Pressable>

          <Text style={styles.headerTitle}>โปรไฟล์เพื่อน</Text>

          <View style={styles.headerSpacer} />
        </View>

        {friend ? (
          <View style={styles.hero}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{friend.avatar}</Text>
              </View>
            </View>

            <Text style={styles.name}>{friend.name}</Text>
            <Text style={styles.status}>{getStatusLabel(friend)}</Text>

            <View style={styles.infoPillsRow}>
              <View style={styles.infoPill}>
                <Ionicons name="location-outline" size={18} color={WarmClearTheme.colors.primaryDark} />
                <Text style={styles.infoPillText}>{friend.distance}</Text>
              </View>
              <View style={styles.infoPill}>
                <Ionicons name="calendar-outline" size={18} color={WarmClearTheme.colors.primaryDark} />
                <Text style={styles.infoPillText}>เจอกันที่: {metAtLabel}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.hero}>
            <Text style={styles.missingTitle}>ไม่พบข้อมูลเพื่อน</Text>
            <Text style={styles.missingBody}>กรุณากลับไปหน้าก่อนหน้าแล้วลองใหม่</Text>
          </View>
        )}
      </View>

      {friend ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ข้อมูลการทำกิจกรรมร่วมกัน</Text>
          <Text style={styles.cardBody}>กิจกรรมร่วมกัน: {friend.commonActivities} ครั้ง</Text>
          <Text style={styles.cardBody}>สถิติการเจอกัน: {friend.streak} วัน</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  topChrome: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...WarmClearTheme.shadows.bar,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  hero: {
    marginTop: 14,
    alignItems: 'center',
  },
  avatarRing: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: WarmClearTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  avatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  avatarText: {
    fontSize: 56,
  },
  name: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    textAlign: 'center',
  },
  status: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    textAlign: 'center',
  },
  infoPillsRow: {
    marginTop: 12,
    width: '100%',
    gap: 10,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  infoPillText: {
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
    flexShrink: 1,
  },

  card: {
    marginTop: 14,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    ...WarmClearTheme.shadows.card,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 16,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
    marginTop: 6,
  },

  missingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    textAlign: 'center',
  },
  missingBody: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
    textAlign: 'center',
    lineHeight: 22,
  },
});
