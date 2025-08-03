import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";

// Auth routes
import { signupProcedure } from "./routes/auth/signup/route";
import { loginProcedure } from "./routes/auth/login/route";
import { refreshTokenProcedure, logoutProcedure } from "./routes/auth/refresh/route";

// User profile routes
import { getProfileProcedure, updateProfileProcedure, updateSettingsProcedure } from "./routes/users/profile/route";

// Cycle tracking routes
import { 
  getCurrentCycleProcedure, 
  getCyclesProcedure, 
  startCycleProcedure, 
  getPeriodLogsProcedure, 
  logPeriodProcedure,
  getSymptomLogsProcedure,
  logSymptomProcedure,
  getMoodLogsProcedure,
  logMoodProcedure
} from "./routes/cycles/tracking/route";

// Fertility routes
import { 
  getBBTLogsProcedure, 
  logBBTProcedure, 
  updateBBTLogProcedure, 
  deleteBBTLogProcedure, 
  getBBTTrendsProcedure 
} from "./routes/fertility/bbt/route";
import { 
  getCervicalMucusLogsProcedure, 
  logCervicalMucusProcedure, 
  updateCervicalMucusLogProcedure, 
  deleteCervicalMucusLogProcedure 
} from "./routes/fertility/cervical-mucus/route";
import { 
  getFertilityPredictionsProcedure,
  getOvulationPredictionProcedure,
  getFertilityWindowProcedure,
  getCyclePredictionsProcedure
} from "./routes/fertility/predictions/route";

// Wellness routes
import { getWaterIntakeLogsProcedure, logWaterIntakeProcedure } from "./routes/wellness/water/route";
import { 
  getNutritionLogsProcedure, 
  logNutritionProcedure, 
  updateNutritionLogProcedure, 
  deleteNutritionLogProcedure, 
  getNutritionSummaryProcedure 
} from "./routes/wellness/nutrition/route";
import { 
  getActivityLogsProcedure, 
  logActivityProcedure, 
  updateActivityLogProcedure, 
  deleteActivityLogProcedure, 
  getActivitySummaryProcedure 
} from "./routes/wellness/activity/route";
import { 
  getSleepLogsProcedure, 
  logSleepProcedure, 
  updateSleepLogProcedure, 
  deleteSleepLogProcedure, 
  getSleepTrendsProcedure 
} from "./routes/wellness/sleep/route";

// Journal routes
import { 
  getJournalEntriesProcedure, 
  createJournalEntryProcedure, 
  updateJournalEntryProcedure, 
  deleteJournalEntryProcedure, 
  getJournalStatsProcedure 
} from "./routes/journal/entries/route";

// Forum routes
import { getForumCategoriesProcedure } from "./routes/forum/categories/route";
import { 
  getForumThreadsProcedure, 
  getForumThreadProcedure, 
  createForumThreadProcedure, 
  updateForumThreadProcedure, 
  deleteForumThreadProcedure 
} from "./routes/forum/threads/route";
import { 
  getForumRepliesProcedure, 
  createForumReplyProcedure, 
  updateForumReplyProcedure, 
  deleteForumReplyProcedure 
} from "./routes/forum/replies/route";

// Birth control routes
import { 
  getBirthControlRecordsProcedure, 
  createBirthControlRecordProcedure, 
  updateBirthControlRecordProcedure, 
  deleteBirthControlRecordProcedure, 
  getBirthControlLogsProcedure, 
  logBirthControlAdherenceProcedure, 
  getBirthControlAdherenceStatsProcedure 
} from "./routes/birth-control/tracking/route";

// Pregnancy routes
import { 
  getPregnanciesProcedure, 
  createPregnancyProcedure, 
  updatePregnancyProcedure, 
  getPregnancyLogsProcedure, 
  createPregnancyLogProcedure, 
  updatePregnancyLogProcedure, 
  getPostpartumLogsProcedure, 
  createPostpartumLogProcedure 
} from "./routes/pregnancy/tracking/route";

// Menopause routes
import { 
  getMenopauseLogsProcedure, 
  logMenopauseProcedure, 
  updateMenopauseLogProcedure, 
  deleteMenopauseLogProcedure, 
  getMenopauseTrendsProcedure 
} from "./routes/menopause/tracking/route";

