import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { friends } from '../../data/mockData';
import { WarmClearTheme } from '../../theme';
import { useRouter } from 'expo-router';

// mock: วันที่พบกันล่าสุด (กิจกรรมล่าสุด) แยกตาม friendId
const lastMetDateByFriendId = {
  f1: '12 ม.ค. 2568',
  f2: '5 ม.ค. 2568',
  f3: '28 ธ.ค. 2567',
  f4: '20 ธ.ค. 2567',
};

export default function FriendsScreen() {
  const router = useRouter();

  const metAtByFriendId = useMemo(
    () => ({
      f1: 'เดินเช้าสวนลุมพินี',
      f2: 'ทำขนมไทยโบราณ',
      f3: 'ตลาดนัดเกษตรกร',
      f4: 'ชมภาพยนตร์ร่วมกัน',
    }),
    []
  );

  const myFriendIdSet = useMemo(() => new Set(['f1', 'f4']), []);
  const recommendedFriends = useMemo(() => friends, []);
  const myFriends = useMemo(() => friends.filter((f) => myFriendIdSet.has(f.id)), [myFriendIdSet]);

  const [activeTab, setActiveTab] = useState('recommended');

  const [relationshipById, setRelationshipById] = useState(() => ({}));

  const getRelationship = (friend) => {
    const local = relationshipById[friend.id];
    if (local) return local;
    return friend.relationship ?? friend.connectionStatus ?? 'none';
  };

  const getPrimaryAction = (friend) => {
    const relationship = getRelationship(friend);
    if (relationship === 'friends') {
      return { label: 'เป็นเพื่อนแล้ว', disabled: true, variant: 'neutral' };
    }
    if (relationship === 'requested') {
      return { label: 'ส่งคำขอแล้ว', disabled: true, variant: 'soft' };
    }
    return { label: 'เพิ่มเพื่อนใน LINE', disabled: false, variant: 'line' };
  };

  // เปิด LINE deep link เพื่อเพิ่มเพื่อน
  // mock: ใช้ LINE ID ของแต่ละเพื่อน (ในของจริงดึงจาก friend.lineId)
  const onPressAddLineFriend = (friend) => {
    const lineId = friend.lineId ?? `goodneighbor_${friend.id}`;
    const lineUrl = `https://line.me/ti/p/~${lineId}`;

    Linking.canOpenURL(lineUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(lineUrl);
        }
        // fallback: เปิด line.me ใน browser
        return Linking.openURL(`https://line.me/R/ti/p/~${lineId}`);
      })
      .catch(() => {
        Alert.alert('ไม่สามารถเปิด LINE ได้', 'กรุณาติดตั้ง LINE ก่อนใช้งาน');
      });

    // อัปเดต state local ว่ากด "ส่งคำขอ" แล้ว
    setRelationshipById((prev) => ({ ...prev, [friend.id]: 'requested' }));
  };

  const openFriendProfile = (friend) => {
    router.push({ pathname: '/(tabs)/friend-profile', params: { friendId: friend.id } });
  };

  const renderPersonCard = (friend, { mode }) => {
    const isMyFriend = mode === 'myFriends';
    const metAt = metAtByFriendId[friend.id] ?? 'กิจกรรมชุมชน';
    const lastDate = lastMetDateByFriendId[friend.id] ?? '-';

    const cardInner = (
      <>
        <View style={styles.cardTopRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{friend.avatar}</Text>
          </View>

          <View style={styles.cardMain}>
            {/* ชื่อ + pill */}
            <View style={styles.nameRow}>
              <Text style={styles.name}>{friend.name}</Text>
              {isMyFriend ? (
                <View style={styles.friendPill}>
                  <Text style={styles.friendPillText}>เพื่อนของฉัน</Text>
                </View>
              ) : null}
            </View>

            {/* เจอกันที่: กิจกรรม — วันที่ */}
            <View style={styles.metRow}>
              <Ionicons name="walk-outline" size={16} color={WarmClearTheme.colors.primaryDark} />
              <Text style={styles.metText}>{metAt}</Text>
            </View>
            {/* กิจกรรมร่วมกัน */}
            <View style={styles.countRow}>
              <Ionicons name="people-outline" size={16} color={WarmClearTheme.colors.primaryDark} />
              <Text style={styles.countText}>
                ทำกิจกรรมร่วมกัน <Text style={styles.countHighlight}>{friend.commonActivities} ครั้ง</Text>
              </Text>
            </View>

            {isMyFriend ? (
              <View style={styles.tapHintRow}>
                <Text style={styles.tapHintText}>แตะเพื่อดูโปรไฟล์</Text>
                <Ionicons name="chevron-forward" size={18} color={WarmClearTheme.colors.textSub} />
              </View>
            ) : null}
          </View>
        </View>

        {/* ปุ่ม — เฉพาะ recommended tab */}
        {!isMyFriend ? (
          (() => {
            const action = getPrimaryAction(friend);
            const isLine = action.variant === 'line';
            return (
              <Pressable
                onPress={() => {
                  if (!action.disabled) onPressAddLineFriend(friend);
                }}
                disabled={action.disabled}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                style={({ pressed }) => [
                  styles.cardButton,
                  isLine ? styles.lineButton
                    : action.variant === 'soft' ? styles.softButton
                    : styles.neutralButton,
                  pressed && !action.disabled ? styles.buttonPressed : null,
                  action.disabled ? styles.buttonDisabled : null,
                ]}
              >
                <Text style={isLine ? styles.lineButtonText : styles.secondaryButtonText}>
                  {action.label}
                </Text>
              </Pressable>
            );
          })()
        ) : null}
      </>
    );

    if (isMyFriend) {
      return (
        <Pressable
          key={friend.id}
          onPress={() => openFriendProfile(friend)}
          accessibilityRole="button"
          accessibilityLabel={`ดูโปรไฟล์ของ ${friend.name}`}
          style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
        >
          {cardInner}
        </Pressable>
      );
    }

    return (
      <View key={friend.id} style={styles.card}>
        {cardInner}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>เพื่อน</Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab('recommended')}
          accessibilityRole="button"
          style={[styles.tabButton, activeTab === 'recommended' ? styles.tabButtonActive : null]}
        >
          <Text style={[styles.tabText, activeTab === 'recommended' ? styles.tabTextActive : null]}>
            เพื่อนแนะนำ
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('myFriends')}
          accessibilityRole="button"
          style={[styles.tabButton, activeTab === 'myFriends' ? styles.tabButtonActive : null]}
        >
          <Text style={[styles.tabText, activeTab === 'myFriends' ? styles.tabTextActive : null]}>
            เพื่อนของฉัน
          </Text>
        </Pressable>
      </View>

      {activeTab === 'recommended' ? (
        <Text style={styles.helperText}></Text>
      ) : (
        <Text style={styles.helperText}></Text>
      )}

      {activeTab === 'recommended'
        ? recommendedFriends.map((friend) => renderPersonCard(friend, { mode: 'recommended' }))
        : myFriends.map((friend) => renderPersonCard(friend, { mode: 'myFriends' }))}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    ...WarmClearTheme.shadows.subtle,
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: WarmClearTheme.radii.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  tabButtonActive: {
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.textSub,
  },
  tabTextActive: {
    color: WarmClearTheme.colors.primaryDark,
  },
  helperText: {
    fontSize: 16,
    color: WarmClearTheme.colors.text,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 14,
  },

  // ── Card ──
  card: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    marginBottom: 18,
    ...WarmClearTheme.shadows.card,
  },
  cardPressed: { opacity: 0.92 },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  avatarCircle: {
    minWidth: 64,
    minHeight: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  avatarText: { fontSize: 34 },
  cardMain: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  name: {
    fontSize: 19,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    flexShrink: 1,
  },
  friendPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  friendPillText: {
    fontSize: 13,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },

  // เจอกันที่ กิจกรรม
  metRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  metText: {
    fontSize: 15,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
    flexShrink: 1,
  },

  // วันที่
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: WarmClearTheme.colors.textMuted,
  },

  // จำนวนครั้ง
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  countText: {
    fontSize: 15,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
  },
  countHighlight: {
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },

  tapHintRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tapHintText: {
    fontSize: 15,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
  },

  // ── Buttons ──
  cardButton: {
    marginTop: 14,
    width: '100%',
    minHeight: 52,
    borderRadius: WarmClearTheme.radii.control,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...WarmClearTheme.shadows.button,
  },
  // LINE สีเขียว #06C755
  lineButton: {
    backgroundColor: '#06C755',
  },
  lineButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  softButton: {
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  neutralButton: {
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  buttonPressed: { opacity: 0.92 },
  buttonDisabled: { opacity: 0.85 },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  modalClose: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  modalInput: {
    minHeight: 52,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    color: WarmClearTheme.colors.text,
    marginBottom: 10,
  },
  lineSearchButton: {
    minHeight: 52,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: '#06C755',
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  lineSearchButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  modalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: WarmClearTheme.colors.border,
  },
  modalDividerText: {
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: '#06C755',
    ...WarmClearTheme.shadows.button,
  },
  qrButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
  },
  modalHint: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
});