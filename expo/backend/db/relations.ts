import { relations } from 'drizzle-orm';
import {
  users,
  cycles,
  periodLogs,
  symptoms,
  symptomLogs,
  moodLogs,
  bbtLogs,
  cervicalMucusLogs,
  pregnancies,
  pregnancyLogs,
  postpartumLogs,
  menopauseLogs,
  birthControlRecords,
  birthControlLogs,
  waterIntakeLogs,
  activityLogs,
  nutritionLogs,
  sleepLogs,
  journalEntries,
  forumCategories,
  forumThreads,
  forumReplies,
  userForumProfiles,
  achievements,
  userAchievements,
  userSettings,
  notificationSettings,
  privacyConsents,
  dataExportRequests,
  accountDeletionRequests,
  dashboardWidgets,
  partnerSharing,
  auditLogs,
} from './schema';

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  // One-to-one relations
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  forumProfile: one(userForumProfiles, {
    fields: [users.id],
    references: [userForumProfiles.userId],
  }),
  
  // One-to-many relations
  cycles: many(cycles),
  periodLogs: many(periodLogs),
  symptomLogs: many(symptomLogs),
  moodLogs: many(moodLogs),
  bbtLogs: many(bbtLogs),
  cervicalMucusLogs: many(cervicalMucusLogs),
  pregnancies: many(pregnancies),
  menopauseLogs: many(menopauseLogs),
  birthControlRecords: many(birthControlRecords),
  waterIntakeLogs: many(waterIntakeLogs),
  activityLogs: many(activityLogs),
  nutritionLogs: many(nutritionLogs),
  sleepLogs: many(sleepLogs),
  journalEntries: many(journalEntries),
  forumThreads: many(forumThreads),
  forumReplies: many(forumReplies),
  userAchievements: many(userAchievements),
  notificationSettings: many(notificationSettings),
  privacyConsents: many(privacyConsents),
  dataExportRequests: many(dataExportRequests),
  accountDeletionRequests: many(accountDeletionRequests),
  dashboardWidgets: many(dashboardWidgets),
  partnerSharingAsUser: many(partnerSharing, { relationName: 'userPartnerSharing' }),
  partnerSharingAsPartner: many(partnerSharing, { relationName: 'partnerPartnerSharing' }),
  auditLogs: many(auditLogs),
}));

// Cycle relations
export const cyclesRelations = relations(cycles, ({ one, many }) => ({
  user: one(users, {
    fields: [cycles.userId],
    references: [users.id],
  }),
  periodLogs: many(periodLogs),
}));

// Period logs relations
export const periodLogsRelations = relations(periodLogs, ({ one }) => ({
  user: one(users, {
    fields: [periodLogs.userId],
    references: [users.id],
  }),
  cycle: one(cycles, {
    fields: [periodLogs.cycleId],
    references: [cycles.id],
  }),
}));

// Symptoms relations
export const symptomsRelations = relations(symptoms, ({ many }) => ({
  symptomLogs: many(symptomLogs),
}));

// Symptom logs relations
export const symptomLogsRelations = relations(symptomLogs, ({ one }) => ({
  user: one(users, {
    fields: [symptomLogs.userId],
    references: [users.id],
  }),
  symptom: one(symptoms, {
    fields: [symptomLogs.symptomId],
    references: [symptoms.id],
  }),
}));

// Mood logs relations
export const moodLogsRelations = relations(moodLogs, ({ one }) => ({
  user: one(users, {
    fields: [moodLogs.userId],
    references: [users.id],
  }),
}));

// BBT logs relations
export const bbtLogsRelations = relations(bbtLogs, ({ one }) => ({
  user: one(users, {
    fields: [bbtLogs.userId],
    references: [users.id],
  }),
}));

// Cervical mucus logs relations
export const cervicalMucusLogsRelations = relations(cervicalMucusLogs, ({ one }) => ({
  user: one(users, {
    fields: [cervicalMucusLogs.userId],
    references: [users.id],
  }),
}));

// Pregnancy relations
export const pregnanciesRelations = relations(pregnancies, ({ one, many }) => ({
  user: one(users, {
    fields: [pregnancies.userId],
    references: [users.id],
  }),
  pregnancyLogs: many(pregnancyLogs),
  postpartumLogs: many(postpartumLogs),
}));

// Pregnancy logs relations
export const pregnancyLogsRelations = relations(pregnancyLogs, ({ one }) => ({
  pregnancy: one(pregnancies, {
    fields: [pregnancyLogs.pregnancyId],
    references: [pregnancies.id],
  }),
}));

