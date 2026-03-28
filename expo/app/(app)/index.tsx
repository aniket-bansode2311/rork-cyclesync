import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View,
  RefreshControl 
} from "react-native";
import { LogOut, Plus, History, Calendar, Activity, BarChart3, Thermometer, Droplets, Heart, Baby, Sunset, Zap, Settings, BookOpen, MessageCircle, Bell, Brain, PenTool, Moon, Trophy, Grid } from "lucide-react-native";

import { Button } from "@/components/Button";
import { CycleStatsCard } from "@/components/CycleStatsCard";
import { CycleCorrelationCard } from "@/components/CycleCorrelationCard";
import { WellnessDashboard } from "@/components/WellnessDashboard";
import { FitnessDashboard } from "@/components/FitnessDashboard";
import { AIInsightsCard } from "@/components/AIInsightsCard";
import { PeriodCalendar } from "@/components/PeriodCalendar";
import { PeriodModal } from "@/components/PeriodModal";
import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { usePeriods } from "@/hooks/usePeriods";
import { usePregnancy } from "@/hooks/usePregnancy";
import { useMenopause } from "@/hooks/useMenopause";
import { useAchievements } from "@/hooks/useAchievements";
import { Period } from "@/types/period";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { periods, cycleStats, addPeriod } = usePeriods();
  const { getCurrentMode } = usePregnancy();
  const { menopauseMode } = useMenopause();
  const { trackAction } = useAchievements();
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh - in a real app, this would refetch data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAddPeriod = async (periodData: Omit<Period, 'id'>) => {
    addPeriod(periodData);
    setShowModal(false);
    
    // Track achievement for first period log
    await trackAction('period_logged', 1);
    
    // Check if this completes a cycle
    if (periods.length >= 2) {
      await trackAction('cycle_completed', 1);
    }
  };

  const navigateToHistory = () => {
    router.push('/(app)/history');
  };

  const currentMode = getCurrentMode();
  const isPregnancyMode = currentMode === 'pregnancy';
  const isPostpartumMode = currentMode === 'postpartum';
  const isMenopauseMode = menopauseMode.isActive;
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "CycleSync",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                title="Notifications"
                variant="text"
                size="small"
                onPress={() => router.push('/(app)/notification-management')}
                rightIcon={<Bell size={16} color={colors.primary} />}
              />
              <Button
                title="Settings"
                variant="text"
                size="small"
                onPress={() => router.push('/(app)/settings')}
                rightIcon={<Settings size={16} color={colors.primary} />}
              />
              <Button
                title="Logout"
                variant="text"
                size="small"
                onPress={logout}
                rightIcon={<LogOut size={16} color={colors.primary} />}
              />
            </View>
          ),
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
            <View style={styles.header}>
              <Text style={styles.welcomeText}>
                Welcome back, {user?.name || user?.email?.split('@')[0] || "User"}!
              </Text>
              <Text style={styles.subtitleText}>
                {isPregnancyMode ? 'Track your pregnancy journey' : 
                 isPostpartumMode ? 'Track your postpartum recovery' : 
                 isMenopauseMode ? `Track your ${menopauseMode.stage} journey` :
                 'Track your cycle and stay informed'}
              </Text>
              {(isPregnancyMode || isPostpartumMode || isMenopauseMode) && (
                <View style={styles.modeIndicator}>
                  {isMenopauseMode ? (
                    <Sunset size={16} color={colors.primary} />
                  ) : (
                    <Baby size={16} color={colors.primary} />
                  )}
                  <Text style={styles.modeText}>
                    {isPregnancyMode ? 'Pregnancy Mode' : 
                     isPostpartumMode ? 'Postpartum Mode' :
                     isMenopauseMode ? `${menopauseMode.stage.charAt(0).toUpperCase() + menopauseMode.stage.slice(1)} Mode` :
                     ''}
                  </Text>
                </View>
              )}
            </View>

            <CycleStatsCard stats={cycleStats} />
            
            <AIInsightsCard onViewAll={() => router.push('/(app)/ai-insights')} />
            
            <CycleCorrelationCard />
            
            <WellnessDashboard 
              onWaterPress={() => router.push('/(app)/water-intake')}
              onActivityPress={() => router.push('/(app)/activity-tracking')}
            />
            
            <FitnessDashboard showHeader={true} />
            
            <View style={styles.actionsContainer}>
              <Button
                title="Log Period"
                onPress={() => setShowModal(true)}
                leftIcon={<Plus size={20} color={colors.white} />}
                style={styles.primaryButton}
                testID="log-period-button"
              />
              
              <View style={styles.secondaryActions}>
                <Button
                  title="Log Symptoms"
                  variant="outline"
                  onPress={() => router.push('/(app)/symptoms')}
                  leftIcon={<Activity size={18} color={colors.primary} />}
                  style={styles.secondaryButton}
                  testID="log-symptoms-button"
                />
                <Button
                  title="View History"
                  variant="outline"
                  onPress={navigateToHistory}
                  leftIcon={<History size={18} color={colors.primary} />}
                  style={styles.secondaryButton}
                  testID="view-history-button"
                />
              </View>
              
              <View style={styles.secondaryActions}>
                <Button
                  title="Symptom History"
                  variant="outline"
                  onPress={() => router.push('/(app)/symptom-history')}
                  leftIcon={<BarChart3 size={18} color={colors.primary} />}
                  style={styles.secondaryButton}
                  testID="symptom-history-button"
                />
                <Button
                  title="AI Insights"
                  variant="outline"
                  onPress={() => router.push('/(app)/ai-insights')}
                  leftIcon={<Brain size={18} color={colors.primary} />}
                  style={styles.secondaryButton}
                  testID="ai-insights-button"
                />
              </View>
              
              {/* Fertility Tracking Section */}
              {!isPregnancyMode && !isPostpartumMode && (
                <View style={styles.fertilitySection}>
                  <Text style={styles.fertilityTitle}>Fertility Tracking</Text>
                  <View style={styles.fertilityActions}>
                    <Button
                      title="BBT"
                      variant="outline"
                      onPress={() => router.push('/(app)/bbt')}
                      leftIcon={<Thermometer size={18} color={colors.primary} />}
                      style={styles.fertilityButton}
                      testID="bbt-button"
                    />
                    <Button
                      title="Cervical Mucus"
                      variant="outline"
                      onPress={() => router.push('/(app)/cervical-mucus')}
                      leftIcon={<Droplets size={18} color={colors.primary} />}
                      style={styles.fertilityButton}
                      testID="cervical-mucus-button"
                    />
                    <Button
                      title="Insights"
                      variant="outline"
                      onPress={() => router.push('/(app)/fertility-insights')}
                      leftIcon={<Heart size={18} color={colors.primary} />}
                      style={styles.fertilityButton}
                      testID="fertility-insights-button"
                    />
                  </View>
                </View>
              )}
              
              {/* Wellness Section */}
              <View style={styles.wellnessSection}>
                <Text style={styles.wellnessSectionTitle}>Daily Wellness</Text>
                <View style={styles.wellnessActions}>
                  <Button
                    title="Water Intake"
                    variant="outline"
                    onPress={() => router.push('/(app)/water-intake')}
                    leftIcon={<Droplets size={18} color={colors.primary} />}
                    style={styles.wellnessButton}
                    testID="water-intake-button"
                  />
                  <Button
                    title="Activity"
                    variant="outline"
                    onPress={() => router.push('/(app)/activity-tracking')}
                    leftIcon={<Zap size={18} color={colors.primary} />}
                    style={styles.wellnessButton}
                    testID="activity-tracking-button"
                  />
                </View>
                <View style={styles.wellnessActions}>
                  <Button
                    title="Sleep Tracking"
                    variant="outline"
                    onPress={() => router.push('/(app)/sleep')}
                    leftIcon={<Moon size={18} color={colors.primary} />}
                    style={styles.wellnessButton}
                    testID="sleep-tracking-button"
                  />
                  <Button
                    title="Fitness Tracking"
                    variant="outline"
                    onPress={() => router.push('/(app)/fitness-settings')}
                    leftIcon={<Activity size={18} color={colors.primary} />}
                    style={styles.wellnessButton}
                    testID="fitness-button"
                  />
                </View>
              </View>
              
              {/* Life Stages Section */}
              <View style={styles.pregnancySection}>
                <Text style={styles.pregnancySectionTitle}>Life Stages</Text>
                <View style={styles.pregnancyActions}>
                  <Button
                    title={isPregnancyMode ? "Pregnancy Dashboard" : "Pregnancy Mode"}
                    variant={isPregnancyMode ? "primary" : "outline"}
                    onPress={() => router.push('/(app)/pregnancy')}
                    leftIcon={<Baby size={18} color={isPregnancyMode ? colors.white : colors.primary} />}
                    style={styles.pregnancyButton}
                    testID="pregnancy-button"
                  />
                  <Button
                    title={isPostpartumMode ? "Postpartum Dashboard" : "Postpartum Mode"}
                    variant={isPostpartumMode ? "primary" : "outline"}
                    onPress={() => router.push('/(app)/postpartum')}
                    leftIcon={<Heart size={18} color={isPostpartumMode ? colors.white : colors.primary} />}
                    style={styles.pregnancyButton}
                    testID="postpartum-button"
                  />
                </View>
                <View style={styles.pregnancyActions}>
                  <Button
                    title={isMenopauseMode ? "Menopause Dashboard" : "Menopause Mode"}
                    variant={isMenopauseMode ? "primary" : "outline"}
                    onPress={() => router.push('/(app)/menopause')}
                    leftIcon={<Sunset size={18} color={isMenopauseMode ? colors.white : colors.primary} />}
                    style={[styles.pregnancyButton, { width: '100%' }]}
                    testID="menopause-button"
                  />
                </View>
              </View>
              
              {/* Journal Section */}
              <View style={styles.journalSection}>
                <Text style={styles.journalSectionTitle}>Personal Journal</Text>
                <View style={styles.journalActions}>
                  <Button
                    title="My Journal"
                    variant="outline"
                    onPress={() => router.push('/(app)/journal')}
                    leftIcon={<PenTool size={18} color={colors.primary} />}
                    style={[styles.journalButton, { width: '100%' }]}
                    testID="journal-button"
                  />
                </View>
              </View>
              
              {/* Education & Community Section */}
              <View style={styles.educationSection}>
                <Text style={styles.educationSectionTitle}>Learn & Connect</Text>
                <View style={styles.educationActions}>
                  <Button
                    title="Education Library"
                    variant="outline"
                    onPress={async () => {
                      router.push('/(app)/education');
                      await trackAction('education_visited', 1);
                    }}
                    leftIcon={<BookOpen size={18} color={colors.primary} />}
                    style={styles.educationButton}
                    testID="education-button"
                  />
                  <Button
                    title="Community Forum"
                    variant="outline"
                    onPress={() => router.push('/(app)/forum')}
                    leftIcon={<MessageCircle size={18} color={colors.primary} />}
                    style={styles.educationButton}
                    testID="forum-button"
                  />
                </View>
                <View style={styles.educationActions}>
                  <Button
                    title="Achievements"
                    variant="outline"
                    onPress={() => router.push('/(app)/achievements')}
                    leftIcon={<Trophy size={18} color={colors.primary} />}
                    style={[styles.educationButton, { width: '100%' }]}
                    testID="achievements-button"
                  />
                </View>
              </View>
            </View>

            <View style={styles.calendarSection}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Calendar View</Text>
              </View>
              <PeriodCalendar
                periods={periods}
                onDateSelect={() => {}} // Read-only calendar on home screen
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <PeriodModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddPeriod}
        periods={periods}
      />
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
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.black,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  actionsContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
  },
  calendarSection: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  fertilitySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  fertilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  fertilityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fertilityButton: {
    flex: 1,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  modeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  pregnancySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  pregnancySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  pregnancyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pregnancyButton: {
    flex: 1,
  },
  wellnessSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  wellnessSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  wellnessActions: {
    flexDirection: 'row',
    gap: 12,
  },
  wellnessButton: {
    flex: 1,
  },
  educationSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  educationSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  educationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  educationButton: {
    flex: 1,
  },
  journalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  journalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  journalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  journalButton: {
    flex: 1,
  },
});