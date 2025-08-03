import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Shield,
  Brain,
  Lock,
  Eye,
  X,
  Check,
} from 'lucide-react-native';
import colors from '@/constants/colors';

interface DataConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onConsent: (granted: boolean) => void;
  isLoading?: boolean;
}

export function DataConsentModal({ 
  visible, 
  onClose, 
  onConsent, 
  isLoading = false 
}: DataConsentModalProps) {
  const [hasReadTerms, setHasReadTerms] = useState<boolean>(false);

  const handleConsent = (granted: boolean) => {
    onConsent(granted);
    if (!granted) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Brain size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>AI Insights Consent</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          onScroll={(event) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const isScrolledToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            if (isScrolledToBottom && !hasReadTerms) {
              setHasReadTerms(true);
            }
          }}
          scrollEventThrottle={400}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Your Privacy Matters</Text>
            </View>
            <Text style={styles.sectionText}>
              To provide you with personalized AI insights about your menstrual health, 
              we need your consent to securely process your health data using our AI service.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Brain size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>What We Analyze</Text>
            </View>
            <Text style={styles.sectionText}>
              Our AI analyzes patterns in your:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Period dates and cycle length</Text>
              <Text style={styles.bulletItem}>• Logged symptoms and their intensity</Text>
              <Text style={styles.bulletItem}>• Mood patterns and emotional well-being</Text>
              <Text style={styles.bulletItem}>• General health and wellness data</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Lock size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>How We Protect Your Data</Text>
            </View>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• All data is encrypted in transit and at rest</Text>
              <Text style={styles.bulletItem}>• Your data is anonymized before AI processing</Text>
              <Text style={styles.bulletItem}>• We never share your personal information</Text>
              <Text style={styles.bulletItem}>• You can revoke consent at any time</Text>
              <Text style={styles.bulletItem}>• Data is automatically deleted after 90 days</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Eye size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>What You Get</Text>
            </View>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Personalized health insights and patterns</Text>
              <Text style={styles.bulletItem}>• Predictive analysis for your cycle</Text>
              <Text style={styles.bulletItem}>• Evidence-based health recommendations</Text>
              <Text style={styles.bulletItem}>• Correlation analysis between symptoms and mood</Text>
              <Text style={styles.bulletItem}>• Lifestyle optimization suggestions</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Choice</Text>
            <Text style={styles.sectionText}>
              You can still use CycleSync without AI insights. If you decline, we&apos;ll provide 
              basic tracking and local analysis only. You can change your mind anytime in Settings.
            </Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Medical Disclaimer:</Text> AI insights are for 
              informational purposes only and should not replace professional medical advice. 
              Always consult with healthcare providers for medical concerns.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {!hasReadTerms && (
            <Text style={styles.scrollHint}>
              Please scroll to read all terms before proceeding
            </Text>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={() => handleConsent(false)}
              disabled={isLoading}
            >
              <Text style={styles.declineButtonText}>
                Decline & Use Basic Features
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                styles.consentButton,
                (!hasReadTerms || isLoading) && styles.buttonDisabled
              ]}
              onPress={() => handleConsent(true)}
              disabled={!hasReadTerms || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Check size={16} color={colors.white} />
                  <Text style={styles.consentButtonText}>
                    I Consent to AI Processing
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 8,
  },
  sectionText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: 4,
  },
  disclaimer: {
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.gray[600],
    lineHeight: 16,
  },
  disclaimerBold: {
    fontWeight: '600',
    color: colors.gray[800],
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  scrollHint: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  declineButton: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  declineButtonText: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500',
  },
  consentButton: {
    backgroundColor: colors.primary,
  },
  consentButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});