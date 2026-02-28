import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { friends } from '../../data/mockData';
import { WarmClearTheme } from '../../theme';

export default function FriendsScreen() {
  const metAtByFriendId = useMemo(
    () => ({
      f1: 'Morning Walk at Lumpini Park',
      f2: 'Traditional Thai Dessert Workshop',
      f3: 'Local Farmers Market Meetup',
      f4: 'Movie Day Together',
    }),
    []
  );

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
        label: 'Friends',
        disabled: true,
        variant: 'neutral',
      };
    }
    if (relationship === 'requested') {
      return {
        label: 'Request Sent',
        disabled: true,
        variant: 'soft',
      };
    }
    return {
      label: 'Add Friend',
      disabled: false,
      variant: 'primary',
    };
  };

  const onPressAddFriend = (friend) => {
    setRelationshipById((prev) => ({ ...prev, [friend.id]: 'requested' }));
    Alert.alert('Request Sent (mock)', `Sent a friend request to ${friend.name}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>People You Met in Activities</Text>
        <Text style={styles.subtitle}>Stay connected with familiar faces</Text>
      </View>

      {friends.map((friend) => (
        <View key={friend.id} style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{friend.avatar}</Text>
            </View>

            <View style={styles.cardMain}>
              <Text style={styles.name}>{friend.name}</Text>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    friend.status === 'online' ? styles.statusOnline : styles.statusOffline,
                  ]}
                />
                <Text style={styles.statusText}>
                  {friend.status === 'online' ? 'Online' : `Last seen: ${friend.lastActive}`}
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

              <Text style={styles.contextText}>
                Met at: {metAtByFriendId[friend.id] ?? 'Community activity'}
              </Text>

              <Text style={styles.detailText}>
                Activities together: {friend.commonActivities}
              </Text>
              {!!friend.mutualFriends && (
                <Text style={styles.detailTextMuted}>Mutual friends: {friend.mutualFriends}</Text>
              )}
            </View>
          </View>

          {(() => {
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
          })()}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '700',
    lineHeight: 22,
  },

  card: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    marginBottom: 18,
    ...WarmClearTheme.shadows.card,
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
  name: {
    fontSize: 19,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 6,
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
});
