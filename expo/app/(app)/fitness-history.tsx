import { Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { 
  TrendingUp, 
  Calendar, 
  Footprints, 
  MapPin, 
  Clock,
  Award,
  BarChart3
} from 'lucide-react-native';

import colors from '@/constants/colors';
import { useFitness } from '@/hooks/useFitness';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 80;
const CHART_HEIGHT = 200;

export default function FitnessHistoryScreen() {
  const {
    weeklyData,
    weeklySummary,
    loadWeeklyData,
    formatDistance,
    formatSteps,
    settings
  } = useFitness();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await loadWeeklyData();
    } catch (error) {
      console.error('Error loading fitness history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxValue = (data: number[]): number => {
    return Math.max(...data, 1);
  };

  const renderBarChart = (data: number[], color: string, maxValue: number) => {
    const barWidth = (CHART_WIDTH - 60) / data.length;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.map((value, index) => {
            const height = (value / maxValue) * (CHART_HEIGHT - 40);
            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(height, 2),
                      backgroundColor: color,
                      width: barWidth - 4
                    }
                  ]}
                />
                <Text style={styles.barLabel}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getWeeklySteps = (): number[] => {
    const steps = new Array(7).fill(0);
    weeklyData.forEach((day, index) => {
      if (index < 7) {
        steps[index] = day.steps;
      }
    });
    return steps;
  };

  const getWeeklyDistance = (): number[] => {
    const distance = new Array(7).fill(0);
    weeklyData.forEach((day, index) => {
      if (index < 7) {
        distance[index] = day.distance;
      }
    });
    return distance;
  };

  const getWeeklyActiveMinutes = (): number[] => {
    const activeMinutes = new Array(7).fill(0);
    weeklyData.forEach((day, index) => {
      if (index < 7) {
        activeMinutes[index] = day.activeMinutes || 0;
      }
    });
    return activeMinutes;
  };

  const weeklySteps = getWeeklySteps();
  const weeklyDistance = getWeeklyDistance();
  const weeklyActiveMinutes = getWeeklyActiveMinutes();

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Fitness History',
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTintColor: colors.black,
          }}
        />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading fitness history...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Fitness History',
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'week' && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod('week')}
              testID="week-period-button"
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'week' && styles.periodButtonTextActive
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'month' && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod('month')}
              testID="month-period-button"
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'month' && styles.periodButtonTextActive
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Summary */}
          <View style={styles.summarySection}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Weekly Summary</Text>
            </View>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Footprints size={24} color={colors.primary} />
                <Text style={styles.summaryValue}>
                  {formatSteps(weeklySummary.totalSteps)}
                </Text>
                <Text style={styles.summaryLabel}>Total Steps</Text>
                <Text style={styles.summaryAverage}>
                  Avg: {formatSteps(weeklySummary.averageSteps)}/day
                </Text>
              </View>
              
              <View style={styles.summaryCard}>
                <MapPin size={24} color={colors.secondary} />
                <Text style={styles.summaryValue}>
                  {formatDistance(weeklySummary.totalDistance)}
                </Text>
                <Text style={styles.summaryLabel}>Total Distance</Text>
                <Text style={styles.summaryAverage}>
                  Avg: {formatDistance(weeklySummary.averageDistance)}/day
                </Text>
              </View>
              
              <View style={styles.summaryCard}>
                <Clock size={24} color={colors.warning} />
                <Text style={styles.summaryValue}>
                  {weeklySummary.totalActiveMinutes}m
                </Text>
                <Text style={styles.summaryLabel}>Active Minutes</Text>
                <Text style={styles.summaryAverage}>
                  Avg: {weeklySummary.averageActiveMinutes}m/day
                </Text>
              </View>
            </View>
          </View>

          {/* Goal Achievements */}
          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
              <Award size={20} color={colors.success} />
              <Text style={styles.sectionTitle}>Goal Achievements</Text>
            </View>
            
            <View style={styles.achievementsList}>
              <View style={styles.achievementItem}>
                <View style={styles.achievementInfo}>
                  <Footprints size={16} color={colors.primary} />
                  <Text style={styles.achievementLabel}>Steps Goal</Text>
                </View>
                <Text style={styles.achievementValue}>
                  {weeklySummary.goalAchievements.steps}/7 days
                </Text>
              </View>
              
              <View style={styles.achievementItem}>
                <View style={styles.achievementInfo}>
                  <MapPin size={16} color={colors.secondary} />
                  <Text style={styles.achievementLabel}>Distance Goal</Text>
                </View>
                <Text style={styles.achievementValue}>
                  {weeklySummary.goalAchievements.distance}/7 days
                </Text>
              </View>
              
              <View style={styles.achievementItem}>
                <View style={styles.achievementInfo}>
                  <Clock size={16} color={colors.warning} />
                  <Text style={styles.achievementLabel}>Active Minutes Goal</Text>
                </View>
                <Text style={styles.achievementValue}>
                  {weeklySummary.goalAchievements.activeMinutes}/7 days
                </Text>
              </View>
            </View>
          </View>

          {/* Steps Chart */}
          <View style={styles.chartSection}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Daily Steps</Text>
            </View>
            {renderBarChart(weeklySteps, colors.primary, getMaxValue(weeklySteps))}
          </View>

          {/* Distance Chart */}
          <View style={styles.chartSection}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={20} color={colors.secondary} />
              <Text style={styles.sectionTitle}>Daily Distance</Text>
            </View>
            {renderBarChart(weeklyDistance, colors.secondary, getMaxValue(weeklyDistance))}
          </View>

          {/* Active Minutes Chart */}
          <View style={styles.chartSection}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={20} color={colors.warning} />
              <Text style={styles.sectionTitle}>Daily Active Minutes</Text>
            </View>
            {renderBarChart(weeklyActiveMinutes, colors.warning, getMaxValue(weeklyActiveMinutes))}
          </View>

          {/* Daily Breakdown */}
          <View style={styles.dailySection}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={colors.gray[600]} />
              <Text style={styles.sectionTitle}>Daily Breakdown</Text>
            </View>
            
            {weeklyData.length === 0 ? (
              <View style={styles.emptyState}>
                <BarChart3 size={48} color={colors.gray[400]} />
                <Text style={styles.emptyStateText}>No fitness data available</Text>
                <Text style={styles.emptyStateSubtext}>
                  Connect your fitness tracker to see your activity history
                </Text>
              </View>
            ) : (
              <View style={styles.dailyList}>
                {weeklyData.map((day) => (
                  <View key={day.id} style={styles.dailyItem}>
                    <View style={styles.dailyDate}>
                      <Text style={styles.dailyDateText}>
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </View>
                    <View style={styles.dailyStats}>
                      <View style={styles.dailyStat}>
                        <Footprints size={14} color={colors.primary} />
                        <Text style={styles.dailyStatValue}>
                          {formatSteps(day.steps)}
                        </Text>
                      </View>
                      <View style={styles.dailyStat}>
                        <MapPin size={14} color={colors.secondary} />
                        <Text style={styles.dailyStatValue}>
                          {formatDistance(day.distance)}
                        </Text>
                      </View>
                      <View style={styles.dailyStat}>
                        <Clock size={14} color={colors.warning} />
                        <Text style={styles.dailyStatValue}>
                          {day.activeMinutes || 0}m
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  summarySection: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 4,
  },
  summaryAverage: {
    fontSize: 10,
    color: colors.gray[500],
    textAlign: 'center',
  },
  achievementsSection: {
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
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  achievementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achievementLabel: {
    fontSize: 14,
    color: colors.black,
  },
  achievementValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  chartSection: {
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
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    width: CHART_WIDTH,
    paddingBottom: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 2,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: colors.gray[500],
    textAlign: 'center',
  },
  dailySection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[600],
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  dailyList: {
    gap: 12,
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  dailyDate: {
    minWidth: 80,
  },
  dailyDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
  },
  dailyStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dailyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dailyStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
});