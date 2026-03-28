import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Shield, 
  FileText, 
  ScrollText, 
  Bell, 
  Palette, 
  HelpCircle, 
  ChevronRight,
  User,
  Database
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { usePrivacy } from '@/hooks/usePrivacy';

export default function SettingsScreen() {
  const router = useRouter();
  const { privacySettings } = usePrivacy();

  const settingsOptions = [
    {
      title: 'Privacy & Security',
      description: 'Manage your data privacy and security settings',
      icon: Shield,
      route: '/(app)/privacy-settings',
      color: colors.primary,
    },
    {
      title: 'Notifications',
      description: 'Configure app notifications and reminders',
      icon: Bell,
      route: '/(app)/notification-settings',
      color: colors.secondary,
    },
    {
      title: 'Appearance',
      description: 'Customize app theme and display settings',
      icon: Palette,
      route: null, // Placeholder
      color: colors.tertiary,
    },
    {
      title: 'Account',
      description: 'Manage your account settings',
      icon: User,
      route: null, // Placeholder
      color: colors.gray[600],
    },
    {
      title: 'Data Management',
      description: 'Export, backup, or delete your data',
      icon: Database,
      route: '/(app)/privacy-settings', // Same as privacy for now
      color: colors.warning,
    },
  ];

  const legalOptions = [
    {
      title: 'Privacy Policy',
      description: 'Read our privacy policy',
      icon: FileText,
      route: '/(app)/privacy-policy',
    },
    {
      title: 'Terms of Service',
      description: 'Read our terms of service',
      icon: ScrollText,
      route: '/(app)/terms-of-service',
    },
    {
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: HelpCircle,
      route: null, // Placeholder
    },
  ];

  const handleOptionPress = (route: string | null) => {
    if (route) {
      router.push(route as any);
    } else {
      // Show coming soon alert or handle placeholder
      console.log('Feature coming soon');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Settings',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your CycleSync experience
          </Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userInfoContent}>
            <Text style={styles.userInfoLabel}>User Mode:</Text>
            <Text style={styles.userInfoValue}>
              {privacySettings.anonymousMode ? 'Anonymous' : 'Standard'}
            </Text>
          </View>
          <View style={styles.userInfoContent}>
            <Text style={styles.userInfoLabel}>Data Encryption:</Text>
            <Text style={[
              styles.userInfoValue,
              { color: privacySettings.dataEncryption ? colors.success : colors.warning }
            ]}>
              {privacySettings.dataEncryption ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionItem}
              onPress={() => handleOptionPress(option.route)}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
                <option.icon size={20} color={option.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <ChevronRight size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Support</Text>
          {legalOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionItem}
              onPress={() => handleOptionPress(option.route)}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.gray[100] }]}>
                <option.icon size={20} color={colors.gray[600]} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <ChevronRight size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>CycleSync v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Your privacy-focused period tracking companion
          </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center' as const,
  },
  userInfo: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userInfoLabel: {
    fontSize: 16,
    color: colors.gray[600],
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
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
  optionItem: {
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
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.black,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.gray[700],
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center' as const,
  },
});