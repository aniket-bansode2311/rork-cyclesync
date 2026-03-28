import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Droplets, Plus, Trash2, Clock, Target } from 'lucide-react-native';

import { Button } from '@/components/Button';
import colors from '@/constants/colors';
import { useWellness } from '@/hooks/useWellness';
import { useAchievements } from '@/hooks/useAchievements';
import { QUICK_WATER_AMOUNTS, WATER_UNITS } from '@/types/wellness';

export default function WaterIntakeScreen() {
  const { 
    todaySummary, 
    settings, 
    addWaterIntake, 
    deleteWaterIntake, 
    updateSettings,
    getProgress 
  } = useWellness();
  const { trackAction } = useAchievements();
  
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState(settings.waterUnit);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const progress = getProgress();
  const quickAmounts = QUICK_WATER_AMOUNTS[selectedUnit];

  const handleQuickAdd = async (amount: number) => {
    try {
      setIsLoading(true);
      const now = new Date();
      await addWaterIntake({
        date: now.toISOString().split('T')[0],
        amount,
        unit: selectedUnit,
        time: now.toTimeString().split(' ')[0],
      });
      
      // Check if daily goal is met after adding water
      const newTotal = todaySummary.totalWater + amount;
      if (newTotal >= settings.waterGoal) {
        await trackAction('water_goal_met', 1, true);
      }
      
      // Track wellness activity
      await trackAction('wellness_activity_completed', 1);
    } catch (error) {
      console.error('Error adding water intake:', error);
      Alert.alert('Error', 'Failed to log water intake. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAdd = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    try {
      setIsLoading(true);
      const now = new Date();
      await addWaterIntake({
        date: now.toISOString().split('T')[0],
        amount,
        unit: selectedUnit,
        time: now.toTimeString().split(' ')[0],
      });
      
      // Check if daily goal is met after adding water
      const newTotal = todaySummary.totalWater + amount;
      if (newTotal >= settings.waterGoal) {
        await trackAction('water_goal_met', 1, true);
      }
      
      // Track wellness activity
      await trackAction('wellness_activity_completed', 1);
      
      setCustomAmount('');
    } catch (error) {
      console.error('Error adding water intake:', error);
      Alert.alert('Error', 'Failed to log water intake. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this water intake entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWaterIntake(id);
            } catch (error) {
              console.error('Error deleting water intake:', error);
              Alert.alert('Error', 'Failed to delete entry. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUnitChange = async (unit: 'glasses' | 'ounces' | 'milliliters') => {
    setSelectedUnit(unit);
    await updateSettings({ waterUnit: unit });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getUnitLabel = (unit: string) => {
    const unitInfo = WATER_UNITS.find(u => u.value === unit);
    return unitInfo?.label || unit;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Water Intake',
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Droplets size={24} color={colors.tertiary} />
              <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(progress.water, 100)}%`,
                      backgroundColor: colors.tertiary 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {progress.water.toFixed(0)}%
              </Text>
            </View>
            
            <View style={styles.progressStats}>
              <Text style={styles.progressValue}>
                {todaySummary.totalWater} / {settings.waterGoal}
              </Text>
              <Text style={styles.progressUnit}>
                {getUnitLabel(settings.waterUnit)}
              </Text>
            </View>
          </View>

          {/* Unit Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unit</Text>
            <View style={styles.unitContainer}>
              {WATER_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitButton,
                    selectedUnit === unit.value && styles.unitButtonActive,
                  ]}
                  onPress={() => handleUnitChange(unit.value as any)}
                  testID={`unit-${unit.value}`}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      selectedUnit === unit.value && styles.unitButtonTextActive,
                    ]}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Add Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <View style={styles.quickAddContainer}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAddButton}
                  onPress={() => handleQuickAdd(amount)}
                  disabled={isLoading}
                  testID={`quick-add-${amount}`}
                >
                  <Plus size={16} color={colors.white} />
                  <Text style={styles.quickAddText}>{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Amount Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Amount</Text>
            <View style={styles.customContainer}>
              <TextInput
                style={styles.customInput}
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder={`Enter amount in ${getUnitLabel(selectedUnit).toLowerCase()}`}
                keyboardType="decimal-pad"
                testID="custom-amount-input"
              />
              <Button
                title="Add"
                onPress={handleCustomAdd}
                disabled={!customAmount || isLoading}
                isLoading={isLoading}
                style={styles.customButton}
                testID="add-custom-button"
              />
            </View>
          </View>

          {/* Today's Entries */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today&apos;s Entries</Text>
              <View style={styles.entriesCount}>
                <Target size={16} color={colors.gray[600]} />
                <Text style={styles.entriesCountText}>
                  {todaySummary.waterIntakes.length} entries
                </Text>
              </View>
            </View>
            
            {todaySummary.waterIntakes.length === 0 ? (
              <View style={styles.emptyState}>
                <Droplets size={48} color={colors.gray[400]} />
                <Text style={styles.emptyStateText}>No water logged today</Text>
                <Text style={styles.emptyStateSubtext}>
                  Use the quick add buttons or enter a custom amount to start tracking
                </Text>
              </View>
            ) : (
              <View style={styles.entriesList}>
                {todaySummary.waterIntakes
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((intake) => (
                    <View key={intake.id} style={styles.entryItem}>
                      <View style={styles.entryInfo}>
                        <View style={styles.entryHeader}>
                          <Droplets size={20} color={colors.tertiary} />
                          <Text style={styles.entryAmount}>
                            {intake.amount} {getUnitLabel(intake.unit)}
                          </Text>
                        </View>
                        <View style={styles.entryTime}>
                          <Clock size={14} color={colors.gray[500]} />
                          <Text style={styles.entryTimeText}>
                            {formatTime(intake.time)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(intake.id)}
                        testID={`delete-${intake.id}`}
                      >
                        <Trash2 size={18} color={colors.error} />
                      </TouchableOpacity>
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
  progressSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
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
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
    minWidth: 40,
    textAlign: 'right',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
  },
  progressUnit: {
    fontSize: 14,
    color: colors.gray[600],
  },
  section: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  unitContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: colors.tertiary,
    borderColor: colors.tertiary,
  },
  unitButtonText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  unitButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  quickAddContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: colors.tertiary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },
  quickAddText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  customContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.black,
  },
  customButton: {
    minWidth: 80,
  },
  entriesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entriesCountText: {
    fontSize: 12,
    color: colors.gray[600],
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
  entriesList: {
    gap: 12,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  entryTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryTimeText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  deleteButton: {
    padding: 8,
  },
});