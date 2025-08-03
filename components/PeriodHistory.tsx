import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Edit3, Trash2, Calendar } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Period } from '@/types/period';
import { formatDate, calculateCycleLength } from '@/utils/periodCalculations';

interface PeriodHistoryProps {
  periods: Period[];
  onEditPeriod: (period: Period) => void;
  onDeletePeriod: (id: string) => void;
}

export function PeriodHistory({ periods, onEditPeriod, onDeletePeriod }: PeriodHistoryProps) {
  const sortedPeriods = [...periods].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const handleDelete = (period: Period) => {
    Alert.alert(
      'Delete Period',
      'Are you sure you want to delete this period? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeletePeriod(period.id)
        },
      ]
    );
  };

  const getPeriodDuration = (period: Period): string => {
    if (!period.endDate) {
      return '1 day';
    }
    
    const duration = calculateCycleLength(period.startDate, period.endDate) + 1;
    return `${duration} day${duration > 1 ? 's' : ''}`;
  };

  const getCycleLength = (period: Period, index: number): string | null => {
    if (index === sortedPeriods.length - 1) return null; // Last period
    
    const nextPeriod = sortedPeriods[index + 1];
    const cycleLength = calculateCycleLength(nextPeriod.startDate, period.startDate);
    return `${cycleLength} days`;
  };

  const renderPeriodItem = ({ item: period, index }: { item: Period; index: number }) => {
    const cycleLength = getCycleLength(period, index);
    
    return (
      <View style={styles.periodItem}>
        <View style={styles.periodHeader}>
          <View style={styles.periodInfo}>
            <View style={styles.dateRow}>
              <Calendar size={16} color={colors.primary} />
              <Text style={styles.dateText}>
                {formatDate(period.startDate)}
                {period.endDate && ` - ${formatDate(period.endDate)}`}
              </Text>
            </View>
            <Text style={styles.durationText}>
              Duration: {getPeriodDuration(period)}
            </Text>
            {cycleLength && (
              <Text style={styles.cycleText}>
                Cycle length: {cycleLength}
              </Text>
            )}
            {period.notes && (
              <Text style={styles.notesText} numberOfLines={2}>
                {period.notes}
              </Text>
            )}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEditPeriod(period)}
            >
              <Edit3 size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(period)}
            >
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (periods.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Calendar size={48} color={colors.gray[400]} />
        <Text style={styles.emptyTitle}>No periods logged yet</Text>
        <Text style={styles.emptyText}>
          Start tracking your periods to see your history and cycle predictions.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Period History</Text>
      <FlatList
        data={sortedPeriods}
        renderItem={renderPeriodItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  periodItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  periodInfo: {
    flex: 1,
    marginRight: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  durationText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 2,
  },
  cycleText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.gray[600],
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.gray[100],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[600],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
});