// AI Insights routes
import { 
  generateAIInsightsProcedure,
  getUserInsightsProcedure,
  getCycleInsightsProcedure,
  getHealthInsightsProcedure,
  getPersonalizedRecommendationsProcedure,
  submitInsightFeedbackProcedure,
  markInsightAsReadProcedure,
  dismissInsightProcedure,
  getInsightAnalyticsProcedure
} from "./routes/insights/ai/route";

// Privacy routes
import { 
  getPrivacyConsentsProcedure,
  updatePrivacyConsentProcedure,
  requestDataExportProcedure,
  getDataExportRequestsProcedure,
  requestAccountDeletionProcedure,
  cancelAccountDeletionProcedure,
  getAccountDeletionRequestProcedure
} from "./routes/privacy/settings/route";

// Notification routes
import { 
  getNotificationSettingsProcedure,
  updateNotificationSettingProcedure,
  createNotificationSettingProcedure,
  deleteNotificationSettingProcedure
} from "./routes/notifications/settings/route";

// Dashboard routes
import { 
  getDashboardWidgetsProcedure,
  updateDashboardWidgetProcedure,
  createDashboardWidgetProcedure,
  deleteDashboardWidgetProcedure,
  reorderDashboardWidgetsProcedure
} from "./routes/dashboard/widgets/route";

// Achievement routes
import { getAchievementProgressProcedure } from "./routes/achievements/progress/route";

