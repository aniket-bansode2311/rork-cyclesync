import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Shield, Download, Trash2, FileText, ScrollText, Info, Database, Eye, Heart, Activity, Droplets, Moon, BookOpen, Baby, Pill, Apple, Dumbbell } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { usePrivacy } from '@/hooks/usePrivacy';
import { Button } from '@/components/Button';
import { DataCollectionSettings, ConsentPurposes } from '@/types/privacy';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { 
    privacySettings, 
    updatePrivacySettings, 
    updateDataCollectionSettings,
    updateConsentPurposes,
    exportUserData, 
    deleteAllUserData, 
    isLoading 
  } = usePrivacy();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleAnonymousModeToggle = async (value: boolean) => {
    try {
      await updatePrivacySettings({ anonymousMode: value });
      
      if (value) {
        Alert.alert(
          'Anonymous Mode Enabled',
          'Your data is now associated with a randomly generated ID. No personally identifiable information will be collected.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update anonymous mode setting.');
    }
  };

  const handleDataEncryptionToggle = async (value: boolean) => {
    try {
      await updatePrivacySettings({ dataEncryption: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update data encryption setting.');
    }
  };

  const handleAnalyticsToggle = async (value: boolean) => {
    try {
      await updatePrivacySettings({ analyticsEnabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update analytics setting.');
    }
  };

  const handleCrashReportingToggle = async (value: boolean) => {
    try {
      await updatePrivacySettings({ crashReportingEnabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update crash reporting setting.');
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const exportedData = await exportUserData();
      
      // For now, just show an alert with the data length
      // In a real app, you would save this to a file or share it
      Alert.alert(
        'Data Export Ready',
        `Your data has been prepared for export (${Math.round(exportedData.length / 1024)}KB). This feature will be fully implemented in a future update.`,
        [{ text: 'OK' }]
      );
      
      console.log('Exported data:', exportedData);
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataCollectionToggle = async (key: keyof DataCollectionSettings, value: boolean) => {
    try {
      await updateDataCollectionSettings({ [key]: value });
      
      if (!value) {
        Alert.alert(
          'Data Collection Disabled',
          `${getDataCategoryName(key)} data collection has been disabled. Existing data will remain but no new data will be collected.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', `Failed to update ${getDataCategoryName(key)} data collection setting.`);
    }
  };

  const handleConsentToggle = async (key: keyof ConsentPurposes, value: boolean) => {
    try {
      await updateConsentPurposes({ [key]: value });
    } catch (error) {
      Alert.alert('Error', `Failed to update ${getConsentPurposeName(key)} consent.`);
    }
  };

  const getDataCategoryName = (key: keyof DataCollectionSettings): string => {
    const names: Record<keyof DataCollectionSettings, string> = {
      periods: 'Period',
      symptoms: 'Symptoms',
      mood: 'Mood',
      fertility: 'Fertility',
      pregnancy: 'Pregnancy',
      menopause: 'Menopause',
      birthControl: 'Birth Control',
      nutrition: 'Nutrition',
      fitness: 'Fitness',
      sleep: 'Sleep',
      waterIntake: 'Water Intake',
      journal: 'Journal',
    };
    return names[key];
  };

  const getConsentPurposeName = (key: keyof ConsentPurposes): string => {
    const names: Record<keyof ConsentPurposes, string> = {
      personalizedInsights: 'Personalized Insights',
      anonymizedResearch: 'Anonymized Research',
      productImprovement: 'Product Improvement',
      healthRecommendations: 'Health Recommendations',
      cycleTracking: 'Cycle Tracking',
      symptomAnalysis: 'Symptom Analysis',
    };
    return names[key];
  };

  const getDataCategoryIcon = (key: keyof DataCollectionSettings) => {
    const icons: Record<keyof DataCollectionSettings, any> = {
      periods: Heart,
      symptoms: Activity,
      mood: Eye,
      fertility: Baby,
      pregnancy: Baby,
      menopause: Heart,
      birthControl: Pill,
      nutrition: Apple,
      fitness: Dumbbell,
      sleep: Moon,
      waterIntake: Droplets,
      journal: BookOpen,
    };
    return icons[key];
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data including periods, symptoms, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteAllUserData();
              Alert.alert(
                'Data Deleted',
                'All your data has been permanently deleted.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Delete Failed', 'Failed to delete your data. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading privacy settings...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Privacy & Security',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Shield size={32} color={colors.primary} />
          <Text style={styles.title}>Privacy & Security</Text>
          <Text style={styles.subtitle}>
            Control how your data is collected, stored, and used
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Collection Controls</Text>
          <Text style={styles.sectionSubtitle}>
            Choose what types of data you want to share with CycleSync
          </Text>
          
          {Object.entries(privacySettings.dataCollection).map(([key, value]) => {
            const IconComponent = getDataCategoryIcon(key as keyof DataCollectionSettings);
            return (
              <View key={key} style={styles.settingItem}>
                <IconComponent size={20} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{getDataCategoryName(key as keyof DataCollectionSettings)}</Text>
                  <Text style={styles.settingDescription}>
                    Allow collection and storage of {getDataCategoryName(key as keyof DataCollectionSettings).toLowerCase()} data
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={(newValue) => handleDataCollectionToggle(key as keyof DataCollectionSettings, newValue)}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purpose-Based Consent</Text>
          <Text style={styles.sectionSubtitle}>
            Control how your data is used to improve your experience
          </Text>
          
          {Object.entries(privacySettings.consentPurposes).map(([key, value]) => {
            const purposeDescriptions: Record<keyof ConsentPurposes, string> = {
              personalizedInsights: 'Use your data to provide personalized health insights and recommendations',
              anonymizedResearch: 'Contribute anonymized data to women&apos;s health research (no personal information shared)',
              productImprovement: 'Help improve app features and user experience through usage analytics',
              healthRecommendations: 'Receive AI-powered health recommendations based on your data patterns',
              cycleTracking: 'Enable advanced cycle prediction and tracking features',
              symptomAnalysis: 'Analyze symptom patterns to provide better health insights',
            };
            
            return (
              <View key={key} style={styles.settingItem}>
                <Database size={20} color={colors.primary} style={styles.settingIcon} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{getConsentPurposeName(key as keyof ConsentPurposes)}</Text>
                  <Text style={styles.settingDescription}>
                    {purposeDescriptions[key as keyof ConsentPurposes]}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={(newValue) => handleConsentToggle(key as keyof ConsentPurposes, newValue)}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <View style={styles.settingItem}>
            <Shield size={20} color={colors.primary} style={styles.settingIcon} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Anonymous Mode</Text>
              <Text style={styles.settingDescription}>
                Use a random ID instead of personal identifiers
              </Text>
            </View>
            <Switch
              value={privacySettings.anonymousMode}
              onValueChange={handleAnonymousModeToggle}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.settingItem}>
            <Shield size={20} color={colors.primary} style={styles.settingIcon} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Data Encryption</Text>
              <Text style={styles.settingDescription}>
                Encrypt sensitive data stored on your device
              </Text>
            </View>
            <Switch
              value={privacySettings.dataEncryption}
              onValueChange={handleDataEncryptionToggle}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics & Reporting</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Usage Analytics</Text>
              <Text style={styles.settingDescription}>
                Help improve the app by sharing anonymous usage data
              </Text>
            </View>
            <Switch
              value={privacySettings.analyticsEnabled}
              onValueChange={handleAnalyticsToggle}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Crash Reporting</Text>
              <Text style={styles.settingDescription}>
                Automatically send crash reports to help fix bugs
              </Text>
            </View>
            <Switch
              value={privacySettings.crashReportingEnabled}
              onValueChange={handleCrashReportingToggle}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.userIdContainer}>
            <Text style={styles.userIdLabel}>Current User ID:</Text>
            <Text style={styles.userId}>
              {privacySettings.anonymousMode ? 'Anonymous' : privacySettings.userId}
            </Text>
            <Text style={styles.lastUpdated}>
              Last updated: {new Date(privacySettings.lastUpdated).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <Download size={20} color={colors.primary} />
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>Export Data</Text>
              <Text style={styles.actionButtonDescription}>
                Download a copy of all your data
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAllData}>
            <Trash2 size={20} color={colors.error} />
            <View style={styles.actionButtonText}>
              <Text style={[styles.actionButtonTitle, { color: colors.error }]}>
                Delete All Data
              </Text>
              <Text style={styles.actionButtonDescription}>
                Permanently remove all your data
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/(app)/privacy-policy')}
          >
            <FileText size={20} color={colors.primary} />
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>Privacy Policy</Text>
              <Text style={styles.actionButtonDescription}>
                Read our privacy policy
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/(app)/terms-of-service')}
          >
            <ScrollText size={20} color={colors.primary} />
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>Terms of Service</Text>
              <Text style={styles.actionButtonDescription}>
                Read our terms of service
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Info size={16} color={colors.primary} />
          <Text style={styles.infoText}>
            Your privacy is our priority. All data is stored locally on your device with encryption. You have full control over what data is collected and how it&apos;s used. Changes take effect immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              Alert.alert(
                'Privacy Summary',
                `Data Collection: ${Object.values(privacySettings.dataCollection).filter(Boolean).length}/12 categories enabled\n` +
                `Consent Purposes: ${Object.values(privacySettings.consentPurposes).filter(Boolean).length}/6 purposes enabled\n` +
                `Anonymous Mode: ${privacySettings.anonymousMode ? 'Enabled' : 'Disabled'}\n` +
                `Data Encryption: ${privacySettings.dataEncryption ? 'Enabled' : 'Disabled'}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Eye size={20} color={colors.primary} />
            <Text style={styles.quickActionText}>View Privacy Summary</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={async () => {
              try {
                await updateDataCollectionSettings({
                  periods: false,
                  symptoms: false,
                  mood: false,
                  fertility: false,
                  pregnancy: false,
                  menopause: false,
                  birthControl: false,
                  nutrition: false,
                  fitness: false,
                  sleep: false,
                  waterIntake: false,
                  journal: false,
                });
                Alert.alert('Data Collection Disabled', 'All data collection has been disabled.');
              } catch (error) {
                Alert.alert('Error', 'Failed to disable data collection.');
              }
            }}
          >
            <Shield size={20} color={colors.error} />
            <Text style={[styles.quickActionText, { color: colors.error }]}>Disable All Data Collection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 15,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 18,
  },
  userIdContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userIdLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  userId: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.black,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.gray[500],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    marginLeft: 15,
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.black,
    marginBottom: 4,
  },
  actionButtonDescription: {
    fontSize: 14,
    color: colors.gray[600],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    flex: 1,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.black,
  },
});