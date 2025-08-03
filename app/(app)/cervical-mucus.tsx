import { Stack } from 'expo-router';
import { Calendar, Droplets, Plus } from 'lucide-react-native';
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
import { useFertility } from '@/hooks/useFertility';
import { CervicalMucusEntry } from '@/types/fertility';

const CONSISTENCY_OPTIONS = [
  { value: 'dry', label: 'Dry', color: '#F59E0B', description: 'No mucus present' },
  { value: 'sticky', label: 'Sticky', color: '#EF4444', description: 'Thick, tacky texture' },
  { value: 'creamy', label: 'Creamy', color: '#8B5CF6', description: 'Smooth, lotion-like' },
  { value: 'watery', label: 'Watery', color: '#06B6D4', description: 'Thin, clear liquid' },
  { value: 'egg-white', label: 'Egg White', color: '#10B981', description: 'Clear, stretchy, slippery' },
] as const;

const AMOUNT_OPTIONS = [
  { value: 'none', label: 'None', description: 'No mucus observed' },
  { value: 'light', label: 'Light', description: 'Small amount' },
  { value: 'moderate', label: 'Moderate', description: 'Noticeable amount' },
  { value: 'heavy', label: 'Heavy', description: 'Abundant amount' },
] as const;

export default function CervicalMucusScreen() {
  const { cervicalMucusEntries, addCervicalMucusEntry, deleteCervicalMucusEntry } = useFertility();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedConsistency, setSelectedConsistency] = useState<CervicalMucusEntry['consistency']>('dry');
  const [selectedAmount, setSelectedAmount] = useState<CervicalMucusEntry['amount']>('none');
  const [notes, setNotes] = useState<string>('');

  const handleAddEntry = () => {
    // Check if entry already exists for this date
    const existingEntry = cervicalMucusEntries.find(entry => entry.date === selectedDate);
    if (existingEntry) {
      Alert.alert('Error', 'Cervical mucus entry already exists for this date');
      return;
    }

    addCervicalMucusEntry({
      date: selectedDate,
      consistency: selectedConsistency,
      amount: selectedAmount,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setSelectedConsistency('dry');
    setSelectedAmount('none');
    setNotes('');
    setShowModal(false);
  };

  const handleDeleteEntry = (entry: CervicalMucusEntry) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete the cervical mucus entry for ${new Date(entry.date).toLocaleDateString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCervicalMucusEntry(entry.id) },
      ]
    );
  };

  const getConsistencyInfo = (consistency: CervicalMucusEntry['consistency']) => {
    return CONSISTENCY_OPTIONS.find(option => option.value === consistency);
  };

  const getAmountInfo = (amount: CervicalMucusEntry['amount']) => {
    return AMOUNT_OPTIONS.find(option => option.value === amount);
  };

  const getFertilityScore = (consistency: CervicalMucusEntry['consistency']): number => {
    switch (consistency) {
      case 'egg-white': return 100;
      case 'watery': return 80;
      case 'creamy': return 60;
      case 'sticky': return 40;
      case 'dry': return 20;
      default: return 0;
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Cervical Mucus',
          headerStyle: { backgroundColor: '#06B6D4' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <ScrollView style={styles.container}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Droplets size={24} color="#06B6D4" />
            <Text style={styles.infoTitle}>Cervical Mucus Tracking</Text>
          </View>
          <Text style={styles.infoText}>
            Track your cervical mucus to identify fertile days. Egg-white consistency indicates peak fertility.
          </Text>
        </View>

        {/* Add Entry Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Log Cervical Mucus</Text>
        </TouchableOpacity>

        {/* Entries List */}
        <View style={styles.entriesContainer}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          
          {cervicalMucusEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Droplets size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No cervical mucus entries yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking to identify your fertile window
              </Text>
            </View>
          ) : (
            cervicalMucusEntries
              .slice()
              .reverse()
              .map((entry) => {
                const consistencyInfo = getConsistencyInfo(entry.consistency);
                const amountInfo = getAmountInfo(entry.amount);
                const fertilityScore = getFertilityScore(entry.consistency);
                
                return (
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
                      <View style={[
                        styles.fertilityBadge,
                        { backgroundColor: fertilityScore > 70 ? '#10B981' : fertilityScore > 40 ? '#F59E0B' : '#6B7280' }
                      ]}>
                        <Text style={styles.fertilityBadgeText}>
                          {fertilityScore > 70 ? 'High' : fertilityScore > 40 ? 'Medium' : 'Low'} Fertility
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.entryContent}>
                      <View style={styles.entryRow}>
                        <View style={[
                          styles.consistencyChip,
                          { backgroundColor: consistencyInfo?.color + '20' }
                        ]}>
                          <Text style={[
                            styles.consistencyText,
                            { color: consistencyInfo?.color }
                          ]}>
                            {consistencyInfo?.label}
                          </Text>
                        </View>
                        
                        <View style={styles.amountChip}>
                          <Text style={styles.amountText}>
                            {amountInfo?.label} Amount
                          </Text>
                        </View>
                      </View>
                      
                      {entry.notes && (
                        <Text style={styles.entryNotes}>{entry.notes}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
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
            <Text style={styles.modalTitle}>Log Cervical Mucus</Text>
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
                testID="mucus-date-input"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Consistency</Text>
              <View style={styles.optionsContainer}>
                {CONSISTENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      selectedConsistency === option.value && styles.optionButtonSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => setSelectedConsistency(option.value)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      selectedConsistency === option.value && { color: option.color }
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount</Text>
              <View style={styles.optionsContainer}>
                {AMOUNT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      selectedAmount === option.value && styles.optionButtonSelected
                    ]}
                    onPress={() => setSelectedAmount(option.value)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      selectedAmount === option.value && { color: '#06B6D4' }
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional observations..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                testID="mucus-notes-input"
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
  infoCard: {
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#06B6D4',
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
    alignItems: 'center',
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
  fertilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fertilityBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  entryContent: {
    gap: 8,
  },
  entryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  consistencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  consistencyText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  amountChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  amountText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
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
    color: '#06B6D4',
    fontWeight: '600' as const,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  optionButtonSelected: {
    borderWidth: 2,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
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