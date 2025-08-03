import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';

import { 
  PregnancyData, 
  PregnancyChecklist, 
  WeeklyUpdate,
  PostpartumData,
  PostpartumBleeding,
  PostpartumRecovery,
  PostpartumMood
} from '@/types/pregnancy';

const PREGNANCY_STORAGE_KEY = 'pregnancy_data';
const PREGNANCY_CHECKLIST_STORAGE_KEY = 'pregnancy_checklist';
const POSTPARTUM_STORAGE_KEY = 'postpartum_data';
const POSTPARTUM_BLEEDING_STORAGE_KEY = 'postpartum_bleeding';
const POSTPARTUM_RECOVERY_STORAGE_KEY = 'postpartum_recovery';
const POSTPARTUM_MOOD_STORAGE_KEY = 'postpartum_mood';

export const [PregnancyProvider, usePregnancy] = createContextHook(() => {
  const [pregnancyData, setPregnancyData] = useState<PregnancyData | null>(null);
  const [checklist, setChecklist] = useState<PregnancyChecklist[]>([]);
  const [postpartumData, setPostpartumData] = useState<PostpartumData | null>(null);
  const [postpartumBleeding, setPostpartumBleeding] = useState<PostpartumBleeding[]>([]);
  const [postpartumRecovery, setPostpartumRecovery] = useState<PostpartumRecovery[]>([]);
  const [postpartumMoods, setPostpartumMoods] = useState<PostpartumMood[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [
        pregnancyDataStr,
        checklistStr,
        postpartumDataStr,
        bleedingStr,
        recoveryStr,
        moodStr
      ] = await Promise.all([
        AsyncStorage.getItem(PREGNANCY_STORAGE_KEY),
        AsyncStorage.getItem(PREGNANCY_CHECKLIST_STORAGE_KEY),
        AsyncStorage.getItem(POSTPARTUM_STORAGE_KEY),
        AsyncStorage.getItem(POSTPARTUM_BLEEDING_STORAGE_KEY),
        AsyncStorage.getItem(POSTPARTUM_RECOVERY_STORAGE_KEY),
        AsyncStorage.getItem(POSTPARTUM_MOOD_STORAGE_KEY),
      ]);

      if (pregnancyDataStr) {
        setPregnancyData(JSON.parse(pregnancyDataStr));
      }
      if (checklistStr) {
        setChecklist(JSON.parse(checklistStr));
      }
      if (postpartumDataStr) {
        setPostpartumData(JSON.parse(postpartumDataStr));
      }
      if (bleedingStr) {
        setPostpartumBleeding(JSON.parse(bleedingStr));
      }
      if (recoveryStr) {
        setPostpartumRecovery(JSON.parse(recoveryStr));
      }
      if (moodStr) {
        setPostpartumMoods(JSON.parse(moodStr));
      }
    } catch (error) {
      console.error('Error loading pregnancy/postpartum data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDueDate = (lastMenstrualPeriod: string): string => {
    const lmp = new Date(lastMenstrualPeriod);
    const dueDate = new Date(lmp);
    dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
    return dueDate.toISOString().split('T')[0];
  };

  const calculateCurrentWeek = (lastMenstrualPeriod: string): number => {
    const lmp = new Date(lastMenstrualPeriod);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmp.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  };

  const activatePregnancyMode = async (data: {
    lastMenstrualPeriod?: string;
    estimatedConceptionDate?: string;
    notes?: string;
  }) => {
    try {
      const lmp = data.lastMenstrualPeriod || 
        (data.estimatedConceptionDate ? 
          new Date(new Date(data.estimatedConceptionDate).getTime() - (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]);

      const newPregnancy: PregnancyData = {
        id: Date.now().toString(),
        isActive: true,
        lastMenstrualPeriod: lmp,
        estimatedConceptionDate: data.estimatedConceptionDate,
        dueDate: calculateDueDate(lmp),
        currentWeek: calculateCurrentWeek(lmp),
        activatedDate: new Date().toISOString().split('T')[0],
        notes: data.notes,
      };

      setPregnancyData(newPregnancy);
      await AsyncStorage.setItem(PREGNANCY_STORAGE_KEY, JSON.stringify(newPregnancy));

      // Initialize default checklist
      const defaultChecklist = getDefaultChecklist(newPregnancy.id);
      setChecklist(defaultChecklist);
      await AsyncStorage.setItem(PREGNANCY_CHECKLIST_STORAGE_KEY, JSON.stringify(defaultChecklist));

      console.log('Pregnancy mode activated successfully');
    } catch (error) {
      console.error('Error activating pregnancy mode:', error);
      throw error;
    }
  };

  const deactivatePregnancyMode = async () => {
    try {
      setPregnancyData(null);
      setChecklist([]);
      await AsyncStorage.removeItem(PREGNANCY_STORAGE_KEY);
      await AsyncStorage.removeItem(PREGNANCY_CHECKLIST_STORAGE_KEY);
      console.log('Pregnancy mode deactivated successfully');
    } catch (error) {
      console.error('Error deactivating pregnancy mode:', error);
      throw error;
    }
  };

  const updateChecklistItem = async (itemId: string, completed: boolean) => {
    try {
      const updatedChecklist = checklist.map(item => 
        item.id === itemId 
          ? { ...item, completed, completedDate: completed ? new Date().toISOString().split('T')[0] : undefined }
          : item
      );
      setChecklist(updatedChecklist);
      await AsyncStorage.setItem(PREGNANCY_CHECKLIST_STORAGE_KEY, JSON.stringify(updatedChecklist));
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  };

  const activatePostpartumMode = async (data: {
    deliveryDate: string;
    deliveryType: 'vaginal' | 'cesarean';
    notes?: string;
  }) => {
    try {
      const newPostpartum: PostpartumData = {
        id: Date.now().toString(),
        isActive: true,
        deliveryDate: data.deliveryDate,
        deliveryType: data.deliveryType,
        activatedDate: new Date().toISOString().split('T')[0],
        notes: data.notes,
      };

      setPostpartumData(newPostpartum);
      await AsyncStorage.setItem(POSTPARTUM_STORAGE_KEY, JSON.stringify(newPostpartum));

      // Deactivate pregnancy mode if active
      if (pregnancyData?.isActive) {
        await deactivatePregnancyMode();
      }

      console.log('Postpartum mode activated successfully');
    } catch (error) {
      console.error('Error activating postpartum mode:', error);
      throw error;
    }
  };

  const deactivatePostpartumMode = async () => {
    try {
      setPostpartumData(null);
      setPostpartumBleeding([]);
      setPostpartumRecovery([]);
      setPostpartumMoods([]);
      await AsyncStorage.multiRemove([
        POSTPARTUM_STORAGE_KEY,
        POSTPARTUM_BLEEDING_STORAGE_KEY,
        POSTPARTUM_RECOVERY_STORAGE_KEY,
        POSTPARTUM_MOOD_STORAGE_KEY,
      ]);
      console.log('Postpartum mode deactivated successfully');
    } catch (error) {
      console.error('Error deactivating postpartum mode:', error);
      throw error;
    }
  };

  const addPostpartumBleeding = async (bleeding: Omit<PostpartumBleeding, 'id'>) => {
    try {
      const newBleeding: PostpartumBleeding = {
        ...bleeding,
        id: Date.now().toString(),
      };
      const updatedBleeding = [...postpartumBleeding, newBleeding];
      setPostpartumBleeding(updatedBleeding);
      await AsyncStorage.setItem(POSTPARTUM_BLEEDING_STORAGE_KEY, JSON.stringify(updatedBleeding));
    } catch (error) {
      console.error('Error adding postpartum bleeding:', error);
      throw error;
    }
  };

  const addPostpartumRecovery = async (recovery: Omit<PostpartumRecovery, 'id'>) => {
    try {
      const newRecovery: PostpartumRecovery = {
        ...recovery,
        id: Date.now().toString(),
      };
      const updatedRecovery = [...postpartumRecovery, newRecovery];
      setPostpartumRecovery(updatedRecovery);
      await AsyncStorage.setItem(POSTPARTUM_RECOVERY_STORAGE_KEY, JSON.stringify(updatedRecovery));
    } catch (error) {
      console.error('Error adding postpartum recovery:', error);
      throw error;
    }
  };

  const addPostpartumMood = async (mood: Omit<PostpartumMood, 'id'>) => {
    try {
      const newMood: PostpartumMood = {
        ...mood,
        id: Date.now().toString(),
      };
      const updatedMoods = [...postpartumMoods, newMood];
      setPostpartumMoods(updatedMoods);
      await AsyncStorage.setItem(POSTPARTUM_MOOD_STORAGE_KEY, JSON.stringify(updatedMoods));
    } catch (error) {
      console.error('Error adding postpartum mood:', error);
      throw error;
    }
  };

  const getWeeklyUpdate = (week: number): WeeklyUpdate => {
    return getWeeklyUpdateData(week);
  };

  const getCurrentMode = (): 'normal' | 'pregnancy' | 'postpartum' => {
    if (postpartumData?.isActive) return 'postpartum';
    if (pregnancyData?.isActive) return 'pregnancy';
    return 'normal';
  };

  return {
    // Pregnancy
    pregnancyData,
    checklist,
    activatePregnancyMode,
    deactivatePregnancyMode,
    updateChecklistItem,
    getWeeklyUpdate,
    
    // Postpartum
    postpartumData,
    postpartumBleeding,
    postpartumRecovery,
    postpartumMoods,
    activatePostpartumMode,
    deactivatePostpartumMode,
    addPostpartumBleeding,
    addPostpartumRecovery,
    addPostpartumMood,
    
    // General
    getCurrentMode,
    isLoading,
  };
});

const getDefaultChecklist = (pregnancyId: string): PregnancyChecklist[] => [
  {
    id: '1',
    pregnancyId,
    title: 'Schedule First Prenatal Visit',
    description: 'Book your first appointment with an OB/GYN or midwife',
    completed: false,
    dueWeek: 8,
  },
  {
    id: '2',
    pregnancyId,
    title: 'Start Taking Prenatal Vitamins',
    description: 'Begin taking folic acid and other essential vitamins',
    completed: false,
    dueWeek: 4,
  },
  {
    id: '3',
    pregnancyId,
    title: 'Choose Healthcare Provider',
    description: 'Research and select your preferred doctor or midwife',
    completed: false,
    dueWeek: 12,
  },
  {
    id: '4',
    pregnancyId,
    title: 'First Trimester Screening',
    description: 'Complete blood tests and ultrasound screening',
    completed: false,
    dueWeek: 12,
  },
  {
    id: '5',
    pregnancyId,
    title: 'Anatomy Scan',
    description: 'Detailed ultrasound to check baby\'s development',
    completed: false,
    dueWeek: 20,
  },
  {
    id: '6',
    pregnancyId,
    title: 'Choose Birth Location',
    description: 'Decide on hospital, birth center, or home birth',
    completed: false,
    dueWeek: 24,
  },
  {
    id: '7',
    pregnancyId,
    title: 'Glucose Screening',
    description: 'Test for gestational diabetes',
    completed: false,
    dueWeek: 28,
  },
  {
    id: '8',
    pregnancyId,
    title: 'Create Birth Plan',
    description: 'Outline your preferences for labor and delivery',
    completed: false,
    dueWeek: 32,
  },
  {
    id: '9',
    pregnancyId,
    title: 'Pack Hospital Bag',
    description: 'Prepare essentials for labor and postpartum stay',
    completed: false,
    dueWeek: 36,
  },
  {
    id: '10',
    pregnancyId,
    title: 'Install Car Seat',
    description: 'Properly install and inspect infant car seat',
    completed: false,
    dueWeek: 38,
  },
];

const getWeeklyUpdateData = (week: number): WeeklyUpdate => {
  const updates: { [key: number]: WeeklyUpdate } = {
    4: {
      week: 4,
      title: 'The Beginning',
      fetalDevelopment: 'Your baby is about the size of a poppy seed. The neural tube is forming, which will become the brain and spinal cord.',
      maternalChanges: 'You might start experiencing early pregnancy symptoms like fatigue, breast tenderness, and morning sickness.',
      tips: ['Start taking prenatal vitamins', 'Avoid alcohol and smoking', 'Schedule your first prenatal appointment'],
    },
    8: {
      week: 8,
      title: 'Rapid Growth',
      fetalDevelopment: 'Your baby is now about the size of a raspberry. Major organs are developing, and tiny limbs are forming.',
      maternalChanges: 'Morning sickness may be at its peak. Your uterus is expanding, though you may not show yet.',
      tips: ['Eat small, frequent meals', 'Stay hydrated', 'Get plenty of rest'],
    },
    12: {
      week: 12,
      title: 'End of First Trimester',
      fetalDevelopment: 'Your baby is about the size of a lime. All major organs are formed and functioning.',
      maternalChanges: 'Morning sickness may start to subside. You might notice your clothes fitting differently.',
      tips: ['Consider sharing your news', 'Schedule first trimester screening', 'Start thinking about maternity clothes'],
    },
    16: {
      week: 16,
      title: 'Second Trimester Begins',
      fetalDevelopment: 'Your baby is about the size of an avocado. They can now hear sounds and may start moving.',
      maternalChanges: 'You might start feeling more energetic. Your bump may become more noticeable.',
      tips: ['Start doing pelvic floor exercises', 'Consider prenatal yoga', 'Plan your anatomy scan'],
    },
    20: {
      week: 20,
      title: 'Halfway Point',
      fetalDevelopment: 'Your baby is about the size of a banana. You might feel their first movements!',
      maternalChanges: 'Your belly is definitely showing now. You might experience back pain as your center of gravity shifts.',
      tips: ['Schedule anatomy scan', 'Start thinking about baby names', 'Consider maternity photos'],
    },
    24: {
      week: 24,
      title: 'Viability Milestone',
      fetalDevelopment: 'Your baby is about the size of an ear of corn. Their lungs are developing rapidly.',
      maternalChanges: 'You might experience heartburn and shortness of breath as your uterus expands.',
      tips: ['Take glucose screening test', 'Start planning nursery', 'Consider childbirth classes'],
    },
    28: {
      week: 28,
      title: 'Third Trimester Begins',
      fetalDevelopment: 'Your baby is about the size of an eggplant. They\'re practicing breathing movements.',
      maternalChanges: 'You might feel more tired again. Braxton Hicks contractions may begin.',
      tips: ['Start weekly prenatal visits', 'Begin thinking about maternity leave', 'Pack hospital bag'],
    },
    32: {
      week: 32,
      title: 'Rapid Weight Gain',
      fetalDevelopment: 'Your baby is about the size of a squash. They\'re gaining weight rapidly and developing fat layers.',
      maternalChanges: 'You might experience swelling in your hands and feet. Sleep may become more difficult.',
      tips: ['Elevate feet when resting', 'Practice relaxation techniques', 'Finalize birth plan'],
    },
    36: {
      week: 36,
      title: 'Almost Ready',
      fetalDevelopment: 'Your baby is about the size of a papaya. They\'re considered full-term in just a few weeks.',
      maternalChanges: 'You might feel pressure in your pelvis as baby drops lower. Frequent urination returns.',
      tips: ['Finish preparing nursery', 'Install car seat', 'Review signs of labor'],
    },
    40: {
      week: 40,
      title: 'Due Date',
      fetalDevelopment: 'Your baby is about the size of a watermelon and ready to meet you!',
      maternalChanges: 'You might feel anxious and excited. Labor could start any day now.',
      tips: ['Stay active but rest when needed', 'Keep hospital bag ready', 'Trust your body'],
    },
  };

  return updates[week] || {
    week,
    title: `Week ${week}`,
    fetalDevelopment: 'Your baby continues to grow and develop.',
    maternalChanges: 'Your body continues to adapt to pregnancy.',
    tips: ['Continue regular prenatal care', 'Listen to your body', 'Stay healthy'],
  };
};