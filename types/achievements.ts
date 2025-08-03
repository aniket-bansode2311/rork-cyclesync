export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'logging' | 'consistency' | 'exploration' | 'wellness';
  requirement: {
    type: 'count' | 'streak' | 'action';
    target: number;
    action?: string;
  };
  unlockedAt?: Date;
  progress: number;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
  progress: number;
}

export interface AchievementProgress {
  [achievementId: string]: {
    progress: number;
    lastUpdated: Date;
  };
}

export interface AchievementContextType {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  checkAchievements: () => Promise<void>;
  getAchievementProgress: (achievementId: string) => number;
  isAchievementUnlocked: (achievementId: string) => boolean;
  unlockedCount: number;
  totalCount: number;
  trackAction: (action: string, value?: number, isStreak?: boolean) => Promise<void>;
  isLoading: boolean;
}