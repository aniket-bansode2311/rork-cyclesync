import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SleepEntry, SleepStats, SleepTrend } from '@/types/sleep';
import { sleepService } from '@/utils/sleepService';

export function useSleep() {
  const queryClient = useQueryClient();

  const sleepEntriesQuery = useQuery({
    queryKey: ['sleepEntries'],
    queryFn: () => sleepService.getSleepEntries(),
  });

  const addSleepEntryMutation = useMutation({
    mutationFn: sleepService.saveSleepEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleepEntries'] });
    },
  });

  const updateSleepEntryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SleepEntry> }) =>
      sleepService.updateSleepEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleepEntries'] });
    },
  });

  const deleteSleepEntryMutation = useMutation({
    mutationFn: sleepService.deleteSleepEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleepEntries'] });
    },
  });

  const sleepStats = sleepEntriesQuery.data 
    ? sleepService.calculateSleepStats(sleepEntriesQuery.data)
    : null;

  const sleepTrends = sleepEntriesQuery.data 
    ? sleepService.getSleepTrends(sleepEntriesQuery.data)
    : [];

  return {
    sleepEntries: sleepEntriesQuery.data || [],
    sleepStats,
    sleepTrends,
    isLoading: sleepEntriesQuery.isLoading,
    error: sleepEntriesQuery.error,
    addSleepEntry: addSleepEntryMutation.mutate,
    updateSleepEntry: updateSleepEntryMutation.mutate,
    deleteSleepEntry: deleteSleepEntryMutation.mutate,
    isAddingEntry: addSleepEntryMutation.isPending,
    isUpdatingEntry: updateSleepEntryMutation.isPending,
    isDeletingEntry: deleteSleepEntryMutation.isPending,
  };
}

export function useSleepEntry(id: string) {
  const { sleepEntries } = useSleep();
  return sleepEntries.find(entry => entry.id === id);
}