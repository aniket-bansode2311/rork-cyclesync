import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Trophy, X } from 'lucide-react-native';
import { Achievement } from '@/types/achievements';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export default function AchievementNotification({
  achievement,
  visible,
  onClose,
}: AchievementNotificationProps) {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && achievement) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible, achievement]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible || !achievement) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Trophy size={32} color="#FFD700" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Achievement Unlocked!</Text>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>
        
        <TouchableOpacity style={styles.closeButton} onPress={hideNotification}>
          <X size={20} color="#7F8C8D" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 2,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
  },
});