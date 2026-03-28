import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Clock, Bell, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react-native';
import { useBirthControlContext } from '@/components/BirthControlProvider';
import { BIRTH_CONTROL_METHODS, BirthControlReminder } from '@/types/birthControl';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';

export default function BirthControlScreen() {
  const { settings, isLoading, toggleNotifications, deleteReminder, logAdherence, getLogForDate } = useBirthControlContext();
  const [selectedReminder, setSelectedReminder] = useState<BirthControlReminder | null>(null);

  const handleDeleteReminder = (reminder: BirthControlReminder) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete the ${reminder.customName || getMethodLabel(reminder.method)} reminder?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReminder(reminder.id),
        },
      ]
    );
  };

  const handleLogAdherence = async (reminder: BirthControlReminder, taken: boolean) => {
    try {
      await logAdherence(reminder.id, taken);
      Alert.alert(
        'Logged',
        taken ? 'Marked as taken!' : 'Marked as missed.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to log adherence. Please try again.');
    }
  };

  const getMethodLabel = (method: string) => {
    const methodInfo = BIRTH_CONTROL_METHODS.find(m => m.value === method);
    return methodInfo?.label || method;
  };

  const getTodayLog = (reminder: BirthControlReminder) => {
    const today = new Date().toISOString().split('T')[0];
    return getLogForDate(reminder.id, today);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Every 3 months';
      default: return frequency;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Birth Control',
          headerStyle: { backgroundColor: colors.purple[600] },
          headerTintColor: 'white',
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Birth Control Reminders</Text>
            <Text style={styles.subtitle}>
              Stay on track with your birth control routine
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Bell size={20} color={colors.purple[600]} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.gray[300], true: colors.purple[200] }}
              thumbColor={settings.notificationsEnabled ? colors.purple[600] : colors.gray[400]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Reminders</Text>
            <Button
              title="Add Reminder"
              onPress={() => router.push('/add-reminder')}
              style={styles.addButton}
              testID="add-reminder-button"
            />
          </View>

          {settings.reminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Plus size={48} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>No Reminders Set</Text>
              <Text style={styles.emptySubtitle}>
                Add a reminder to stay on track with your birth control
              </Text>
            </View>
          ) : (
            settings.reminders.map((reminder) => {
              const todayLog = getTodayLog(reminder);
              return (
                <View key={reminder.id} style={styles.reminderCard}>
                  <View style={styles.reminderHeader}>
                    <View style={styles.reminderInfo}>
                      <Text style={styles.reminderName}>
                        {reminder.customName || getMethodLabel(reminder.method)}
                      </Text>
                      <View style={styles.reminderDetails}>
                        <Clock size={14} color={colors.gray[600]} />
                        <Text style={styles.reminderTime}>
                          {formatTime(reminder.time)} • {getFrequencyLabel(reminder.frequency)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.reminderActions}>
                      <TouchableOpacity
                        onPress={() => router.push(`/add-reminder?id=${reminder.id}`)}
                        style={styles.actionButton}
                        testID={`edit-reminder-${reminder.id}`}
                      >
                        <Edit3 size={16} color={colors.gray[600]} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteReminder(reminder)}
                        style={styles.actionButton}
                        testID={`delete-reminder-${reminder.id}`}
                      >
                        <Trash2 size={16} color={colors.red[600]} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {reminder.notes && (
                    <Text style={styles.reminderNotes}>{reminder.notes}</Text>
                  )}

                  <View style={styles.adherenceSection}>
                    <Text style={styles.adherenceTitle}>Today&apos;s Status</Text>
                    <View style={styles.adherenceButtons}>
                      <TouchableOpacity
                        onPress={() => handleLogAdherence(reminder, true)}
                        style={[
                          styles.adherenceButton,
                          styles.takenButton,
                          todayLog?.taken && styles.adherenceButtonActive,
                        ]}
                        testID={`log-taken-${reminder.id}`}
                      >
                        <CheckCircle 
                          size={16} 
                          color={todayLog?.taken ? 'white' : colors.green[600]} 
                        />
                        <Text style={[
                          styles.adherenceButtonText,
                          todayLog?.taken && styles.adherenceButtonTextActive,
                        ]}>
                          Taken
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => handleLogAdherence(reminder, false)}
                        style={[
                          styles.adherenceButton,
                          styles.missedButton,
                          todayLog && !todayLog.taken && styles.adherenceButtonActive,
                        ]}
                        testID={`log-missed-${reminder.id}`}
                      >
                        <XCircle 
                          size={16} 
                          color={todayLog && !todayLog.taken ? 'white' : colors.red[600]} 
                        />
                        <Text style={[
                          styles.adherenceButtonText,
                          todayLog && !todayLog.taken && styles.adherenceButtonTextActive,
                        ]}>
                          Missed
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    {todayLog && (
                      <Text style={styles.loggedTime}>
                        Logged at {new Date(todayLog.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Button
            title="View Adherence History"
            onPress={() => router.push('/adherence-history')}
            style={styles.historyButton}
            testID="view-history-button"
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  header: {
    backgroundColor: colors.purple[600],
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.purple[100],
    textAlign: 'center',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.gray[900],
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: colors.gray[900],
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  reminderCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.gray[900],
    marginBottom: 4,
  },
  reminderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTime: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
  },
  reminderActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  reminderNotes: {
    fontSize: 14,
    color: colors.gray[700],
    fontStyle: 'italic' as const,
    marginBottom: 12,
  },
  adherenceSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: 12,
  },
  adherenceTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.gray[900],
    marginBottom: 8,
  },
  adherenceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  adherenceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  takenButton: {
    borderColor: colors.green[600],
    backgroundColor: 'white',
  },
  missedButton: {
    borderColor: colors.red[600],
    backgroundColor: 'white',
  },
  adherenceButtonActive: {
    backgroundColor: colors.green[600],
  },
  adherenceButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginLeft: 4,
    color: colors.gray[700],
  },
  adherenceButtonTextActive: {
    color: 'white',
  },
  loggedTime: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
  },
  historyButton: {
    backgroundColor: colors.purple[100],
  },
});