export const appRouter = createTRPCRouter({
  // Example routes
  example: createTRPCRouter({
    hi: hiRoute,
  }),

  // Authentication
  auth: createTRPCRouter({
    signup: signupProcedure,
    login: loginProcedure,
    refresh: refreshTokenProcedure,
    logout: logoutProcedure,
  }),

  // User management
  users: createTRPCRouter({
    profile: createTRPCRouter({
      get: getProfileProcedure,
      update: updateProfileProcedure,
      updateSettings: updateSettingsProcedure,
    }),
  }),

  // Cycle tracking
  cycles: createTRPCRouter({
    tracking: createTRPCRouter({
      getCurrentCycle: getCurrentCycleProcedure,
      getCycles: getCyclesProcedure,
      startCycle: startCycleProcedure,
      getPeriodLogs: getPeriodLogsProcedure,
      logPeriod: logPeriodProcedure,
      getSymptomLogs: getSymptomLogsProcedure,
      logSymptom: logSymptomProcedure,
      getMoodLogs: getMoodLogsProcedure,
      logMood: logMoodProcedure,
    }),
  }),

  // Fertility tracking
  fertility: createTRPCRouter({
    bbt: createTRPCRouter({
      getLogs: getBBTLogsProcedure,
      log: logBBTProcedure,
      update: updateBBTLogProcedure,
      delete: deleteBBTLogProcedure,
      getTrends: getBBTTrendsProcedure,
    }),
    cervicalMucus: createTRPCRouter({
      getLogs: getCervicalMucusLogsProcedure,
      log: logCervicalMucusProcedure,
      update: updateCervicalMucusLogProcedure,
      delete: deleteCervicalMucusLogProcedure,
    }),
    predictions: createTRPCRouter({
      getFertilityPredictions: getFertilityPredictionsProcedure,
      getOvulationPrediction: getOvulationPredictionProcedure,
      getFertilityWindow: getFertilityWindowProcedure,
      getCyclePredictions: getCyclePredictionsProcedure,
    }),
  }),

  // Wellness tracking
  wellness: createTRPCRouter({
    water: createTRPCRouter({
      getLogs: getWaterIntakeLogsProcedure,
      log: logWaterIntakeProcedure,
    }),
    nutrition: createTRPCRouter({
      getLogs: getNutritionLogsProcedure,
      log: logNutritionProcedure,
      update: updateNutritionLogProcedure,
      delete: deleteNutritionLogProcedure,
      getSummary: getNutritionSummaryProcedure,
    }),
    activity: createTRPCRouter({
      getLogs: getActivityLogsProcedure,
      log: logActivityProcedure,
      update: updateActivityLogProcedure,
      delete: deleteActivityLogProcedure,
      getSummary: getActivitySummaryProcedure,
    }),
    sleep: createTRPCRouter({
      getLogs: getSleepLogsProcedure,
      log: logSleepProcedure,
      update: updateSleepLogProcedure,
      delete: deleteSleepLogProcedure,
      getTrends: getSleepTrendsProcedure,
    }),
  }),

  // Journal
  journal: createTRPCRouter({
    entries: createTRPCRouter({
      get: getJournalEntriesProcedure,
      create: createJournalEntryProcedure,
      update: updateJournalEntryProcedure,
      delete: deleteJournalEntryProcedure,
      getStats: getJournalStatsProcedure,
    }),
  }),

  // Community forum
  forum: createTRPCRouter({
    categories: createTRPCRouter({
      get: getForumCategoriesProcedure,
    }),
    threads: createTRPCRouter({
      get: getForumThreadsProcedure,
      getById: getForumThreadProcedure,
      create: createForumThreadProcedure,
      update: updateForumThreadProcedure,
      delete: deleteForumThreadProcedure,
    }),
    replies: createTRPCRouter({
      get: getForumRepliesProcedure,
      create: createForumReplyProcedure,
      update: updateForumReplyProcedure,
      delete: deleteForumReplyProcedure,
    }),
  }),

  // Birth control
  birthControl: createTRPCRouter({
    tracking: createTRPCRouter({
      getRecords: getBirthControlRecordsProcedure,
      createRecord: createBirthControlRecordProcedure,
      updateRecord: updateBirthControlRecordProcedure,
      deleteRecord: deleteBirthControlRecordProcedure,
      getLogs: getBirthControlLogsProcedure,
      logAdherence: logBirthControlAdherenceProcedure,
      getAdherenceStats: getBirthControlAdherenceStatsProcedure,
    }),
  }),

  // Pregnancy
  pregnancy: createTRPCRouter({
    tracking: createTRPCRouter({
      getPregnancies: getPregnanciesProcedure,
      create: createPregnancyProcedure,
      update: updatePregnancyProcedure,
      getLogs: getPregnancyLogsProcedure,
      createLog: createPregnancyLogProcedure,
      updateLog: updatePregnancyLogProcedure,
      getPostpartumLogs: getPostpartumLogsProcedure,
      createPostpartumLog: createPostpartumLogProcedure,
    }),
  }),

  // Menopause
  menopause: createTRPCRouter({
    tracking: createTRPCRouter({
      getLogs: getMenopauseLogsProcedure,
      log: logMenopauseProcedure,
      update: updateMenopauseLogProcedure,
      delete: deleteMenopauseLogProcedure,
      getTrends: getMenopauseTrendsProcedure,
    }),
  }),

  // AI Insights
  insights: createTRPCRouter({
    ai: createTRPCRouter({
      generate: generateAIInsightsProcedure,
      getUserInsights: getUserInsightsProcedure,
      getCycleInsights: getCycleInsightsProcedure,
      getHealthInsights: getHealthInsightsProcedure,
      getRecommendations: getPersonalizedRecommendationsProcedure,
      submitFeedback: submitInsightFeedbackProcedure,
      markAsRead: markInsightAsReadProcedure,
      dismiss: dismissInsightProcedure,
      getAnalytics: getInsightAnalyticsProcedure,
    }),
  }),

  // Privacy
  privacy: createTRPCRouter({
    settings: createTRPCRouter({
      getConsents: getPrivacyConsentsProcedure,
      updateConsent: updatePrivacyConsentProcedure,
      requestDataExport: requestDataExportProcedure,
      getDataExportRequests: getDataExportRequestsProcedure,
      requestAccountDeletion: requestAccountDeletionProcedure,
      cancelAccountDeletion: cancelAccountDeletionProcedure,
      getAccountDeletionRequest: getAccountDeletionRequestProcedure,
    }),
  }),

  // Notifications
  notifications: createTRPCRouter({
    settings: createTRPCRouter({
      get: getNotificationSettingsProcedure,
      update: updateNotificationSettingProcedure,
      create: createNotificationSettingProcedure,
      delete: deleteNotificationSettingProcedure,
    }),
  }),

  // Dashboard
  dashboard: createTRPCRouter({
    widgets: createTRPCRouter({
      get: getDashboardWidgetsProcedure,
      update: updateDashboardWidgetProcedure,
      create: createDashboardWidgetProcedure,
      delete: deleteDashboardWidgetProcedure,
      reorder: reorderDashboardWidgetsProcedure,
    }),
  }),

  // Achievements
  achievements: createTRPCRouter({
    progress: createTRPCRouter({
      get: getAchievementProgressProcedure,
    }),
  }),
});

export type AppRouter = typeof appRouter;