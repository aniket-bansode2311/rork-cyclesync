import { eq, and, gte, lte, desc, asc, count, sql } from 'drizzle-orm';
import { db } from './config';
import {
  users,
  cycles,
  periodLogs,
  symptomLogs,
  moodLogs,
  userSettings,
  userAchievements,
  achievements,
  waterIntakeLogs,
  activityLogs,
  nutritionLogs,
  sleepLogs,
  privacyConsents,
  bbtLogs,
  cervicalMucusLogs,
  birthControlRecords,
  birthControlLogs,
  pregnancies,
  pregnancyLogs,
  postpartumLogs,
  menopauseLogs,
  journalEntries,
  forumCategories,
  forumThreads,
  forumReplies,
  notificationSettings,
  dataExportRequests,
  accountDeletionRequests,
  dashboardWidgets,
} from './schema';

// User utilities
export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
}

export async function createUser(userData: {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say';
}) {
  const [user] = await db.insert(users).values(userData).returning();
  
  // Create default user settings
  await db.insert(userSettings).values({
    userId: user.id,
  });
  
  return user;
}

export async function updateUserLastLogin(userId: string) {
  const [user] = await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return user;
}

// Cycle utilities
export async function getCurrentCycle(userId: string) {
  const [cycle] = await db
    .select()
    .from(cycles)
    .where(and(eq(cycles.userId, userId), eq(cycles.isComplete, false)))
    .orderBy(desc(cycles.startDate))
    .limit(1);
  return cycle;
}

export async function getUserCycles(userId: string, limit = 10) {
  return await db
    .select()
    .from(cycles)
    .where(eq(cycles.userId, userId))
    .orderBy(desc(cycles.startDate))
    .limit(limit);
}

export async function createCycle(cycleData: {
  userId: string;
  startDate: string;
  predictedNextPeriod?: string;
  predictedOvulation?: string;
}) {
  const [cycle] = await db.insert(cycles).values(cycleData).returning();
  return cycle;
}

// Period log utilities
export async function getPeriodLogs(userId: string, startDate?: string, endDate?: string) {
  let query = db
    .select()
    .from(periodLogs);

  if (startDate && endDate) {
    query = query.where(
      and(
        eq(periodLogs.userId, userId),
        gte(periodLogs.date, startDate),
        lte(periodLogs.date, endDate)
      )
    );
  } else {
    query = query.where(eq(periodLogs.userId, userId));
  }

  return await query.orderBy(desc(periodLogs.date));
}

export async function logPeriod(logData: {
  userId: string;
  cycleId?: string;
  date: string;
  flowIntensity?: 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms?: string[];
  notes?: string;
}) {
  const [log] = await db.insert(periodLogs).values(logData).returning();
  return log;
}

// Symptom log utilities
export async function getSymptomLogs(userId: string, startDate?: string, endDate?: string) {
  let query = db
    .select()
    .from(symptomLogs);

  if (startDate && endDate) {
    query = query.where(
      and(
        eq(symptomLogs.userId, userId),
        gte(symptomLogs.date, startDate),
        lte(symptomLogs.date, endDate)
      )
    );
  } else {
    query = query.where(eq(symptomLogs.userId, userId));
  }

  return await query.orderBy(desc(symptomLogs.date));
}

export async function logSymptom(logData: {
  userId: string;
  symptomId: string;
  date: string;
  intensity?: 'low' | 'medium' | 'high';
  notes?: string;
}) {
  const [log] = await db.insert(symptomLogs).values(logData).returning();
  return log;
}

// Mood log utilities
export async function getMoodLogs(userId: string, startDate?: string, endDate?: string) {
  let query = db
    .select()
    .from(moodLogs);

  if (startDate && endDate) {
    query = query.where(
      and(
        eq(moodLogs.userId, userId),
        gte(moodLogs.date, startDate),
        lte(moodLogs.date, endDate)
      )
    );
  } else {
    query = query.where(eq(moodLogs.userId, userId));
  }

  return await query.orderBy(desc(moodLogs.date));
}

export async function logMood(logData: {
  userId: string;
  date: string;
  mood: 'happy' | 'sad' | 'anxious' | 'angry' | 'neutral' | 'excited' | 'stressed' | 'calm';
  intensity?: 'low' | 'medium' | 'high';
  notes?: string;
  triggers?: string[];
}) {
  const [log] = await db.insert(moodLogs).values(logData).returning();
  return log;
}

// User settings utilities
export async function getUserSettings(userId: string) {
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  return settings;
}

