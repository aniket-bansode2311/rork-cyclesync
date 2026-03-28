import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendingUp, Activity, Smile } from 'lucide-react-native';

import colors from '@/constants/colors';
import { useSymptoms } from '@/hooks/useSymptoms';
import { usePeriods } from '@/hooks/usePeriods';
import { MoodType } from '@/types/symptoms';

const MOOD_EMOJIS: Record<MoodType, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  energetic: '⚡',
  irritable: '😤',
  calm: '😌',
  stressed: '😫',
  excited: '🤩',
};

export function CycleCorrelationCard() {
  const { loggedSymptoms, loggedMoods } = useSymptoms();
  const { periods } = usePeriods();

  // Get recent data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSymptoms = loggedSymptoms.filter(
    symptom => new Date(symptom.date) >= thirtyDaysAgo
  );

  const recentMoods = loggedMoods.filter(
    mood => new Date(mood.date) >= thirtyDaysAgo
  );

  // Get most common symptoms
  const symptomCounts: { [key: string]: number } = {};
  recentSymptoms.forEach(symptom => {
    symptomCounts[symptom.symptomName] = (symptomCounts[symptom.symptomName] || 0) + 1;
  });

  const topSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Get most common moods
  const moodCounts: { [key: string]: number } = {};
  recentMoods.forEach(mood => {
    moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
  });

  const topMoods = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([mood, count]) => ({ mood: mood as MoodType, count }));

  // Calculate cycle phase correlations
  const getCyclePhaseForDate = (date: string) => {
    const targetDate = new Date(date);
    
    const relevantPeriods = periods
      .filter(p => new Date(p.startDate) <= targetDate)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    if (relevantPeriods.length === 0) return null;
    
    const lastPeriod = relevantPeriods[0];
    const periodStart = new Date(lastPeriod.startDate);
    const daysSincePeriod = Math.floor((targetDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSincePeriod <= 5) return 'menstrual';
    if (daysSincePeriod <= 13) return 'follicular';
    if (daysSincePeriod <= 16) return 'ovulation';
    return 'luteal';
  };

  // Analyze symptoms by cycle phase
  const phaseSymptoms: { [phase: string]: string[] } = {
    menstrual: [],
    follicular: [],
    ovulation: [],
    luteal: [],
  };

  recentSymptoms.forEach(symptom => {
    const phase = getCyclePhaseForDate(symptom.date);
    if (phase && phaseSymptoms[phase]) {
      phaseSymptoms[phase].push(symptom.symptomName);
    }
  });

  const getPhaseInsight = () => {
    const phases = Object.entries(phaseSymptoms);
    const mostActivePhase = phases.reduce((max, [phase, symptoms]) => 
      symptoms.length > max.symptoms.length ? { phase, symptoms } : max
    , { phase: '', symptoms: [] as string[] });

    if (mostActivePhase.symptoms.length === 0) {
      return "No recent symptom patterns detected";
    }

    const phaseNames = {
      menstrual: 'menstrual phase',
      follicular: 'follicular phase',
      ovulation: 'ovulation',
      luteal: 'luteal phase',
    };

    return `Most symptoms occur during ${phaseNames[mostActivePhase.phase as keyof typeof phaseNames]}`;
  };

  if (recentSymptoms.length === 0 && recentMoods.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TrendingUp size={20} color={colors.primary} />
          <Text style={styles.title}>Cycle Insights</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Start logging symptoms and moods to see patterns with your cycle
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TrendingUp size={20} color={colors.primary} />
        <Text style={styles.title}>Cycle Insights</Text>
        <Text style={styles.subtitle}>Last 30 days</Text>
      </View>

      <View style={styles.content}>
        {/* Phase Insight */}
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>{getPhaseInsight()}</Text>
        </View>

        <View style={styles.statsRow}>
          {/* Top Symptoms */}
          {topSymptoms.length > 0 && (
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Activity size={16} color={colors.primary} />
                <Text style={styles.statTitle}>Top Symptoms</Text>
              </View>
              {topSymptoms.map(({ name, count }) => (
                <View key={name} style={styles.statItem}>
                  <Text style={styles.statName}>{name}</Text>
                  <Text style={styles.statCount}>{count}x</Text>
                </View>
              ))}
            </View>
          )}

          {/* Top Moods */}
          {topMoods.length > 0 && (
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Smile size={16} color={colors.primary} />
                <Text style={styles.statTitle}>Common Moods</Text>
              </View>
              {topMoods.map(({ mood, count }) => (
                <View key={mood} style={styles.statItem}>
                  <View style={styles.moodItem}>
                    <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood]}</Text>
                    <Text style={styles.statName}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.statCount}>{count}x</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray[500],
  },
  content: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  insightText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  moodEmoji: {
    fontSize: 14,
  },
  statName: {
    fontSize: 12,
    color: colors.gray[700],
    flex: 1,
  },
  statCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
});