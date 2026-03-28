import { Period, CycleStats } from '@/types/period';

export function calculateCycleLength(startDate1: string, startDate2: string): number {
  const date1 = new Date(startDate1);
  const date2 = new Date(startDate2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateCycleStats(periods: Period[]): CycleStats {
  if (periods.length === 0) {
    return {
      averageCycleLength: 28,
      totalPeriods: 0,
    };
  }

  // Sort periods by start date
  const sortedPeriods = [...periods].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  let totalCycleLength = 0;
  let cycleCount = 0;

  // Calculate cycle lengths between consecutive periods
  for (let i = 1; i < sortedPeriods.length; i++) {
    const cycleLength = calculateCycleLength(
      sortedPeriods[i - 1].startDate,
      sortedPeriods[i].startDate
    );
    totalCycleLength += cycleLength;
    cycleCount++;
  }

  const averageCycleLength = cycleCount > 0 ? Math.round(totalCycleLength / cycleCount) : 28;

  // Predict next period
  let nextPredictedPeriod: string | undefined;
  if (sortedPeriods.length > 0) {
    const lastPeriod = sortedPeriods[sortedPeriods.length - 1];
    const lastPeriodDate = new Date(lastPeriod.startDate);
    const nextPeriodDate = new Date(lastPeriodDate.getTime() + (averageCycleLength * 24 * 60 * 60 * 1000));
    nextPredictedPeriod = nextPeriodDate.toISOString().split('T')[0];
  }

  return {
    averageCycleLength,
    nextPredictedPeriod,
    totalPeriods: periods.length,
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getDaysUntilNextPeriod(nextPeriodDate: string): number {
  const today = new Date();
  const nextDate = new Date(nextPeriodDate);
  const diffTime = nextDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isDateInRange(date: string, startDate: string, endDate?: string): boolean {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  
  if (!endDate) {
    return checkDate.toDateString() === start.toDateString();
  }
  
  const end = new Date(endDate);
  return checkDate >= start && checkDate <= end;
}

// Fertility and ovulation calculations
export function calculateOvulationDate(lastPeriodStart: string, cycleLength: number): Date {
  const lastPeriod = new Date(lastPeriodStart);
  const ovulationDay = cycleLength - 14; // Ovulation typically occurs 14 days before next period
  const ovulationDate = new Date(lastPeriod.getTime() + (ovulationDay * 24 * 60 * 60 * 1000));
  return ovulationDate;
}

export function calculateFertileWindow(ovulationDate: Date): { start: Date; end: Date } {
  // Fertile window is typically 5 days before ovulation and 1 day after
  const fertileStart = new Date(ovulationDate.getTime() - (5 * 24 * 60 * 60 * 1000));
  const fertileEnd = new Date(ovulationDate.getTime() + (1 * 24 * 60 * 60 * 1000));
  
  return { start: fertileStart, end: fertileEnd };
}

export function getPredictedOvulationDate(periods: Period[]): Date | null {
  if (periods.length === 0) return null;
  
  const stats = calculateCycleStats(periods);
  const sortedPeriods = [...periods].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  
  const lastPeriod = sortedPeriods[0];
  return calculateOvulationDate(lastPeriod.startDate, stats.averageCycleLength);
}

export function getPredictedFertileWindow(periods: Period[]): { start: Date; end: Date } | null {
  const ovulationDate = getPredictedOvulationDate(periods);
  if (!ovulationDate) return null;
  
  return calculateFertileWindow(ovulationDate);
}