export async function updateUserSettings(userId: string, settingsData: Partial<{
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  temperatureUnit: string;
  weightUnit: string;
  cycleLength: number;
  periodLength: number;
  lutealPhaseLength: number;
  dailyWaterGoal: number;
  enableNotifications: boolean;
  enableDataSync: boolean;
  enableAnalytics: boolean;
}>) {
  const [settings] = await db
    .update(userSettings)
    .set({ ...settingsData, updatedAt: new Date() })
    .where(eq(userSettings.userId, userId))
    .returning();
  return settings;
}

// Achievement utilities
export async function getUserAchievements(userId: string) {
  return await db
    .select({
      id: userAchievements.id,
      progress: userAchievements.progress,
      isUnlocked: userAchievements.isUnlocked,
      unlockedAt: userAchievements.unlockedAt,
      achievement: {
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        type: achievements.type,
        badgeIcon: achievements.badgeIcon,
        points: achievements.points,
      },
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.unlockedAt));
}

export async function updateAchievementProgress(userId: string, achievementId: string, progress: number) {
  const [userAchievement] = await db
    .update(userAchievements)
    .set({ 
      progress,
      isUnlocked: progress >= 100,
      unlockedAt: progress >= 100 ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      )
    )
    .returning();
  return userAchievement;
}

// Water intake utilities
export async function getWaterIntake(userId: string, date: string) {
  const [intake] = await db
    .select()
    .from(waterIntakeLogs)
    .where(
      and(
        eq(waterIntakeLogs.userId, userId),
        eq(waterIntakeLogs.date, date)
      )
    )
    .limit(1);
  return intake;
}

export async function logWaterIntake(logData: {
  userId: string;
  date: string;
  amount: number;
  goal?: number;
}) {
  const [log] = await db.insert(waterIntakeLogs).values(logData).returning();
  return log;
}

// Privacy consent utilities
export async function getUserPrivacyConsents(userId: string) {
  return await db
    .select()
    .from(privacyConsents)
    .where(eq(privacyConsents.userId, userId))
    .orderBy(desc(privacyConsents.createdAt));
}

export async function updatePrivacyConsent(
  userId: string,
  consentType: 'data_collection' | 'analytics' | 'research' | 'marketing' | 'third_party_sharing',
  isGranted: boolean,
  ipAddress?: string,
  userAgent?: string
) {
  const [consent] = await db
    .insert(privacyConsents)
    .values({
      userId,
      consentType,
      isGranted,
      grantedAt: isGranted ? new Date() : null,
      revokedAt: !isGranted ? new Date() : null,
      ipAddress,
      userAgent,
    })
    .returning();
  return consent;
}

// Analytics utilities
export async function getUserStats(userId: string) {
  const [cycleCount] = await db
    .select({ count: count() })
    .from(cycles)
    .where(eq(cycles.userId, userId));

  const [symptomLogCount] = await db
    .select({ count: count() })
    .from(symptomLogs)
    .where(eq(symptomLogs.userId, userId));

  const [moodLogCount] = await db
    .select({ count: count() })
    .from(moodLogs)
    .where(eq(moodLogs.userId, userId));

  const [achievementCount] = await db
    .select({ count: count() })
    .from(userAchievements)
    .where(
      and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.isUnlocked, true)
      )
    );

  return {
    totalCycles: cycleCount.count,
    totalSymptomLogs: symptomLogCount.count,
    totalMoodLogs: moodLogCount.count,
    unlockedAchievements: achievementCount.count,
  };
}

// Data export utilities
export async function exportUserData(userId: string) {
  const user = await getUserById(userId);
  const cycles = await getUserCycles(userId, 100);
  const periodLogs = await getPeriodLogs(userId);
  const symptomLogs = await getSymptomLogs(userId);
  const moodLogs = await getMoodLogs(userId);
  const settings = await getUserSettings(userId);
  const achievements = await getUserAchievements(userId);
  const privacyConsents = await getUserPrivacyConsents(userId);

  return {
    user: {
      id: user?.id,
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      dateOfBirth: user?.dateOfBirth,
      gender: user?.gender,
      createdAt: user?.createdAt,
    },
    cycles,
    periodLogs,
    symptomLogs,
    moodLogs,
    settings,
    achievements,
    privacyConsents,
    exportedAt: new Date().toISOString(),
  };
}

