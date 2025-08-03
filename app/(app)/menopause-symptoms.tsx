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
import { Plus, Save, Calendar, Activity } from "lucide-react-native";

import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { useMenopause } from "@/hooks/useMenopause";
import { MENOPAUSE_SYMPTOMS, MenopauseSymptomType } from "@/types/menopause";

export default function MenopauseSymptomsScreen() {
  const router = useRouter();
  const { addSymptom, menopauseMode } = useMenopause();
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSymptom, setSelectedSymptom] = useState<string>('');
  const [customSymptom, setCustomSymptom] = useState<string>('');
  const [intensity, setIntensity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [frequency, setFrequency] = useState<'rarely' | 'sometimes' | 'often' | 'daily'>('sometimes');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!menopauseMode.isActive) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: "Menopause Symptoms",
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTintColor: colors.black,
          }} 
        />
        <SafeAreaView style={styles.container}>
          <View style={styles.inactiveContainer}>
            <Activity size={48} color={colors.gray[400]} />
            <Text style={styles.inactiveTitle}>Menopause Mode Required</Text>
            <Text style={styles.inactiveDescription}>
              Please activate Menopause Mode to track symptoms.
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

  const handleSaveSymptom = async () => {
    const symptomToSave = selectedSymptom || customSymptom.trim();
    
    if (!symptomToSave) {
      Alert.alert("Error", "Please select or enter a symptom");
      return;
    }

    try {
      setIsLoading(true);
      await addSymptom({
        date: selectedDate,
        symptom: symptomToSave,
        intensity,
        frequency,
        notes: notes.trim() || undefined
      });

      Alert.alert("Success", "Symptom logged successfully", [
        {
          text: "Add Another",
          onPress: () => {
            setSelectedSymptom('');
            setCustomSymptom('');
            setIntensity('mild');
            setFrequency('sometimes');
            setNotes('');
          }
        },
        {
          text: "Done",
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save symptom. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const intensityColors = {
    mild: '#66D9EF',
    moderate: '#FFB366',
    severe: '#FF6B6B'
  };

  const frequencyLabels = {
    rarely: 'Rarely',
    sometimes: 'Sometimes',
    often: 'Often',
    daily: 'Daily'
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Log Symptoms",
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

            {/* Symptom Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Symptom</Text>
              <View style={styles.symptomGrid}>
                {MENOPAUSE_SYMPTOMS.map((symptom) => (
                  <TouchableOpacity
                    key={symptom}
                    style={[
                      styles.symptomChip,
                      selectedSymptom === symptom && styles.selectedSymptomChip
                    ]}
                    onPress={() => {
                      setSelectedSymptom(symptom);
                      setCustomSymptom('');
                    }}
                    testID={`symptom-${symptom.toLowerCase().replace(/\\s+/g, '-')}`}
                  >
                    <Text style={[
                      styles.symptomChipText,
                      selectedSymptom === symptom && styles.selectedSymptomChipText
                    ]}>
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.orText}>or add custom symptom</Text>
              
              <TextInput
                style={styles.customSymptomInput}
                value={customSymptom}
                onChangeText={(text) => {
                  setCustomSymptom(text);
                  if (text.trim()) {
                    setSelectedSymptom('');
                  }
                }}
                placeholder="Enter custom symptom"
                testID="custom-symptom-input"
              />
            </View>

            {/* Intensity Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Intensity</Text>
              <View style={styles.intensityContainer}>
                {(['mild', 'moderate', 'severe'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.intensityButton,
                      { borderColor: intensityColors[level] },
                      intensity === level && { backgroundColor: intensityColors[level] }
                    ]}
                    onPress={() => setIntensity(level)}
                    testID={`intensity-${level}`}
                  >
                    <Text style={[
                      styles.intensityButtonText,
                      intensity === level && styles.selectedIntensityText
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Frequency Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequency</Text>
              <View style={styles.frequencyContainer}>
                {(Object.keys(frequencyLabels) as Array<keyof typeof frequencyLabels>).map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      frequency === freq && styles.selectedFrequencyButton
                    ]}
                    onPress={() => setFrequency(freq)}
                    testID={`frequency-${freq}`}
                  >
                    <Text style={[
                      styles.frequencyButtonText,
                      frequency === freq && styles.selectedFrequencyText
                    ]}>
                      {frequencyLabels[freq]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes about this symptom..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                testID="notes-input"
              />
            </View>

            {/* Save Button */}
            <Button
              title="Save Symptom"
              onPress={handleSaveSymptom}
              isLoading={isLoading}
              leftIcon={<Save size={20} color={colors.white} />}
              style={styles.saveButton}
              testID="save-symptom-button"
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
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  symptomChip: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectedSymptomChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  symptomChipText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  selectedSymptomChipText: {
    color: colors.white,
  },
  orText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 12,
  },
  customSymptomInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    fontSize: 16,
    color: colors.black,
  },
  intensityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  intensityButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  intensityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
  },
  selectedIntensityText: {
    color: colors.white,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectedFrequencyButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyButtonText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  selectedFrequencyText: {
    color: colors.white,
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