import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../providers/providers';
import { WarmClearTheme } from '../../theme';

export default function RoleOnboardingScreen() {
  const { upsertProfileRole, signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const chooseRole = async (role) => {
    setSubmitting(true);
    try {
      await upsertProfileRole(role);
      // RouteGuard will redirect based on role.
    } catch (err) {
      Alert.alert('ตั้งค่าบัญชีไม่สำเร็จ', err?.message ?? 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const onSignOut = async () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (err) {
              Alert.alert('ออกจากระบบไม่สำเร็จ', err?.message ?? 'กรุณาลองใหม่');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[WarmClearTheme.colors.primary, WarmClearTheme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>GoodNeighbor</Text>
        <Text style={styles.heroSubtitle}>เลือกบทบาทของคุณ</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>คุณจะใช้งานในบทบาทไหน?</Text>
        <Text style={styles.cardBody}>
          เลือกครั้งแรกเพื่อจัดหน้าจอและสิทธิ์การเข้าถึงข้อมูล
        </Text>

        <Pressable
          onPress={() => chooseRole('elder')}
          disabled={submitting}
          style={[styles.primaryButton, submitting && { opacity: 0.7 }]}
        >
          <Text style={styles.primaryButtonText}>ฉันคือผู้สูงอายุ</Text>
        </Pressable>

        <Pressable
          onPress={() => chooseRole('caregiver')}
          disabled={submitting}
          style={[styles.secondaryButton, submitting && { opacity: 0.7 }]}
        >
          <Text style={styles.secondaryButtonText}>ฉันคือผู้ดูแล / ลูกหลาน</Text>
        </Pressable>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>ความเป็นส่วนตัว</Text>
          <Text style={styles.noteBody}>
            สิทธิ์การเห็นข้อมูลของผู้สูงอายุจะถูกควบคุมด้วยความยินยอมและความสัมพันธ์ในฐานข้อมูล (RLS)
          </Text>
        </View>

        <Pressable onPress={onSignOut} style={styles.ghostButton}>
          <Text style={styles.ghostButtonText}>ออกจากระบบ</Text>
        </Pressable>
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
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  cardBody: {
    marginTop: 8,
    fontSize: 16,
    color: WarmClearTheme.colors.textMuted,
    lineHeight: 22,
    fontWeight: '800',
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: WarmClearTheme.colors.primary,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...WarmClearTheme.shadows.button,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    justifyContent: 'center',
    ...WarmClearTheme.shadows.subtle,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  noteBox: {
    marginTop: 16,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderRadius: WarmClearTheme.radii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    ...WarmClearTheme.shadows.subtle,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
    marginBottom: 6,
  },
  noteBody: {
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.primaryDark,
    lineHeight: 20,
  },
  ghostButton: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.textMuted,
    textDecorationLine: 'underline',
  },
});