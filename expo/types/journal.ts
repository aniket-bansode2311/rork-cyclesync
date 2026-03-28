export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'happy' | 'sad' | 'anxious' | 'calm' | 'excited' | 'stressed' | 'neutral';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  encrypted?: boolean;
}

export interface JournalFilters {
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  mood?: string;
  tags?: string[];
}

export interface JournalStats {
  totalEntries: number;
  entriesThisMonth: number;
  mostUsedMood: string;
  longestStreak: number;
  currentStreak: number;
}