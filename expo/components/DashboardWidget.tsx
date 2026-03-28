import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import colors from '@/constants/colors';
import { DashboardWidget as WidgetType, WidgetSize } from '@/types/dashboard';

interface DashboardWidgetProps {
  widget: WidgetType;
  children: React.ReactNode;
  onSettings?: () => void;
}

export function DashboardWidget({ widget, children, onSettings }: DashboardWidgetProps) {
  const getWidgetStyle = (size: WidgetSize) => {
    switch (size) {
      case 'small':
        return styles.smallWidget;
      case 'medium':
        return styles.mediumWidget;
      case 'large':
        return styles.largeWidget;
      default:
        return styles.mediumWidget;
    }
  };

  return (
    <View style={[styles.container, getWidgetStyle(widget.size)]}>
      <View style={styles.header}>
        <Text style={styles.title}>{widget.title}</Text>
        {onSettings && (
          <TouchableOpacity onPress={onSettings} style={styles.settingsButton}>
            <Settings size={16} color={colors.gray[600]} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  smallWidget: {
    minHeight: 120,
  },
  mediumWidget: {
    minHeight: 180,
  },
  largeWidget: {
    minHeight: 240,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
});