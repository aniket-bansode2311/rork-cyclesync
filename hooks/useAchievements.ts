import { useState, useEffect, useCallback } from 'react';
import { Achievement, UserAchievement, AchievementContextType } from '@/types/achievements';
import {
  defaultAchievements,
  loadUserAchievements,
  loadAchievementProgress,
  checkForNewAchievements,
  updateProgress
} from '@/utils/achievementService';
import * as Notifications from 'expo-notifications';
import createContextHook from '@nkzw/create-context-hook';

export const [AchievementProvider, useAchievements] = createContextHook((): AchievementContextType => {
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [userAchs, progress] = await Promise.all([
        loadUserAchievements(),
        loadAchievementProgress()
      ]);

      setUserAchievements(userAchs);
      
      const updatedAchievements = defaultAchievements.map(achievement => {
        const userAch = userAchs.find(ua => ua.achievementId === achievement.id);
        const currentProgress = progress[achievement.id]?.progress || 0;
        
        return {
          ...achievement,
          progress: currentProgress,
          unlockedAt: userAch?.unlockedAt
        };
      });
      
      setAchievements(updatedAchievements);
    } catch (error) {
      console.error('Error loading achievement data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAchievements = useCallback(async () => {
    try {
      const newAchievements = await checkForNewAchievements();
      
      if (newAchievements.length > 0) {
        for (const achievement of newAchievements) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Achievement Unlocked! 🏆',
              body: `You've earned "${achievement.title}"!`,
              data: { achievementId: achievement.id }
            },
            trigger: null
          });
        }
        
        await loadData();
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [loadData]);

  const getAchievementProgress = useCallback((achievementId: string): number => {
    const achievement = achievements.find(a => a.id === achievementId);
    return achievement?.progress || 0;
  }, [achievements]);

  const isAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return userAchievements.some(ua => ua.achievementId === achievementId);
  }, [userAchievements]);

  const trackAction = useCallback(async (action: string, value: number = 1, isStreak: boolean = false) => {
    await updateProgress(action, value, isStreak);
    await checkAchievements();
  }, [checkAchievements]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unlockedCount = userAchievements.length;
  const totalCount = defaultAchievements.length;

  return {
    achievements,
    userAchievements,
    checkAchievements,
    getAchievementProgress,
    isAchievementUnlocked,
    unlockedCount,
    totalCount,
    trackAction,
    isLoading
  };
});