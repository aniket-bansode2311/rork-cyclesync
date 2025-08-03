import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Achievement } from '@/types/achievements';
import { 
  Calendar, 
  Target, 
  BookOpen, 
  Droplets, 
  Activity, 
  Heart, 
  RotateCcw, 
  GraduationCap 
} from 'lucide-react-native';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

const iconMap = {
  Calendar,
  Target,
  BookOpen,
  Droplets,
  Activity,
  Heart,
  RotateCcw,
  GraduationCap
};

export default function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Calendar;
  const progressPercentage = Math.min((achievement.progress / achievement.requirement.target) * 100, 100);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'logging': return '#FF6B6B';
      case 'consistency': return '#4ECDC4';
      case 'exploration': return '#45B7D1';
      case 'wellness': return '#96CEB4';
      default: return '#95A5A6';
    }
  };

  return (
    <View style={[styles.container, isUnlocked && styles.unlockedContainer]}>
      <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(achievement.category) }]}>
        <IconComponent 
          size={24} 
          color={isUnlocked ? '#FFFFFF' : '#BDC3C7'} 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, isUnlocked && styles.unlockedTitle]}>
          {achievement.title}
        </Text>
        <Text style={styles.description}>
          {achievement.description}
        </Text>
        
        {!isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: getCategoryColor(achievement.category)
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress}/{achievement.requirement.target}
            </Text>
          </View>
        )}
        
        {isUnlocked && achievement.unlockedAt && (
          <Text style={styles.unlockedDate}>
            Unlocked {achievement.unlockedAt.toLocaleDateString()}
          </Text>
        )}
      </View>
      
      {isUnlocked && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    opacity: 0.6,
  },
  unlockedContainer: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#27AE60',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  unlockedTitle: {
    color: '#27AE60',
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#ECF0F1',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#95A5A6',
    fontWeight: '500',
  },
  unlockedDate: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});