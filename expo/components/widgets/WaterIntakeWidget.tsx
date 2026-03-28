import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Droplets } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useWellness } from '@/hooks/useWellness';

export function WaterIntakeWidget() {
  const { todaySummary, settings, getProgress } = useWellness();
  const progress = getProgress();

  const getProgressColor = () => {
    if (progress.water >= 100) return colors.success;
    if (progress.water >= 50) return colors.warning;
    return colors.primary;
  };

  const getProgressText = () => {
    const percentage = Math.round(progress.water);
    if (percentage >= 100) return 'Goal achieved!';
    return `${percentage}% of goal`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Droplets size={20} color={colors.primary} />
        <Text style={styles.titleText}>Water Intake</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(progress.water, 100)}%`,
                backgroundColor: getProgressColor()
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{getProgressText()}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.currentText}>
          {todaySummary.totalWater} / {settings.waterGoal} {settings.waterUnit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  statsContainer: {
    alignItems: 'center',
  },
  currentText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
});