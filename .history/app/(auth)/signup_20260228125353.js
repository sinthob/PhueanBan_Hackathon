import React, { useMemo, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { categories } from '../../data/mockData';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/providers';
import { WarmClearTheme } from '../../theme';

function ChipButton({ label, active, onPress, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
      style={[styles.chip, active ? styles.chipActive : null]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function RadioOption({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={[styles.radioRow, active ? styles.radioRowActive : null]}
    >
      <View style={[styles.radioOuter, active ? styles.radioOuterActive : null]}>
        {active ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );
}

const HEALTH_OPTIONS = [
  { label: 'ไม่ระบุ', value: 'none' },
  { label: 'หัวใจและหลอดเลือด', value: 'cardiovascular' },
  { label: 'เบาหวาน', value: 'diabetes' },
  { label: 'ข้อ/การเคลื่อนไหว', value: 'mobility_joint' },
  { label: 'ระบบทางเดินหายใจ', value: 'respiratory' },
  { label: 'อื่นๆ', value: 'other' },
];

function buildAvatarPath(userId, uri) {
  const rawExt = typeof uri === 'string' ? uri.split('.').pop() : '';
  const ext = rawExt && rawExt.length <= 6 ? rawExt.toLowerCase() : 'jpg';
  return `${userId}/avatar-${Date.now()}.${ext}`;
}

async function uploadAvatarToStorage({ userId, uri }) {
  const avatarPath = buildAvatarPath(userId, uri);

  // In Expo/RN, we can fetch local file URIs and upload as Blob.
  const blob = await (await fetch(uri)).blob();

  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(avatarPath, blob, {
      upsert: true,
      contentType: blob.type || 'image/jpeg',
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
  return data?.publicUrl ?? null;
}

export default function SignupScreen() {
  const { signUp, refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [gender, setGender] = useState(null); // 'male' | 'female'
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [role, setRole] = useState(null); // 'elder' | 'caregiver'
  const [healthCategory, setHealthCategory] = useState('none');
  const [healthDropdownOpen, setHealthDropdownOpen] = useState(false);
  const [activityInterests, setActivityInterests] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const availableActivityCategories = useMemo(
    () => categories.filter((c) => c.value !== 'all'),
    []
  );

  const toggleActivityInterest = (value) => {
    setActivityInterests((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return Array.from(next);
    });
  };

  const onPickAvatar = async () => {
    try {
      // On iOS/Android, request permission. On web, it will fall back to file picker.
      if (Platform.OS !== 'web') {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('ต้องอนุญาตเข้าถึงรูปภาพ', 'กรุณาอนุญาตเพื่อเลือกภาพโปรไฟล์');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;
      const nextUri = result.assets?.[0]?.uri ?? null;
      if (nextUri) setAvatarUri(nextUri);
    } catch (err) {
      Alert.alert('เลือกรูปไม่สำเร็จ', err?.message ?? 'กรุณาลองใหม่อีกครั้ง');
    }
  };

  const onSignup = async () => {
    const trimmedEmail = email.trim();
    const trimmedProfileName = profileName.trim();

    if (!trimmedEmail || !password || !confirmPassword || !trimmedProfileName) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (!role) {
      Alert.alert('เลือกบทบาท', 'กรุณาเลือกบทบาทของคุณ');
      return;
    }

    if (!gender) {
      Alert.alert('เลือกเพศ', 'กรุณาเลือกเพศของคุณ');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('อีเมลไม่ถูกต้อง', 'กรุณากรอกอีเมลในรูปแบบที่ถูกต้อง');
      return;
    }

    if (password.length < 8) {
      Alert.alert('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณากรอกรหัสผ่านให้ตรงกันทั้งสองช่อง');
      return;
    }

    const healthToStore = role === 'elder' ? (healthCategory === 'none' ? null : healthCategory) : null;
    const interestsToStore = Array.isArray(activityInterests) ? activityInterests : [];

    setSubmitting(true);
    try {
      const { data } = await signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            profile_name: trimmedProfileName,
            gender,
            role,
            health_category: healthToStore,
            activity_interests: interestsToStore,
          },
        },
      });

      const userId = data?.user?.id ?? data?.session?.user?.id ?? null;

      // If signUp returns a session (no email-confirm required), we can immediately create the profile row.
      if (userId && data?.session) {
        let uploadedAvatarUrl = null;
        if (avatarUri) {
          setAvatarUploading(true);
          try {
            uploadedAvatarUrl = await uploadAvatarToStorage({ userId, uri: avatarUri });
          } finally {
            setAvatarUploading(false);
          }
        }

        const payload = {
          id: userId,
          email: trimmedEmail,
          profile_name: trimmedProfileName,
          display_name: trimmedProfileName,
          avatar_url: uploadedAvatarUrl,
          gender,
          role,
          health_category: healthToStore,
          activity_interests: interestsToStore,
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' });
        if (profileError) throw profileError;

        // Help RouteGuard pick up the role quickly.
        await refreshProfile();
      }

      // Depending on Supabase settings, user may need email confirmation.
      if (!data?.session) {
        Alert.alert(
          'สมัครสำเร็จ',
          'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ (ถ้าระบบเปิดยืนยันอีเมล)\n\nหมายเหตุ: รูปโปรไฟล์จะอัปโหลดได้หลังเข้าสู่ระบบแล้ว'
        );
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

        <Text style={[styles.label, { marginTop: 12 }]}>ยืนยันรหัสผ่าน</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="กรอกรหัสผ่านอีกครั้ง"
          placeholderTextColor={WarmClearTheme.colors.textMuted}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>ชื่อโปรไฟล์</Text>
        <TextInput
          value={profileName}
          onChangeText={setProfileName}
          placeholder="เช่น คุณสมชาย"
          placeholderTextColor={WarmClearTheme.colors.textMuted}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>เพศ</Text>
        <View accessibilityRole="radiogroup" style={styles.radioGroup}>
          <RadioOption
            label="ชาย"
            active={gender === 'male'}
            onPress={() => setGender('male')}
          />
          <RadioOption
            label="หญิง"
            active={gender === 'female'}
            onPress={() => setGender('female')}
          />
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>รูปโปรไฟล์ (ไม่บังคับ)</Text>
        <View style={styles.avatarRow}>
          <View style={styles.avatarPreviewRing}>
            <View style={styles.avatarPreviewCircle}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarPreviewImage}
                  accessibilityLabel="ตัวอย่างรูปโปรไฟล์"
                />
              ) : (
                <Text style={styles.avatarPreviewPlaceholder}>+</Text>
              )}
            </View>
          </View>

          <View style={styles.avatarActions}>
            <Pressable
              onPress={onPickAvatar}
              accessibilityRole="button"
              accessibilityLabel="เลือกรูปโปรไฟล์"
              style={styles.secondaryButtonInline}
              disabled={submitting || avatarUploading}
            >
              <Text style={styles.secondaryButtonInlineText}>
                {avatarUri ? 'เปลี่ยนรูป' : 'เลือกรูป'}
              </Text>
            </Pressable>

            {avatarUri ? (
              <Pressable
                onPress={() => setAvatarUri(null)}
                accessibilityRole="button"
                accessibilityLabel="ลบรูปที่เลือก"
                style={styles.ghostInline}
                disabled={submitting || avatarUploading}
              >
                <Text style={styles.ghostInlineText}>ลบรูป</Text>
              </Pressable>
            ) : null}

            <Text style={styles.helpText}>ข้ามได้ และอัปเดตภายหลัง</Text>
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>บทบาท</Text>
        <View accessibilityRole="radiogroup" style={styles.radioGroup}>
          <RadioOption
            label="ผู้สูงวัย"
            active={role === 'elder'}
            onPress={() => {
              setRole('elder');
            }}
          />
          <RadioOption
            label="ลูกหลาน"
            active={role === 'caregiver'}
            onPress={() => {
              setRole('caregiver');
              setHealthCategory('none');
              setHealthDropdownOpen(false);
            }}
          />
        </View>

        {role === 'elder' ? (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.label}>ประเภทอาการสุขภาพ (ไม่บังคับ)</Text>
            <Pressable
              onPress={() => setHealthDropdownOpen((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel="เลือกประเภทอาการสุขภาพ"
              style={styles.dropdownButton}
            >
              <Text style={styles.dropdownText}>
                {HEALTH_OPTIONS.find((o) => o.value === healthCategory)?.label ?? 'ไม่ระบุ'}
              </Text>
              <Text style={styles.dropdownChevron}>{healthDropdownOpen ? '▴' : '▾'}</Text>
            </Pressable>

            {healthDropdownOpen ? (
              <View style={styles.dropdownMenu}>
                {HEALTH_OPTIONS.map((opt) => {
                  const active = opt.value === healthCategory;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        setHealthCategory(opt.value);
                        setHealthDropdownOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={[styles.dropdownItem, active ? styles.dropdownItemActive : null]}
                    >
                      <Text style={[styles.dropdownItemText, active ? styles.dropdownItemTextActive : null]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}

        <Text style={[styles.label, { marginTop: 16 }]}>หมวดกิจกรรมที่สนใจ</Text>
        <Text style={styles.helpText}>เลือกได้หลายข้อ (ข้ามได้)</Text>
        <View style={styles.chipGrid}>
          {availableActivityCategories.map((c) => {
            const active = activityInterests.includes(c.value);
            return (
              <ChipButton
                key={c.id}
                label={c.label}
                active={active}
                onPress={() => toggleActivityInterest(c.value)}
                accessibilityLabel={`เลือกหมวด ${c.label}`}
              />
            );
          })}
        </View>

        <Pressable
          onPress={onSignup}
          disabled={submitting || avatarUploading}
          style={[styles.primaryButton, submitting && { opacity: 0.7 }]}
        >
          <Text style={styles.primaryButtonText}>
            {avatarUploading ? 'กำลังอัปโหลดรูป…' : submitting ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
          </Text>
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
  helpText: {
    marginTop: -4,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '800',
    color: WarmClearTheme.colors.textMuted,
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

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  avatarPreviewRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreviewCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: WarmClearTheme.colors.surface,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPreviewPlaceholder: {
    fontSize: 26,
    fontWeight: '900',
    color: WarmClearTheme.colors.textMuted,
    marginTop: -2,
  },
  avatarActions: {
    flex: 1,
    gap: 8,
  },
  secondaryButtonInline: {
    alignSelf: 'flex-start',
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.control,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.subtle,
  },
  secondaryButtonInlineText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  ghostInline: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  ghostInlineText: {
    fontSize: 13,
    fontWeight: '900',
    color: WarmClearTheme.colors.textMuted,
    textDecorationLine: 'underline',
  },

  radioGroup: {
    gap: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: WarmClearTheme.radii.control,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surface,
    ...WarmClearTheme.shadows.subtle,
  },
  radioRowActive: {
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    backgroundColor: WarmClearTheme.colors.primarySoft,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: WarmClearTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WarmClearTheme.colors.surface,
  },
  radioOuterActive: {
    borderColor: WarmClearTheme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: WarmClearTheme.colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },

  dropdownButton: {
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    borderRadius: WarmClearTheme.radii.control,
    backgroundColor: WarmClearTheme.colors.surfaceSoft,
    paddingHorizontal: 14,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  dropdownChevron: {
    fontSize: 16,
    fontWeight: '900',
    color: WarmClearTheme.colors.textMuted,
  },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    borderRadius: WarmClearTheme.radii.card,
    backgroundColor: WarmClearTheme.colors.surface,
    overflow: 'hidden',
    ...WarmClearTheme.shadows.card,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: WarmClearTheme.colors.border,
  },
  dropdownItemActive: {
    backgroundColor: WarmClearTheme.colors.primarySoft,
    borderTopColor: WarmClearTheme.colors.primarySoftBorder,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  dropdownItemTextActive: {
    color: WarmClearTheme.colors.primaryDark,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: WarmClearTheme.radii.chip,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    backgroundColor: WarmClearTheme.colors.surface,
  },
  chipActive: {
    borderColor: WarmClearTheme.colors.primarySoftBorder,
    backgroundColor: WarmClearTheme.colors.primarySoft,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
  },
  chipTextActive: {
    color: WarmClearTheme.colors.primaryDark,
  },
});