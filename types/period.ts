export interface Period {
  id: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  cycleLength?: number;
  notes?: string;
}

export interface CycleStats {
  averageCycleLength: number;
  nextPredictedPeriod?: string; // ISO date string
  totalPeriods: number;
}

export interface PeriodContextType {
  periods: Period[];
  cycleStats: CycleStats;
  addPeriod: (period: Omit<Period, 'id'>) => void;
  updatePeriod: (id: string, updates: Partial<Period>) => void;
  deletePeriod: (id: string) => void;
  isLoading: boolean;
}