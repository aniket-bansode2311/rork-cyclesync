import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function TermsOfServiceScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Terms of Service',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated: [Date to be provided]</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
          <Text style={styles.content}>
            [Placeholder content for acceptance of terms. This section will explain that by using the app, users agree to these terms and conditions.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description of Service</Text>
          <Text style={styles.content}>
            [Placeholder content for service description. This section will describe what CycleSync does, its features, and intended use.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Responsibilities</Text>
          <Text style={styles.content}>
            [Placeholder content for user responsibilities. This section will outline what users are responsible for when using the app.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Disclaimer</Text>
          <Text style={styles.content}>
            [Placeholder content for medical disclaimer. This section will clarify that the app is not a substitute for professional medical advice.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.content}>
            [Placeholder content for intellectual property rights. This section will detail ownership of app content and user-generated content.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.content}>
            [Placeholder content for limitation of liability. This section will explain the limits of our liability for app use.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Termination</Text>
          <Text style={styles.content}>
            [Placeholder content for termination. This section will explain how and when the service may be terminated.]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to Terms</Text>
          <Text style={styles.content}>
            [Placeholder content for changes to terms. This section will explain how users will be notified of changes to these terms.]
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These terms of service are placeholder content and will be updated with actual legal terms before app release.
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