// BBT utilities
export async function getBBTLogs(userId: string, startDate?: string, endDate?: string, limit = 30) {
  let query = db
    .select()
    .from(bbtLogs);

  if (startDate && endDate) {
    query = query.where(
      and(
        eq(bbtLogs.userId, userId),
        gte(bbtLogs.date, startDate),
        lte(bbtLogs.date, endDate)
      )
    );
  } else {
    query = query.where(eq(bbtLogs.userId, userId));
  }

  return await query.orderBy(desc(bbtLogs.date)).limit(limit);
}

export async function createBBTLog(logData: {
  userId: string;
  date: string;
  temperature: number;
  time?: string;
  notes?: string;
}) {
  // Convert temperature to string if schema expects string
  const [log] = await db.insert(bbtLogs).values({
    ...logData,
    temperature: logData.temperature.toString(),
  }).returning();
  return log;
}

export async function updateBBTLog(id: string, userId: string, updateData: {
  temperature?: number;
  time?: string;
  notes?: string;
}) {
  const updateValues: any = { ...updateData, updatedAt: new Date() };
  
  // Convert temperature to string if provided
  if (updateData.temperature !== undefined) {
    updateValues.temperature = updateData.temperature.toString();
  }
  
  const [log] = await db
    .update(bbtLogs)
    .set(updateValues)
    .where(and(eq(bbtLogs.id, id), eq(bbtLogs.userId, userId)))
    .returning();
  return log;
}

export async function deleteBBTLog(id: string, userId: string) {
  await db
    .delete(bbtLogs)
    .where(and(eq(bbtLogs.id, id), eq(bbtLogs.userId, userId)));
}

export async function getBBTTrends(userId: string, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  return await db
    .select()
    .from(bbtLogs)
    .where(
      and(
        eq(bbtLogs.userId, userId),
        gte(bbtLogs.date, startDate.toISOString().split('T')[0]),
        lte(bbtLogs.date, endDate.toISOString().split('T')[0])
      )
    )
    .orderBy(asc(bbtLogs.date));
}

// Cervical mucus utilities
export async function getCervicalMucusLogs(userId: string, startDate?: string, endDate?: string, limit = 30) {
  let query = db
    .select()
    .from(cervicalMucusLogs);

  if (startDate && endDate) {
    query = query.where(
      and(
        eq(cervicalMucusLogs.userId, userId),
        gte(cervicalMucusLogs.date, startDate),
        lte(cervicalMucusLogs.date, endDate)
      )
    );
  } else {
    query = query.where(eq(cervicalMucusLogs.userId, userId));
  }

  return await query.orderBy(desc(cervicalMucusLogs.date)).limit(limit);
}

export async function createCervicalMucusLog(logData: {
  userId: string;
  date: string;
  type: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';
  amount?: 'low' | 'medium' | 'high';
  notes?: string;
}) {
  const [log] = await db.insert(cervicalMucusLogs).values(logData).returning();
  return log;
}

export async function updateCervicalMucusLog(id: string, userId: string, updateData: {
  type?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';
  amount?: 'low' | 'medium' | 'high';
  notes?: string;
}) {
  const [log] = await db
    .update(cervicalMucusLogs)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(cervicalMucusLogs.id, id), eq(cervicalMucusLogs.userId, userId)))
    .returning();
  return log;
}

export async function deleteCervicalMucusLog(id: string, userId: string) {
  await db
    .delete(cervicalMucusLogs)
    .where(and(eq(cervicalMucusLogs.id, id), eq(cervicalMucusLogs.userId, userId)));
}

