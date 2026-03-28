import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardSettings, DashboardWidget } from '@/types/dashboard';

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'period_countdown',
    type: 'period_countdown',
    title: 'Next Period',
    description: 'Days until next period',
    isEnabled: true,
    position: 0,
    size: 'large'
  },
  {
    id: 'ovulation_countdown',
    type: 'ovulation_countdown',
    title: 'Ovulation Window',
    description: 'Days until ovulation',
    isEnabled: true,
    position: 1,
    size: 'medium'
  },
  {
    id: 'symptom_summary',
    type: 'symptom_summary',
    title: 'Today\'s Symptoms',
    description: 'Summary of logged symptoms',
    isEnabled: true,
    position: 2,
    size: 'medium'
  },
  {
    id: 'mood_trend',
    type: 'mood_trend',
    title: 'Mood Trend',
    description: 'Your recent mood patterns',
    isEnabled: true,
    position: 3,
    size: 'small'
  },
  {
    id: 'water_intake',
    type: 'water_intake',
    title: 'Water Intake',
    description: 'Daily hydration progress',
    isEnabled: true,
    position: 4,
    size: 'small'
  }
];

const DEFAULT_SETTINGS: DashboardSettings = {
  widgets: DEFAULT_WIDGETS,
  layout: 'grid',
  refreshInterval: 300000 // 5 minutes
};

export function useDashboard() {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('dashboard_settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error loading dashboard settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: DashboardSettings) => {
    try {
      await AsyncStorage.setItem('dashboard_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving dashboard settings:', error);
    }
  };

  const updateWidgetSettings = (widgetId: string, updates: Partial<DashboardWidget>) => {
    const updatedWidgets = settings.widgets.map(widget => 
      widget.id === widgetId ? { ...widget, ...updates } : widget
    );
    const newSettings = { ...settings, widgets: updatedWidgets };
    saveSettings(newSettings);
  };

  const toggleWidget = (widgetId: string) => {
    const widget = settings.widgets.find(w => w.id === widgetId);
    if (widget) {
      updateWidgetSettings(widgetId, { isEnabled: !widget.isEnabled });
    }
  };

  const reorderWidgets = (widgets: DashboardWidget[]) => {
    const newSettings = { ...settings, widgets };
    saveSettings(newSettings);
  };

  const resetToDefault = () => {
    saveSettings(DEFAULT_SETTINGS);
  };

  const getEnabledWidgets = () => {
    return settings.widgets
      .filter(widget => widget.isEnabled)
      .sort((a, b) => a.position - b.position);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    updateWidgetSettings,
    toggleWidget,
    reorderWidgets,
    resetToDefault,
    getEnabledWidgets,
    isLoading
  };
}