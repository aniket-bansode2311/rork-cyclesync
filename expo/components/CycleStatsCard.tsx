import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, TrendingUp, Clock } from 'lucide-react-native';
import colors from '@/constants/colors';
import { CycleStats } from '@/types/period';
import { getDaysUntilNextPeriod, formatDate } from '@/utils/periodCalculations';

interface CycleStatsCardProps {
  stats: CycleStats;
}

export function CycleStatsCard({ stats }: CycleStatsCardProps) {
  const daysUntilNext = stats.nextPredictedPeriod 
    ? getDaysUntilNextPeriod(stats.nextPredictedPeriod)
    : null;

  const getNextPeriodMessage = () => {
    if (!stats.nextPredictedPeriod || !daysUntilNext) {
      return 'Log more periods for predictions';
    }

    if (daysUntilNext < 0) {
      return 'Period may be overdue';
    } else if (daysUntilNext === 0) {
      return 'Period expected today';
    } else if (daysUntilNext === 1) {
      return 'Period expected tomorrow';
    } else {
      return `Period expected in ${daysUntilNext} days`;
    }
  };

  const getNextPeriodColor = () => {
    if (!daysUntilNext) return colors.gray[600];
    if (daysUntilNext < 0) return colors.error;
    if (daysUntilNext <= 3) return colors.warning;
    return colors.primary;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cycle Overview</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <TrendingUp size={20} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{stats.averageCycleLength}</Text>
          <Text style={styles.statLabel}>Avg Cycle Length</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Calendar size={20} color={colors.secondary} />
          </View>
          <Text style={styles.statValue}>{stats.totalPeriods}</Text>
          <Text style={styles.statLabel}>Periods Logged</Text>
        </View>
      </View>

      {stats.nextPredictedPeriod && (
        <View style={styles.predictionCard}>
          <View style={styles.predictionHeader}>
            <Clock size={20} color={getNextPeriodColor()} />
            <Text style={[styles.predictionTitle, { color: getNextPeriodColor() }]}>
              Next Period Prediction
            </Text>
          </View>
          
          <Text style={styles.predictionDate}>
            {formatDate(stats.nextPredictedPeriod)}
          </Text>
          
          <Text style={[styles.predictionMessage, { color: getNextPeriodColor() }]}>
            {getNextPeriodMessage()}
          </Text>
        </View>
      )}

      {stats.totalPeriods === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Start logging your periods to see cycle statistics and predictions.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 16,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
    fontWeight: '500',
  },
  predictionCard: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  predictionDate: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  predictionMessage: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
});