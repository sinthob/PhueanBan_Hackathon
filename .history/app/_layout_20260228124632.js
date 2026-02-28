/**
 * app/_layout.js  (Root Layout)
 *
 * แก้ import จาก providers/AuthProvider + providers/LonelinessProvider
 * → providers/providers (ไฟล์รวม)
 */

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth, LonelinessProvider } from '../providers/providers';

function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { initialized, session, user, profile, profileLoading } = useAuth();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabs = segments[0] === '(tabs)';
    const inCaregiver = segments[0] === 'caregiver';

    const isSignedIn = Boolean(session);

    if (!isSignedIn) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (profileLoading) return;

    const role = profile?.role ?? null;
    if (!role) {
      // Signup now collects role. If an older user logs in without a profiles row,
      // avoid a separate onboarding screen; use user_metadata.role when available.
      const metaRole = user?.user_metadata?.role ?? null;
      if (metaRole === 'caregiver') {
        if (!inCaregiver) router.replace('/caregiver');
        return;
      }
      if (!inTabs) router.replace('/(tabs)');
      return;
    }

    if (role === 'caregiver') {
      if (!inCaregiver) {
        router.replace('/caregiver');
      }
      return;
    }

    if (role === 'elder') {
      if (!inTabs) {
        router.replace('/(tabs)');
      }
    }
  }, [initialized, session, profile?.role, profileLoading, segments, router]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LonelinessProvider>
        <RouteGuard />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="caregiver" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </LonelinessProvider>
    </AuthProvider>
  );
}