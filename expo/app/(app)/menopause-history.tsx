import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert
} from "react-native";
import { 
  Calendar, 
  Activity, 
  TrendingUp, 
  Filter,
  Trash2,
  Edit3
} from "lucide-react-native";

import colors from "@/constants/colors";
import { useMenopause } from "@/hooks/useMenopause";
import { MenopauseSymptom, IrregularPeriod } from "@/types/menopause";

type FilterType = 'all' | 'symptoms' | 'periods';

export default function MenopauseHistoryScreen() {
  const { 
    symptoms, 
    irregularPeriods, 
    deleteSymptom, 
    deleteIrregularPeriod,
    menopauseMode 
  } = useMenopause();
  
  const [filter, setFilter] = useState<FilterType>('all');

  if (!menopauseMode.isActive) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: "Menopause History",
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTintColor: colors.black,
          }} 
        />
        <SafeAreaView style={styles.container}>
          <View style={styles.inactiveContainer}>
            <TrendingUp size={48} color={colors.gray[400]} />
            <Text style={styles.inactiveTitle}>Menopause Mode Required</Text>
            <Text style={styles.inactiveDescription}>
              Please activate Menopause Mode to view your tracking history.
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const handleDeleteSymptom = (symptom: MenopauseSymptom) => {
    Alert.alert(
      "Delete Symptom",
      `Are you sure you want to delete this ${symptom.symptom} entry?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteSymptom(symptom.id)
        }
      ]
    );
  };

  const handleDeletePeriod = (period: IrregularPeriod) => {
    Alert.alert(
      "Delete Period Entry",
      "Are you sure you want to delete this period entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteIrregularPeriod(period.id)
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'severe': return '#FF6B6B';
      case 'moderate': return '#FFB366';
      case 'mild': return '#66D9EF';
      default: return colors.gray[400];
    }
  };

  const getPeriodTypeColor = (type: string) => {
    switch (type) {
      case 'normal': return '#FF6B6B';
      case 'light': return '#FFB3B3';
      case 'heavy': return '#CC0000';
      case 'spotting': return '#FF9999';
      case 'skipped': return '#999999';
      default: return colors.gray[400];
    }
  };

  // Combine and sort all entries
  const allEntries = [
    ...symptoms.map(s => ({ ...s, entryType: 'symptom' as const })),
    ...irregularPeriods.map(p => ({ ...p, entryType: 'period' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter entries
  const filteredEntries = allEntries.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'symptoms') return entry.entryType === 'symptom';
    if (filter === 'periods') return entry.entryType === 'period';
    return true;
  });

  return (
    <>
      <Stack.Screen 
        options={{
          title: "History & Trends",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }} 
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <View style={styles.filterTabs}>
              <TouchableOpacity
                style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
                onPress={() => setFilter('all')}
                testID="filter-all"
              >
                <Filter size={16} color={filter === 'all' ? colors.white : colors.gray[600]} />
                <Text style={[
                  styles.filterTabText,
                  filter === 'all' && styles.activeFilterTabText
                ]}>
                  All ({allEntries.length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterTab, filter === 'symptoms' && styles.activeFilterTab]}
                onPress={() => setFilter('symptoms')}
                testID="filter-symptoms"
              >
                <Activity size={16} color={filter === 'symptoms' ? colors.white : colors.gray[600]} />
                <Text style={[
                  styles.filterTabText,
                  filter === 'symptoms' && styles.activeFilterTabText
                ]}>
                  Symptoms ({symptoms.length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterTab, filter === 'periods' && styles.activeFilterTab]}
                onPress={() => setFilter('periods')}
                testID="filter-periods"
              >
                <Calendar size={16} color={filter === 'periods' ? colors.white : colors.gray[600]} />
                <Text style={[
                  styles.filterTabText,
                  filter === 'periods' && styles.activeFilterTabText
                ]}>
                  Periods ({irregularPeriods.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Entries List */}
          <ScrollView style={styles.entriesList} showsVerticalScrollIndicator={false}>
            {filteredEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <TrendingUp size={48} color={colors.gray[400]} />
                <Text style={styles.emptyStateTitle}>No entries yet</Text>
                <Text style={styles.emptyStateDescription}>
                  Start tracking your symptoms and periods to see your history here.
                </Text>
              </View>
            ) : (
              filteredEntries.map((entry) => (
                <View key={`${entry.entryType}-${entry.id}`} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryInfo}>
                      <View style={styles.entryTitleRow}>
                        {entry.entryType === 'symptom' ? (
                          <Activity size={16} color={colors.primary} />
                        ) : (
                          <Calendar size={16} color={colors.primary} />
                        )}
                        <Text style={styles.entryTitle}>
                          {entry.entryType === 'symptom' 
                            ? (entry as MenopauseSymptom & { entryType: 'symptom' }).symptom
                            : `${(entry as IrregularPeriod & { entryType: 'period' }).type.charAt(0).toUpperCase() + (entry as IrregularPeriod & { entryType: 'period' }).type.slice(1)} Period`
                          }
                        </Text>
                      </View>
                      <Text style={styles.entryDate}>
                        {formatDate(entry.date)}
                      </Text>
                    </View>
                    
                    <View style={styles.entryActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          if (entry.entryType === 'symptom') {
                            handleDeleteSymptom(entry as MenopauseSymptom & { entryType: 'symptom' });
                          } else {
                            handleDeletePeriod(entry as IrregularPeriod & { entryType: 'period' });
                          }
                        }}
                        testID={`delete-${entry.entryType}-${entry.id}`}
                      >
                        <Trash2 size={16} color={colors.gray[500]} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Entry Details */}
                  <View style={styles.entryDetails}>
                    {entry.entryType === 'symptom' ? (
                      <View style={styles.symptomDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Intensity:</Text>
                          <View style={styles.intensityBadge}>
                            <View style={[
                              styles.intensityIndicator,
                              { backgroundColor: getIntensityColor((entry as MenopauseSymptom & { entryType: 'symptom' }).intensity) }
                            ]} />
                            <Text style={styles.detailValue}>
                              {(entry as MenopauseSymptom & { entryType: 'symptom' }).intensity.charAt(0).toUpperCase() + (entry as MenopauseSymptom & { entryType: 'symptom' }).intensity.slice(1)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Frequency:</Text>
                          <Text style={styles.detailValue}>
                            {(entry as MenopauseSymptom & { entryType: 'symptom' }).frequency.charAt(0).toUpperCase() + (entry as MenopauseSymptom & { entryType: 'symptom' }).frequency.slice(1)}
                          </Text>
                        </View>
                        {(entry as MenopauseSymptom & { entryType: 'symptom' }).notes && (
                          <View style={styles.notesContainer}>
                            <Text style={styles.detailLabel}>Notes:</Text>
                            <Text style={styles.notesText}>
                              {(entry as MenopauseSymptom & { entryType: 'symptom' }).notes}
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View style={styles.periodDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Type:</Text>
                          <View style={styles.periodTypeBadge}>
                            <View style={[
                              styles.periodTypeIndicator,
                              { backgroundColor: getPeriodTypeColor((entry as IrregularPeriod & { entryType: 'period' }).type) }
                            ]} />
                            <Text style={styles.detailValue}>
                              {(entry as IrregularPeriod & { entryType: 'period' }).type.charAt(0).toUpperCase() + (entry as IrregularPeriod & { entryType: 'period' }).type.slice(1)}
                            </Text>
                          </View>
                        </View>
                        {(entry as IrregularPeriod & { entryType: 'period' }).duration && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Duration:</Text>
                            <Text style={styles.detailValue}>
                              {(entry as IrregularPeriod & { entryType: 'period' }).duration} days
                            </Text>
                          </View>
                        )}
                        {(entry as IrregularPeriod & { entryType: 'period' }).notes && (
                          <View style={styles.notesContainer}>
                            <Text style={styles.detailLabel}>Notes:</Text>
                            <Text style={styles.notesText}>
                              {(entry as IrregularPeriod & { entryType: 'period' }).notes}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: colors.white,
  },
  entriesList: {
    flex: 1,
    padding: 20,
  },
  entryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  entryDate: {
    fontSize: 14,
    color: colors.gray[600],
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  entryDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  symptomDetails: {
    gap: 8,
  },
  periodDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: colors.black,
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  intensityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  periodTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  periodTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notesContainer: {
    marginTop: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 18,
    marginTop: 4,
    paddingLeft: 88,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  inactiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  inactiveTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  inactiveDescription: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
});