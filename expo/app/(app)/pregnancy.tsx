import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { Baby, Calendar, CheckSquare, BookOpen, ArrowLeft } from "lucide-react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import colors from "@/constants/colors";
import { usePregnancy } from "@/hooks/usePregnancy";

export default function PregnancyScreen() {
  const router = useRouter();
  const { 
    pregnancyData, 
    checklist, 
    activatePregnancyMode, 
    deactivatePregnancyMode,
    updateChecklistItem,
    getWeeklyUpdate,
    getCurrentMode 
  } = usePregnancy();
  
  const [showActivationForm, setShowActivationForm] = useState<boolean>(false);
  const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState<string>("");
  const [estimatedConceptionDate, setEstimatedConceptionDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentMode = getCurrentMode();
  const isPregnancyActive = currentMode === 'pregnancy';

  const handleActivatePregnancy = async () => {
    if (!lastMenstrualPeriod && !estimatedConceptionDate) {
      Alert.alert("Error", "Please provide either your last menstrual period date or estimated conception date.");
      return;
    }

    try {
      setIsLoading(true);
      await activatePregnancyMode({
        lastMenstrualPeriod: lastMenstrualPeriod || undefined,
        estimatedConceptionDate: estimatedConceptionDate || undefined,
        notes: notes || undefined,
      });
      setShowActivationForm(false);
      setLastMenstrualPeriod("");
      setEstimatedConceptionDate("");
      setNotes("");
      Alert.alert("Success", "Pregnancy mode activated! Welcome to your pregnancy journey.");
    } catch (error) {
      Alert.alert("Error", "Failed to activate pregnancy mode. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivatePregnancy = () => {
    Alert.alert(
      "Deactivate Pregnancy Mode",
      "Are you sure you want to deactivate pregnancy mode? This will remove all pregnancy data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await deactivatePregnancyMode();
              Alert.alert("Success", "Pregnancy mode deactivated.");
            } catch (error) {
              Alert.alert("Error", "Failed to deactivate pregnancy mode.");
            }
          },
        },
      ]
    );
  };

  const handleChecklistToggle = async (itemId: string, completed: boolean) => {
    try {
      await updateChecklistItem(itemId, completed);
    } catch (error) {
      Alert.alert("Error", "Failed to update checklist item.");
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilDue = (): number => {
    if (!pregnancyData?.dueDate) return 0;
    const today = new Date();
    const dueDate = new Date(pregnancyData.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const weeklyUpdate = pregnancyData ? getWeeklyUpdate(pregnancyData.currentWeek) : null;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Pregnancy Mode",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
          headerLeft: () => (
            <Button
              title=""
              variant="text"
              size="small"
              onPress={() => router.back()}
              leftIcon={<ArrowLeft size={20} color={colors.primary} />}
            />
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {!isPregnancyActive && !showActivationForm && (
              <View style={styles.activationPrompt}>
                <Baby size={64} color={colors.primary} style={styles.icon} />
                <Text style={styles.title}>Pregnancy Mode</Text>
                <Text style={styles.description}>
                  Activate pregnancy mode to track your journey, get weekly updates, 
                  and manage important milestones throughout your pregnancy.
                </Text>
                <Button
                  title="Activate Pregnancy Mode"
                  onPress={() => setShowActivationForm(true)}
                  style={styles.activateButton}
                  testID="activate-pregnancy-button"
                />
              </View>
            )}

            {!isPregnancyActive && showActivationForm && (
              <View style={styles.activationForm}>
                <Text style={styles.formTitle}>Activate Pregnancy Mode</Text>
                <Text style={styles.formDescription}>
                  Please provide your last menstrual period date or estimated conception date to calculate your due date.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Last Menstrual Period (LMP)</Text>
                  <Input
                    value={lastMenstrualPeriod}
                    onChangeText={setLastMenstrualPeriod}
                    placeholder="YYYY-MM-DD"
                    testID="lmp-input"
                  />
                </View>

                <View style={styles.orDivider}>
                  <Text style={styles.orText}>OR</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Estimated Conception Date</Text>
                  <Input
                    value={estimatedConceptionDate}
                    onChangeText={setEstimatedConceptionDate}
                    placeholder="YYYY-MM-DD"
                    testID="conception-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <Input
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Any additional notes..."
                    multiline
                    testID="notes-input"
                  />
                </View>

                <View style={styles.formActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setShowActivationForm(false)}
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Activate"
                    onPress={handleActivatePregnancy}
                    isLoading={isLoading}
                    style={styles.submitButton}
                    testID="submit-activation-button"
                  />
                </View>
              </View>
            )}

            {isPregnancyActive && pregnancyData && (
              <View style={styles.pregnancyDashboard}>
                <View style={styles.pregnancyHeader}>
                  <Baby size={32} color={colors.primary} />
                  <View style={styles.pregnancyInfo}>
                    <Text style={styles.pregnancyTitle}>Week {pregnancyData.currentWeek}</Text>
                    <Text style={styles.pregnancySubtitle}>
                      {getDaysUntilDue()} days until due date
                    </Text>
                    <Text style={styles.dueDateText}>
                      Due: {formatDate(pregnancyData.dueDate)}
                    </Text>
                  </View>
                </View>

                {weeklyUpdate && (
                  <View style={styles.weeklyUpdateCard}>
                    <View style={styles.cardHeader}>
                      <BookOpen size={20} color={colors.primary} />
                      <Text style={styles.cardTitle}>{weeklyUpdate.title}</Text>
                    </View>
                    
                    <View style={styles.updateSection}>
                      <Text style={styles.updateSectionTitle}>Fetal Development</Text>
                      <Text style={styles.updateText}>{weeklyUpdate.fetalDevelopment}</Text>
                    </View>
                    
                    <View style={styles.updateSection}>
                      <Text style={styles.updateSectionTitle}>Maternal Changes</Text>
                      <Text style={styles.updateText}>{weeklyUpdate.maternalChanges}</Text>
                    </View>
                    
                    <View style={styles.updateSection}>
                      <Text style={styles.updateSectionTitle}>Tips for This Week</Text>
                      {weeklyUpdate.tips.map((tip, index) => (
                        <Text key={index} style={styles.tipText}>• {tip}</Text>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.checklistCard}>
                  <View style={styles.cardHeader}>
                    <CheckSquare size={20} color={colors.primary} />
                    <Text style={styles.cardTitle}>Pregnancy Checklist</Text>
                  </View>
                  
                  {checklist.map((item) => (
                    <View key={item.id} style={styles.checklistItem}>
                      <Button
                        title=""
                        variant="text"
                        size="small"
                        onPress={() => handleChecklistToggle(item.id, !item.completed)}
                        leftIcon={
                          <CheckSquare 
                            size={20} 
                            color={item.completed ? colors.success : colors.gray[400]} 
                            fill={item.completed ? colors.success : 'transparent'}
                          />
                        }
                        style={styles.checklistButton}
                      />
                      <View style={styles.checklistContent}>
                        <Text style={[
                          styles.checklistTitle,
                          item.completed && styles.checklistTitleCompleted
                        ]}>
                          {item.title}
                        </Text>
                        <Text style={styles.checklistDescription}>
                          {item.description}
                        </Text>
                        {item.dueWeek && (
                          <Text style={styles.checklistDueWeek}>
                            Due: Week {item.dueWeek}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.actions}>
                  <Button
                    title="Switch to Postpartum"
                    variant="outline"
                    onPress={() => router.push('/(app)/postpartum')}
                    leftIcon={<Calendar size={18} color={colors.primary} />}
                    style={styles.actionButton}
                    testID="switch-postpartum-button"
                  />
                  <Button
                    title="Deactivate"
                    variant="outline"
                    onPress={handleDeactivatePregnancy}
                    style={[styles.actionButton, styles.deactivateButton]}
                    testID="deactivate-pregnancy-button"
                  />
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
  activationPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 40,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  activateButton: {
    minWidth: 200,
  },
  activationForm: {
    flex: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  orDivider: {
    alignItems: 'center',
    marginVertical: 16,
  },
  orText: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  pregnancyDashboard: {
    flex: 1,
  },
  pregnancyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pregnancyInfo: {
    marginLeft: 16,
    flex: 1,
  },
  pregnancyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
  },
  pregnancySubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    marginTop: 4,
  },
  dueDateText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  weeklyUpdateCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 8,
  },
  updateSection: {
    marginBottom: 16,
  },
  updateSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  updateText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  tipText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: 4,
  },
  checklistCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  checklistButton: {
    marginRight: 12,
    marginTop: -4,
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  checklistTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.gray[500],
  },
  checklistDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 18,
  },
  checklistDueWeek: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  deactivateButton: {
    borderColor: colors.error,
  },
});