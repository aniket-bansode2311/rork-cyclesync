import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import colors from '@/constants/colors';
import { usePeriods } from '@/hooks/usePeriods';
import { getPredictedOvulationDate } from '@/utils/periodCalculations';

export function OvulationCountdownWidget() {
  const { periods } = usePeriods();

  const getDaysUntilOvulation = () => {
    const ovulationDate = getPredictedOvulationDate(periods);
    if (!ovulationDate) return null;
    
    const today = new Date();
    const ovulation = new Date(ovulationDate);
    const diffTime = ovulation.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntil = getDaysUntilOvulation();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Heart size={24} color={colors.secondary} />
      </View>
      <View style={styles.content}>
        {daysUntil !== null ? (
          <>
            <Text style={styles.daysText}>{daysUntil}</Text>
            <Text style={styles.labelText}>
              {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'day to ovulation' : 'days to ovulation'}
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
    color: colors.secondary,
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