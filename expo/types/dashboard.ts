export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  isEnabled: boolean;
  position: number;
  size: WidgetSize;
}

export type WidgetType = 
  | 'cycle_calendar'
  | 'period_countdown'
  | 'ovulation_countdown'
  | 'symptom_summary'
  | 'mood_trend'
  | 'water_intake'
  | 'cycle_stats'
  | 'fertility_window';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface DashboardSettings {
  widgets: DashboardWidget[];
  layout: 'grid' | 'list';
  refreshInterval: number;
}

export interface DashboardContextType {
  settings: DashboardSettings;
  updateWidgetSettings: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  toggleWidget: (widgetId: string) => void;
  reorderWidgets: (widgets: DashboardWidget[]) => void;
  resetToDefault: () => void;
  isLoading: boolean;
}