// Fertility prediction utilities (mock implementations)
export async function getFertilityPredictions(userId: string) {
  // Mock implementation - in real app, this would use ML/AI algorithms
  const currentCycle = await getCurrentCycle(userId);
  const settings = await getUserSettings(userId);
  
  if (!currentCycle || !settings) {
    return null;
  }

  // Handle null values with defaults
  const cycleLength = settings.cycleLength ?? 28;
  const lutealPhaseLength = settings.lutealPhaseLength ?? 14;

  const cycleStart = new Date(currentCycle.startDate);
  const ovulationDay = cycleLength - lutealPhaseLength;
  const ovulationDate = new Date(cycleStart.getTime() + (ovulationDay * 24 * 60 * 60 * 1000));
  const nextPeriodDate = new Date(cycleStart.getTime() + (cycleLength * 24 * 60 * 60 * 1000));
  
  return {
    ovulationDate: ovulationDate.toISOString().split('T')[0],
    nextPeriodDate: nextPeriodDate.toISOString().split('T')[0],
    fertilityWindow: {
      start: new Date(ovulationDate.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      end: new Date(ovulationDate.getTime() + (1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    },
  };
}

export async function getOvulationPrediction(userId: string, cycleId?: string) {
  // Mock implementation
  return await getFertilityPredictions(userId);
}

export async function getFertilityWindow(userId: string, date?: string) {
  // Mock implementation
  return await getFertilityPredictions(userId);
}

export async function getCyclePredictions(userId: string, months = 3) {
  // Mock implementation
  const predictions = [];
  const settings = await getUserSettings(userId);
  
  if (!settings) return [];
  
  const cycleLength = settings.cycleLength ?? 28;
  const lutealPhaseLength = settings.lutealPhaseLength ?? 14;
  
  const today = new Date();
  for (let i = 0; i < months; i++) {
    const cycleStart = new Date(today.getTime() + (i * cycleLength * 24 * 60 * 60 * 1000));
    const ovulationDay = cycleLength - lutealPhaseLength;
    const ovulationDate = new Date(cycleStart.getTime() + (ovulationDay * 24 * 60 * 60 * 1000));
    
    predictions.push({
      month: i + 1,
      periodStart: cycleStart.toISOString().split('T')[0],
      ovulationDate: ovulationDate.toISOString().split('T')[0],
    });
  }
  
  return predictions;
}

// Water intake utilities
export async function getWaterIntakeLogsProcedure(userId: string, date?: string) {
  let query = db
    .select()
    .from(waterIntakeLogs);

  if (date) {
    query = query.where(
      and(
        eq(waterIntakeLogs.userId, userId),
        eq(waterIntakeLogs.date, date)
      )
    );
  } else {
    query = query.where(eq(waterIntakeLogs.userId, userId));
  }

  return await query.orderBy(desc(waterIntakeLogs.date));
}

export async function logWaterIntakeProcedure(logData: {
  userId: string;
  date: string;
  amount: number;
  goal?: number;
}) {
  // Check if log already exists for this date
  const existingLog = await getWaterIntake(logData.userId, logData.date);
  
  if (existingLog) {
    // Update existing log
    const [log] = await db
      .update(waterIntakeLogs)
      .set({ 
        amount: existingLog.amount + logData.amount,
        goal: logData.goal || existingLog.goal,
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(waterIntakeLogs.userId, logData.userId),
          eq(waterIntakeLogs.date, logData.date)
        )
      )
      .returning();
    return log;
  } else {
    // Create new log
    return await logWaterIntake(logData);
  }
}

// Nutrition utilities
export async function getNutritionLogs(userId: string, filters: {
  date?: string;
  startDate?: string;
  endDate?: string;
  mealType?: string;
}) {
  let query = db
    .select()
    .from(nutritionLogs);

  if (filters.date) {
    query = query.where(
      and(
        eq(nutritionLogs.userId, userId),
        eq(nutritionLogs.date, filters.date)
      )
    );
  } else if (filters.startDate && filters.endDate) {
    query = query.where(
      and(
        eq(nutritionLogs.userId, userId),
        gte(nutritionLogs.date, filters.startDate),
        lte(nutritionLogs.date, filters.endDate)
      )
    );
  } else {
    query = query.where(eq(nutritionLogs.userId, userId));
  }

  if (filters.mealType) {
    query = query.where(
      and(
        eq(nutritionLogs.userId, userId),
        eq(nutritionLogs.mealType, filters.mealType)
      )
    );
  }

  return await query.orderBy(desc(nutritionLogs.date));
}

export async function createNutritionLog(logData: {
  userId: string;
  date: string;
  foodItem: string;
  quantity?: number;
  unit?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}) {
  // Convert numeric values to strings if schema expects strings
  const processedData: any = { ...logData };
  
  if (logData.quantity !== undefined) {
    processedData.quantity = logData.quantity.toString();
  }
  if (logData.calories !== undefined) {
    processedData.calories = logData.calories.toString();
  }
  if (logData.protein !== undefined) {
    processedData.protein = logData.protein.toString();
  }
  if (logData.carbs !== undefined) {
    processedData.carbs = logData.carbs.toString();
  }
  if (logData.fat !== undefined) {
    processedData.fat = logData.fat.toString();
  }
  if (logData.fiber !== undefined) {
    processedData.fiber = logData.fiber.toString();
  }
  if (logData.sugar !== undefined) {
    processedData.sugar = logData.sugar.toString();
  }
  if (logData.sodium !== undefined) {
    processedData.sodium = logData.sodium.toString();
  }
  
  const [log] = await db.insert(nutritionLogs).values(processedData).returning();
  return log;
}

export async function updateNutritionLog(id: string, userId: string, updateData: any) {
  const [log] = await db
    .update(nutritionLogs)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(nutritionLogs.id, id), eq(nutritionLogs.userId, userId)))
    .returning();
  return log;
}

export async function deleteNutritionLog(id: string, userId: string) {
  await db
    .delete(nutritionLogs)
    .where(and(eq(nutritionLogs.id, id), eq(nutritionLogs.userId, userId)));
}

export async function getNutritionSummary(userId: string, date: string) {
  const logs = await db
    .select()
    .from(nutritionLogs)
    .where(
      and(
        eq(nutritionLogs.userId, userId),
        eq(nutritionLogs.date, date)
      )
    );

  const summary = logs.reduce((acc, log) => {
    // Convert string values to numbers for calculation
    const calories = typeof log.calories === 'string' ? parseFloat(log.calories) || 0 : log.calories || 0;
    const protein = typeof log.protein === 'string' ? parseFloat(log.protein) || 0 : log.protein || 0;
    const carbs = typeof log.carbs === 'string' ? parseFloat(log.carbs) || 0 : log.carbs || 0;
    const fat = typeof log.fat === 'string' ? parseFloat(log.fat) || 0 : log.fat || 0;
    const fiber = typeof log.fiber === 'string' ? parseFloat(log.fiber) || 0 : log.fiber || 0;
    const sugar = typeof log.sugar === 'string' ? parseFloat(log.sugar) || 0 : log.sugar || 0;
    const sodium = typeof log.sodium === 'string' ? parseFloat(log.sodium) || 0 : log.sodium || 0;
    
    acc.totalCalories += calories;
    acc.totalProtein += protein;
    acc.totalCarbs += carbs;
    acc.totalFat += fat;
    acc.totalFiber += fiber;
    acc.totalSugar += sugar;
    acc.totalSodium += sodium;
    return acc;
  }, {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    totalSugar: 0,
    totalSodium: 0,
  });

  return { ...summary, date, logCount: logs.length };
}

// Activity utilities
export async function getActivityLogs(userId: string, filters: {
  startDate?: string;
  endDate?: string;
  type?: string;
}) {
  let query = db
    .select()
    .from(activityLogs);

  if (filters.startDate && filters.endDate) {
    query = query.where(
      and(
        eq(activityLogs.userId, userId),
        gte(activityLogs.date, filters.startDate),
        lte(activityLogs.date, filters.endDate)
      )
    );
  } else {
    query = query.where(eq(activityLogs.userId, userId));
  }

  if (filters.type) {
    // Cast the type to match the enum
    const activityType = filters.type as 'cardio' | 'strength' | 'yoga' | 'walking' | 'running' | 'cycling' | 'swimming' | 'other';
    query = query.where(
      and(
        eq(activityLogs.userId, userId),
        eq(activityLogs.type, activityType)
      )
    );
  }

  return await query.orderBy(desc(activityLogs.date));
}

export async function createActivityLog(logData: {
  userId: string;
  date: string;
  type: 'cardio' | 'strength' | 'yoga' | 'walking' | 'running' | 'cycling' | 'swimming' | 'other';
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
  calories?: number;
  notes?: string;
}) {
  const [log] = await db.insert(activityLogs).values(logData).returning();
  return log;
}

export async function updateActivityLog(id: string, userId: string, updateData: any) {
  const [log] = await db
    .update(activityLogs)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(activityLogs.id, id), eq(activityLogs.userId, userId)))
    .returning();
  return log;
}

