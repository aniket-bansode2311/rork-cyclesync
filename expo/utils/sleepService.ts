import { SleepEntry, SleepStats, SleepTrend } from '@/types/sleep';

export const sleepService = {
  async saveSleepEntry(entry: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<SleepEntry> {
    const newEntry: SleepEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('https://api.cyclesync.com/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        throw new Error('Failed to save sleep entry');
      }

      return await response.json();
    } catch (error) {
      console.log('Using mock data for sleep entry save');
      return newEntry;
    }
  },

  async getSleepEntries(startDate?: string, endDate?: string): Promise<SleepEntry[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`https://api.cyclesync.com/sleep?${params}`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sleep entries');
      }

      return await response.json();
    } catch (error) {
      console.log('Using mock data for sleep entries');
      return generateMockSleepEntries();
    }
  },

  async updateSleepEntry(id: string, updates: Partial<SleepEntry>): Promise<SleepEntry> {
    try {
      const response = await fetch(`https://api.cyclesync.com/sleep/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({ ...updates, updatedAt: new Date().toISOString() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update sleep entry');
      }

      return await response.json();
    } catch (error) {
      console.log('Using mock data for sleep entry update');
      return { ...updates, updatedAt: new Date().toISOString() } as SleepEntry;
    }
  },

  async deleteSleepEntry(id: string): Promise<void> {
    try {
      const response = await fetch(`https://api.cyclesync.com/sleep/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete sleep entry');
      }
    } catch (error) {
      console.log('Using mock data for sleep entry deletion');
    }
  },

  calculateSleepDuration(bedTime: string, wakeTime: string): number {
    const bed = new Date(`2000-01-01T${bedTime}`);
    let wake = new Date(`2000-01-01T${wakeTime}`);
    
    if (wake < bed) {
      wake = new Date(`2000-01-02T${wakeTime}`);
    }
    
    return (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
  },

  calculateSleepStats(entries: SleepEntry[]): SleepStats {
    if (entries.length === 0) {
      return {
        averageDuration: 0,
        averageQuality: 0,
        totalEntries: 0,
        bestSleep: null,
        worstSleep: null,
      };
    }

    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalQuality = entries.reduce((sum, entry) => sum + entry.quality, 0);
    
    const bestSleep = entries.reduce((best, entry) => 
      entry.quality > (best?.quality || 0) ? entry : best
    );
    
    const worstSleep = entries.reduce((worst, entry) => 
      entry.quality < (worst?.quality || 6) ? entry : worst
    );

    return {
      averageDuration: totalDuration / entries.length,
      averageQuality: totalQuality / entries.length,
      totalEntries: entries.length,
      bestSleep,
      worstSleep,
    };
  },

  getSleepTrends(entries: SleepEntry[], days: number = 30): SleepTrend[] {
    const sortedEntries = entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-days);

    return sortedEntries.map(entry => ({
      date: entry.date,
      duration: entry.duration,
      quality: entry.quality,
    }));
  },
};

async function getAuthToken(): Promise<string> {
  return 'mock-token';
}

function generateMockSleepEntries(): SleepEntry[] {
  const entries: SleepEntry[] = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const bedHour = 22 + Math.floor(Math.random() * 3);
    const bedMinute = Math.floor(Math.random() * 60);
    const wakeHour = 6 + Math.floor(Math.random() * 3);
    const wakeMinute = Math.floor(Math.random() * 60);
    
    const bedTime = `${bedHour.toString().padStart(2, '0')}:${bedMinute.toString().padStart(2, '0')}`;
    const wakeTime = `${wakeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
    const duration = sleepService.calculateSleepDuration(bedTime, wakeTime);
    
    entries.push({
      id: `mock-${i}`,
      date: date.toISOString().split('T')[0],
      bedTime,
      wakeTime,
      duration,
      quality: Math.floor(Math.random() * 5) + 1,
      notes: Math.random() > 0.7 ? 'Had trouble falling asleep' : undefined,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }
  
  return entries;
}