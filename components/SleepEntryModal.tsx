import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { X, Clock, Star } from 'lucide-react-native';
import { SleepEntry, SLEEP_QUALITY_LABELS } from '@/types/sleep';
import { sleepService } from '@/utils/sleepService';

interface SleepEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  entry?: SleepEntry;
  selectedDate?: string;
}

export default function SleepEntryModal({
  visible,
  onClose,
  onSave,
  entry,
  selectedDate,
}: SleepEntryModalProps) {
  const [date, setDate] = useState<string>('');
  const [bedTime, setBedTime] = useState<string>('22:00');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [quality, setQuality] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setBedTime(entry.bedTime);
      setWakeTime(entry.wakeTime);
      setQuality(entry.quality);
      setNotes(entry.notes || '');
    } else {
      const today = selectedDate || new Date().toISOString().split('T')[0];
      setDate(today);
      setBedTime('22:00');
      setWakeTime('07:00');
      setQuality(3);
      setNotes('');
    }
  }, [entry, selectedDate, visible]);

  const handleSave = () => {
    if (!date || !bedTime || !wakeTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const duration = sleepService.calculateSleepDuration(bedTime, wakeTime);
    
    if (duration <= 0 || duration > 24) {
      Alert.alert('Error', 'Please check your sleep times');
      return;
    }

    const sleepEntry = {
      date,
      bedTime,
      wakeTime,
      duration,
      quality,
      notes: notes.trim() || undefined,
    };

    onSave(sleepEntry);
    onClose();
  };

  const formatDuration = () => {
    const duration = sleepService.calculateSleepDuration(bedTime, wakeTime);
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {entry ? 'Edit Sleep Entry' : 'Add Sleep Entry'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.timeSection}>
            <View style={styles.timeInput}>
              <Text style={styles.sectionTitle}>Bedtime</Text>
              <View style={styles.timeInputContainer}>
                <Clock size={20} color="#666" />
                <TextInput
                  style={styles.timeField}
                  value={bedTime}
                  onChangeText={setBedTime}
                  placeholder="22:00"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.timeInput}>
              <Text style={styles.sectionTitle}>Wake Time</Text>
              <View style={styles.timeInputContainer}>
                <Clock size={20} color="#666" />
                <TextInput
                  style={styles.timeField}
                  value={wakeTime}
                  onChangeText={setWakeTime}
                  placeholder="07:00"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Sleep Duration</Text>
            <Text style={styles.durationValue}>{formatDuration()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sleep Quality</Text>
            <View style={styles.qualityContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.qualityButton,
                    quality === rating && styles.qualityButtonActive,
                  ]}
                  onPress={() => setQuality(rating)}
                >
                  <Star
                    size={24}
                    color={quality >= rating ? '#FFD700' : '#DDD'}
                    fill={quality >= rating ? '#FFD700' : 'transparent'}
                  />
                  <Text style={[
                    styles.qualityText,
                    quality === rating && styles.qualityTextActive,
                  ]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.qualityLabel}>
              {SLEEP_QUALITY_LABELS[quality as keyof typeof SLEEP_QUALITY_LABELS]}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="How did you sleep? Any factors that affected your sleep?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  timeField: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  durationContainer: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A90E2',
  },
  qualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  qualityButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    minWidth: 60,
  },
  qualityButtonActive: {
    backgroundColor: '#fff3cd',
  },
  qualityText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  qualityTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  qualityLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    minHeight: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});