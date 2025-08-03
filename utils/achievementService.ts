import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, UserAchievement, AchievementProgress } from '@/types/achievements';

const ACHIEVEMENTS_KEY = 'user_achievements';
const PROGRESS_KEY = 'achievement_progress';

export const defaultAchievements: Achievement[] = [
  {
    id: 'first_log',
    title: 'First Log',
    description: 'Log your first period',
    icon: 'Calendar',
    category: 'logging',
    requirement: {
      type: 'count',
      target: 1,
      action: 'period_logged'
    },
    progress: 0
  },
  {
    id: 'consistent_logger',
    title: 'Consistent Logger',
    description: 'Log symptoms for 7 consecutive days',
    icon: 'Target',
    category: 'consistency',
    requirement: {
      type: 'streak',
      target: 7,
      action: 'symptom_logged'
    },
    progress: 0
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Explore the educational content library',
    icon: 'BookOpen',
    category: 'exploration',
    requirement: {
      type: 'action',
      target: 1,
      action: 'education_visited'
    },
    progress: 0
  },
  {
    id: 'hydration_hero',
    title: 'Hydration Hero',
    description: 'Log your daily water goal for 3 days in a row',
    icon: 'Droplets',
    category: 'wellness',
    requirement: {
      type: 'streak',
      target: 3,
      action: 'water_goal_met'
    },
    progress: 0
  },
  {
    id: 'symptom_tracker',
    title: 'Symptom Tracker',
    description: 'Log 10 different symptoms',
    icon: 'Activity',
    category: 'logging',
    requirement: {
      type: 'count',
      target: 10,
      action: 'unique_symptoms_logged'
    },
    progress: 0
  },
  {
    id: 'wellness_warrior',
    title: 'Wellness Warrior',
    description: 'Complete 5 wellness activities',
    icon: 'Heart',
    category: 'wellness',
    requirement: {
      type: 'count',
      target: 5,
      action: 'wellness_activity_completed'
    },
    progress: 0
  },
  {
    id: 'cycle_expert',
    title: 'Cycle Expert',
    description: 'Track 3 complete cycles',
    icon: 'RotateCcw',
    category: 'logging',
    requirement: {
      type: 'count',
      target: 3,
      action: 'cycle_completed'
    },
    progress: 0
  },
  {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Read 5 educational articles',
    icon: 'GraduationCap',
    category: 'exploration',
    requirement: {
      type: 'count',
      target: 5,
      action: 'article_read'
    },
    progress: 0
  }
];

export const saveUserAchievements = async (achievements: UserAchievement[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving user achievements:', error);
  }
};

export const loadUserAchievements = async (): Promise<UserAchievement[]> => {
  try {
    const stored = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading user achievements:', error);
    return [];
  }
};

export const saveAchievementProgress = async (progress: AchievementProgress): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving achievement progress:', error);
  }
};

export const loadAchievementProgress = async (): Promise<AchievementProgress> => {
  try {
    const stored = await AsyncStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading achievement progress:', error);
    return {};
  }
};

export const updateProgress = async (
  action: string,
  value: number = 1,
  isStreak: boolean = false
): Promise<void> => {
  try {
    const progress = await loadAchievementProgress();
    const now = new Date();
    
    for (const achievement of defaultAchievements) {
      if (achievement.requirement.action === action) {
        const currentProgress = progress[achievement.id] || { progress: 0, lastUpdated: now };
        
        if (achievement.requirement.type === 'streak') {
          if (isStreak) {
            const lastUpdate = new Date(currentProgress.lastUpdated);
            const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
              currentProgress.progress += value;
            } else if (daysDiff > 1) {
              currentProgress.progress = value;
            }
          } else {
            currentProgress.progress = 0;
          }
        } else {
          currentProgress.progress += value;
        }
        
        currentProgress.lastUpdated = now;
        progress[achievement.id] = currentProgress;
      }
    }
    
    await saveAchievementProgress(progress);
  } catch (error) {
    console.error('Error updating achievement progress:', error);
  }
};

export const checkForNewAchievements = async (): Promise<Achievement[]> => {
  try {
    const userAchievements = await loadUserAchievements();
    const progress = await loadAchievementProgress();
    const newAchievements: Achievement[] = [];
    
    for (const achievement of defaultAchievements) {
      const isAlreadyUnlocked = userAchievements.some(ua => ua.achievementId === achievement.id);
      if (!isAlreadyUnlocked) {
        const currentProgress = progress[achievement.id]?.progress || 0;
        
        if (currentProgress >= achievement.requirement.target) {
          const newUserAchievement: UserAchievement = {
            achievementId: achievement.id,
            unlockedAt: new Date(),
            progress: currentProgress
          };
          
          userAchievements.push(newUserAchievement);
          newAchievements.push({
            ...achievement,
            progress: currentProgress,
            unlockedAt: new Date()
          });
        }
      }
    }
    
    if (newAchievements.length > 0) {
      await saveUserAchievements(userAchievements);
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking for new achievements:', error);
    return [];
  }
};