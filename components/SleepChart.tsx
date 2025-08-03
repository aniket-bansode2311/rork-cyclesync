import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SleepTrend } from '@/types/sleep';

interface SleepChartProps {
  data: SleepTrend[];
  type: 'duration' | 'quality';
}

export default function SleepChart({ data, type }: SleepChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No sleep data available</Text>
      </View>
    );
  }

  const maxValue = type === 'duration' 
    ? Math.max(...data.map(d => d.duration))
    : 5;

  const getBarHeight = (value: number) => {
    const percentage = (value / maxValue) * 100;
    return Math.max(percentage, 5);
  };

  const getBarColor = (value: number) => {
    if (type === 'duration') {
      if (value >= 7 && value <= 9) return '#4CAF50';
      if (value >= 6 && value < 7) return '#FFC107';
      return '#FF5722';
    } else {
      if (value >= 4) return '#4CAF50';
      if (value >= 3) return '#FFC107';
      return '#FF5722';
    }
  };

  const formatValue = (value: number) => {
    if (type === 'duration') {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type === 'duration' ? 'Sleep Duration' : 'Sleep Quality'} Trend
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.chartContainer}
        contentContainerStyle={styles.chartContent}
      >
        <View style={styles.chart}>
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const value = type === 'duration' ? item.duration : item.quality;
              const barHeight = getBarHeight(value);
              const barColor = getBarColor(value);
              
              return (
                <View key={index} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    <Text style={styles.valueLabel}>{formatValue(value)}</Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${barHeight}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dateLabel}>{formatDate(item.date)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>
            {type === 'duration' ? 'Optimal (7-9h)' : 'Good (4-5)'}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>
            {type === 'duration' ? 'Fair (6-7h)' : 'Fair (3)'}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF5722' }]} />
          <Text style={styles.legendText}>
            {type === 'duration' ? 'Poor (<6h)' : 'Poor (1-2)'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  chartContainer: {
    marginBottom: 16,
  },
  chartContent: {
    paddingHorizontal: 8,
  },
  chart: {
    height: 200,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 30,
  },
  barWrapper: {
    alignItems: 'center',
    marginHorizontal: 4,
    minWidth: 40,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 8,
  },
  valueLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});