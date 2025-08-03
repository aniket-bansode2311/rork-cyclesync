import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, ChevronDown } from 'lucide-react-native';
import { useBirthControlContext } from '@/components/BirthControlProvider';
import { BIRTH_CONTROL_METHODS, BirthControlMethod, ReminderFrequency } from '@/types/birthControl';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import colors from '@/constants/colors';

export default function AddReminderScreen() {
  const { addReminder } = useBirthControlContext();
  
  const [selectedMethod, setSelectedMethod] = useState<BirthControlMethod>('pill');
  const [selectedFrequency, setSelectedFrequency] = useState<ReminderFrequency>('daily');
  const [reminderTime, setReminderTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedMethodInfo = BIRTH_CONTROL_METHODS.find(m => m.value === selectedMethod);
  const availableFrequencies = selectedMethodInfo?.frequency || ['daily'];

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSave = async () => {
    if (availableFrequencies.length > 0 && !availableFrequencies.includes(selectedFrequency)) {
      Alert.alert('Error', 'Please select a valid frequency for this method.');
      return;
    }

    setIsLoading(true);
    try {
      const timeString = reminderTime.toTimeString().slice(0, 5); // HH:MM format
      await addReminder(
        selectedMethod,
        selectedFrequency,
        timeString,
        customName.trim() || undefined,
        notes.trim() || undefined
      );
      
      Alert.alert(
        'Success',
        'Reminder created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create reminder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Add Reminder',
          headerStyle: { backgroundColor: colors.purple },
          headerTintColor: 'white',
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Birth Control Method</Text>
          <View style={styles.methodGrid}>
            {BIRTH_CONTROL_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.methodCard,
                  selectedMethod === method.value && styles.methodCardSelected,
                ]}
                onPress={() => {
                  setSelectedMethod(method.value);
                  if (method.frequency.length > 0) {
                    setSelectedFrequency(method.frequency[0]);
                  }
                }}
                testID={`method-${method.value}`}
              >
                <Text style={[
                  styles.methodLabel,
                  selectedMethod === method.value && styles.methodLabelSelected,
                ]}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {availableFrequencies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Frequency</Text>
            <View style={styles.frequencyContainer}>
              {availableFrequencies.map((frequency) => (
                <TouchableOpacity
                  key={frequency}
                  style={[
                    styles.frequencyButton,
                    selectedFrequency === frequency && styles.frequencyButtonSelected,
                  ]}
                  onPress={() => setSelectedFrequency(frequency)}
                  testID={`frequency-${frequency}`}
                >
                  <Text style={[
                    styles.frequencyText,
                    selectedFrequency === frequency && styles.frequencyTextSelected,
                  ]}>
                    {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {availableFrequencies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
              testID="time-picker-button"
            >
              <Clock size={20} color={colors.purple} />
              <Text style={styles.timeText}>{formatTime(reminderTime)}</Text>
              <ChevronDown size={20} color={colors.gray[400]} />
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                testID="time-picker"
              />
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Name (Optional)</Text>
          <Input
            value={customName}
            onChangeText={setCustomName}
            placeholder="e.g., My Daily Pill"
            testID="custom-name-input"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes..."
            multiline
            numberOfLines={3}
            testID="notes-input"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            style={styles.cancelButton}
            testID="cancel-button"
          />
          <Button
            title="Save Reminder"
            onPress={handleSave}
            isLoading={isLoading}
            style={styles.saveButton}
            testID="save-button"
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.gray[800],
    marginBottom: 12,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodCard: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '45%',
    alignItems: 'center',
  },
  methodCardSelected: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.gray[700],
    textAlign: 'center',
  },
  methodLabelSelected: {
    color: colors.white,
    fontWeight: '600' as const,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  frequencyButtonSelected: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.gray[700],
  },
  frequencyTextSelected: {
    color: colors.white,
    fontWeight: '600' as const,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[800],
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  saveButton: {
    flex: 1,
  },
});