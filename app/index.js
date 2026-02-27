import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../providers/providers';
import { WarmClearTheme } from '../theme';

export default function GateScreen() {
  const { initialized, session, profile, profileLoading } = useAuth();

  const subtitle = !initialized
    ? 'กำลังเตรียมระบบ…'
    : !session
      ? 'กำลังไปหน้าล็อกอิน…'
      : profileLoading
        ? 'กำลังโหลดโปรไฟล์…'
        : !profile?.role
          ? 'กำลังไปหน้าเลือกบทบาท…'
          : 'กำลังเข้าสู่ระบบ…';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[WarmClearTheme.colors.primary, WarmClearTheme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>GoodNeighbor</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>
      </LinearGradient>

      <View style={styles.card}>
        <ActivityIndicator size="large" color={WarmClearTheme.colors.primary} />
        <Text style={styles.cardBody}>ระบบจะพาคุณไปหน้าที่ถูกต้องอัตโนมัติ</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WarmClearTheme.colors.background,
  },
  content: {
    paddingBottom: 80,
  },
  hero: {
    paddingTop: 56,
    paddingBottom: 26,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...WarmClearTheme.shadows.bar,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '800',
  },
  card: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cardBody: {
    marginTop: 2,
    fontSize: 16,
    color: WarmClearTheme.colors.textMuted,
    lineHeight: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
});