import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { useJournal } from '@/hooks/useJournal';

const { width } = Dimensions.get('window');

const moodColors = {
  happy: '#FFD700',
  sad: '#87CEEB',
  anxious: '#FFA07A',
  calm: '#98FB98',
  excited: '#FF69B4',
  stressed: '#DC143C',
  neutral: '#D3D3D3',
};

const moodEmojis = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  calm: '😌',
  excited: '🤩',
  stressed: '😤',
  neutral: '😐',
};

export default function JournalStatsScreen() {
  const { allEntries, stats } = useJournal();

  // Calculate mood distribution
  const moodDistribution = allEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEntries = allEntries.length;

  // Calculate entries per month for the last 6 months
  const monthlyEntries = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const count = allEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const entryMonthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
      return entryMonthKey === monthKey;
    }).length;

    return { month: monthName, count };
  }).reverse();

  const maxMonthlyCount = Math.max(...monthlyEntries.map(m => m.count), 1);

  // Calculate average words per entry
  const averageWords = totalEntries > 0 
    ? Math.round(allEntries.reduce((sum, entry) => sum + entry.content.split(' ').length, 0) / totalEntries)
    : 0;

  // Most used tags
  const tagCounts = allEntries.reduce((acc, entry) => {
    entry.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const renderMoodChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Mood Distribution</Text>
      <View style={styles.moodChart}>
        {Object.entries(moodDistribution).map(([mood, count]) => {
          const percentage = (count / totalEntries) * 100;
          const barWidth = (percentage / 100) * (width - 80);
          
          return (
            <View key={mood} style={styles.moodBar}>
              <View style={styles.moodInfo}>
                <Text style={styles.moodEmoji}>
                  {moodEmojis[mood as keyof typeof moodEmojis]}
                </Text>
                <Text style={styles.moodName}>{mood}</Text>
                <Text style={styles.moodCount}>({count})</Text>
              </View>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: barWidth,
                      backgroundColor: moodColors[mood as keyof typeof moodColors],
                    },
                  ]}
                />
                <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderMonthlyChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Monthly Activity</Text>
      <View style={styles.monthlyChart}>
        {monthlyEntries.map((month, index) => {
          const barHeight = (month.count / maxMonthlyCount) * 100;
          
          return (
            <View key={index} style={styles.monthColumn}>
              <View style={styles.monthBarContainer}>
                <View
                  style={[
                    styles.monthBar,
                    {
                      height: `${barHeight}%`,
                      backgroundColor: '#8B5CF6',
                    },
                  ]}
                />
              </View>
              <Text style={styles.monthLabel}>{month.month}</Text>
              <Text style={styles.monthCount}>{month.count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Journal Statistics',
          headerStyle: { backgroundColor: '#8B5CF6' },
          headerTintColor: '#FFFFFF',
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.overviewContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.entriesThisMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
        </View>

        {/* Additional Stats */}
        <View style={styles.additionalStats}>
          <View style={styles.additionalStatCard}>
            <Text style={styles.additionalStatNumber}>{averageWords}</Text>
            <Text style={styles.additionalStatLabel}>Average Words per Entry</Text>
          </View>
          <View style={styles.additionalStatCard}>
            <Text style={styles.additionalStatEmoji}>
              {moodEmojis[stats.mostUsedMood as keyof typeof moodEmojis]}
            </Text>
            <Text style={styles.additionalStatLabel}>Most Common Mood</Text>
          </View>
        </View>

        {/* Mood Distribution Chart */}
        {totalEntries > 0 && renderMoodChart()}

        {/* Monthly Activity Chart */}
        {totalEntries > 0 && renderMonthlyChart()}

        {/* Top Tags */}
        {topTags.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Most Used Tags</Text>
            <View style={styles.tagsContainer}>
              {topTags.map(([tag, count], index) => (
                <View key={tag} style={styles.tagItem}>
                  <View style={styles.tagRank}>
                    <Text style={styles.tagRankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.tagName}>#{tag}</Text>
                  <Text style={styles.tagCount}>{count} times</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {totalEntries === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptyDescription}>
              Start writing journal entries to see your statistics and insights.
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5FF',
  },
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  additionalStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  additionalStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  additionalStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  additionalStatEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  moodChart: {
    gap: 12,
  },
  moodBar: {
    gap: 8,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodName: {
    fontSize: 16,
    color: '#1F2937',
    textTransform: 'capitalize',
    flex: 1,
  },
  moodCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    height: 8,
    borderRadius: 4,
    minWidth: 4,
  },
  percentage: {
    fontSize: 12,
    color: '#6B7280',
    minWidth: 40,
  },
  monthlyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  monthColumn: {
    alignItems: 'center',
    flex: 1,
  },
  monthBarContainer: {
    height: 80,
    width: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  monthBar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  monthLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  monthCount: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  tagsContainer: {
    gap: 12,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tagRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tagName: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
    flex: 1,
  },
  tagCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});