import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { BBTEntry } from '@/types/fertility';

interface BBTChartProps {
  entries: BBTEntry[];
  height?: number;
}

export function BBTChart({ entries, height = 200 }: BBTChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 32, entries.length * 40);
  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  
  if (entries.length === 0) {
    return (
      <View style={[styles.container, { height: chartHeight }]}>
        <Text style={styles.emptyText}>No BBT data to display</Text>
      </View>
    );
  }

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate temperature range
  const temperatures = sortedEntries.map(entry => entry.temperature);
  const minTemp = Math.min(...temperatures) - 0.2;
  const maxTemp = Math.max(...temperatures) + 0.2;
  const tempRange = maxTemp - minTemp;

  // Chart dimensions
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index: number) => padding.left + (index / (sortedEntries.length - 1)) * plotWidth;
  const yScale = (temp: number) => padding.top + ((maxTemp - temp) / tempRange) * plotHeight;

  // Generate path for the line
  const pathData = sortedEntries
    .map((entry, index) => {
      const x = xScale(index);
      const y = yScale(entry.temperature);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // Generate y-axis labels
  const yAxisLabels = [];
  const labelCount = 5;
  for (let i = 0; i <= labelCount; i++) {
    const temp = minTemp + (tempRange * i) / labelCount;
    const y = yScale(temp);
    yAxisLabels.push({ temp: temp.toFixed(1), y });
  }

  // Calculate average temperature for reference line
  const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
  const avgY = yScale(avgTemp);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BBT Chart</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Y-axis grid lines and labels */}
          {yAxisLabels.map((label, index) => (
            <React.Fragment key={index}>
              <Line
                x1={padding.left}
                y1={label.y}
                x2={chartWidth - padding.right}
                y2={label.y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <SvgText
                x={padding.left - 10}
                y={label.y + 4}
                fontSize="12"
                fill="#6B7280"
                textAnchor="end"
              >
                {label.temp}°C
              </SvgText>
            </React.Fragment>
          ))}

          {/* Average temperature line */}
          <Line
            x1={padding.left}
            y1={avgY}
            x2={chartWidth - padding.right}
            y2={avgY}
            stroke="#8B5CF6"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity={0.7}
          />

          {/* Temperature line */}
          <Path
            d={pathData}
            stroke="#EF4444"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {sortedEntries.map((entry, index) => {
            const x = xScale(index);
            const y = yScale(entry.temperature);
            const isHigh = entry.temperature > avgTemp;
            
            return (
              <React.Fragment key={entry.id}>
                <Circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill={isHigh ? "#EF4444" : "#3B82F6"}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                {/* Date labels (show every few points to avoid crowding) */}
                {index % Math.max(1, Math.floor(sortedEntries.length / 6)) === 0 && (
                  <SvgText
                    x={x}
                    y={chartHeight - padding.bottom + 15}
                    fontSize="10"
                    fill="#6B7280"
                    textAnchor="middle"
                  >
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}

          {/* X-axis line */}
          <Line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="#D1D5DB"
            strokeWidth="1"
          />

          {/* Y-axis line */}
          <Line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="#D1D5DB"
            strokeWidth="1"
          />
        </Svg>
      </ScrollView>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Temperature</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>Average ({avgTemp.toFixed(1)}°C)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 60,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLine: {
    width: 20,
    height: 2,
    opacity: 0.7,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});