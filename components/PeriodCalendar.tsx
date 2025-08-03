import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import colors from '@/constants/colors';
import { Period } from '@/types/period';

interface PeriodCalendarProps {
  periods: Period[];
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  markedDates?: { [key: string]: any };
  compact?: boolean;
}

export function PeriodCalendar({ 
  periods, 
  selectedDate, 
  onDateSelect, 
  markedDates = {} 
}: PeriodCalendarProps) {
  // Create marked dates for periods
  const periodMarkedDates = periods.reduce((acc, period) => {
    const startDate = new Date(period.startDate);
    const endDate = period.endDate ? new Date(period.endDate) : startDate;
    
    // Mark all days in the period range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      acc[dateString] = {
        color: colors.primary,
        textColor: colors.white,
        startingDay: currentDate.getTime() === startDate.getTime(),
        endingDay: currentDate.getTime() === endDate.getTime(),
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return acc;
  }, {} as { [key: string]: any });

  // Combine all marked dates
  const allMarkedDates = {
    ...periodMarkedDates,
    ...markedDates,
  };

  // Add selected date marking
  if (selectedDate) {
    allMarkedDates[selectedDate] = {
      ...allMarkedDates[selectedDate],
      selected: true,
      selectedColor: colors.secondary,
    };
  }

  const handleDayPress = (day: DateData) => {
    onDateSelect(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={allMarkedDates}
        markingType="period"
        theme={{
          backgroundColor: colors.white,
          calendarBackground: colors.white,
          textSectionTitleColor: colors.gray[600],
          selectedDayBackgroundColor: colors.secondary,
          selectedDayTextColor: colors.white,
          todayTextColor: colors.primary,
          dayTextColor: colors.black,
          textDisabledColor: colors.gray[300],
          dotColor: colors.primary,
          selectedDotColor: colors.white,
          arrowColor: colors.primary,
          monthTextColor: colors.black,
          indicatorColor: colors.primary,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Period Days</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
          <Text style={styles.legendText}>Selected Date</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: {
    borderRadius: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: colors.gray[600],
  },
});