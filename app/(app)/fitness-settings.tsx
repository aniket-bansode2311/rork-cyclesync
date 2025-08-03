import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert
} from 'react-native';
import { 
  Target, 
  Clock, 
  Smartphone, 
  Bell,
  Heart,
  Activity
} from 'lucide-react-native';

import { Button } from '@/components/Button';
import colors from '@/constants/colors';
import { useFitness } from '@/hooks/useFitness';
import { SYNC_INTERVALS } from '@/types/fitness';

export default function FitnessSettingsScreen() {
  const {
    settings,
    permissions,
    updateSettings,
    requestHealthKitPermission,
    requestGoogleFitPermission,
    getAvailableSources,
    formatDistance,
    formatSteps
  } = useFitness();

  const [localSettings, setLocalSettings] = useState(settings);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateSettings(localSettings);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectSource = async (source: 'healthkit' | 'googlefit') => {
    try {
      setIsLoading(true);
      let success = false;
      
      if (source === 'healthkit') {
        success = await requestHealthKitPermission();
      } else {
        success = await requestGoogleFitPermission();
      }
      
      if (success) {
        Alert.alert(
          'Connected!', 
          `Successfully connected to ${source === 'healthkit' ? 'Apple HealthKit' : 'Google Fit'}`
        );
      } else {
        Alert.alert(
          'Connection Failed', 
          `Failed to connect to ${source === 'healthkit' ? 'Apple HealthKit' : 'Google Fit'}. Please try again.`
        );
      }
    } catch (error) {
      console.error(`Error connecting to ${source}:`, error);
      Alert.alert('Error', 'An error occurred while connecting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocalSetting = <K extends keyof typeof localSettings>(
    key: K,
    value: typeof localSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Fitness Settings',
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Data Sources */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Smartphone size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Data Sources</Text>
            </View>
            
            {getAvailableSources().map((source) => (
              <View key={source} style={styles.sourceItem}>
                <View style={styles.sourceInfo}>
                  <Heart size={20} color={permissions[source] ? colors.success : colors.gray[400]} />
                  <View style={styles.sourceDetails}>
                    <Text style={styles.sourceName}>
                      {source === 'healthkit' ? 'Apple HealthKit' : 'Google Fit'}
                    </Text>
                    <Text style={styles.sourceStatus}>
                      {permissions[source] ? 'Connected' : 'Not connected'}
                    </Text>
                  </View>
                </View>
                {!permissions[source] && (
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => handleConnectSource(source)}
                    disabled={isLoading}
                    testID={`connect-${source}`}
                  >
                    <Text style={styles.connectButtonText}>Connect</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color={colors.secondary} />
              <Text style={styles.sectionTitle}>Daily Goals</Text>
            </View>
            
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Steps Goal</Text>
              <TextInput
                style={styles.goalInput}
                value={localSettings.stepsGoal.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  updateLocalSetting('stepsGoal', value);
                }}
                keyboardType="number-pad"
                placeholder="10000"
                testID="steps-goal-input"
              />
              <Text style={styles.goalUnit}>steps</Text>
            </View>
            
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Distance Goal</Text>
              <TextInput
                style={styles.goalInput}
                value={(localSettings.distanceGoal / 1000).toString()}
                onChangeText={(text) => {
                  const value = (parseFloat(text) || 0) * 1000;
                  updateLocalSetting('distanceGoal', value);
                }}
                keyboardType="numeric"
                placeholder="8"
                testID="distance-goal-input"
              />
              <Text style={styles.goalUnit}>km</Text>
            </View>
            
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Active Minutes Goal</Text>
              <TextInput
                style={styles.goalInput}
                value={localSettings.activeMinutesGoal.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  updateLocalSetting('activeMinutesGoal', value);
                }}
                keyboardType="number-pad"
                placeholder="30"
                testID="active-minutes-goal-input"
              />
              <Text style={styles.goalUnit}>minutes</Text>
            </View>
          </View>

          {/* Sync Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Activity size={20} color={colors.warning} />
              <Text style={styles.sectionTitle}>Sync Settings</Text>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto Sync</Text>
                <Text style={styles.settingDescription}>
                  Automatically sync fitness data from connected sources
                </Text>
              </View>
              <Switch
                value={localSettings.autoSync}
                onValueChange={(value) => updateLocalSetting('autoSync', value)}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={colors.white}
                testID="auto-sync-switch"
              />
            </View>
            
            {localSettings.autoSync && (
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Sync Interval</Text>
                  <Text style={styles.settingDescription}>
                    How often to sync data automatically
                  </Text>
                </View>
                <View style={styles.intervalButtons}>
                  {SYNC_INTERVALS.map((interval) => (
                    <TouchableOpacity
                      key={interval.value}
                      style={[
                        styles.intervalButton,
                        localSettings.syncInterval === interval.value && styles.intervalButtonActive
                      ]}
                      onPress={() => updateLocalSetting('syncInterval', interval.value)}
                      testID={`sync-interval-${interval.value}`}
                    >
                      <Text
                        style={[
                          styles.intervalButtonText,
                          localSettings.syncInterval === interval.value && styles.intervalButtonTextActive
                        ]}
                      >
                        {interval.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Bell size={20} color={colors.error} />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Goal Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get notified when you reach your daily goals
                </Text>
              </View>
              <Switch
                value={localSettings.enableNotifications}
                onValueChange={(value) => updateLocalSetting('enableNotifications', value)}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={colors.white}
                testID="notifications-switch"
              />
            </View>
          </View>

          {/* Current Goals Preview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={colors.gray[600]} />
              <Text style={styles.sectionTitle}>Current Goals</Text>
            </View>
            
            <View style={styles.goalsPreview}>
              <View style={styles.goalPreviewItem}>
                <Text style={styles.goalPreviewLabel}>Steps</Text>
                <Text style={styles.goalPreviewValue}>
                  {formatSteps(localSettings.stepsGoal)}
                </Text>
              </View>
              <View style={styles.goalPreviewItem}>
                <Text style={styles.goalPreviewLabel}>Distance</Text>
                <Text style={styles.goalPreviewValue}>
                  {formatDistance(localSettings.distanceGoal)}
                </Text>
              </View>
              <View style={styles.goalPreviewItem}>
                <Text style={styles.goalPreviewLabel}>Active Minutes</Text>
                <Text style={styles.goalPreviewValue}>
                  {localSettings.activeMinutesGoal}m
                </Text>
              </View>
            </View>
          </View>

          <Button
            title="Save Settings"
            onPress={handleSave}
            isLoading={isLoading}
            style={styles.saveButton}
            testID="save-settings-button"
          />
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sourceDetails: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  sourceStatus: {
    fontSize: 12,
    color: colors.gray[500],
  },
  connectButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  goalLabel: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  goalInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.black,
    textAlign: 'right',
    minWidth: 80,
    marginRight: 8,
  },
  goalUnit: {
    fontSize: 14,
    color: colors.gray[600],
    minWidth: 60,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.gray[500],
    lineHeight: 16,
  },
  intervalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  intervalButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  intervalButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  intervalButtonText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  intervalButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  goalsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  goalPreviewItem: {
    alignItems: 'center',
  },
  goalPreviewLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 4,
  },
  goalPreviewValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  saveButton: {
    marginTop: 20,
  },
});