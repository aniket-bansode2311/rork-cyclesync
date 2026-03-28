import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { X, Calendar as CalendarIcon } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Button } from '@/components/Button';
import { PeriodCalendar } from '@/components/PeriodCalendar';
import { Period } from '@/types/period';

interface PeriodModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (period: Omit<Period, 'id'>) => void;
  periods: Period[];
  editingPeriod?: Period;
}

export function PeriodModal({ 
  visible, 
  onClose, 
  onSave, 
  periods, 
  editingPeriod 
}: PeriodModalProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectingDate, setSelectingDate] = useState<'start' | 'end'>('start');

  useEffect(() => {
    if (editingPeriod) {
      setStartDate(editingPeriod.startDate);
      setEndDate(editingPeriod.endDate || '');
      setNotes(editingPeriod.notes || '');
    } else {
      // Reset form for new period
      setStartDate('');
      setEndDate('');
      setNotes('');
    }
  }, [editingPeriod, visible]);

  const handleDateSelect = (date: string) => {
    if (selectingDate === 'start') {
      setStartDate(date);
      // If end date is before start date, clear it
      if (endDate && new Date(endDate) < new Date(date)) {
        setEndDate('');
      }
    } else {
      // Only allow end date if it's after start date
      if (startDate && new Date(date) >= new Date(startDate)) {
        setEndDate(date);
      } else {
        Alert.alert('Invalid Date', 'End date must be after start date');
        return;
      }
    }
    setShowCalendar(false);
  };

  const handleSave = () => {
    if (!startDate) {
      Alert.alert('Missing Information', 'Please select a start date');
      return;
    }

    // Check for overlapping periods (excluding the period being edited)
    const overlappingPeriod = periods.find(period => {
      if (editingPeriod && period.id === editingPeriod.id) {
        return false;
      }
      
      const periodStart = new Date(period.startDate);
      const periodEnd = period.endDate ? new Date(period.endDate) : periodStart;
      const newStart = new Date(startDate);
      const newEnd = endDate ? new Date(endDate) : newStart;

      return (newStart <= periodEnd && newEnd >= periodStart);
    });

    if (overlappingPeriod) {
      Alert.alert(
        'Overlapping Period', 
        'This period overlaps with an existing period. Please choose different dates.'
      );
      return;
    }

    onSave({
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setStartDate('');
    setEndDate('');
    setNotes('');
    onClose();
  };

  const openCalendar = (dateType: 'start' | 'end') => {
    setSelectingDate(dateType);
    setShowCalendar(true);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Select date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {editingPeriod ? 'Edit Period' : 'Add Period'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>

        {showCalendar ? (
          <View style={styles.calendarContainer}>
            <Text style={styles.calendarTitle}>
              Select {selectingDate === 'start' ? 'Start' : 'End'} Date
            </Text>
            <PeriodCalendar
              periods={periods}
              onDateSelect={handleDateSelect}
              selectedDate={selectingDate === 'start' ? startDate : endDate}
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowCalendar(false)}
              style={styles.cancelButton}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.dateSection}>
              <Text style={styles.label}>Start Date *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => openCalendar('start')}
              >
                <CalendarIcon size={20} color={colors.gray[600]} />
                <Text style={[
                  styles.dateText,
                  !startDate && styles.placeholderText
                ]}>
                  {formatDisplayDate(startDate)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateSection}>
              <Text style={styles.label}>End Date (Optional)</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  !startDate && styles.disabledButton
                ]}
                onPress={() => openCalendar('end')}
                disabled={!startDate}
              >
                <CalendarIcon size={20} color={colors.gray[600]} />
                <Text style={[
                  styles.dateText,
                  !endDate && styles.placeholderText
                ]}>
                  {formatDisplayDate(endDate)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this period..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={onClose}
                style={styles.button}
              />
              <Button
                title={editingPeriod ? 'Update' : 'Save'}
                onPress={handleSave}
                style={styles.button}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
  closeButton: {
    padding: 4,
  },
  calendarContainer: {
    flex: 1,
    padding: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 20,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  dateSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  dateText: {
    fontSize: 16,
    color: colors.black,
  },
  placeholderText: {
    color: colors.gray[500],
  },
  notesSection: {
    marginBottom: 32,
  },
  notesInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.black,
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});