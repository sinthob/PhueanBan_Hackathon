/**
 * caregiver/_layout.js
 */
import React from 'react';
import { Stack } from 'expo-router';

export default function CaregiverLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}