import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, Plus, Save, Smile } from 'lucide-react-native';

import { Button } from '@/components/Button';
import colors from '@/constants/colors';
import { useSymptoms } from '@/hooks/useSymptoms';
import {
  LoggedMood,
  LoggedSymptom,
  MoodType,
  PREDEFINED_SYMPTOMS,
  SymptomIntensity,
} from '@/types/symptoms';

const MOOD_OPTIONS: { mood: MoodType; emoji: string; color: string }[] = [
  { mood: 'happy', emoji: '😊', color: '#FFD700' },
  { mood: 'sad', emoji: '😢', color: '#87CEEB' },
  { mood: 'anxious', emoji: '😰', color: '#FFA500' },
  { mood: 'energetic', emoji: '⚡', color: '#32CD32' },
  { mood: 'irritable', emoji: '😤', color: '#FF6347' },
  { mood: 'calm', emoji: '😌', color: '#98FB98' },
  { mood: 'stressed', emoji: '😫', color: '#DC143C' },
  { mood: 'excited', emoji: '🤩', color: '#FF69B4' },
];

const INTENSITY_OPTIONS: { value: SymptomIntensity; label: string; color: string }[] = [
  { value: 'mild', label: 'Mild', color: colors.success },
  { value: 'moderate', label: 'Moderate', color: colors.warning },
  { value: 'severe', label: 'Severe', color: colors.error },
];