export async function deleteActivityLog(id: string, userId: string) {
  await db
    .delete(activityLogs)
    .where(and(eq(activityLogs.id, id), eq(activityLogs.userId, userId)));
}

export async function getActivitySummary(userId: string, startDate: string, endDate: string) {
  const logs = await db
    .select()
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.userId, userId),
        gte(activityLogs.date, startDate),
        lte(activityLogs.date, endDate)
      )
    );

  const summary = logs.reduce((acc, log) => {
    acc.totalDuration += log.duration || 0;
    acc.totalCalories += log.calories || 0;
    acc.sessionCount += 1;
    return acc;
  }, {
    totalDuration: 0,
    totalCalories: 0,
    sessionCount: 0,
  });

  return { ...summary, startDate, endDate };
}

// Sleep utilities
export async function getSleepLogs(userId: string, startDate?: string, endDate?: string, limit = 30) {
  let query = db
    .select()
    .from(sleepLogs);

  if (startDate && endDate) {
    query = query.where(
      and(
        eq(sleepLogs.userId, userId),
        gte(sleepLogs.date, startDate),
        lte(sleepLogs.date, endDate)
      )
    );
  } else {
    query = query.where(eq(sleepLogs.userId, userId));
  }

  return await query.orderBy(desc(sleepLogs.date)).limit(limit);
}

