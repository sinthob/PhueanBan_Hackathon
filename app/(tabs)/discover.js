import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';

import ActivityCard from '../../components/ActivityCard';
import { activities, categories } from '../../data/mockData';

export default function DiscoverScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredActivities = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return activities.filter((activity) => {
      const matchesCategory =
        selectedCategory === 'all' || activity.category === selectedCategory;
      if (!query) {
        return matchesCategory;
      }
      const inTitle = activity.title.toLowerCase().includes(query);
      const inDescription = activity.description.toLowerCase().includes(query);
      const inTags = activity.tags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && (inTitle || inDescription || inTags);
    });
  }, [searchText, selectedCategory]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>ค้นหากิจกรรม</Text>
        <Text style={styles.subtitle}>กิจกรรมใกล้คุณและตรงกับความสนใจ</Text>
      </View>

      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="ค้นหากิจกรรม หรือคำที่สนใจ"
        placeholderTextColor="#9ca3af"
        style={styles.searchInput}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((category) => {
          const isActive = category.value === selectedCategory;
          return (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategory(category.value)}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
            >
              <Text
                style={[styles.categoryText, isActive && styles.categoryTextActive]}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filteredActivities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} onJoin={() => {}} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#6b7280',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  categoryRow: {
    paddingBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
});
