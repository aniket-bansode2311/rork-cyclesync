import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Smile, Meh, Frown } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSymptoms } from '@/hooks/useSymptoms';

export function MoodTrendWidget() {
  const { loggedMoods } = useSymptoms();

  const getRecentMoods = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return loggedMoods
      .filter(mood => new Date(mood.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
  };

  const getMoodIcon = (mood: string) => {
    const moodLower = mood.toLowerCase();
    if (moodLower.includes('happy') || moodLower.includes('excited') || moodLower.includes('energetic')) {
      return <Smile size={16} color={colors.success} />;
    } else if (moodLower.includes('sad') || moodLower.includes('anxious') || moodLower.includes('irritable')) {
      return <Frown size={16} color={colors.error} />;
    } else {
      return <Meh size={16} color={colors.warning} />;
    }
  };

  const getAverageMoodTrend = () => {
    const recentMoods = getRecentMoods();
    if (recentMoods.length === 0) return null;

    const moodScores = recentMoods.map(mood => {
      const moodLower = mood.mood.toLowerCase();
      if (moodLower.includes('happy') || moodLower.includes('excited') || moodLower.includes('energetic')) {
        return 3; // Positive
      } else if (moodLower.includes('sad') || moodLower.includes('anxious') || moodLower.includes('irritable')) {
        return 1; // Negative
      } else {
        return 2; // Neutral
      }
    });

    const average = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
    
    if (average >= 2.5) return 'positive';
    if (average <= 1.5) return 'negative';
    return 'neutral';
  };

  const recentMoods = getRecentMoods();
  const trend = getAverageMoodTrend();

  const getTrendText = () => {
    if (!trend) return 'No mood data';
    
    switch (trend) {
      case 'positive':
        return 'Trending positive';
      case 'negative':
        return 'Needs attention';
      case 'neutral':
        return 'Stable mood';
      default:
        return 'No mood data';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'positive':
        return colors.success;
      case 'negative':
        return colors.error;
      case 'neutral':
        return colors.warning;
      default:
        return colors.gray[600];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.trendText, { color: getTrendColor() }]}>
          {getTrendText()}
        </Text>
      </View>
      
      {recentMoods.length > 0 ? (
        <View style={styles.moodsList}>
          {recentMoods.slice(0, 3).map((mood, index) => (
            <View key={mood.id} style={styles.moodItem}>
              {getMoodIcon(mood.mood)}
              <Text style={styles.moodText}>{mood.mood}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>
          Start logging your daily mood to see trends
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 12,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  moodsList: {
    gap: 8,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodText: {
    fontSize: 14,
    color: colors.gray[700],
    flex: 1,
  },
  noDataText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});