export default function SymptomsScreen() {
  const { addSymptom, addMood, addCustomSymptom, customSymptoms } = useSymptoms();
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<{[key: string]: SymptomIntensity}>({});
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [moodIntensity, setMoodIntensity] = useState<number>(3);
  const [symptomNotes, setSymptomNotes] = useState<{[key: string]: string}>({});
  const [moodNotes, setMoodNotes] = useState<string>('');
  const [customSymptomName, setCustomSymptomName] = useState<string>('');
  const [customSymptomCategory, setCustomSymptomCategory] = useState<'physical' | 'emotional'>('physical');
  const [showCustomSymptomForm, setShowCustomSymptomForm] = useState<boolean>(false);

  const allSymptoms = [...PREDEFINED_SYMPTOMS, ...customSymptoms.map(cs => ({
    id: cs.id,
    name: cs.name,
    category: cs.category,
  }))];

  const physicalSymptoms = allSymptoms.filter(s => s.category === 'physical');
  const emotionalSymptoms = allSymptoms.filter(s => s.category === 'emotional');

  const handleSymptomToggle = (symptomId: string, intensity?: SymptomIntensity) => {
    if (selectedSymptoms[symptomId] && !intensity) {
      const newSelected = { ...selectedSymptoms };
      delete newSelected[symptomId];
      setSelectedSymptoms(newSelected);
    } else if (intensity) {
      setSelectedSymptoms(prev => ({
        ...prev,
        [symptomId]: intensity,
      }));
    }
  };

  const handleAddCustomSymptom = () => {
    if (!customSymptomName.trim()) {
      Alert.alert('Error', 'Please enter a symptom name');
      return;
    }

    addCustomSymptom({
      name: customSymptomName.trim(),
      category: customSymptomCategory,
    });

    setCustomSymptomName('');
    setShowCustomSymptomForm(false);
    Alert.alert('Success', 'Custom symptom added successfully!');
  };

  const handleSave = () => {
    const dateToSave = new Date(selectedDate).toISOString();

    // Save symptoms
    Object.entries(selectedSymptoms).forEach(([symptomId, intensity]) => {
      const symptom = allSymptoms.find(s => s.id === symptomId);
      if (symptom) {
        const symptomData: Omit<LoggedSymptom, 'id'> = {
          symptomId,
          symptomName: symptom.name,
          intensity,
          notes: symptomNotes[symptomId] || undefined,
          date: dateToSave,
          isCustom: customSymptoms.some(cs => cs.id === symptomId),
        };
        addSymptom(symptomData);
      }
    });

    // Save mood
    if (selectedMood) {
      const moodData: Omit<LoggedMood, 'id'> = {
        mood: selectedMood,
        intensity: moodIntensity,
        notes: moodNotes || undefined,
        date: dateToSave,
      };
      addMood(moodData);
    }

    // Reset form
    setSelectedSymptoms({});
    setSelectedMood(null);
    setMoodIntensity(3);
    setSymptomNotes({});
    setMoodNotes('');

    Alert.alert('Success', 'Symptoms and mood logged successfully!');
  };

  const renderSymptomSection = (title: string, symptoms: typeof allSymptoms) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.symptomsGrid}>
        {symptoms.map(symptom => (
          <View key={symptom.id} style={styles.symptomContainer}>
            <TouchableOpacity
              style={[
                styles.symptomButton,
                selectedSymptoms[symptom.id] && styles.symptomButtonSelected,
              ]}
              onPress={() => handleSymptomToggle(symptom.id)}
            >
              <Text style={[
                styles.symptomText,
                selectedSymptoms[symptom.id] && styles.symptomTextSelected,
              ]}>
                {symptom.name}
              </Text>
            </TouchableOpacity>
            
            {selectedSymptoms[symptom.id] && (
              <View style={styles.intensityContainer}>
                <View style={styles.intensityButtons}>
                  {INTENSITY_OPTIONS.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.intensityButton,
                        selectedSymptoms[symptom.id] === option.value && {
                          backgroundColor: option.color,
                        },
                      ]}
                      onPress={() => handleSymptomToggle(symptom.id, option.value)}
                    >
                      <Text style={[
                        styles.intensityText,
                        selectedSymptoms[symptom.id] === option.value && styles.intensityTextSelected,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add notes (optional)"
                  value={symptomNotes[symptom.id] || ''}
                  onChangeText={(text) => setSymptomNotes(prev => ({
                    ...prev,
                    [symptom.id]: text,
                  }))}
                  multiline
                />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Log Symptoms & Mood",
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
            <View style={styles.dateSection}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Date</Text>
              </View>
              <TextInput
                style={styles.dateInput}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Mood Selection */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Smile size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>How are you feeling?</Text>
              </View>
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.mood}
                    style={[
                      styles.moodButton,
                      selectedMood === option.mood && {
                        backgroundColor: option.color + '20',
                        borderColor: option.color,
                      },
                    ]}
                    onPress={() => setSelectedMood(option.mood)}
                  >
                    <Text style={styles.moodEmoji}>{option.emoji}</Text>
                    <Text style={styles.moodLabel}>
                      {option.mood.charAt(0).toUpperCase() + option.mood.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {selectedMood && (
                <View style={styles.moodDetailsContainer}>
                  <Text style={styles.intensityLabel}>Intensity (1-5):</Text>
                  <View style={styles.moodIntensityContainer}>
                    {[1, 2, 3, 4, 5].map(num => (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.moodIntensityButton,
                          moodIntensity === num && styles.moodIntensityButtonSelected,
                        ]}
                        onPress={() => setMoodIntensity(num)}
                      >
                        <Text style={[
                          styles.moodIntensityText,
                          moodIntensity === num && styles.moodIntensityTextSelected,
                        ]}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add mood notes (optional)"
                    value={moodNotes}
                    onChangeText={setMoodNotes}
                    multiline
                  />
                </View>
              )}
            </View>

            {/* Physical Symptoms */}
            {renderSymptomSection('Physical Symptoms', physicalSymptoms)}

            {/* Emotional Symptoms */}
            {renderSymptomSection('Emotional Symptoms', emotionalSymptoms)}

            {/* Custom Symptom Form */}
            <View style={styles.section}>
              <Button
                title="Add Custom Symptom"
                variant="outline"
                onPress={() => setShowCustomSymptomForm(!showCustomSymptomForm)}
                leftIcon={<Plus size={18} color={colors.primary} />}
                style={styles.customSymptomToggle}
              />
              
              {showCustomSymptomForm && (
                <View style={styles.customSymptomForm}>
                  <TextInput
                    style={styles.customSymptomInput}
                    placeholder="Enter symptom name"
                    value={customSymptomName}
                    onChangeText={setCustomSymptomName}
                  />
                  <View style={styles.categoryButtons}>
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        customSymptomCategory === 'physical' && styles.categoryButtonSelected,
                      ]}
                      onPress={() => setCustomSymptomCategory('physical')}
                    >
                      <Text style={[
                        styles.categoryText,
                        customSymptomCategory === 'physical' && styles.categoryTextSelected,
                      ]}>
                        Physical
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        customSymptomCategory === 'emotional' && styles.categoryButtonSelected,
                      ]}
                      onPress={() => setCustomSymptomCategory('emotional')}
                    >
                      <Text style={[
                        styles.categoryText,
                        customSymptomCategory === 'emotional' && styles.categoryTextSelected,
                      ]}>
                        Emotional
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Button
                    title="Add Symptom"
                    onPress={handleAddCustomSymptom}
                    style={styles.addCustomButton}
                  />
                </View>
              )}
            </View>

            {/* Save Button */}
            <Button
              title="Save Symptoms & Mood"
              onPress={handleSave}
              leftIcon={<Save size={20} color={colors.white} />}
              style={styles.saveButton}
              testID="save-symptoms-button"
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
  dateSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    minWidth: 80,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  moodDetailsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  moodIntensityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  moodIntensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodIntensityButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  moodIntensityText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[600],
  },
  moodIntensityTextSelected: {
    color: colors.white,
  },
  symptomsGrid: {
    gap: 12,
  },
  symptomContainer: {
    marginBottom: 8,
  },
  symptomButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  symptomButtonSelected: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  symptomText: {
    fontSize: 16,
    color: colors.gray[700],
    textAlign: 'center',
  },
  symptomTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  intensityContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  intensityButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  intensityText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  intensityTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: colors.white,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  customSymptomToggle: {
    marginBottom: 12,
  },
  customSymptomForm: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    gap: 12,
  },
  customSymptomInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  categoryTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  addCustomButton: {
    marginTop: 8,
  },
  saveButton: {
    marginTop: 24,
  },
});