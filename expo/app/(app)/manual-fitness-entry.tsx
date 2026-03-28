import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert
} from 'react-native';
import { 
  Footprints, 
  MapPin, 
  Clock, 
  Calendar,
  Save
} from 'lucide-react-native';

import { Button } from '@/components/Button';
import colors from '@/constants/colors';
import { useFitness } from '@/hooks/useFitness';
import FitnessService from '@/utils/fitnessService';

export default function ManualFitnessEntryScreen() {
  const { loadWeeklyData } = useFitness();
  
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [steps, setSteps] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [activeMinutes, setActiveMinutes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSave = async () => {
    const stepsNum = parseInt(steps) || 0;
    const distanceNum = parseFloat(distance) || 0;
    const activeMinutesNum = parseInt(activeMinutes) || 0;

    if (stepsNum < 0 || distanceNum < 0 || activeMinutesNum < 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers.');
      return;
    }

    try {
      setIsLoading(true);
      
      const fitnessData = {
        id: `${date}-manual`,
        date,
        steps: stepsNum,
        distance: distanceNum * 1000, // Convert km to meters
        activeMinutes: activeMinutesNum,
        source: 'manual' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await FitnessService.saveFitnessData(fitnessData);
      await loadWeeklyData();
      
      Alert.alert(
        'Success', 
        'Fitness data saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSteps('');
              setDistance('');
              setActiveMinutes('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving fitness data:', error);
      Alert.alert('Error', 'Failed to save fitness data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Manual Fitness Entry',
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Date</Text>
            </View>
            
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              testID="date-input"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Footprints size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Steps</Text>
            </View>
            
            <TextInput
              style={styles.input}
              value={steps}
              onChangeText={setSteps}
              placeholder="Enter number of steps"
              keyboardType="number-pad"
              testID="steps-input"
            />
            <Text style={styles.inputHint}>
              Average daily steps: 8,000 - 12,000
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={colors.secondary} />
              <Text style={styles.sectionTitle}>Distance (km)</Text>
            </View>
            
            <TextInput
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              placeholder="Enter distance in kilometers"
              keyboardType="numeric"
              testID="distance-input"
            />
            <Text style={styles.inputHint}>
              Example: 5.2 for 5.2 kilometers
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={colors.warning} />
              <Text style={styles.sectionTitle}>Active Minutes</Text>
            </View>
            
            <TextInput
              style={styles.input}
              value={activeMinutes}
              onChangeText={setActiveMinutes}
              placeholder="Enter active minutes"
              keyboardType="number-pad"
              testID="active-minutes-input"
            />
            <Text style={styles.inputHint}>
              Recommended: At least 30 minutes per day
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Manual Entry Tips</Text>
            <Text style={styles.infoText}>
              • Use fitness apps or wearables to get accurate data
            </Text>
            <Text style={styles.infoText}>
              • Steps can be estimated: 1 mile ≈ 2,000 steps
            </Text>
            <Text style={styles.infoText}>
              • Active minutes include moderate to vigorous activities
            </Text>
            <Text style={styles.infoText}>
              • Consider connecting Apple HealthKit or Google Fit for automatic tracking
            </Text>
          </View>

          <Button
            title="Save Fitness Data"
            onPress={handleSave}
            isLoading={isLoading}
            disabled={!steps && !distance && !activeMinutes}
            leftIcon={<Save size={20} color={colors.white} />}
            style={styles.saveButton}
            testID="save-button"
          />
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
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.white,
  },
  inputHint: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.gray[600],
    lineHeight: 18,
    marginBottom: 4,
  },
  saveButton: {
    marginTop: 10,
  },
});