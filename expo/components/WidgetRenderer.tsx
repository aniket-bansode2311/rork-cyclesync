import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DashboardWidget } from '@/components/DashboardWidget';
import { CycleCalendarWidget } from '@/components/widgets/CycleCalendarWidget';
import { PeriodCountdownWidget } from '@/components/widgets/PeriodCountdownWidget';
import { OvulationCountdownWidget } from '@/components/widgets/OvulationCountdownWidget';
import { SymptomSummaryWidget } from '@/components/widgets/SymptomSummaryWidget';
import { MoodTrendWidget } from '@/components/widgets/MoodTrendWidget';
import { WaterIntakeWidget } from '@/components/widgets/WaterIntakeWidget';
import { DashboardWidget as WidgetType } from '@/types/dashboard';

interface WidgetRendererProps {
  widget: WidgetType;
  onSettings?: () => void;
}

export function WidgetRenderer({ widget, onSettings }: WidgetRendererProps) {
  const router = useRouter();

  const getWidgetContent = () => {
    switch (widget.type) {
      case 'cycle_calendar':
        return <CycleCalendarWidget />;
      case 'period_countdown':
        return <PeriodCountdownWidget />;
      case 'ovulation_countdown':
        return <OvulationCountdownWidget />;
      case 'symptom_summary':
        return <SymptomSummaryWidget />;
      case 'mood_trend':
        return <MoodTrendWidget />;
      case 'water_intake':
        return <WaterIntakeWidget />;
      default:
        return null;
    }
  };

  const getNavigationRoute = () => {
    switch (widget.type) {
      case 'cycle_calendar':
        return '/(app)/history';
      case 'period_countdown':
        return '/(app)/history';
      case 'ovulation_countdown':
        return '/(app)/fertility-insights';
      case 'symptom_summary':
        return '/(app)/symptoms';
      case 'mood_trend':
        return '/(app)/symptoms';
      case 'water_intake':
        return '/(app)/water-intake';
      default:
        return null;
    }
  };

  const handleWidgetPress = () => {
    const route = getNavigationRoute();
    if (route) {
      router.push(route as any);
    }
  };

  const content = getWidgetContent();
  if (!content) return null;

  return (
    <TouchableOpacity onPress={handleWidgetPress} activeOpacity={0.7}>
      <DashboardWidget widget={widget} onSettings={onSettings}>
        {content}
      </DashboardWidget>
    </TouchableOpacity>
  );
}