import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, Filter, Trash2, TrendingUp } from 'lucide-react-native';

import colors from '@/constants/colors';
import { useSymptoms } from '@/hooks/useSymptoms';
import { usePeriods } from '@/hooks/usePeriods';
import { LoggedMood, LoggedSymptom, MoodType } from '@/types/symptoms';

const MOOD_EMOJIS: Record<MoodType, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  energetic: '⚡',
  irritable: '😤',
  calm: '😌',
  stressed: '😫',
  excited: '🤩',
};

export default function SymptomHistoryScreen() {
  const { loggedSymptoms, loggedMoods, deleteSymptom, deleteMood } = useSymptoms();
  const { periods } = usePeriods();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'symptoms' | 'moods'>('all');

  // Sort by date (most recent first)
  const sortedSymptoms = [...loggedSymptoms].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const sortedMoods = [...loggedMoods].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group by date
  const groupedData = React.useMemo(() => {
    const groups: { [date: string]: { symptoms: LoggedSymptom[]; moods: LoggedMood[] } } = {};
    
    sortedSymptoms.forEach(symptom => {
      const dateKey = symptom.date.split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { symptoms: [], moods: [] };
      }
      groups[dateKey].symptoms.push(symptom);
    });
    
    sortedMoods.forEach(mood => {
      const dateKey = mood.date.split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { symptoms: [], moods: [] };
      }
      groups[dateKey].moods.push(mood);
    });
    
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [sortedSymptoms, sortedMoods]);

  const getCyclePhase = (date: string) => {
    const targetDate = new Date(date);
    
    // Find the most recent period before or on this date
    const relevantPeriods = periods
      .filter(p => new Date(p.startDate) <= targetDate)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    if (relevantPeriods.length === 0) return null;
    
    const lastPeriod = relevantPeriods[0];
    const periodStart = new Date(lastPeriod.startDate);
    const daysSincePeriod = Math.floor((targetDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSincePeriod <= 5) return { phase: 'Menstrual', color: colors.error };
    if (daysSincePeriod <= 13) return { phase: 'Follicular', color: colors.success };
    if (daysSincePeriod <= 16) return { phase: 'Ovulation', color: colors.warning };
    return { phase: 'Luteal', color: colors.primary };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getIntensityColor = (intensity: string | number) => {
    if (typeof intensity === 'string') {
      switch (intensity) {
        case 'mild': return colors.success;
        case 'moderate': return colors.warning;
        case 'severe': return colors.error;
        default: return colors.gray[500];
      }
    } else {
      // Mood intensity (1-5)
      if (intensity <= 2) return colors.success;
      if (intensity <= 3) return colors.warning;
      return colors.error;
    }
  };

  const renderSymptom = (symptom: LoggedSymptom) => (
    <View key={symptom.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{symptom.symptomName}</Text>
          <View style={styles.itemMeta}>
            <View style={[
              styles.intensityBadge,
              { backgroundColor: getIntensityColor(symptom.intensity) }
            ]}>
              <Text style={styles.intensityText}>
                {symptom.intensity.charAt(0).toUpperCase() + symptom.intensity.slice(1)}
              </Text>
            </View>
            {symptom.isCustom && (
              <View style={styles.customBadge}>
                <Text style={styles.customText}>Custom</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteSymptom(symptom.id)}
        >
          <Trash2 size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
      {symptom.notes && (
        <Text style={styles.itemNotes}>{symptom.notes}</Text>
      )}
    </View>
  );

  const renderMood = (mood: LoggedMood) => (
    <View key={mood.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <View style={styles.moodHeader}>
            <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood.mood]}</Text>
            <Text style={styles.itemName}>
              {mood.mood.charAt(0).toUpperCase() + mood.mood.slice(1)}
            </Text>
          </View>
          <View style={styles.itemMeta}>
            <View style={[
              styles.intensityBadge,
              { backgroundColor: getIntensityColor(mood.intensity) }
            ]}>
              <Text style={styles.intensityText}>
                {mood.intensity}/5
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteMood(mood.id)}
        >
          <Trash2 size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
      {mood.notes && (
        <Text style={styles.itemNotes}>{mood.notes}</Text>
      )}
    </View>
  );

  const filteredData = groupedData.filter(([_, data]) => {
    if (selectedFilter === 'symptoms') return data.symptoms.length > 0;
    if (selectedFilter === 'moods') return data.moods.length > 0;
    return true;
  });

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Symptom & Mood History",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }} 
      />
      <SafeAreaView style={styles.container}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <View style={styles.filterTabs}>
            {[
              { key: 'all', label: 'All', icon: TrendingUp },
              { key: 'symptoms', label: 'Symptoms', icon: Calendar },
              { key: 'moods', label: 'Moods', icon: Filter },
            ].map(({ key, label, icon: Icon }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterTab,
                  selectedFilter === key && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(key as typeof selectedFilter)}
              >
                <Icon 
                  size={16} 
                  color={selectedFilter === key ? colors.white : colors.gray[600]} 
                />
                <Text style={[
                  styles.filterTabText,
                  selectedFilter === key && styles.filterTabTextActive,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No {selectedFilter === 'all' ? 'data' : selectedFilter} logged yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your symptoms and moods to see patterns over time
              </Text>
            </View>
          ) : (
            filteredData.map(([date, data]) => {
              const cyclePhase = getCyclePhase(date);
              const shouldShowSymptoms = selectedFilter === 'all' || selectedFilter === 'symptoms';
              const shouldShowMoods = selectedFilter === 'all' || selectedFilter === 'moods';
              
              return (
                <View key={date} style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <View style={styles.dateInfo}>
                      <Text style={styles.dateText}>{formatDate(date)}</Text>
                      {cyclePhase && (
                        <View style={[
                          styles.phaseIndicator,
                          { backgroundColor: cyclePhase.color + '20', borderColor: cyclePhase.color }
                        ]}>
                          <Text style={[styles.phaseText, { color: cyclePhase.color }]}>
                            {cyclePhase.phase}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.dateContent}>
                    {shouldShowSymptoms && data.symptoms.map(renderSymptom)}
                    {shouldShowMoods && data.moods.map(renderMood)}
                  </View>
                </View>
              );
            })
          )}
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
  filterContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
  },
  filterTabTextActive: {
    color: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    marginBottom: 12,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  phaseIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  phaseText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateContent: {
    gap: 8,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  moodEmoji: {
    fontSize: 20,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
  },
  customBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  customText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[600],
  },
  deleteButton: {
    padding: 4,
  },
  itemNotes: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 8,
    fontStyle: 'italic',
  },
});