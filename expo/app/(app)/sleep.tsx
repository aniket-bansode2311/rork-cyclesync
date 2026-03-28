import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Moon, Clock, Star, TrendingUp, History } from 'lucide-react-native';
import { useSleep } from '@/hooks/useSleep';
import { SleepEntry, SLEEP_QUALITY_LABELS } from '@/types/sleep';
import SleepEntryModal from '@/components/SleepEntryModal';
import SleepChart from '@/components/SleepChart';

export default function SleepScreen() {
  const router = useRouter();
  const {
    sleepEntries,
    sleepStats,
    sleepTrends,
    isLoading,
    addSleepEntry,
    isAddingEntry,
  } = useSleep();

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<SleepEntry | undefined>();

  const handleAddEntry = () => {
    setSelectedEntry(undefined);
    setModalVisible(true);
  };

  const handleEditEntry = (entry: SleepEntry) => {
    setSelectedEntry(entry);
    setModalVisible(true);
  };

  const handleSaveEntry = (entryData: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    addSleepEntry(entryData);
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

  const recentEntries = sleepEntries.slice(0, 7);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading sleep data...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Sleep Tracking',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={() => router.push('/(app)/sleep-history')} 
                style={styles.headerButton}
              >
                <History size={24} color="#4A90E2" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddEntry} style={styles.headerButton}>
                <Plus size={24} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {sleepStats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Sleep Overview</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Moon size={24} color="#4A90E2" />
                <Text style={styles.statValue}>
                  {formatDuration(sleepStats.averageDuration)}
                </Text>
                <Text style={styles.statLabel}>Avg Duration</Text>
              </View>
              
              <View style={styles.statCard}>
                <Star size={24} color="#FFD700" />
                <Text style={styles.statValue}>
                  {sleepStats.averageQuality.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Avg Quality</Text>
              </View>
              
              <View style={styles.statCard}>
                <TrendingUp size={24} color="#4CAF50" />
                <Text style={styles.statValue}>{sleepStats.totalEntries}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </View>
            </View>
          </View>
        )}

        {sleepTrends.length > 0 && (
          <>
            <SleepChart data={sleepTrends} type="duration" />
            <SleepChart data={sleepTrends} type="quality" />
          </>
        )}

        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Sleep Entries</Text>
          
          {recentEntries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Moon size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>No sleep entries yet</Text>
              <Text style={styles.emptyText}>
                Start tracking your sleep to see insights and trends
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddEntry}>
                <Text style={styles.emptyButtonText}>Add First Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.entriesList}>
              {recentEntries.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.entryCard}
                  onPress={() => handleEditEntry(entry)}
                >
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <View style={styles.qualityBadge}>
                      <Star
                        size={16}
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
                    <Text style={styles.notesText} numberOfLines={2}>
                      {entry.notes}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <SleepEntryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEntry}
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recentContainer: {
    margin: 16,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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