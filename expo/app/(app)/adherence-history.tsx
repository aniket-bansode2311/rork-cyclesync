import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, CheckCircle, XCircle, TrendingUp, Filter } from 'lucide-react-native';
import { useBirthControl } from '@/hooks/useBirthControl';
import { BirthControlReminder } from '@/types/birthControl';
import colors from '@/constants/colors';

export default function AdherenceHistoryScreen() {
  const { settings, getAdherenceStats } = useBirthControl();
  const [selectedReminder, setSelectedReminder] = useState<string | null>(
    settings.reminders.length > 0 ? settings.reminders[0].id : null
  );
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);

  const currentReminder = settings.reminders.find(r => r.id === selectedReminder);
  const adherenceStats = selectedReminder ? getAdherenceStats(selectedReminder, selectedPeriod) : null;

  const getMethodLabel = (reminder: BirthControlReminder) => {
    return reminder.customName || reminder.method.charAt(0).toUpperCase() + reminder.method.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return colors.green;
    if (rate >= 70) return colors.yellow;
    return colors.red;
  };

  const getAdherenceLabel = (rate: number) => {
    if (rate >= 90) return 'Excellent';
    if (rate >= 70) return 'Good';
    if (rate >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  if (settings.reminders.length === 0) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: 'Adherence History',
            headerStyle: { backgroundColor: colors.purple[600] },
            headerTintColor: 'white',
          }} 
        />
        <View style={styles.emptyContainer}>
          <Calendar size={64} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>No Reminders Found</Text>
          <Text style={styles.emptySubtitle}>
            Create a reminder to start tracking your adherence history.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Adherence History',
          headerStyle: { backgroundColor: colors.purple[600] },
          headerTintColor: 'white',
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Filter size={20} color={colors.purple[600]} />
            <Text style={styles.sectionTitle}>Filters</Text>
          </View>
          
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Reminder:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reminderScroll}>
              {settings.reminders.map((reminder) => (
                <TouchableOpacity
                  key={reminder.id}
                  style={[
                    styles.reminderChip,
                    selectedReminder === reminder.id && styles.reminderChipSelected,
                  ]}
                  onPress={() => setSelectedReminder(reminder.id)}
                  testID={`reminder-filter-${reminder.id}`}
                >
                  <Text style={[
                    styles.reminderChipText,
                    selectedReminder === reminder.id && styles.reminderChipTextSelected,
                  ]}>
                    {getMethodLabel(reminder)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Period:</Text>
            <View style={styles.periodButtons}>
              {[7, 30, 90].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.periodButton,
                    selectedPeriod === days && styles.periodButtonSelected,
                  ]}
                  onPress={() => setSelectedPeriod(days)}
                  testID={`period-${days}`}
                >
                  <Text style={[
                    styles.periodButtonText,
                    selectedPeriod === days && styles.periodButtonTextSelected,
                  ]}>
                    {days}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {adherenceStats && currentReminder && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={colors.purple[600]} />
                <Text style={styles.sectionTitle}>Overview</Text>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{adherenceStats.adherenceRate}%</Text>
                  <Text style={[
                    styles.statLabel,
                    { color: getAdherenceColor(adherenceStats.adherenceRate) }
                  ]}>
                    {getAdherenceLabel(adherenceStats.adherenceRate)}
                  </Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{adherenceStats.takenCount}</Text>
                  <Text style={styles.statLabel}>Taken</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{adherenceStats.totalCount - adherenceStats.takenCount}</Text>
                  <Text style={styles.statLabel}>Missed</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{adherenceStats.totalCount}</Text>
                  <Text style={styles.statLabel}>Total Days</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${adherenceStats.adherenceRate}%`,
                      backgroundColor: getAdherenceColor(adherenceStats.adherenceRate)
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color={colors.purple[600]} />
                <Text style={styles.sectionTitle}>Daily Log</Text>
              </View>
              
              {adherenceStats.logs.length === 0 ? (
                <View style={styles.emptyLogs}>
                  <Text style={styles.emptyLogsText}>
                    No logs found for the selected period.
                  </Text>
                </View>
              ) : (
                <View style={styles.logsList}>
                  {adherenceStats.logs
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((log) => (
                      <View key={log.id} style={styles.logItem}>
                        <View style={styles.logDate}>
                          <Text style={styles.logDateText}>{formatDate(log.date)}</Text>
                        </View>
                        
                        <View style={styles.logStatus}>
                          {log.taken ? (
                            <CheckCircle size={20} color={colors.green[600]} />
                          ) : (
                            <XCircle size={20} color={colors.red[600]} />
                          )}
                          <Text style={[
                            styles.logStatusText,
                            { color: log.taken ? colors.green[600] : colors.red[600] }
                          ]}>
                            {log.taken ? 'Taken' : 'Missed'}
                          </Text>
                        </View>
                        
                        {log.takenAt && (
                          <Text style={styles.logTime}>
                            {new Date(log.takenAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        )}
                        
                        {log.notes && (
                          <Text style={styles.logNotes}>{log.notes}</Text>
                        )}
                      </View>
                    ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.gray[50],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.gray[900],
    marginLeft: 8,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.gray[700],
    marginBottom: 8,
  },
  reminderScroll: {
    flexGrow: 0,
  },
  reminderChip: {
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reminderChipSelected: {
    backgroundColor: colors.purple[50],
    borderColor: colors.purple[600],
  },
  reminderChipText: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500' as const,
  },
  reminderChipTextSelected: {
    color: colors.purple[700],
    fontWeight: '600' as const,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodButtonSelected: {
    backgroundColor: colors.purple[50],
    borderColor: colors.purple[600],
  },
  periodButtonText: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500' as const,
  },
  periodButtonTextSelected: {
    color: colors.purple[700],
    fontWeight: '600' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.gray[900],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.gray[600],
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyLogs: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyLogsText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  logsList: {
    gap: 12,
  },
  logItem: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.gray[300],
  },
  logDate: {
    marginBottom: 8,
  },
  logDateText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.gray[900],
  },
  logStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logStatusText: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginLeft: 8,
  },
  logTime: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 4,
  },
  logNotes: {
    fontSize: 12,
    color: colors.gray[600],
    fontStyle: 'italic' as const,
  },
});