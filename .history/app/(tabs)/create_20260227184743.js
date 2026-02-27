import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { WarmClearTheme } from '../../theme';

export default function CreateActivityScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>สร้างกิจกรรม</Text>
        <Text style={styles.subtitle}>สร้างกิจกรรมใหม่ให้เพื่อนๆ เข้าร่วม</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>กำลังพัฒนา</Text>
        <Text style={styles.cardBody}>
          หน้านี้เป็นตัวอย่างเพื่อรองรับปุ่ม “สร้างกิจกรรม” ในแถบด้านล่าง
          (ยังไม่ได้ทำฟอร์มสร้างกิจกรรมจริง)
        </Text>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '700',
    lineHeight: 24,
  },
  card: {
    backgroundColor: WarmClearTheme.colors.surface,
    borderRadius: WarmClearTheme.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: WarmClearTheme.colors.border,
    ...WarmClearTheme.shadows.card,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: WarmClearTheme.colors.text,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 16,
    color: WarmClearTheme.colors.textSub,
    fontWeight: '700',
    lineHeight: 22,
  },
});
