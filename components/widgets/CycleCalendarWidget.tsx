import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PeriodCalendar } from '@/components/PeriodCalendar';
import { usePeriods } from '@/hooks/usePeriods';

export function CycleCalendarWidget() {
  const { periods } = usePeriods();

  return (
    <View style={styles.container}>
      <PeriodCalendar
        periods={periods}
        onDateSelect={() => {}} // Read-only in widget
        compact={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});