export async function createSleepLog(logData: {
  userId: string;
  date: string;
  bedtime?: string;
  wakeTime?: string;
  duration?: number;
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
}) {
  // Convert time strings to Date objects if schema expects Date
  const processedData: any = { ...logData };
  
  if (logData.bedtime) {
    // If bedtime is a string, convert to Date object
    processedData.bedtime = new Date(`1970-01-01T${logData.bedtime}:00.000Z`);
  }
  
  if (logData.wakeTime) {
    // If wakeTime is a string, convert to Date object
    processedData.wakeTime = new Date(`1970-01-01T${logData.wakeTime}:00.000Z`);
  }
  
  const [log] = await db.insert(sleepLogs).values(processedData).returning();
  return log;
}

export async function updateSleepLog(id: string, userId: string, updateData: any) {
  const [log] = await db
    .update(sleepLogs)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(sleepLogs.id, id), eq(sleepLogs.userId, userId)))
    .returning();
  return log;
}

export async function deleteSleepLog(id: string, userId: string) {
  await db
    .delete(sleepLogs)
    .where(and(eq(sleepLogs.id, id), eq(sleepLogs.userId, userId)));
}

export async function getSleepTrends(userId: string, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  return await db
    .select()
    .from(sleepLogs)
    .where(
      and(
        eq(sleepLogs.userId, userId),
        gte(sleepLogs.date, startDate.toISOString().split('T')[0]),
        lte(sleepLogs.date, endDate.toISOString().split('T')[0])
      )
    )
    .orderBy(asc(sleepLogs.date));
}

// Placeholder functions for other utilities (to be implemented)
export async function getJournalEntries(userId: string, filters: any) {
  // Mock implementation
  return [];
}

export async function createJournalEntry(data: any) {
  // Mock implementation
  return { id: 'mock-id', ...data };
}

export async function updateJournalEntry(id: string, userId: string, data: any) {
  // Mock implementation
  return { id, ...data };
}

export async function deleteJournalEntry(id: string, userId: string) {
  // Mock implementation
}

export async function getJournalStats(userId: string, startDate?: string, endDate?: string) {
  // Mock implementation
  return { totalEntries: 0, averageMood: 'neutral' };
}

export async function getForumCategories() {
  // Mock implementation
  return [];
}

export async function getForumThreads(filters: any) {
  // Mock implementation
  return [];
}

export async function getForumThread(id: string) {
  // Mock implementation
  return null;
}

export async function createForumThread(data: any) {
  // Mock implementation
  return { id: 'mock-id', ...data };
}

export async function updateForumThread(id: string, userId: string, data: any) {
  // Mock implementation
  return { id, ...data };
}

export async function deleteForumThread(id: string, userId: string) {
  // Mock implementation
}

export async function incrementThreadViews(id: string) {
  // Mock implementation
}

export async function getForumReplies(filters: any) {
  // Mock implementation
  return [];
}

export async function createForumReply(data: any) {
  // Mock implementation
  return { id: 'mock-id', ...data };
}

export async function updateForumReply(id: string, userId: string, data: any) {
  // Mock implementation
  return { id, ...data };
}

export async function deleteForumReply(id: string, userId: string) {
  // Mock implementation
}

// Birth control utilities (mock implementations)
export async function getBirthControlRecords(userId: string) {
  return [];
}

export async function createBirthControlRecord(data: any) {
  return { id: 'mock-id', ...data };
}

export async function updateBirthControlRecord(id: string, userId: string, data: any) {
  return { id, ...data };
}

export async function deleteBirthControlRecord(id: string, userId: string) {
  // Mock implementation
}

export async function getBirthControlLogs(birthControlId: string, userId: string, startDate?: string, endDate?: string) {
  return [];
}

export async function logBirthControlAdherence(data: any) {
  return { id: 'mock-id', ...data };
}

export async function getBirthControlAdherenceStats(birthControlId: string, userId: string, days: number) {
  return { adherenceRate: 95, totalDays: days, takenDays: Math.floor(days * 0.95) };
}

// Pregnancy utilities (mock implementations)
export async function getPregnancies(userId: string) {
  return [];
}

export async function createPregnancy(data: any) {
  return { id: 'mock-id', ...data };
}

export async function updatePregnancy(id: string, userId: string, data: any) {
  return { id, ...data };
}

