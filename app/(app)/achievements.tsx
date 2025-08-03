import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { Trophy, Filter, Award } from 'lucide-react-native';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementCard from '@/components/AchievementCard';

type FilterType = 'all' | 'unlocked' | 'locked' | 'logging' | 'consistency' | 'exploration' | 'wellness';

export default function AchievementsScreen() {
  const { 
    achievements, 
    isAchievementUnlocked, 
    unlockedCount, 
    totalCount, 
    checkAchievements,
    isLoading 
  } = useAchievements();
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await checkAchievements();
    setRefreshing(false);
  };

  const filteredAchievements = achievements.filter(achievement => {
    switch (filter) {
      case 'unlocked':
        return isAchievementUnlocked(achievement.id);
      case 'locked':
        return !isAchievementUnlocked(achievement.id);
      case 'logging':
      case 'consistency':
      case 'exploration':
      case 'wellness':
        return achievement.category === filter;
      default:
        return true;
    }
  });

  const filterOptions: { key: FilterType; label: string; icon?: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unlocked', label: 'Unlocked' },
    { key: 'locked', label: 'Locked' },
    { key: 'logging', label: 'Logging' },
    { key: 'consistency', label: 'Consistency' },
    { key: 'exploration', label: 'Exploration' },
    { key: 'wellness', label: 'Wellness' },
  ];

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Achievements',
          headerRight: () => (
            <TouchableOpacity onPress={checkAchievements}>
              <Trophy size={24} color="#FF6B6B" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Award size={32} color="#27AE60" />
              <Text style={styles.statNumber}>{unlockedCount}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            <View style={styles.statItem}>
              <Trophy size={32} color="#FF6B6B" />
              <Text style={styles.statNumber}>{totalCount}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Progress: {unlockedCount}/{totalCount}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(unlockedCount / totalCount) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Filter size={20} color="#7F8C8D" />
            <Text style={styles.filterTitle}>Filter</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterButton,
                  filter === option.key && styles.activeFilterButton
                ]}
                onPress={() => setFilter(option.key)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === option.key && styles.activeFilterButtonText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>
            {filter === 'all' ? 'All Achievements' : 
             filter === 'unlocked' ? 'Unlocked Achievements' :
             filter === 'locked' ? 'Locked Achievements' :
             `${filter.charAt(0).toUpperCase() + filter.slice(1)} Achievements`}
          </Text>
          
          {filteredAchievements.length === 0 ? (
            <View style={styles.emptyState}>
              <Trophy size={48} color="#BDC3C7" />
              <Text style={styles.emptyStateText}>
                {filter === 'unlocked' 
                  ? 'No achievements unlocked yet. Keep going!'
                  : 'No achievements found for this filter.'
                }
              </Text>
            </View>
          ) : (
            filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={isAchievementUnlocked(achievement.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: 4,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  filterScroll: {
    paddingLeft: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterButton: {
    backgroundColor: '#FF6B6B',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});