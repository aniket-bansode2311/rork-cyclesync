import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert
} from "react-native";
import { Save, Calendar, Droplets } from "lucide-react-native";

import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { useMenopause } from "@/hooks/useMenopause";
import { PERIOD_TYPES } from "@/types/menopause";

export default function IrregularPeriodsScreen() {
  const router = useRouter();
  const { addIrregularPeriod, menopauseMode } = useMenopause();
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedType, setSelectedType] = useState<'normal' | 'light' | 'heavy' | 'spotting' | 'skipped'>('normal');
  const [duration, setDuration] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!menopauseMode.isActive) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: "Period Tracking",
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTintColor: colors.black,
          }} 
        />
        <SafeAreaView style={styles.container}>
          <View style={styles.inactiveContainer}>
            <Droplets size={48} color={colors.gray[400]} />
            <Text style={styles.inactiveTitle}>Menopause Mode Required</Text>
            <Text style={styles.inactiveDescription}>
              Please activate Menopause Mode to track irregular periods.
            </Text>
            <Button
              title="Go to Menopause Mode"
              onPress={() => router.push('/(app)/menopause')}
              style={styles.activateButton}
              testID="go-to-menopause-button"
            />
          </View>
        </SafeAreaView>
      </>
    );
  }

  const handleSavePeriod = async () => {
    try {
      setIsLoading(true);
      await addIrregularPeriod({
        date: selectedDate,
        type: selectedType,
        duration: duration ? parseInt(duration, 10) : undefined,
        notes: notes.trim() || undefined
      });

      Alert.alert("Success", "Period entry logged successfully", [
        {
          text: "Add Another",
          onPress: () => {
            setSelectedType('normal');
            setDuration('');
            setNotes('');
          }
        },
        {
          text: "Done",
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save period entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Track Period",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date</Text>
              <View style={styles.dateContainer}>
                <Calendar size={20} color={colors.primary} />
                <TextInput
                  style={styles.dateInput}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="YYYY-MM-DD"
                  testID="date-input"
                />
              </View>
            </View>

            {/* Period Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Period Type</Text>
              <View style={styles.typeGrid}>
                {PERIOD_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeCard,
                      selectedType === type.value && styles.selectedTypeCard
                    ]}
                    onPress={() => setSelectedType(type.value as any)}
                    testID={`period-type-${type.value}`}
                  >
                    <View style={[styles.typeIndicator, { backgroundColor: type.color }]} />
                    <Text style={[
                      styles.typeLabel,
                      selectedType === type.value && styles.selectedTypeLabel
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration (only for non-skipped periods) */}
            {selectedType !== 'skipped' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Duration (Days)</Text>
                <TextInput
                  style={styles.durationInput}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Enter number of days"
                  keyboardType="numeric"
                  testID="duration-input"
                />
              </View>
            )}

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes about this period..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                testID="notes-input"
              />
            </View>

            {/* Information Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Tracking Irregular Periods</Text>
              <Text style={styles.infoText}>
                During perimenopause and menopause, periods can become irregular. 
                Tracking these changes helps you and your healthcare provider understand your transition.
              </Text>
              <View style={styles.infoList}>
                <Text style={styles.infoItem}>• Normal: Regular flow and duration</Text>
                <Text style={styles.infoItem}>• Light: Lighter than usual flow</Text>
                <Text style={styles.infoItem}>• Heavy: Heavier than usual flow</Text>
                <Text style={styles.infoItem}>• Spotting: Very light bleeding</Text>
                <Text style={styles.infoItem}>• Skipped: Missed period</Text>
              </View>
            </View>

            {/* Save Button */}
            <Button
              title="Save Period Entry"
              onPress={handleSavePeriod}
              isLoading={isLoading}
              leftIcon={<Save size={20} color={colors.white} />}
              style={styles.saveButton}
              testID="save-period-button"
            />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  dateInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.black,
  },
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  selectedTypeCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  typeIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 16,
    color: colors.gray[700],
    fontWeight: '500',
  },
  selectedTypeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  durationInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    fontSize: 16,
    color: colors.black,
  },
  notesInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    fontSize: 16,
    color: colors.black,
    minHeight: 100,
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: 12,
  },
  infoList: {
    gap: 4,
  },
  infoItem: {
    fontSize: 12,
    color: colors.gray[600],
    paddingLeft: 8,
  },
  saveButton: {
    marginTop: 8,
  },
  inactiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  inactiveTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  inactiveDescription: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  activateButton: {
    minWidth: 200,
  },
});