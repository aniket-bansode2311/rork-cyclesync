import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from "react-native";
import { BookOpen, ChevronDown, ChevronRight, Lightbulb } from "lucide-react-native";

import colors from "@/constants/colors";
import { useMenopause } from "@/hooks/useMenopause";
import { EDUCATIONAL_CONTENT } from "@/types/menopause";

interface ExpandableSection {
  title: string;
  content: string;
  isExpanded: boolean;
}

export default function MenopauseEducationScreen() {
  const { menopauseMode } = useMenopause();
  
  const [sections, setSections] = useState<ExpandableSection[]>([
    {
      title: EDUCATIONAL_CONTENT.perimenopause.title,
      content: EDUCATIONAL_CONTENT.perimenopause.content,
      isExpanded: menopauseMode.stage === 'perimenopause'
    },
    {
      title: EDUCATIONAL_CONTENT.menopause.title,
      content: EDUCATIONAL_CONTENT.menopause.content,
      isExpanded: menopauseMode.stage === 'menopause'
    },
    {
      title: EDUCATIONAL_CONTENT.postmenopause.title,
      content: EDUCATIONAL_CONTENT.postmenopause.content,
      isExpanded: menopauseMode.stage === 'postmenopause'
    }
  ]);

  const toggleSection = (index: number) => {
    setSections(prev => prev.map((section, i) => 
      i === index ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Education & Tips",
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <BookOpen size={32} color={colors.primary} />
              <Text style={styles.headerTitle}>Menopause Education</Text>
              <Text style={styles.headerSubtitle}>
                Learn about your journey and discover helpful tips for managing symptoms
              </Text>
            </View>

            {/* Current Stage Highlight */}
            {menopauseMode.isActive && (
              <View style={styles.currentStageCard}>
                <Text style={styles.currentStageTitle}>
                  Your Current Stage: {menopauseMode.stage.charAt(0).toUpperCase() + menopauseMode.stage.slice(1)}
                </Text>
                <Text style={styles.currentStageDescription}>
                  {menopauseMode.stage === 'perimenopause' && EDUCATIONAL_CONTENT.perimenopause.content}
                  {menopauseMode.stage === 'menopause' && EDUCATIONAL_CONTENT.menopause.content}
                  {menopauseMode.stage === 'postmenopause' && EDUCATIONAL_CONTENT.postmenopause.content}
                </Text>
              </View>
            )}

            {/* Educational Sections */}
            <View style={styles.sectionsContainer}>
              <Text style={styles.sectionGroupTitle}>Learn About Each Stage</Text>
              {sections.map((section, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.educationSection,
                    menopauseMode.isActive && 
                    section.title.toLowerCase().includes(menopauseMode.stage) && 
                    styles.currentSection
                  ]}
                  onPress={() => toggleSection(index)}
                  testID={`education-section-${index}`}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={[
                      styles.sectionTitle,
                      menopauseMode.isActive && 
                      section.title.toLowerCase().includes(menopauseMode.stage) && 
                      styles.currentSectionTitle
                    ]}>
                      {section.title}
                    </Text>
                    {section.isExpanded ? (
                      <ChevronDown size={20} color={colors.gray[600]} />
                    ) : (
                      <ChevronRight size={20} color={colors.gray[600]} />
                    )}
                  </View>
                  {section.isExpanded && (
                    <Text style={styles.sectionContent}>
                      {section.content}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Tips Section */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <Lightbulb size={24} color={colors.primary} />
                <Text style={styles.tipsTitle}>Helpful Tips</Text>
              </View>
              <Text style={styles.tipsSubtitle}>
                Evidence-based strategies to help manage your symptoms
              </Text>
              
              <View style={styles.tipsList}>
                {EDUCATIONAL_CONTENT.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <View style={styles.tipBullet} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerTitle}>Important Note</Text>
              <Text style={styles.disclaimerText}>
                This information is for educational purposes only and should not replace professional medical advice. 
                Always consult with your healthcare provider about your specific symptoms and treatment options.
              </Text>
            </View>

            {/* Additional Resources Placeholder */}
            <View style={styles.resourcesCard}>
              <Text style={styles.resourcesTitle}>Additional Resources</Text>
              <Text style={styles.resourcesDescription}>
                Connect with healthcare providers, support groups, and additional educational materials 
                to support your menopause journey.
              </Text>
              <View style={styles.resourcesList}>
                <Text style={styles.resourceItem}>• Consult with your gynecologist or primary care physician</Text>
                <Text style={styles.resourceItem}>• Consider joining menopause support groups</Text>
                <Text style={styles.resourceItem}>• Explore hormone therapy options if appropriate</Text>
                <Text style={styles.resourceItem}>• Look into complementary therapies like acupuncture</Text>
                <Text style={styles.resourceItem}>• Maintain regular health screenings</Text>
              </View>
            </View>
          </View>
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
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  currentStageCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  currentStageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  currentStageDescription: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  sectionsContainer: {
    marginBottom: 24,
  },
  sectionGroupTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  educationSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currentSection: {
    borderWidth: 2,
    borderColor: colors.primary + '30',
    backgroundColor: colors.primary + '05',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
  },
  currentSectionTitle: {
    color: colors.primary,
  },
  sectionContent: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
  tipsSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 16,
  },
  tipsList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  resourcesCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  resourcesDescription: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: 16,
  },
  resourcesList: {
    gap: 8,
  },
  resourceItem: {
    fontSize: 14,
    color: colors.gray[700],
    paddingLeft: 8,
  },
});