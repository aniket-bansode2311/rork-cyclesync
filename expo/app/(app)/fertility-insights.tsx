import { Stack } from 'expo-router';
import { Calendar, Heart, TrendingUp } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BBTChart } from '@/components/BBTChart';
import { useFertility, useFertilityInsights } from '@/hooks/useFertility';
import { usePeriods } from '@/hooks/usePeriods';

export default function FertilityInsightsScreen() {
  const { bbtEntries, cervicalMucusEntries } = useFertility();
  const { periods } = usePeriods();
  const { calculateBBTTrend, getFertilityScore } = useFertilityInsights();

  // Get recent entries for analysis
  const recentBBTEntries = useMemo(() => {
    return bbtEntries
      .slice(-30) // Last 30 entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bbtEntries]);

  const recentMucusEntries = useMemo(() => {
    return cervicalMucusEntries
      .slice(-30) // Last 30 entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [cervicalMucusEntries]);

  // Calculate current fertility insights
  const today = new Date().toISOString().split('T')[0];
  const currentFertilityScore = getFertilityScore(today);
  const bbtTrend = calculateBBTTrend(recentBBTEntries);

  // Predict ovulation based on BBT and mucus patterns
  const predictOvulation = useMemo(() => {
    if (recentBBTEntries.length < 7 || recentMucusEntries.length < 3) {
      return null;
    }

    // Look for temperature shift pattern
    const last7Days = recentBBTEntries.slice(-7);
    const tempShift = last7Days.some((entry, index) => {
      if (index < 3) return false;
      const recent3 = last7Days.slice(index - 3, index);
      const avg3 = recent3.reduce((sum, e) => sum + e.temperature, 0) / 3;
      return entry.temperature > avg3 + 0.2;
    });

    // Look for fertile mucus pattern
    const recentMucus = recentMucusEntries.slice(-5);
    const hasFertileMucus = recentMucus.some(entry => 
      entry.consistency === 'egg-white' || entry.consistency === 'watery'
    );

    if (tempShift && hasFertileMucus) {
      return 'Ovulation likely occurred in the past 1-3 days';
    } else if (hasFertileMucus && !tempShift) {
      return 'Approaching ovulation - fertile window';
    } else if (tempShift && !hasFertileMucus) {
      return 'Post-ovulation phase';
    }

    return 'Insufficient data for prediction';
  }, [recentBBTEntries, recentMucusEntries]);

  // Calculate cycle phase based on last period
  const currentPhase = useMemo(() => {
    if (periods.length === 0) return 'Unknown';
    
    const lastPeriod = periods
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
    
    const daysSinceLastPeriod = Math.floor(
      (new Date().getTime() - new Date(lastPeriod.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPeriod <= 5) return 'Menstrual';
    if (daysSinceLastPeriod <= 13) return 'Follicular';
    if (daysSinceLastPeriod <= 16) return 'Ovulation';
    return 'Luteal';
  }, [periods]);

  const getPhaseColor = (phase: string): string => {
    switch (phase) {
      case 'Menstrual': return '#EF4444';
      case 'Follicular': return '#F59E0B';
      case 'Ovulation': return '#10B981';
      case 'Luteal': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getFertilityColor = (score: number): string => {
    if (score >= 70) return '#10B981';
    if (score >= 40) return '#F59E0B';
    return '#6B7280';
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Fertility Insights',
          headerStyle: { backgroundColor: '#10B981' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <ScrollView style={styles.container}>
        {/* Current Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Heart size={24} color="#10B981" />
            <Text style={styles.statusTitle}>Current Status</Text>
          </View>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={[
                styles.phaseChip,
                { backgroundColor: getPhaseColor(currentPhase) + '20' }
              ]}>
                <Text style={[
                  styles.phaseText,
                  { color: getPhaseColor(currentPhase) }
                ]}>
                  {currentPhase} Phase
                </Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>
                {currentFertilityScore}%
              </Text>
              <Text style={[
                styles.statusLabel,
                { color: getFertilityColor(currentFertilityScore) }
              ]}>
                Fertility Score
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <View style={styles.trendContainer}>
                <TrendingUp 
                  size={16} 
                  color={bbtTrend === 'rising' ? '#10B981' : bbtTrend === 'falling' ? '#EF4444' : '#6B7280'} 
                />
                <Text style={[
                  styles.trendText,
                  { color: bbtTrend === 'rising' ? '#10B981' : bbtTrend === 'falling' ? '#EF4444' : '#6B7280' }
                ]}>
                  {bbtTrend.charAt(0).toUpperCase() + bbtTrend.slice(1)}
                </Text>
              </View>
              <Text style={styles.statusLabel}>BBT Trend</Text>
            </View>
          </View>
        </View>

        {/* Ovulation Prediction Card */}
        {predictOvulation && (
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <Calendar size={20} color="#8B5CF6" />
              <Text style={styles.predictionTitle}>Ovulation Prediction</Text>
            </View>
            <Text style={styles.predictionText}>{predictOvulation}</Text>
          </View>
        )}

        {/* BBT Chart */}
        <BBTChart entries={recentBBTEntries} height={250} />

        {/* Recent Cervical Mucus */}
        <View style={styles.mucusCard}>
          <Text style={styles.cardTitle}>Recent Cervical Mucus</Text>
          
          {recentMucusEntries.length === 0 ? (
            <Text style={styles.emptyText}>No cervical mucus data</Text>
          ) : (
            <View style={styles.mucusTimeline}>
              {recentMucusEntries.slice(-7).map((entry) => {
                const consistencyColors = {
                  'dry': '#F59E0B',
                  'sticky': '#EF4444',
                  'creamy': '#8B5CF6',
                  'watery': '#06B6D4',
                  'egg-white': '#10B981',
                };
                
                return (
                  <View key={entry.id} style={styles.mucusEntry}>
                    <Text style={styles.mucusDate}>
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                    <View style={[
                      styles.mucusDot,
                      { backgroundColor: consistencyColors[entry.consistency] }
                    ]} />
                    <Text style={styles.mucusLabel}>
                      {entry.consistency.charAt(0).toUpperCase() + entry.consistency.slice(1)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Fertility Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.cardTitle}>Fertility Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • Take BBT at the same time each morning before getting up
            </Text>
            <Text style={styles.tipItem}>
              • Track cervical mucus daily for best results
            </Text>
            <Text style={styles.tipItem}>
              • Egg-white mucus indicates peak fertility
            </Text>
            <Text style={styles.tipItem}>
              • Temperature rise confirms ovulation has occurred
            </Text>
            <Text style={styles.tipItem}>
              • Combine multiple signs for accurate prediction
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F5FF',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginLeft: 8,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  phaseChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  predictionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginLeft: 8,
  },
  predictionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  mucusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mucusTimeline: {
    gap: 12,
  },
  mucusEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mucusDate: {
    fontSize: 12,
    color: '#6B7280',
    width: 50,
  },
  mucusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mucusLabel: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});