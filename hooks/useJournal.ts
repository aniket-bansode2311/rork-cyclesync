import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { JournalEntry, JournalFilters, JournalStats } from '@/types/journal';
import { secureStorage } from '@/utils/secureStorage';

const JOURNAL_STORAGE_KEY = 'journal_entries';

export const [JournalProvider, useJournal] = createContextHook(() => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<JournalFilters>({});

  // Load entries from secure storage
  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const entries = await secureStorage.getSecureData<JournalEntry[]>(JOURNAL_STORAGE_KEY, true);
      if (entries) {
        setEntries(entries);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save entries to secure storage
  const saveEntries = useCallback(async (newEntries: JournalEntry[]) => {
    try {
      await secureStorage.setSecureData(JOURNAL_STORAGE_KEY, newEntries, true);
    } catch (error) {
      console.error('Error saving journal entries:', error);
    }
  }, []);

  // Add new journal entry
  const addEntry = useCallback(async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      encrypted: true,
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    await saveEntries(updatedEntries);
    return newEntry;
  }, [entries, saveEntries]);

  // Update existing entry
  const updateEntry = useCallback(async (id: string, updates: Partial<JournalEntry>) => {
    const updatedEntries = entries.map(entry =>
      entry.id === id
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    );
    setEntries(updatedEntries);
    await saveEntries(updatedEntries);
  }, [entries, saveEntries]);

  // Delete entry
  const deleteEntry = useCallback(async (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    await saveEntries(updatedEntries);
  }, [entries, saveEntries]);

  // Filter entries based on current filters
  const filteredEntries = entries.filter(entry => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!entry.title.toLowerCase().includes(query) && 
          !entry.content.toLowerCase().includes(query)) {
        return false;
      }
    }

    if (filters.dateFrom && entry.date < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && entry.date > filters.dateTo) {
      return false;
    }

    if (filters.mood && entry.mood !== filters.mood) {
      return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        entry.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    return true;
  });

  // Calculate journal statistics
  const stats: JournalStats = {
    totalEntries: entries.length,
    entriesThisMonth: entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && 
             entryDate.getFullYear() === now.getFullYear();
    }).length,
    mostUsedMood: entries.length > 0 ? 
      (() => {
        const moodCounts = entries.reduce((acc, entry) => {
          acc[entry.mood] = (acc[entry.mood] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        return Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
      })() : 'neutral',
    longestStreak: calculateLongestStreak(entries),
    currentStreak: calculateCurrentStreak(entries),
  };

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries: filteredEntries,
    allEntries: entries,
    isLoading,
    filters,
    stats,
    setFilters,
    addEntry,
    updateEntry,
    deleteEntry,
    loadEntries,
  };
});

// Helper function to calculate longest streak
function calculateLongestStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  const sortedDates = entries
    .map(entry => entry.date)
    .sort()
    .map(date => new Date(date).toDateString());

  const uniqueDates = [...new Set(sortedDates)];
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currentDate = new Date(uniqueDates[i]);
    const diffTime = currentDate.getTime() - prevDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

// Helper function to calculate current streak
function calculateCurrentStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  const sortedDates = entries
    .map(entry => entry.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => new Date(date).toDateString());

  const uniqueDates = [...new Set(sortedDates)];
  
  // Check if there's an entry today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(uniqueDates[0]);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i]);
    const expectedDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    
    if (prevDate.toDateString() === expectedDate.toDateString()) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}