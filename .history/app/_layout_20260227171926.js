import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '../providers/AuthProvider';

function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { initialized, session, profile, profileLoading } = useAuth();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
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
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/role');
      }
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
      <RouteGuard />
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="caregiver" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
