import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, Clock, Star, Trash2, Edit3 } from 'lucide-react-native';
import { useSleep } from '@/hooks/useSleep';
import { SleepEntry, SLEEP_QUALITY_LABELS } from '@/types/sleep';
import SleepEntryModal from '@/components/SleepEntryModal';

export default function SleepHistoryScreen() {
  const {
    sleepEntries,
    isLoading,
    updateSleepEntry,
    deleteSleepEntry,
    isUpdatingEntry,
    isDeletingEntry,
  } = useSleep();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<SleepEntry | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  const handleEditEntry = (entry: SleepEntry) => {
    setSelectedEntry(entry);
    setModalVisible(true);
  };

  const handleDeleteEntry = (entry: SleepEntry) => {
    Alert.alert(
      'Delete Sleep Entry',
      'Are you sure you want to delete this sleep entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSleepEntry(entry.id),
        },
      ]
    );
  };

  const handleUpdateEntry = (entryData: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedEntry) {
      updateSleepEntry({
        id: selectedEntry.id,
        updates: entryData,
      });
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 4) return '#4CAF50';
    if (quality >= 3) return '#FFC107';
    return '#FF5722';
  };

  const filteredEntries = sleepEntries.filter(entry =>
    entry.date.startsWith(selectedMonth)
  );

  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const week = getWeekOfMonth(new Date(entry.date));
    if (!groups[week]) groups[week] = [];
    groups[week].push(entry);
    return groups;
  }, {} as Record<string, SleepEntry[]>);

  function getWeekOfMonth(date: Date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekday = firstDay.getDay();
    const offsetDate = date.getDate() + firstWeekday - 1;
    return Math.floor(offsetDate / 7) + 1;
  }

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthString = date.toISOString().slice(0, 7);
      const displayString = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      options.push({ value: monthString, label: displayString });
    }
    return options;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading sleep history...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Sleep History' }} />
      
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthSelector}
          >
            {generateMonthOptions().map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.monthButton,
                  selectedMonth === option.value && styles.monthButtonActive,
                ]}
                onPress={() => setSelectedMonth(option.value)}
              >
                <Text
                  style={[
                    styles.monthButtonText,
                    selectedMonth === option.value && styles.monthButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredEntries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Calendar size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>No sleep entries</Text>
              <Text style={styles.emptyText}>
                No sleep entries found for {selectedMonth}
              </Text>
            </View>
          ) : (
            <View style={styles.entriesContainer}>
              {Object.entries(groupedEntries)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([week, entries]) => (
                  <View key={week} style={styles.weekSection}>
                    <Text style={styles.weekTitle}>Week {week}</Text>
                    
                    {entries
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry) => (
                        <View key={entry.id} style={styles.entryCard}>
                          <View style={styles.entryHeader}>
                            <View style={styles.entryDateContainer}>
                              <Text style={styles.entryDate}>
                                {new Date(entry.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </Text>
                              <View style={styles.qualityBadge}>
                                <Star
                                  size={14}
                                  color={getQualityColor(entry.quality)}
                                  fill={getQualityColor(entry.quality)}
                                />
                                <Text style={[
                                  styles.qualityText,
                                  { color: getQualityColor(entry.quality) }
                                ]}>
                                  {entry.quality}
                                </Text>
                              </View>
                            </View>
                            
                            <View style={styles.entryActions}>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleEditEntry(entry)}
                                disabled={isUpdatingEntry}
                              >
                                <Edit3 size={16} color="#4A90E2" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleDeleteEntry(entry)}
                                disabled={isDeletingEntry}
                              >
                                <Trash2 size={16} color="#FF5722" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          <View style={styles.entryDetails}>
                            <View style={styles.timeInfo}>
                              <Clock size={16} color="#666" />
                              <Text style={styles.timeText}>
                                {formatTime(entry.bedTime)} - {formatTime(entry.wakeTime)}
                              </Text>
                            </View>
                            <Text style={styles.durationText}>
                              {formatDuration(entry.duration)}
                            </Text>
                          </View>
                          
                          <Text style={styles.qualityLabel}>
                            {SLEEP_QUALITY_LABELS[entry.quality as keyof typeof SLEEP_QUALITY_LABELS]}
                          </Text>
                          
                          {entry.notes && (
                            <Text style={styles.notesText} numberOfLines={3}>
                              {entry.notes}
                            </Text>
                          )}
                        </View>
                      ))}
                  </View>
                ))}
            </View>
          )}
        </ScrollView>
      </View>

      <SleepEntryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleUpdateEntry}
        entry={selectedEntry}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthSelector: {
    paddingHorizontal: 16,
    gap: 8,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    minWidth: 120,
    alignItems: 'center',
  },
  monthButtonActive: {
    backgroundColor: '#4A90E2',
  },
  monthButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  monthButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  entriesContainer: {
    padding: 16,
  },
  weekSection: {
    marginBottom: 24,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  qualityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});