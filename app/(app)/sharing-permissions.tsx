import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { 
  Shield, 
  Calendar, 
  Heart, 
  Activity, 
  Baby, 
  Thermometer,
  Info
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { usePartnerSharing } from '@/hooks/usePartnerSharing';
import { SharingPermissions } from '@/types/partnerSharing';

interface PermissionItem {
  key: keyof SharingPermissions;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'basic' | 'health' | 'lifecycle';
}

const permissionItems: PermissionItem[] = [
  {
    key: 'shareBasicCycle',
    title: 'Basic Cycle Information',
    description: 'Current cycle day, cycle length, and period dates',
    icon: <Calendar size={20} color={colors.primary} />,
    category: 'basic',
  },
  {
    key: 'shareFertileWindow',
    title: 'Fertile Window',
    description: 'Ovulation predictions and fertile days',
    icon: <Heart size={20} color={colors.secondary} />,
    category: 'basic',
  },
  {
    key: 'shareMood',
    title: 'Mood Tracking',
    description: 'Daily mood entries and emotional patterns',
    icon: <Activity size={20} color={colors.tertiary} />,
    category: 'health',
  },
  {
    key: 'shareSymptoms',
    title: 'Symptoms',
    description: 'Physical symptoms and their intensity',
    icon: <Thermometer size={20} color={colors.warning} />,
    category: 'health',
  },
  {
    key: 'sharePregnancyUpdates',
    title: 'Pregnancy Updates',
    description: 'Pregnancy week, milestones, and related information',
    icon: <Baby size={20} color={colors.success} />,
    category: 'lifecycle',
  },
  {
    key: 'sharePostpartumUpdates',
    title: 'Postpartum Updates',
    description: 'Recovery progress and postpartum tracking',
    icon: <Heart size={20} color={colors.secondary} />,
    category: 'lifecycle',
  },
  {
    key: 'shareMenopauseUpdates',
    title: 'Menopause Updates',
    description: 'Menopause symptoms and transition tracking',
    icon: <Activity size={20} color={colors.tertiary} />,
    category: 'lifecycle',
  },
];

export default function SharingPermissionsScreen() {
  const { permissions, updatePermissions, hasActiveConnection } = usePartnerSharing();
  const [localPermissions, setLocalPermissions] = useState<SharingPermissions>(permissions);
  const [isSaving, setIsSaving] = useState(false);

  const handlePermissionChange = (key: keyof SharingPermissions, value: boolean) => {
    setLocalPermissions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setIsSaving(true);
      await updatePermissions(localPermissions);
      Alert.alert('Success', 'Sharing permissions updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(permissions) !== JSON.stringify(localPermissions);

  const renderPermissionCategory = (category: 'basic' | 'health' | 'lifecycle') => {
    const categoryItems = permissionItems.filter(item => item.category === category);
    const categoryTitles = {
      basic: 'Basic Information',
      health: 'Health & Wellness',
      lifecycle: 'Life Stages',
    };

    return (
      <View key={category} style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{categoryTitles[category]}</Text>
        {categoryItems.map((item) => (
          <View key={item.key} style={styles.permissionItem}>
            <View style={styles.permissionHeader}>
              <View style={styles.permissionIcon}>
                {item.icon}
              </View>
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>{item.title}</Text>
                <Text style={styles.permissionDescription}>{item.description}</Text>
              </View>
              <Switch
                value={localPermissions[item.key]}
                onValueChange={(value) => handlePermissionChange(item.key, value)}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={localPermissions[item.key] ? colors.white : colors.gray[100]}
                testID={`permission-switch-${item.key}`}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Sharing Permissions',
          headerStyle: { backgroundColor: colors.background },
        }} 
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Shield size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Sharing Permissions</Text>
        <Text style={styles.subtitle}>
          Control what information you share with your partner
        </Text>
      </View>

      {/* Connection Status */}
      {hasActiveConnection ? (
        <View style={styles.statusCard}>
          <Info size={16} color={colors.success} />
          <Text style={styles.statusText}>
            Your partner can see the information you have enabled below
          </Text>
        </View>
      ) : (
        <View style={[styles.statusCard, styles.noConnectionCard]}>
          <Info size={16} color={colors.warning} />
          <Text style={styles.statusText}>
            No partner connected. These settings will apply when you connect with a partner
          </Text>
        </View>
      )}

      {/* Permission Categories */}
      {renderPermissionCategory('basic')}
      {renderPermissionCategory('health')}
      {renderPermissionCategory('lifecycle')}

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Text style={styles.privacyTitle}>Privacy & Security</Text>
        <Text style={styles.privacyText}>
          • All shared data is encrypted and secure{'\n'}
          • You can change these permissions at any time{'\n'}
          • Your partner will only see data from the time they connect{'\n'}
          • Disconnecting your partner immediately stops all data sharing
        </Text>
      </View>

      {/* Save Button */}
      {hasChanges && (
        <View style={styles.saveSection}>
          <Button
            title="Save Permissions"
            onPress={handleSavePermissions}
            isLoading={isSaving}
            testID="save-permissions-button"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noConnectionCard: {
    borderLeftColor: colors.warning,
  },
  statusText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  categorySection: {
    margin: 20,
    marginTop: 0,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 12,
  },
  permissionItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 18,
  },
  privacyNotice: {
    margin: 20,
    marginTop: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  saveSection: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
  },
});