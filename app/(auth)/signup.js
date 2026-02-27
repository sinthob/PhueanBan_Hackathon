import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

import { useAuth } from '../../providers/AuthProvider';
import { WarmClearTheme } from '../../theme';

export default function SignupScreen() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSignup = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    if (password.length < 8) {
      Alert.alert('รหัสผ่านสั้นเกินไป', 'แนะนำอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await signUp({ email: trimmedEmail, password });

      // Depending on Supabase settings, user may need email confirmation.
      if (!data?.session) {
        Alert.alert('สมัครสำเร็จ', 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ (ถ้าระบบเปิดยืนยันอีเมล)');
      }
      // RouteGuard will redirect if session exists.
    } catch (err) {
      Alert.alert('สมัครไม่สำเร็จ', err?.message ?? 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <LinearGradient
        colors={[WarmClearTheme.colors.primary, WarmClearTheme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>GoodNeighbor</Text>
        <Text style={styles.heroSubtitle}>สมัครสมาชิก</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={WarmClearTheme.colors.textMuted}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>รหัสผ่าน</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="อย่างน้อย 8 ตัวอักษร"
          placeholderTextColor={WarmClearTheme.colors.textMuted}
          style={styles.input}
        />

        <Pressable
          onPress={onSignup}
          disabled={submitting}
          style={[styles.primaryButton, submitting && { opacity: 0.7 }]}
        >
          <Text style={styles.primaryButtonText}>{submitting ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>มีบัญชีแล้ว?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.linkButton}>
              <Text style={styles.linkButtonText}>เข้าสู่ระบบ</Text>
            </Pressable>
          </Link>
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
  label: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 16,
    fontWeight: '800',
    color: WarmClearTheme.colors.text,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '800',
    color: WarmClearTheme.colors.textMuted,
  },
  linkButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: WarmClearTheme.radii.chip,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.primaryDark,
  },
});