export async function getPregnancyLogs(pregnancyId: string, userId: string) {
  return [];
}

export async function createPregnancyLog(data: any) {
  return { id: 'mock-id', ...data };
}

export async function updatePregnancyLog(id: string, userId: string, data: any) {
  return { id, ...data };
}

export async function getPostpartumLogs(pregnancyId: string, userId: string) {
  return [];
}

export async function createPostpartumLog(data: any) {
  return { id: 'mock-id', ...data };
}

// Menopause utilities (mock implementations)
export async function getMenopauseLogs(userId: string, startDate?: string, endDate?: string, limit = 30) {
  return [];
}

export async function createMenopauseLog(data: any) {
  return { id: 'mock-id', ...data };
}

export async function updateMenopauseLog(id: string, userId: string, data: any) {
  return { id, ...data };
}

export async function deleteMenopauseLog(id: string, userId: string) {
  // Mock implementation
}

export async function getMenopauseTrends(userId: string, days: number) {
  return [];
}

// AI Insights utilities (enhanced implementations)
export async function generateAIInsights(
  userId: string, 
  type: string, 
  timeframe: string, 
  options?: { forceRefresh?: boolean; maxInsights?: number }
) {
  // Mock implementation with more realistic data structure
  const insights = [
    {
      id: `insight_${Date.now()}_1`,
      type,
      title: 'Cycle Pattern Analysis',
      content: 'Your cycle has been consistent at 28 days for the past 3 months.',
      confidence: 0.85,
      priority: 'medium' as const,
      category: 'cycle' as const,
      isRead: false,
      isDismissed: false,
      generatedAt: new Date().toISOString(),
      actionable: true,
      tags: ['cycle', 'patterns'],
    },
    {
      id: `insight_${Date.now()}_2`,
      type,
      title: 'Symptom Correlation',
      content: 'You tend to experience more headaches 2 days before your period starts.',
      confidence: 0.72,
      priority: 'high' as const,
      category: 'symptoms' as const,
      isRead: false,
      isDismissed: false,
      generatedAt: new Date().toISOString(),
      actionable: true,
      tags: ['symptoms', 'headaches', 'pms'],
    },
  ];
  
  return insights.slice(0, options?.maxInsights || 5);
}

export async function getUserInsights(
  userId: string, 
  options: {
    limit: number;
    type?: string;
    includeRead: boolean;
    includeDismissed: boolean;
    sortBy: string;
    sortOrder: string;
  }
) {
  // Mock implementation with filtering
  const allInsights = [
    {
      id: 'insight_1',
      type: 'cycle',
      title: 'Regular Cycle Pattern',
      content: 'Your cycle has been consistent.',
      confidence: 0.85,
      priority: 'medium' as const,
      isRead: false,
      isDismissed: false,
      generatedAt: new Date().toISOString(),
    },
    {
      id: 'insight_2',
      type: 'symptoms',
      title: 'PMS Symptoms',
      content: 'Common symptoms before period.',
      confidence: 0.72,
      priority: 'high' as const,
      isRead: true,
      isDismissed: false,
      generatedAt: new Date().toISOString(),
    },
  ];
  
  let filtered = allInsights;
  
  if (options.type) {
    filtered = filtered.filter(insight => insight.type === options.type);
  }
  
  if (!options.includeRead) {
    filtered = filtered.filter(insight => !insight.isRead);
  }
  
  if (!options.includeDismissed) {
    filtered = filtered.filter(insight => !insight.isDismissed);
  }
  
  return filtered.slice(0, options.limit);
}

export async function getCycleInsights(
  userId: string, 
  options: {
    cycleId?: string;
    months: number;
    includePatterns: boolean;
    includePredictions: boolean;
  }
) {
  return {
    averageCycleLength: 28,
    averagePeriodLength: 5,
    cycleVariability: 2.1,
    lastPeriodDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalPeriods: 12,
    predictedNextPeriod: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    commonSymptoms: [
      { name: 'cramps', frequency: 0.8, averageIntensity: 2.5, trend: 'stable' as const },
      { name: 'bloating', frequency: 0.6, averageIntensity: 2.0, trend: 'decreasing' as const },
    ],
    moodPatterns: [
      { mood: 'irritable', frequency: 0.7, averageIntensity: 2.3, trend: 'stable' as const },
      { mood: 'anxious', frequency: 0.4, averageIntensity: 1.8, trend: 'improving' as const },
    ],
  };
}

