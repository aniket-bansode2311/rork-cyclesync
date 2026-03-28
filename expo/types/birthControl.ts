export type BirthControlMethod = 
  | 'pill'
  | 'patch'
  | 'ring'
  | 'injection'
  | 'iud'
  | 'implant'
  | 'condom'
  | 'diaphragm'
  | 'other';

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface BirthControlReminder {
  id: string;
  method: BirthControlMethod;
  frequency: ReminderFrequency;
  time: string; // HH:MM format
  isActive: boolean;
  customName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BirthControlLog {
  id: string;
  reminderId: string;
  date: string; // YYYY-MM-DD format
  taken: boolean;
  takenAt?: string; // ISO string
  notes?: string;
  createdAt: string;
}

export interface BirthControlSettings {
  currentMethod?: BirthControlMethod;
  reminders: BirthControlReminder[];
  logs: BirthControlLog[];
  notificationsEnabled: boolean;
}

export const BIRTH_CONTROL_METHODS: { value: BirthControlMethod; label: string; frequency: ReminderFrequency[] }[] = [
  { value: 'pill', label: 'Birth Control Pill', frequency: ['daily'] },
  { value: 'patch', label: 'Contraceptive Patch', frequency: ['weekly'] },
  { value: 'ring', label: 'Vaginal Ring', frequency: ['monthly'] },
  { value: 'injection', label: 'Contraceptive Injection', frequency: ['quarterly'] },
  { value: 'iud', label: 'IUD', frequency: [] },
  { value: 'implant', label: 'Contraceptive Implant', frequency: [] },
  { value: 'condom', label: 'Condom', frequency: [] },
  { value: 'diaphragm', label: 'Diaphragm', frequency: [] },
  { value: 'other', label: 'Other', frequency: ['daily', 'weekly', 'monthly'] },
];