import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import { 
  Activity, 
  Footprints, 
  MapPin, 
  Clock, 
  RefreshCw,
  Smartphone,
  Heart
} from 'lucide-react-native';
import { router } from 'expo-router';

import colors from '@/constants/colors';
import { useFitness } from '@/hooks/useFitness';

interface FitnessDashboardProps {
  showHeader?: boolean;
}

export function FitnessDashboard({ showHeader = true }: FitnessDashboardProps) {
  const {
    fitnessData,
    isLoading,
    isSyncing,
    lastSyncTime,
    todayProgress,
    syncTodayData,
    requestHealthKitPermission,
    requestGoogleFitPermission,
    formatDistance,
    formatSteps,
    canSync,
    getAvailableSources,
    hasAnyPermission
  } = useFitness();

  const handleSync = async () => {
    if (!canSync()) {
      // Show permission request
      const sources = getAvailableSources();
      if (sources.includes('healthkit') && Platform.OS === 'ios') {
        await requestHealthKitPermission();
      } else if (sources.includes('googlefit') && Platform.OS === 'android') {
        await requestGoogleFitPermission();
      } else {
        // Web - show both options
        if (sources.includes('healthkit')) {
          await requestHealthKitPermission();
        } else if (sources.includes('googlefit')) {
          await requestGoogleFitPermission();
        }
      }
    } else {
      await syncTodayData();
    }
  };

  const formatLastSync = (timestamp: string | null): string => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const syncTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - syncTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return colors.success;
    if (percentage >= 75) return colors.secondary;
    if (percentage >= 50) return colors.warning;
    return colors.primary;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading fitness data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Activity size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>Fitness & Activity</Text>
          </View>
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
            onPress={handleSync}
            disabled={isSyncing}
            testID="sync-button"
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <RefreshCw size={16} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {!hasAnyPermission() ? (
        <View style={styles.permissionContainer}>
          <Smartphone size={48} color={colors.gray[400]} />
          <Text style={styles.permissionTitle}>Connect Your Fitness Data</Text>
          <Text style={styles.permissionDescription}>
            Connect to {Platform.OS === 'ios' ? 'Apple HealthKit' : 'Google Fit'} to automatically track your daily activity
          </Text>
          
          <View style={styles.permissionButtons}>
            {getAvailableSources().map((source) => (
              <TouchableOpacity
                key={source}
                style={styles.permissionButton}
                onPress={source === 'healthkit' ? requestHealthKitPermission : requestGoogleFitPermission}
                testID={`connect-${source}`}
              >
                <Heart size={20} color={colors.white} />
                <Text style={styles.permissionButtonText}>
                  Connect {source === 'healthkit' ? 'HealthKit' : 'Google Fit'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <>
          {/* Progress Cards */}
          <View style={styles.progressGrid}>
            {/* Steps */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Footprints size={20} color={colors.primary} />
                <Text style={styles.progressLabel}>Steps</Text>
              </View>
              <Text style={styles.progressValue}>
                {formatSteps(todayProgress.steps.current)}
              </Text>
              <Text style={styles.progressGoal}>
                of {formatSteps(todayProgress.steps.goal)}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(todayProgress.steps.percentage, 100)}%`,
                      backgroundColor: getProgressColor(todayProgress.steps.percentage)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>
                {todayProgress.steps.percentage.toFixed(0)}%
              </Text>
            </View>

            {/* Distance */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <MapPin size={20} color={colors.secondary} />
                <Text style={styles.progressLabel}>Distance</Text>
              </View>
              <Text style={styles.progressValue}>
                {formatDistance(todayProgress.distance.current)}
              </Text>
              <Text style={styles.progressGoal}>
                of {formatDistance(todayProgress.distance.goal)}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(todayProgress.distance.percentage, 100)}%`,
                      backgroundColor: getProgressColor(todayProgress.distance.percentage)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>
                {todayProgress.distance.percentage.toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* Active Minutes */}
          <View style={styles.activeMinutesCard}>
            <View style={styles.progressHeader}>
              <Clock size={20} color={colors.warning} />
              <Text style={styles.progressLabel}>Active Minutes</Text>
            </View>
            <View style={styles.activeMinutesContent}>
              <Text style={styles.progressValue}>
                {todayProgress.activeMinutes.current}
              </Text>
              <Text style={styles.progressGoal}>
                of {todayProgress.activeMinutes.goal} minutes
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(todayProgress.activeMinutes.percentage, 100)}%`,
                    backgroundColor: getProgressColor(todayProgress.activeMinutes.percentage)
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressPercentage}>
              {todayProgress.activeMinutes.percentage.toFixed(0)}%
            </Text>
          </View>

          {/* Sync Status */}
          <View style={styles.syncStatus}>
            <Text style={styles.syncStatusText}>
              Last sync: {formatLastSync(lastSyncTime)}
            </Text>
            <Text style={styles.syncStatusSource}>
              Source: {fitnessData?.source === 'healthkit' ? 'Apple HealthKit' : 
                      fitnessData?.source === 'googlefit' ? 'Google Fit' : 'Manual'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(app)/fitness-settings')}
              testID="fitness-settings-button"
            >
              <Text style={styles.actionButtonText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(app)/fitness-history')}
              testID="fitness-history-button"
            >
              <Text style={styles.actionButtonText}>View History</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  syncButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  permissionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  permissionButtons: {
    gap: 12,
    width: '100%',
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  progressCard: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 2,
  },
  progressGoal: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPercentage: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray[600],
    textAlign: 'right',
  },
  activeMinutesCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  activeMinutesContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  syncStatus: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginBottom: 16,
  },
  syncStatusText: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 2,
  },
  syncStatusSource: {
    fontSize: 11,
    color: colors.gray[500],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});