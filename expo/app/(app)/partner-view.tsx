import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { 
  Heart, 
  Calendar, 
  Activity, 
  Thermometer, 
  Baby,
  Clock,
  Info,
  Eye
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { usePartnerSharing } from '@/hooks/usePartnerSharing';

export default function PartnerViewScreen() {
  const { getPartnerView } = usePartnerSharing();
  const partnerView = getPartnerView();

  if (!partnerView) {
    return (
      <ScrollView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Partner View Preview',
            headerStyle: { backgroundColor: colors.background },
          }} 
        />
        
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Eye size={48} color={colors.gray[400]} />
          </View>
          <Text style={styles.emptyTitle}>No Partner Connected</Text>
          <Text style={styles.emptySubtitle}>
            Connect with a partner to preview what they will see
          </Text>
        </View>
      </ScrollView>
    );
  }

  const { sharedData, permissions, connectionStatus } = partnerView;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Partner View Preview',
          headerStyle: { backgroundColor: colors.background },
        }} 
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Eye size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Partner View Preview</Text>
        <Text style={styles.subtitle}>
          This is what your partner sees when they access your shared information
        </Text>
      </View>

      {/* Connection Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: connectionStatus === 'connected' ? colors.success : colors.warning }
          ]} />
          <Text style={styles.statusText}>
            {connectionStatus === 'connected' ? 'Connected' : 'Pending Connection'}
          </Text>
        </View>
        <Text style={styles.lastUpdated}>
          Last updated: {formatDate(sharedData.lastUpdated)}
        </Text>
      </View>

      {/* Basic Cycle Information */}
      {permissions.shareBasicCycle && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle Information</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Current Cycle</Text>
            </View>
            <View style={styles.cycleInfo}>
              <View style={styles.cycleItem}>
                <Text style={styles.cycleLabel}>Cycle Day</Text>
                <Text style={styles.cycleValue}>
                  {sharedData.currentCycleDay || 'N/A'}
                </Text>
              </View>
              <View style={styles.cycleItem}>
                <Text style={styles.cycleLabel}>Cycle Length</Text>
                <Text style={styles.cycleValue}>
                  {sharedData.cycleLength ? `${sharedData.cycleLength} days` : 'N/A'}
                </Text>
              </View>
              {sharedData.periodStartDate && (
                <View style={styles.cycleItem}>
                  <Text style={styles.cycleLabel}>Last Period</Text>
                  <Text style={styles.cycleValue}>
                    {getDaysAgo(sharedData.periodStartDate)} days ago
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Fertile Window */}
      {permissions.shareFertileWindow && sharedData.fertileWindow && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fertile Window</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Heart size={20} color={colors.secondary} />
              <Text style={styles.cardTitle}>Fertility Status</Text>
            </View>
            <View style={styles.fertileInfo}>
              <View style={styles.fertileItem}>
                <Text style={styles.fertileLabel}>Fertile Window</Text>
                <Text style={styles.fertileValue}>
                  {formatDate(sharedData.fertileWindow.start)} - {formatDate(sharedData.fertileWindow.end)}
                </Text>
              </View>
              <View style={styles.fertileItem}>
                <Text style={styles.fertileLabel}>Peak Fertility</Text>
                <Text style={styles.fertileValue}>
                  {formatDate(sharedData.fertileWindow.peak)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Mood */}
      {permissions.shareMood && sharedData.mood && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Activity size={20} color={colors.tertiary} />
              <Text style={styles.cardTitle}>Current Mood</Text>
            </View>
            <View style={styles.moodInfo}>
              <Text style={styles.moodValue}>{sharedData.mood.current}</Text>
              <View style={styles.moodIntensity}>
                <Text style={styles.moodLabel}>Intensity</Text>
                <View style={styles.intensityBar}>
                  <View 
                    style={[
                      styles.intensityFill, 
                      { width: `${(sharedData.mood.intensity / 5) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.intensityText}>{sharedData.mood.intensity}/5</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Symptoms */}
      {permissions.shareSymptoms && sharedData.symptoms && sharedData.symptoms.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptoms</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Thermometer size={20} color={colors.warning} />
              <Text style={styles.cardTitle}>Current Symptoms</Text>
            </View>
            <View style={styles.symptomsContainer}>
              {sharedData.symptoms.map((symptom, index) => (
                <View key={index} style={styles.symptomTag}>
                  <Text style={styles.symptomText}>{symptom}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Pregnancy Updates */}
      {permissions.sharePregnancyUpdates && sharedData.isPregnant && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pregnancy</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Baby size={20} color={colors.success} />
              <Text style={styles.cardTitle}>Pregnancy Progress</Text>
            </View>
            <View style={styles.pregnancyInfo}>
              <Text style={styles.pregnancyWeek}>
                Week {sharedData.pregnancyWeek || 'N/A'}
              </Text>
              <Text style={styles.pregnancyLabel}>of pregnancy</Text>
            </View>
          </View>
        </View>
      )}

      {/* Postpartum Updates */}
      {permissions.sharePostpartumUpdates && sharedData.isPostpartum && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Postpartum</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Heart size={20} color={colors.secondary} />
              <Text style={styles.cardTitle}>Recovery Progress</Text>
            </View>
            <Text style={styles.postpartumText}>
              Currently in postpartum recovery phase
            </Text>
          </View>
        </View>
      )}

      {/* Menopause Updates */}
      {permissions.shareMenopauseUpdates && sharedData.isMenopause && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menopause</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Activity size={20} color={colors.tertiary} />
              <Text style={styles.cardTitle}>Menopause Transition</Text>
            </View>
            <Text style={styles.menopauseText}>
              Currently tracking menopause transition
            </Text>
          </View>
        </View>
      )}

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Info size={16} color={colors.gray[500]} />
        <Text style={styles.privacyText}>
          This preview shows what your partner can see based on your current sharing permissions. 
          You can change these permissions at any time.
        </Text>
      </View>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: colors.white,
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.gray[600],
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
    marginLeft: 8,
  },
  cycleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cycleItem: {
    alignItems: 'center',
  },
  cycleLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 4,
  },
  cycleValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.black,
  },
  fertileInfo: {
    gap: 12,
  },
  fertileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fertileLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  fertileValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.black,
  },
  moodInfo: {
    alignItems: 'center',
  },
  moodValue: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.black,
    marginBottom: 16,
  },
  moodIntensity: {
    width: '100%',
    alignItems: 'center',
  },
  moodLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 8,
  },
  intensityBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: 4,
  },
  intensityFill: {
    height: '100%',
    backgroundColor: colors.tertiary,
    borderRadius: 4,
  },
  intensityText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  symptomText: {
    fontSize: 12,
    color: colors.gray[700],
  },
  pregnancyInfo: {
    alignItems: 'center',
  },
  pregnancyWeek: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.success,
  },
  pregnancyLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  postpartumText: {
    fontSize: 14,
    color: colors.gray[700],
    textAlign: 'center',
  },
  menopauseText: {
    fontSize: 14,
    color: colors.gray[700],
    textAlign: 'center',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  privacyText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});