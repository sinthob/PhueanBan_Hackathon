import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { friends } from '../../data/mockData';
import { WarmClearTheme } from '../../theme';

// mock: วันที่พบกันล่าสุด (กิจกรรมล่าสุดที่เจอกัน)
const lastMetDateByFriendId = {
  f1: '12 ม.ค. 2568',
  f2: '5 ม.ค. 2568',
  f3: '28 ธ.ค. 2567',
  f4: '20 ธ.ค. 2567',
};

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

  const lastMetDate = lastMetDateByFriendId[friendId] ?? '-';

  const onAddLine = () => {
    const lineId = friend?.lineId ?? `goodneighbor_${friendId}`;
    const lineUrl = `https://line.me/ti/p/~${lineId}`;
    Linking.openURL(lineUrl).catch(() =>
      Alert.alert('ไม่สามารถเปิด LINE ได้', 'กรุณาติดตั้ง LINE ก่อนใช้งาน')
    );
  };

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
            {/* Avatar */}
            <View style={styles.avatarRing}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{friend.avatar}</Text>
              </View>
            </View>

            {/* ชื่อ */}
            <Text style={styles.name}>{friend.name}</Text>

            {/* Info pills — เจอกันที่ + วันที่ */}
            <View style={styles.infoPillsRow}>
              <View style={styles.infoPill}>
                <Ionicons name="walk-outline" size={18} color={WarmClearTheme.colors.primaryDark} />
                <Text style={styles.infoPillText}>เจอกันที่: {metAtLabel}</Text>
              </View>
              <View style={styles.infoPill}>
                <Ionicons name="calendar-outline" size={18} color={WarmClearTheme.colors.primaryDark} />
                <Text style={styles.infoPillText}>ครั้งล่าสุด: {lastMetDate}</Text>
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
        <>
          {/* กิจกรรมร่วมกัน */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>กิจกรรมร่วมกัน</Text>
            <View style={styles.statRow}>
              <Ionicons name="people-outline" size={20} color={WarmClearTheme.colors.primaryDark} />
              <Text style={styles.cardBody}>
                เข้าร่วมกิจกรรมร่วมกัน{' '}
                <Text style={styles.highlight}>{friend.commonActivities} ครั้ง</Text>
              </Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="flame-outline" size={20} color={WarmClearTheme.colors.primaryDark} />
              <Text style={styles.cardBody}>
                สถิติการเจอกัน{' '}
                <Text style={styles.highlight}>{friend.streak} วัน</Text>
              </Text>
            </View>
          </View>

          {/* ปุ่มเพิ่มเพื่อนใน LINE */}
          <Pressable
            onPress={onAddLine}
            accessibilityRole="button"
            accessibilityLabel="เพิ่มเพื่อนใน LINE"
            style={styles.lineButton}
          >
            <Text style={styles.lineButtonText}>เพิ่มเพื่อนใน LINE</Text>
          </Pressable>
        </>
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

  // Card
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
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  cardBody: {
    fontSize: 16,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
    flex: 1,
  },
  highlight: {
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },

  // LINE Button
  lineButton: {
    marginTop: 16,
    minHeight: 56,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: '#06C755',
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  lineButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
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