// Postpartum logs relations
export const postpartumLogsRelations = relations(postpartumLogs, ({ one }) => ({
  pregnancy: one(pregnancies, {
    fields: [postpartumLogs.pregnancyId],
    references: [pregnancies.id],
  }),
}));

// Menopause logs relations
export const menopauseLogsRelations = relations(menopauseLogs, ({ one }) => ({
  user: one(users, {
    fields: [menopauseLogs.userId],
    references: [users.id],
  }),
}));

// Birth control records relations
export const birthControlRecordsRelations = relations(birthControlRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [birthControlRecords.userId],
    references: [users.id],
  }),
  birthControlLogs: many(birthControlLogs),
}));

// Birth control logs relations
export const birthControlLogsRelations = relations(birthControlLogs, ({ one }) => ({
  birthControlRecord: one(birthControlRecords, {
    fields: [birthControlLogs.birthControlId],
    references: [birthControlRecords.id],
  }),
}));

// Water intake logs relations
export const waterIntakeLogsRelations = relations(waterIntakeLogs, ({ one }) => ({
  user: one(users, {
    fields: [waterIntakeLogs.userId],
    references: [users.id],
  }),
}));

// Activity logs relations
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Nutrition logs relations
export const nutritionLogsRelations = relations(nutritionLogs, ({ one }) => ({
  user: one(users, {
    fields: [nutritionLogs.userId],
    references: [users.id],
  }),
}));

// Sleep logs relations
export const sleepLogsRelations = relations(sleepLogs, ({ one }) => ({
  user: one(users, {
    fields: [sleepLogs.userId],
    references: [users.id],
  }),
}));

// Journal entries relations
export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

// Forum categories relations
export const forumCategoriesRelations = relations(forumCategories, ({ many }) => ({
  threads: many(forumThreads),
}));

// Forum threads relations
export const forumThreadsRelations = relations(forumThreads, ({ one, many }) => ({
  category: one(forumCategories, {
    fields: [forumThreads.categoryId],
    references: [forumCategories.id],
  }),
  author: one(users, {
    fields: [forumThreads.authorId],
    references: [users.id],
  }),
  lastReplyUser: one(users, {
    fields: [forumThreads.lastReplyBy],
    references: [users.id],
  }),
  replies: many(forumReplies),
}));

// Forum replies relations
export const forumRepliesRelations = relations(forumReplies, ({ one, many }) => ({
  thread: one(forumThreads, {
    fields: [forumReplies.threadId],
    references: [forumThreads.id],
  }),
  author: one(users, {
    fields: [forumReplies.authorId],
    references: [users.id],
  }),
  parentReply: one(forumReplies, {
    fields: [forumReplies.parentReplyId],
    references: [forumReplies.id],
    relationName: 'parentReply',
  }),
  childReplies: many(forumReplies, { relationName: 'parentReply' }),
}));

// User forum profiles relations
export const userForumProfilesRelations = relations(userForumProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userForumProfiles.userId],
    references: [users.id],
  }),
}));

// Achievements relations
export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

// User achievements relations
export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

// User settings relations
export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// Notification settings relations
export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [notificationSettings.userId],
    references: [users.id],
  }),
}));

// Privacy consents relations
export const privacyConsentsRelations = relations(privacyConsents, ({ one }) => ({
  user: one(users, {
    fields: [privacyConsents.userId],
    references: [users.id],
  }),
}));

// Data export requests relations
export const dataExportRequestsRelations = relations(dataExportRequests, ({ one }) => ({
  user: one(users, {
    fields: [dataExportRequests.userId],
    references: [users.id],
  }),
}));

// Account deletion requests relations
export const accountDeletionRequestsRelations = relations(accountDeletionRequests, ({ one }) => ({
  user: one(users, {
    fields: [accountDeletionRequests.userId],
    references: [users.id],
  }),
}));

// Dashboard widgets relations
export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  user: one(users, {
    fields: [dashboardWidgets.userId],
    references: [users.id],
  }),
}));

// Partner sharing relations
export const partnerSharingRelations = relations(partnerSharing, ({ one }) => ({
  user: one(users, {
    fields: [partnerSharing.userId],
    references: [users.id],
    relationName: 'userPartnerSharing',
  }),
  partner: one(users, {
    fields: [partnerSharing.partnerId],
    references: [users.id],
    relationName: 'partnerPartnerSharing',
  }),
}));

// Audit logs relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));