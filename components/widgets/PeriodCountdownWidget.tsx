import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import colors from '@/constants/colors';
import { usePeriods } from '@/hooks/usePeriods';

export function PeriodCountdownWidget() {
  const { cycleStats } = usePeriods();

  const getDaysUntilPeriod = () => {
    if (!cycleStats.nextPredictedPeriod) return null;
    
    const today = new Date();
    const nextPeriod = new Date(cycleStats.nextPredictedPeriod);
    const diffTime = nextPeriod.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntil = getDaysUntilPeriod();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Calendar size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        {daysUntil !== null ? (
          <>
            <Text style={styles.daysText}>{daysUntil}</Text>
            <Text style={styles.labelText}>
              {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'day left' : 'days left'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.noDataText}>--</Text>
            <Text style={styles.labelText}>Log periods to predict</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  content: {
    alignItems: 'center',
  },
  daysText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  noDataText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.gray[400],
    marginBottom: 4,
  },
  labelText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
});