import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Privacy Policy',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: [Date to be provided]</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Collection and Use</Text>
          <Text style={styles.content}>
            [Placeholder content for data collection and use policies. This section will detail what data we collect, how we use it, and the legal basis for processing.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage and Security</Text>
          <Text style={styles.content}>
            [Placeholder content for data storage and security measures. This section will explain how we protect your data, encryption methods, and storage locations.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.content}>
            [Placeholder content for data sharing policies. This section will detail if and when we share data with third parties, and under what circumstances.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.content}>
            [Placeholder content for user rights. This section will explain user rights regarding their data, including access, correction, deletion, and portability rights.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anonymous Mode</Text>
          <Text style={styles.content}>
            [Placeholder content for anonymous mode. This section will explain how anonymous mode works, what data is not collected, and the limitations of this mode.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.content}>
            [Placeholder content for contact information. This section will provide contact details for privacy-related inquiries and data protection officer information.]
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This privacy policy is a placeholder and will be updated with actual content before app release.
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
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.gray[600],
    fontStyle: 'italic' as const,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray[700],
    textAlign: 'justify' as const,
  },
  footer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.gray[600],
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
  },
});