export async function getHealthInsights(
  userId: string, 
  options: {
    categories?: string[];
    timeframe: string;
    includeCorrelations: boolean;
    minConfidence: number;
  }
) {
  return {
    sleepQuality: 'good',
    activityLevel: 'moderate',
    nutritionScore: 75,
    recommendations: ['Increase water intake', 'Add more fiber to diet'],
    correlations: options.includeCorrelations ? [
      { factor1: 'sleep', factor2: 'mood', correlation: 0.65 },
      { factor1: 'exercise', factor2: 'energy', correlation: 0.72 },
    ] : [],
  };
}

export async function getPersonalizedRecommendations(
  userId: string, 
  options: {
    category?: string;
    limit: number;
    priority?: string;
    excludeCompleted: boolean;
  }
) {
  const allRecommendations = [
    { 
      id: '1', 
      category: 'nutrition', 
      title: 'Increase iron intake', 
      description: 'Consider iron-rich foods during your period',
      priority: 'high' as const,
      completed: false,
    },
    { 
      id: '2', 
      category: 'activity', 
      title: 'Light exercise', 
      description: 'Try yoga or walking during PMS',
      priority: 'medium' as const,
      completed: false,
    },
    { 
      id: '3', 
      category: 'sleep', 
      title: 'Improve sleep hygiene', 
      description: 'Maintain consistent bedtime routine',
      priority: 'low' as const,
      completed: true,
    },
  ];
  
  let filtered = allRecommendations;
  
  if (options.category) {
    filtered = filtered.filter(rec => rec.category === options.category);
  }
  
  if (options.priority) {
    filtered = filtered.filter(rec => rec.priority === options.priority);
  }
  
  if (options.excludeCompleted) {
    filtered = filtered.filter(rec => !rec.completed);
  }
  
  return filtered.slice(0, options.limit);
}

// Privacy utilities
export async function getPrivacyConsents(userId: string) {
  return await getUserPrivacyConsents(userId);
}

export async function createDataExportRequest(userId: string, format: string) {
  const [request] = await db.insert(dataExportRequests).values({
    userId,
    format,
    status: 'pending',
  }).returning();
  return request;
}

export async function getDataExportRequests(userId: string) {
  return await db
    .select()
    .from(dataExportRequests)
    .where(eq(dataExportRequests.userId, userId))
    .orderBy(desc(dataExportRequests.requestedAt));
}

export async function createAccountDeletionRequest(userId: string, reason?: string, gracePeriodDays = 30) {
  const scheduledFor = new Date(Date.now() + (gracePeriodDays * 24 * 60 * 60 * 1000));
  const cancellationToken = Math.random().toString(36).substring(2, 15);
  
  const [request] = await db.insert(accountDeletionRequests).values({
    userId,
    reason,
    scheduledFor,
    cancellationToken,
    status: 'pending',
  }).returning();
  return request;
}

export async function cancelAccountDeletionRequest(userId: string, cancellationToken: string) {
  const [request] = await db
    .update(accountDeletionRequests)
    .set({ status: 'cancelled' })
    .where(
      and(
        eq(accountDeletionRequests.userId, userId),
        eq(accountDeletionRequests.cancellationToken, cancellationToken),
        eq(accountDeletionRequests.status, 'pending')
      )
    )
    .returning();
  return request;
}

export async function getAccountDeletionRequest(userId: string) {
  const [request] = await db
    .select()
    .from(accountDeletionRequests)
    .where(
      and(
        eq(accountDeletionRequests.userId, userId),
        eq(accountDeletionRequests.status, 'pending')
      )
    )
    .limit(1);
  return request;
}

// Notification utilities (mock implementations)
export async function getNotificationSettings(userId: string) {
  return [];
}

export async function updateNotificationSettings(id: string, userId: string, data: any) {
  return { id, ...data };
}

export async function createNotificationSetting(data: any) {
  return { id: 'mock-id', ...data };
}

export async function deleteNotificationSetting(id: string, userId: string) {
  // Mock implementation
}

// Dashboard utilities (mock implementations)
export async function getDashboardWidgets(userId: string) {
  return [];
}

export async function updateDashboardWidget(id: string, userId: string, data: any) {
  return { id, ...data };
}

export async function createDashboardWidget(data: any) {
  return { id: 'mock-id', ...data };
}

export async function deleteDashboardWidget(id: string, userId: string) {
  // Mock implementation
}

export async function reorderDashboardWidgets(userId: string, widgets: Array<{ id: string; position: number }>) {
  // Mock implementation
}

// Achievement utilities
export async function getAchievementProgressProcedure(userId: string) {
  return await getUserAchievements(userId);
}