import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Bell, Clock, Volume2, Vibrate } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationService } from '@/utils/notificationService';

export default function NotificationSettingsScreen() {
  const { settings, updateSettings } = useNotifications();
  const [timePickerVisible, setTimePickerVisible] = useState<boolean>(false);

  const handlePermissionRequest = async () => {
    const hasPermission = await NotificationService.requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive reminders.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTimeChange = (time: string) => {
    updateSettings({ notificationTime: time });
  };

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const SettingRow = ({ 
    icon, 
    title, 
    description, 
    value, 
    onToggle 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#D1D5DB', true: '#EC4899' }}
        thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
      />
    </View>
  );

  const TimePickerRow = () => (
    <TouchableOpacity style={styles.settingRow} onPress={() => setTimePickerVisible(true)}>
      <View style={styles.settingIcon}>
        <Clock size={24} color="#EC4899" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>Default Notification Time</Text>
        <Text style={styles.settingDescription}>
          Current time: {settings.notificationTime}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Notification Settings',
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Types</Text>
          
          <SettingRow
            icon={<Bell size={24} color="#EC4899" />}
            title="Period Reminders"
            description="Get notified when your period is expected to start"
            value={settings.periodReminders}
            onToggle={() => toggleSetting('periodReminders')}
          />
          
          <SettingRow
            icon={<Bell size={24} color="#8B5CF6" />}
            title="Ovulation Reminders"
            description="Get notified on your predicted ovulation day"
            value={settings.ovulationReminders}
            onToggle={() => toggleSetting('ovulationReminders')}
          />
          
          <SettingRow
            icon={<Bell size={24} color="#10B981" />}
            title="Fertile Window Reminders"
            description="Get notified when your fertile window begins"
            value={settings.fertileWindowReminders}
            onToggle={() => toggleSetting('fertileWindowReminders')}
          />
          
          <SettingRow
            icon={<Bell size={24} color="#F59E0B" />}
            title="Birth Control Reminders"
            description="Get notified to take your birth control"
            value={settings.birthControlReminders}
            onToggle={() => toggleSetting('birthControlReminders')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <TimePickerRow />
          
          <SettingRow
            icon={<Volume2 size={24} color="#6B7280" />}
            title="Sound"
            description="Play sound with notifications"
            value={settings.soundEnabled}
            onToggle={() => toggleSetting('soundEnabled')}
          />
          
          <SettingRow
            icon={<Vibrate size={24} color="#6B7280" />}
            title="Vibration"
            description="Vibrate when receiving notifications"
            value={settings.vibrationEnabled}
            onToggle={() => toggleSetting('vibrationEnabled')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={handlePermissionRequest}
          >
            <Text style={styles.permissionButtonText}>
              Request Notification Permissions
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#EC4899',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});