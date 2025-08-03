import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import { 
  Thermometer, 
  Calendar, 
  Plus, 
  TrendingUp, 
  BookOpen, 
  Settings,
  Activity,
  Clock,
  Heart
} from "lucide-react-native";

import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { useMenopause } from "@/hooks/useMenopause";
import { EDUCATIONAL_CONTENT } from "@/types/menopause";

export default function MenopauseScreen() {
  const router = useRouter();
  const { 
    menopauseMode, 
    menopauseStats, 
    activateMenopauseMode, 
    deactivateMenopauseMode,
    getRecentSymptoms,
    getRecentIrregularPeriods,
    isLoading 
  } = useMenopause();
  
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleActivateMode = () => {
    Alert.alert(
      "Activate Menopause Mode",
      "Which stage best describes your current situation?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Perimenopause",
          onPress: () => activateMenopauseMode('perimenopause')
        },
        {
          text: "Menopause",
          onPress: () => activateMenopauseMode('menopause')
        },
        {
          text: "Postmenopause",
          onPress: () => activateMenopauseMode('postmenopause')
        }
      ]
    );
  };

  const handleDeactivateMode = () => {
    Alert.alert(
      "Deactivate Menopause Mode",
      "Are you sure you want to deactivate Menopause Mode? Your data will be preserved.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: deactivateMenopauseMode
        }
      ]
    );
  };

  const recentSymptoms = getRecentSymptoms().slice(0, 3);
  const recentPeriods = getRecentIrregularPeriods().slice(0, 3);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'perimenopause': return '#FF6B6B';
      case 'menopause': return '#4ECDC4';
      case 'postmenopause': return '#45B7D1';
      default: return colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Menopause Mode",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.content}>
            {/* Mode Status */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusIndicator, { 
                  backgroundColor: menopauseMode.isActive ? getStageColor(menopauseMode.stage) : colors.gray[300] 
                }]} />
                <Text style={styles.statusTitle}>
                  {menopauseMode.isActive ? `${menopauseMode.stage.charAt(0).toUpperCase() + menopauseMode.stage.slice(1)} Mode` : 'Menopause Mode Inactive'}
                </Text>
              </View>
              
              {menopauseMode.isActive && (
                <View style={styles.statusDetails}>
                  <Text style={styles.statusSubtitle}>
                    Activated on {new Date(menopauseMode.activatedAt).toLocaleDateString()}
                  </Text>
                  {menopauseMode.lastPeriodDate && (
                    <Text style={styles.statusSubtitle}>
                      Last period: {new Date(menopauseMode.lastPeriodDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}

              <Button
                title={menopauseMode.isActive ? "Deactivate Mode" : "Activate Mode"}
                variant={menopauseMode.isActive ? "outline" : "primary"}
                onPress={menopauseMode.isActive ? handleDeactivateMode : handleActivateMode}
                style={styles.modeButton}
                testID={menopauseMode.isActive ? "deactivate-mode-button" : "activate-mode-button"}
              />
            </View>

            {menopauseMode.isActive && (
              <>
                {/* Stats Overview */}
                <View style={styles.statsContainer}>
                  <Text style={styles.sectionTitle}>Overview</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Activity size={24} color={colors.primary} />
                      <Text style={styles.statNumber}>{menopauseStats.totalSymptoms}</Text>
                      <Text style={styles.statLabel}>Symptoms Logged</Text>
                    </View>
                    
                    <View style={styles.statCard}>
                      <Calendar size={24} color={colors.primary} />
                      <Text style={styles.statNumber}>{menopauseStats.irregularPeriodsCount}</Text>
                      <Text style={styles.statLabel}>Period Entries</Text>
                    </View>
                    
                    {menopauseStats.daysSinceLastPeriod && (
                      <View style={styles.statCard}>
                        <Clock size={24} color={colors.primary} />
                        <Text style={styles.statNumber}>{menopauseStats.daysSinceLastPeriod}</Text>
                        <Text style={styles.statLabel}>Days Since Last Period</Text>
                      </View>
                    )}
                    
                    {menopauseStats.mostCommonSymptom && (
                      <View style={[styles.statCard, styles.fullWidthStat]}>
                        <TrendingUp size={24} color={colors.primary} />
                        <Text style={styles.statLabel}>Most Common Symptom</Text>
                        <Text style={styles.statHighlight}>{menopauseStats.mostCommonSymptom}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsContainer}>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                  <View style={styles.actionButtons}>
                    <Button
                      title="Log Symptoms"
                      variant="outline"
                      onPress={() => router.push('/(app)/menopause-symptoms')}
                      leftIcon={<Plus size={18} color={colors.primary} />}
                      style={styles.actionButton}
                      testID="log-symptoms-button"
                    />
                    <Button
                      title="Track Period"
                      variant="outline"
                      onPress={() => router.push('/(app)/irregular-periods')}
                      leftIcon={<Calendar size={18} color={colors.primary} />}
                      style={styles.actionButton}
                      testID="track-period-button"
                    />
                  </View>
                  <View style={styles.actionButtons}>
                    <Button
                      title="View History"
                      variant="outline"
                      onPress={() => router.push('/(app)/menopause-history')}
                      leftIcon={<TrendingUp size={18} color={colors.primary} />}
                      style={styles.actionButton}
                      testID="view-history-button"
                    />
                    <Button
                      title="Education"
                      variant="outline"
                      onPress={() => router.push('/(app)/menopause-education')}
                      leftIcon={<BookOpen size={18} color={colors.primary} />}
                      style={styles.actionButton}
                      testID="education-button"
                    />
                  </View>
                </View>

                {/* Recent Activity */}
                {recentSymptoms.length > 0 && (
                  <View style={styles.recentSection}>
                    <Text style={styles.sectionTitle}>Recent Symptoms</Text>
                    {recentSymptoms.map((symptom) => (
                      <TouchableOpacity 
                        key={symptom.id} 
                        style={styles.recentItem}
                        onPress={() => router.push('/(app)/menopause-symptoms')}
                      >
                        <View style={styles.recentItemContent}>
                          <Text style={styles.recentItemTitle}>{symptom.symptom}</Text>
                          <Text style={styles.recentItemSubtitle}>
                            {formatDate(symptom.date)} • {symptom.intensity} • {symptom.frequency}
                          </Text>
                        </View>
                        <View style={[styles.intensityIndicator, { 
                          backgroundColor: symptom.intensity === 'severe' ? '#FF6B6B' : 
                                         symptom.intensity === 'moderate' ? '#FFB366' : '#66D9EF' 
                        }]} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Educational Content Preview */}
                <View style={styles.educationPreview}>
                  <View style={styles.educationHeader}>
                    <BookOpen size={20} color={colors.primary} />
                    <Text style={styles.sectionTitle}>Today&apos;s Tip</Text>
                  </View>
                  <View style={styles.educationCard}>
                    <Text style={styles.educationTip}>
                      {EDUCATIONAL_CONTENT.tips[Math.floor(Math.random() * EDUCATIONAL_CONTENT.tips.length)]}
                    </Text>
                    <Button
                      title="Learn More"
                      variant="text"
                      size="small"
                      onPress={() => router.push('/(app)/menopause-education')}
                      testID="learn-more-button"
                    />
                  </View>
                </View>
              </>
            )}

            {/* Inactive Mode Content */}
            {!menopauseMode.isActive && (
              <View style={styles.inactiveContent}>
                <Heart size={48} color={colors.gray[400]} />
                <Text style={styles.inactiveTitle}>Menopause Support</Text>
                <Text style={styles.inactiveDescription}>
                  Activate Menopause Mode to track symptoms, irregular periods, and access educational resources tailored to your journey through perimenopause, menopause, or postmenopause.
                </Text>
                <View style={styles.featureList}>
                  <Text style={styles.featureItem}>• Comprehensive symptom tracking</Text>
                  <Text style={styles.featureItem}>• Irregular period monitoring</Text>
                  <Text style={styles.featureItem}>• Educational content and tips</Text>
                  <Text style={styles.featureItem}>• Personalized insights</Text>
                </View>
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
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  statusDetails: {
    marginBottom: 16,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  modeButton: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fullWidthStat: {
    width: '100%',
    flex: 0,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  statHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  recentItemSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
  },
  intensityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  educationPreview: {
    marginBottom: 24,
  },
  educationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  educationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  educationTip: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: 12,
  },
  inactiveContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  inactiveTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
    marginBottom: 12,
  },
  inactiveDescription: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  featureItem: {
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: 8,
    paddingLeft: 8,
  },
});