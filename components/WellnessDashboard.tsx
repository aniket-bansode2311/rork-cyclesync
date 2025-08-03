import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Droplets, Activity, Target, TrendingUp } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useWellness } from '@/hooks/useWellness';

interface WellnessDashboardProps {
  onWaterPress: () => void;
  onActivityPress: () => void;
}

export function WellnessDashboard({ onWaterPress, onActivityPress }: WellnessDashboardProps) {
  const { todaySummary, settings, getProgress } = useWellness();
  const progress = getProgress();

  const formatWaterUnit = (unit: string) => {
    switch (unit) {
      case 'glasses':
        return 'glasses';
      case 'ounces':
        return 'oz';
      case 'milliliters':
        return 'ml';
      default:
        return unit;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TrendingUp size={20} color={colors.primary} />
        <Text style={styles.title}>Today&apos;s Wellness</Text>
      </View>

      <View style={styles.statsContainer}>
        {/* Water Intake */}
        <TouchableOpacity style={styles.statCard} onPress={onWaterPress} testID="water-card">
          <View style={styles.statHeader}>
            <Droplets size={24} color={colors.tertiary} />
            <Text style={styles.statTitle}>Water</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress.water}%`,
                    backgroundColor: colors.tertiary 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progress.water.toFixed(0)}%
            </Text>
          </View>
          
          <View style={styles.statDetails}>
            <Text style={styles.statValue}>
              {todaySummary.totalWater} / {settings.waterGoal}
            </Text>
            <Text style={styles.statUnit}>
              {formatWaterUnit(settings.waterUnit)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Activity */}
        <TouchableOpacity style={styles.statCard} onPress={onActivityPress} testID="activity-card">
          <View style={styles.statHeader}>
            <Activity size={24} color={colors.secondary} />
            <Text style={styles.statTitle}>Activity</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress.activity}%`,
                    backgroundColor: colors.secondary 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progress.activity.toFixed(0)}%
            </Text>
          </View>
          
          <View style={styles.statDetails}>
            <Text style={styles.statValue}>
              {todaySummary.totalActivityDuration} / {settings.activityGoal}
            </Text>
            <Text style={styles.statUnit}>minutes</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Target size={16} color={colors.gray[600]} />
          <Text style={styles.quickStatText}>
            {todaySummary.waterIntakes.length} water logs
          </Text>
        </View>
        <View style={styles.quickStat}>
          <Target size={16} color={colors.gray[600]} />
          <Text style={styles.quickStatText}>
            {todaySummary.totalActivities} activities
          </Text>
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
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    minWidth: 35,
    textAlign: 'right',
  },
  statDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  statUnit: {
    fontSize: 12,
    color: colors.gray[600],
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickStatText: {
    fontSize: 12,
    color: colors.gray[600],
  },
});