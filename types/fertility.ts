export interface BBTEntry {
  id: string;
  date: string; // ISO date string
  temperature: number; // in Celsius
  timeOfMeasurement: string; // HH:MM format
  notes?: string;
}

export interface CervicalMucusEntry {
  id: string;
  date: string; // ISO date string
  consistency: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg-white';
  amount: 'none' | 'light' | 'moderate' | 'heavy';
  notes?: string;
}

export interface FertilityContextType {
  bbtEntries: BBTEntry[];
  cervicalMucusEntries: CervicalMucusEntry[];
  addBBTEntry: (entry: Omit<BBTEntry, 'id'>) => void;
  updateBBTEntry: (id: string, updates: Partial<BBTEntry>) => void;
  deleteBBTEntry: (id: string) => void;
  addCervicalMucusEntry: (entry: Omit<CervicalMucusEntry, 'id'>) => void;
  updateCervicalMucusEntry: (id: string, updates: Partial<CervicalMucusEntry>) => void;
  deleteCervicalMucusEntry: (id: string) => void;
  isLoading: boolean;
}

export interface FertilityInsight {
  date: string;
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  fertilityScore: number; // 0-100
  bbtTrend: 'rising' | 'falling' | 'stable';
  ovulationPrediction?: string; // ISO date string
}