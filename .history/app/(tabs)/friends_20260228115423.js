import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { friends } from '../../data/mockData';
import { WarmClearTheme } from '../../theme';
import { useRouter } from 'expo-router';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  const [relationshipById, setRelationshipById] = useState(() => ({}));

  const getRelationship = (friend) => {
    const local = relationshipById[friend.id];
    if (local) return local;
    return friend.relationship ?? friend.connectionStatus ?? 'none';
  };

  const getPrimaryAction = (friend) => {
    const relationship = getRelationship(friend);
    if (relationship === 'friends') {
      return {
        label: 'เป็นเพื่อนแล้ว',
        disabled: true,
        variant: 'neutral',
      };
    }
    if (relationship === 'requested') {
      return {
        label: 'ส่งคำขอแล้ว',
        disabled: true,
        variant: 'soft',
      };
    }
    return {
      label: 'เพิ่มเพื่อน',
      disabled: false,
      variant: 'primary',
    };
  };

  const onPressAddFriend = (friend) => {
    setRelationshipById((prev) => ({ ...prev, [friend.id]: 'requested' }));
    Alert.alert('ส่งคำขอแล้ว (mock)', `ส่งคำขอเป็นเพื่อนไปที่ ${friend.name}`);
  };

  const openFriendProfile = (friend) => {
    router.push({ pathname: '/(tabs)/friend-profile', params: { friendId: friend.id } });
  };

  const renderPersonCard = (friend, { mode }) => {
    const isMyFriend = mode === 'myFriends';

    const cardInner = (
      <>
        <View style={styles.cardTopRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{friend.avatar}</Text>
          </View>

          <View style={styles.cardMain}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{friend.name}</Text>
              {isMyFriend ? (
                <View style={styles.friendPill}>
                  <Text style={styles.friendPillText}>เพื่อนของฉัน</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  friend.status === 'online' ? styles.statusOnline : styles.statusOffline,
                ]}
              />
              <Text style={styles.statusText}>
                {friend.status === 'online' ? 'ออนไลน์' : `ใช้งานล่าสุด: ${friend.lastActive}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={WarmClearTheme.colors.primaryDark}
              />
              <Text style={styles.infoText}>{friend.distance}</Text>
            </View>

            <Text style={styles.contextText}>เจอกันที่: {metAtByFriendId[friend.id] ?? 'กิจกรรมชุมชน'}</Text>
            <Text style={styles.detailText}>กิจกรรมร่วมกัน: {friend.commonActivities} ครั้ง</Text>
            {!!friend.mutualFriends && (
              <Text style={styles.detailTextMuted}>เพื่อนร่วมกัน: {friend.mutualFriends} คน</Text>
            )}

            {isMyFriend ? (
              <View style={styles.tapHintRow}>
                <Text style={styles.tapHintText}>แตะเพื่อดูโปรไฟล์</Text>
                <Ionicons name="chevron-forward" size={18} color={WarmClearTheme.colors.textSub} />
              </View>
            ) : null}
          </View>
        </View>

        {!isMyFriend ? (
          (() => {
            const action = getPrimaryAction(friend);
            const buttonStyle =
              action.variant === 'primary'
                ? styles.primaryButton
                : action.variant === 'soft'
                  ? styles.softButton
                  : styles.neutralButton;
            const buttonTextStyle =
              action.variant === 'primary'
                ? styles.primaryButtonText
                : styles.secondaryButtonText;

            return (
              <Pressable
                onPress={() => {
                  if (!action.disabled) onPressAddFriend(friend);
                }}
                disabled={action.disabled}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                style={({ pressed }) => [
                  styles.cardButton,
                  buttonStyle,
                  pressed && !action.disabled ? styles.buttonPressed : null,
                  action.disabled ? styles.buttonDisabled : null,
                ]}
              >
                <Text style={buttonTextStyle}>{action.label}</Text>
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
        <Pressable
          onPress={() => setSearchOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="ค้นหาเพื่อน"
          style={styles.searchButton}
        >
          <Ionicons name="search" size={18} color={WarmClearTheme.colors.primaryDark} />
          <Text style={styles.searchButtonText}>ค้นหาเพื่อน</Text>
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab('recommended')}
          accessibilityRole="button"
          accessibilityLabel="เพื่อนแนะนำ"
          style={[styles.tabButton, activeTab === 'recommended' ? styles.tabButtonActive : null]}
        >
          <Text style={[styles.tabText, activeTab === 'recommended' ? styles.tabTextActive : null]}>
            เพื่อนแนะนำ
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('myFriends')}
          accessibilityRole="button"
          accessibilityLabel="เพื่อนของฉัน"
          style={[styles.tabButton, activeTab === 'myFriends' ? styles.tabButtonActive : null]}
        >
          <Text style={[styles.tabText, activeTab === 'myFriends' ? styles.tabTextActive : null]}>
            เพื่อนของฉัน
          </Text>
        </Pressable>
      </View>

      {activeTab === 'recommended' ? (
        <Text style={styles.helperText}>คนที่เคยทำกิจกรรมร่วมกัน และอาจอยากเป็นเพื่อนกัน</Text>
      ) : (
        <Text style={styles.helperText}>รายชื่อเพื่อนที่คุณเชื่อมต่อแล้ว</Text>
      )}

      {activeTab === 'recommended'
        ? recommendedFriends.map((friend) => renderPersonCard(friend, { mode: 'recommended' }))
        : myFriends.map((friend) => renderPersonCard(friend, { mode: 'myFriends' }))}

      <Modal
        visible={searchOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSearchOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ค้นหาเพื่อน</Text>
              <Pressable
                onPress={() => setSearchOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="ปิด"
                style={styles.modalClose}
              >
                <Ionicons name="close" size={20} color={WarmClearTheme.colors.text} />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>ค้นหาด้วยชื่อ</Text>
            <TextInput
              value={searchName}
              onChangeText={setSearchName}
              placeholder="พิมพ์ชื่อเพื่อน..."
              placeholderTextColor={WarmClearTheme.colors.textMuted}
              style={styles.modalInput}
            />

            <Text style={styles.modalDividerText}>หรือ</Text>

            <Pressable
              onPress={() => Alert.alert('สแกน QR (mock)', 'ยังไม่เปิดใช้งานในตอนนี้')}
              accessibilityRole="button"
              accessibilityLabel="ค้นหาด้วย QR code"
              style={styles.qrButton}
            >
              <Ionicons name="qr-code" size={20} color={WarmClearTheme.colors.surface} />
              <Text style={styles.qrButtonText}>ค้นหาด้วย QR code</Text>
            </Pressable>

            <Text style={styles.modalHint}>
              (ตอนนี้เป็นหน้าตา UI ตัวอย่าง ยังไม่มีระบบค้นหาจริง)
            </Text>
          </View>
        </View>
      </Modal>
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
    fontSize: 16,
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

  card: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    marginBottom: 18,
    ...WarmClearTheme.shadows.card,
  },
  cardPressed: {
    opacity: 0.92,
  },
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
  avatarText: {
    fontSize: 34,
  },
  cardMain: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 2,
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
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOnline: {
    backgroundColor: WarmClearTheme.colors.primary,
  },
  statusOffline: {
    backgroundColor: WarmClearTheme.colors.textMuted,
  },
  statusText: {
    fontSize: 16,
    color: WarmClearTheme.colors.text,
    fontWeight: '700',
    lineHeight: 22,
    flexShrink: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: WarmClearTheme.colors.text,
    fontWeight: '800',
  },
  contextText: {
    fontSize: 16,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: WarmClearTheme.colors.text,
    fontWeight: '700',
    lineHeight: 22,
  },
  detailTextMuted: {
    fontSize: 16,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 4,
  },

  tapHintRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tapHintText: {
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
  },

  cardButton: {
    marginTop: 14,
    width: '100%',
    minHeight: 56,
    borderRadius: WarmClearTheme.radii.control,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  primaryButton: {
    backgroundColor: WarmClearTheme.colors.primary,
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
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.surface,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.85,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
    fontSize: 16,
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
  },
  modalDividerText: {
    marginTop: 14,
    marginBottom: 14,
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.textSub,
    textAlign: 'center',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.primary,
    ...WarmClearTheme.shadows.button,
  },
  qrButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.surface,
  },
  modalHint: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: WarmClearTheme.colors.textSub,
    lineHeight: 22,
  },
});
