import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { WarmClearTheme } from '../theme';

export default function RoleSelectScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[WarmClearTheme.colors.primary, WarmClearTheme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>GoodNeighbor</Text>
        <Text style={styles.heroSubtitle}>เลือกโหมดการใช้งาน (ตัวอย่าง mock)</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>เข้าสู่ระบบแบบไหน?</Text>
        <Text style={styles.cardBody}>
          ตอนนี้เป็น mock แยกเส้นทาง UI เฉยๆ (ยังไม่ผูกบัญชีจริง)
        </Text>

        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>👨‍🦳 โหมดผู้สูงอายุ</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/caregiver')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>👩‍👦 โหมดลูกหลาน/ผู้ดูแล</Text>
        </Pressable>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>ความเป็นส่วนตัว</Text>
          <Text style={styles.noteBody}>
            หน้าลูกหลานจะแสดงเฉพาะข้อมูลจำเป็น เช่น สถานที่กิจกรรมล่าสุดแบบคร่าวๆ และแนวโน้มการออกไปทำกิจกรรม
          </Text>
        </View>
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
    fontSize: 18,
    color: WarmClearTheme.colors.textMuted,
    lineHeight: 24,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.primaryDark,
    lineHeight: 22,
  },
});
