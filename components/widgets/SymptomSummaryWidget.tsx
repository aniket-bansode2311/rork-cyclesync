import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSymptoms } from '@/hooks/useSymptoms';

export function SymptomSummaryWidget() {
  const { getSymptomsByDate, getMoodsByDate } = useSymptoms();

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const todaySymptoms = getSymptomsByDate(getTodayString());
  const todayMoods = getMoodsByDate(getTodayString());

  const getSymptomSummary = () => {
    if (todaySymptoms.length === 0 && todayMoods.length === 0) {
      return 'No symptoms logged today';
    }

    const symptomCount = todaySymptoms.length;
    const moodCount = todayMoods.length;
    
    const parts = [];
    if (symptomCount > 0) {
      parts.push(`${symptomCount} symptom${symptomCount > 1 ? 's' : ''}`);
    }
    if (moodCount > 0) {
      parts.push(`${moodCount} mood${moodCount > 1 ? 's' : ''}`);
    }
    
    return parts.join(', ') + ' logged';
  };

  const getTopSymptoms = () => {
    if (todaySymptoms.length === 0) return [];
    
    return todaySymptoms.slice(0, 3).map(symptom => symptom.symptomName);
  };

  const topSymptoms = getTopSymptoms();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Activity size={20} color={colors.primary} />
        <Text style={styles.summaryText}>{getSymptomSummary()}</Text>
      </View>
      
      {topSymptoms.length > 0 && (
        <View style={styles.symptomsList}>
          {topSymptoms.map((symptom, index) => (
            <View key={index} style={styles.symptomTag}>
              <Text style={styles.symptomTagText}>{symptom}</Text>
            </View>
          ))}
        </View>
      )}
      
      {todaySymptoms.length === 0 && todayMoods.length === 0 && (
        <Text style={styles.noDataText}>
          Tap to log your symptoms and mood for today
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 8,
  },
  symptomsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  symptomTagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});