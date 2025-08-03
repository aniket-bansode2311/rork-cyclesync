import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { X, Settings, Eye, EyeOff } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Button } from '@/components/Button';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardWidget } from '@/types/dashboard';

interface DashboardCustomizationProps {
  visible: boolean;
  onClose: () => void;
}

export function DashboardCustomization({ visible, onClose }: DashboardCustomizationProps) {
  const { settings, toggleWidget, resetToDefault } = useDashboard();
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);

  const handleToggleWidget = (widgetId: string) => {
    toggleWidget(widgetId);
  };

  const handleResetToDefault = () => {
    resetToDefault();
    onClose();
  };

  const getWidgetDescription = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'cycle_calendar':
        return 'View your cycle calendar with period and fertile days';
      case 'period_countdown':
        return 'See days remaining until your next predicted period';
      case 'ovulation_countdown':
        return 'Track days until your predicted ovulation';
      case 'symptom_summary':
        return 'Quick overview of today\'s logged symptoms';
      case 'mood_trend':
        return 'View your recent mood patterns and trends';
      case 'water_intake':
        return 'Monitor your daily water intake progress';
      default:
        return widget.description;
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
          <Text style={styles.title}>Customize Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Available Widgets</Text>
          <Text style={styles.sectionDescription}>
            Choose which widgets to display on your dashboard
          </Text>

          <View style={styles.widgetsList}>
            {settings.widgets.map((widget) => (
              <View key={widget.id} style={styles.widgetItem}>
                <View style={styles.widgetInfo}>
                  <View style={styles.widgetHeader}>
                    <Text style={styles.widgetTitle}>{widget.title}</Text>
                    <View style={styles.widgetActions}>
                      {widget.isEnabled ? (
                        <Eye size={16} color={colors.success} />
                      ) : (
                        <EyeOff size={16} color={colors.gray[400]} />
                      )}
                      <Switch
                        value={widget.isEnabled}
                        onValueChange={() => handleToggleWidget(widget.id)}
                        trackColor={{ false: colors.gray[300], true: colors.primary + '40' }}
                        thumbColor={widget.isEnabled ? colors.primary : colors.gray[500]}
                      />
                    </View>
                  </View>
                  <Text style={styles.widgetDescription}>
                    {getWidgetDescription(widget)}
                  </Text>
                  <View style={styles.widgetMeta}>
                    <Text style={styles.widgetSize}>Size: {widget.size}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              title="Reset to Default"
              variant="outline"
              onPress={handleResetToDefault}
              leftIcon={<Settings size={18} color={colors.primary} />}
              style={styles.resetButton}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 20,
  },
  widgetsList: {
    gap: 16,
  },
  widgetItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  widgetInfo: {
    flex: 1,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
  },
  widgetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  widgetDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 8,
    lineHeight: 20,
  },
  widgetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetSize: {
    fontSize: 12,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  actions: {
    marginTop: 32,
    marginBottom: 32,
  },
  resetButton: {
    width: '100%',
  },
});