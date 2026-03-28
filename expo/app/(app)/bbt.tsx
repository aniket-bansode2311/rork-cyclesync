import { Stack } from 'expo-router';
import { Calendar, Clock, Plus, Thermometer, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


import { Input } from '@/components/Input';
import { useFertility, useFertilityInsights } from '@/hooks/useFertility';
import { BBTEntry } from '@/types/fertility';

export default function BBTScreen() {
  const { bbtEntries, addBBTEntry, deleteBBTEntry } = useFertility();
  const { calculateBBTTrend } = useFertilityInsights();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [temperature, setTemperature] = useState<string>('');
  const [timeOfMeasurement, setTimeOfMeasurement] = useState<string>('07:00');
  const [notes, setNotes] = useState<string>('');

  const handleAddEntry = () => {
    if (!temperature || isNaN(parseFloat(temperature))) {
      Alert.alert('Error', 'Please enter a valid temperature');
      return;
    }

    const tempValue = parseFloat(temperature);
    if (tempValue < 35 || tempValue > 42) {
      Alert.alert('Error', 'Temperature should be between 35°C and 42°C');
      return;
    }

    // Check if entry already exists for this date
    const existingEntry = bbtEntries.find(entry => entry.date === selectedDate);
    if (existingEntry) {
      Alert.alert('Error', 'BBT entry already exists for this date');
      return;
    }

    addBBTEntry({
      date: selectedDate,
      temperature: tempValue,
      timeOfMeasurement,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setTemperature('');
    setTimeOfMeasurement('07:00');
    setNotes('');
    setShowModal(false);
  };

  const handleDeleteEntry = (entry: BBTEntry) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete the BBT entry for ${new Date(entry.date).toLocaleDateString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteBBTEntry(entry.id) },
      ]
    );
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp >= 37.0) return '#EF4444'; // Red for high temp
    if (temp >= 36.5) return '#F59E0B'; // Orange for medium temp
    return '#3B82F6'; // Blue for low temp
  };

  const trend = calculateBBTTrend(bbtEntries);
  const averageTemp = bbtEntries.length > 0 
    ? bbtEntries.reduce((sum, entry) => sum + entry.temperature, 0) / bbtEntries.length 
    : 0;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'BBT Tracking',
          headerStyle: { backgroundColor: '#8B5CF6' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <ScrollView style={styles.container}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Thermometer size={24} color="#8B5CF6" />
            <Text style={styles.statsTitle}>BBT Overview</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {averageTemp > 0 ? `${averageTemp.toFixed(1)}°C` : '--'}
              </Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.trendContainer}>
                <TrendingUp 
                  size={16} 
                  color={trend === 'rising' ? '#10B981' : trend === 'falling' ? '#EF4444' : '#6B7280'} 
                />
                <Text style={[
                  styles.trendText,
                  { color: trend === 'rising' ? '#10B981' : trend === 'falling' ? '#EF4444' : '#6B7280' }
                ]}>
                  {trend.charAt(0).toUpperCase() + trend.slice(1)}
                </Text>
              </View>
              <Text style={styles.statLabel}>Trend</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bbtEntries.length}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
          </View>
        </View>

        {/* Add Entry Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Log BBT</Text>
        </TouchableOpacity>

        {/* Entries List */}
        <View style={styles.entriesContainer}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          
          {bbtEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Thermometer size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No BBT entries yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your basal body temperature to identify patterns
              </Text>
            </View>
          ) : (
            bbtEntries
              .slice()
              .reverse()
              .map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.entryCard}
                  onLongPress={() => handleDeleteEntry(entry)}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.entryDate}>
                      <Calendar size={16} color="#6B7280" />
                      <Text style={styles.entryDateText}>
                        {new Date(entry.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.entryTime}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.entryTimeText}>{entry.timeOfMeasurement}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.entryContent}>
                    <View style={[
                      styles.temperatureChip,
                      { backgroundColor: getTemperatureColor(entry.temperature) + '20' }
                    ]}>
                      <Text style={[
                        styles.temperatureText,
                        { color: getTemperatureColor(entry.temperature) }
                      ]}>
                        {entry.temperature.toFixed(1)}°C
                      </Text>
                    </View>
                    
                    {entry.notes && (
                      <Text style={styles.entryNotes}>{entry.notes}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
          )}
        </View>
      </ScrollView>

      {/* Add Entry Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Log BBT</Text>
            <TouchableOpacity onPress={handleAddEntry}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <Input
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
                testID="bbt-date-input"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Temperature (°C)</Text>
              <Input
                value={temperature}
                onChangeText={setTemperature}
                placeholder="36.5"
                keyboardType="decimal-pad"
                testID="bbt-temperature-input"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Time of Measurement</Text>
              <Input
                value={timeOfMeasurement}
                onChangeText={setTimeOfMeasurement}
                placeholder="07:00"
                testID="bbt-time-input"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                testID="bbt-notes-input"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5FF',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  entriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  entryDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDateText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  entryTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTimeText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  entryContent: {
    gap: 8,
  },
  temperatureChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  temperatureText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  entryNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9F5FF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600' as const,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 80,
  },
});