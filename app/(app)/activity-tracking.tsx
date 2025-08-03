import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Activity, Plus, Trash2, Clock, Target, Timer, Zap } from 'lucide-react-native';

import { Button } from '@/components/Button';
import colors from '@/constants/colors';
import { useWellness } from '@/hooks/useWellness';
import { ACTIVITY_TYPES } from '@/types/wellness';

export default function ActivityTrackingScreen() {
  const { 
    todaySummary, 
    settings, 
    addActivity, 
    deleteActivity,
    getProgress 
  } = useWellness();
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('Walking');
  const [duration, setDuration] = useState<string>('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const progress = getProgress();

  const handleAddActivity = async () => {
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid duration in minutes.');
      return;
    }

    try {
      setIsLoading(true);
      const now = new Date();
      await addActivity({
        date: now.toISOString().split('T')[0],
        type: selectedType,
        duration: durationNum,
        intensity,
        notes: notes.trim() || undefined,
        time: now.toTimeString().split(' ')[0],
      });
      
      // Reset form
      setDuration('');
      setNotes('');
      setShowModal(false);
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert('Error', 'Failed to log activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteActivity(id);
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Failed to delete activity. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return colors.success;
      case 'moderate':
        return colors.warning;
      case 'high':
        return colors.error;
      default:
        return colors.gray[500];
    }
  };

  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return <Zap size={14} color={colors.success} />;
      case 'moderate':
        return <Zap size={14} color={colors.warning} />;
      case 'high':
        return <Zap size={14} color={colors.error} />;
      default:
        return <Zap size={14} color={colors.gray[500]} />;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Activity Tracking',
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Activity size={24} color={colors.secondary} />
              <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(progress.activity, 100)}%`,
                      backgroundColor: colors.secondary 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {progress.activity.toFixed(0)}%
              </Text>
            </View>
            
            <View style={styles.progressStats}>
              <Text style={styles.progressValue}>
                {todaySummary.totalActivityDuration} / {settings.activityGoal}
              </Text>
              <Text style={styles.progressUnit}>minutes</Text>
            </View>
          </View>

          {/* Add Activity Button */}
          <View style={styles.section}>
            <Button
              title="Log Activity"
              onPress={() => setShowModal(true)}
              leftIcon={<Plus size={20} color={colors.white} />}
              style={styles.addButton}
              testID="add-activity-button"
            />
          </View>

          {/* Today's Activities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today&apos;s Activities</Text>
              <View style={styles.activitiesCount}>
                <Target size={16} color={colors.gray[600]} />
                <Text style={styles.activitiesCountText}>
                  {todaySummary.totalActivities} activities
                </Text>
              </View>
            </View>
            
            {todaySummary.activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Activity size={48} color={colors.gray[400]} />
                <Text style={styles.emptyStateText}>No activities logged today</Text>
                <Text style={styles.emptyStateSubtext}>
                  Tap the &quot;Log Activity&quot; button to start tracking your physical activities
                </Text>
              </View>
            ) : (
              <View style={styles.activitiesList}>
                {todaySummary.activities
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((activity) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <View style={styles.activityInfo}>
                        <View style={styles.activityHeader}>
                          <Activity size={20} color={colors.secondary} />
                          <Text style={styles.activityType}>{activity.type}</Text>
                          <View style={styles.intensityBadge}>
                            {getIntensityIcon(activity.intensity)}
                            <Text style={[styles.intensityText, { color: getIntensityColor(activity.intensity) }]}>
                              {activity.intensity}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.activityDetails}>
                          <View style={styles.activityDuration}>
                            <Timer size={14} color={colors.gray[500]} />
                            <Text style={styles.activityDurationText}>
                              {activity.duration} min
                            </Text>
                          </View>
                          <View style={styles.activityTime}>
                            <Clock size={14} color={colors.gray[500]} />
                            <Text style={styles.activityTimeText}>
                              {formatTime(activity.time)}
                            </Text>
                          </View>
                        </View>
                        {activity.notes && (
                          <Text style={styles.activityNotes}>{activity.notes}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(activity.id)}
                        testID={`delete-${activity.id}`}
                      >
                        <Trash2 size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Activity Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalCancelButton}
                testID="cancel-button"
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Log Activity</Text>
              <View style={styles.modalPlaceholder} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Activity Type */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Activity Type</Text>
                <View style={styles.activityTypeGrid}>
                  {ACTIVITY_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.activityTypeButton,
                        selectedType === type && styles.activityTypeButtonActive,
                      ]}
                      onPress={() => setSelectedType(type)}
                      testID={`activity-type-${type}`}
                    >
                      <Text
                        style={[
                          styles.activityTypeText,
                          selectedType === type && styles.activityTypeTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Duration (minutes)</Text>
                <TextInput
                  style={styles.durationInput}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Enter duration in minutes"
                  keyboardType="number-pad"
                  testID="duration-input"
                />
              </View>

              {/* Intensity */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Intensity</Text>
                <View style={styles.intensityContainer}>
                  {(['low', 'moderate', 'high'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.intensityButton,
                        intensity === level && styles.intensityButtonActive,
                        { borderColor: getIntensityColor(level) },
                        intensity === level && { backgroundColor: getIntensityColor(level) },
                      ]}
                      onPress={() => setIntensity(level)}
                      testID={`intensity-${level}`}
                    >
                      <Text
                        style={[
                          styles.intensityButtonText,
                          { color: intensity === level ? colors.white : getIntensityColor(level) },
                        ]}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about your activity..."
                  multiline
                  numberOfLines={3}
                  testID="notes-input"
                />
              </View>

              <Button
                title="Log Activity"
                onPress={handleAddActivity}
                disabled={!duration || isLoading}
                isLoading={isLoading}
                style={styles.saveButton}
                testID="save-activity-button"
              />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  progressSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
    minWidth: 40,
    textAlign: 'right',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
  },
  progressUnit: {
    fontSize: 14,
    color: colors.gray[600],
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButton: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  activitiesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activitiesCountText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[600],
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
  },
  intensityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  activityDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  activityDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityDurationText: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: '600',
  },
  activityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityTimeText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  activityNotes: {
    fontSize: 12,
    color: colors.gray[600],
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalCancelButton: {
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: colors.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  modalPlaceholder: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  activityTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  activityTypeButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  activityTypeText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  activityTypeTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  durationInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.black,
  },
  intensityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  intensityButtonActive: {
    // backgroundColor set dynamically
  },
  intensityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.black,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});