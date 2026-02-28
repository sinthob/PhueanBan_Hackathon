import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { WarmClearTheme } from '../../theme';

function CreateActivityTabButton({ onPress, accessibilityState }) {
  const focused = Boolean(accessibilityState?.selected);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="สร้างกิจกรรม"
      style={styles.createButtonContainer}
    >
      <View
        style={[
          styles.createButtonCircle,
          focused ? styles.createButtonCircleFocused : null,
        ]}
      >
        <Ionicons name="add" size={30} color={WarmClearTheme.colors.surface} />
      </View>
      <Text style={[styles.createButtonLabel, focused ? styles.createButtonLabelFocused : null]}>
        สร้างกิจกรรม
      </Text>
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: WarmClearTheme.colors.tabBarIcon,
        tabBarInactiveTintColor: WarmClearTheme.colors.tabBarIconInactive,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '800' },
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen
        name="discover"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="activity-preferences"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'กิจกรรม',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'ข้อความ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'สร้างกิจกรรม',
          tabBarLabel: () => null,
          tabBarButton: (props) => <CreateActivityTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'เพื่อน',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 78,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: WarmClearTheme.colors.tabBar,
    borderTopWidth: 0,
    ...WarmClearTheme.shadows.bar,
  },
  createButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonCircle: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: WarmClearTheme.colors.tabBarIcon,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...WarmClearTheme.shadows.button,
  },
  createButtonCircleFocused: {
    backgroundColor: '#C04010',
  },
  createButtonLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: WarmClearTheme.colors.textMuted,
  },
  createButtonLabelFocused: {
    color: WarmClearTheme.colors.primary,
  },
});