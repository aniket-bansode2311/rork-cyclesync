import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, jsonb, date, time, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const genderEnum = pgEnum('gender', ['female', 'male', 'non_binary', 'prefer_not_to_say']);
export const symptomTypeEnum = pgEnum('symptom_type', ['physical', 'emotional', 'behavioral']);
export const intensityEnum = pgEnum('intensity', ['low', 'medium', 'high']);
export const moodEnum = pgEnum('mood', ['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'stressed', 'calm']);
export const flowIntensityEnum = pgEnum('flow_intensity', ['spotting', 'light', 'medium', 'heavy']);
export const cervicalMucusTypeEnum = pgEnum('cervical_mucus_type', ['dry', 'sticky', 'creamy', 'watery', 'egg_white']);
export const birthControlTypeEnum = pgEnum('birth_control_type', ['pill', 'patch', 'ring', 'injection', 'implant', 'iud', 'condom', 'diaphragm', 'natural']);
export const activityTypeEnum = pgEnum('activity_type', ['cardio', 'strength', 'yoga', 'walking', 'running', 'cycling', 'swimming', 'other']);
export const sleepQualityEnum = pgEnum('sleep_quality', ['poor', 'fair', 'good', 'excellent']);
export const achievementTypeEnum = pgEnum('achievement_type', ['milestone', 'streak', 'exploration', 'consistency']);
export const notificationTypeEnum = pgEnum('notification_type', ['period_reminder', 'ovulation_reminder', 'birth_control_reminder', 'symptom_log_reminder', 'appointment_reminder']);
export const privacyConsentTypeEnum = pgEnum('privacy_consent_type', ['data_collection', 'analytics', 'research', 'marketing', 'third_party_sharing']);
export const forumCategoryEnum = pgEnum('forum_category', ['general', 'periods', 'fertility', 'pregnancy', 'menopause', 'birth_control', 'wellness', 'support']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  dateOfBirth: date('date_of_birth'),
  gender: genderEnum('gender'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  isEmailVerified: boolean('is_email_verified').default(false),
  profilePicture: text('profile_picture'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at'),
});

// Cycles table
export const cycles = pgTable('cycles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  cycleLength: integer('cycle_length'),
  periodLength: integer('period_length'),
  predictedNextPeriod: date('predicted_next_period'),
  predictedOvulation: date('predicted_ovulation'),
  actualOvulation: date('actual_ovulation'),
  notes: text('notes'),
  isComplete: boolean('is_complete').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Period logs table
export const periodLogs = pgTable('period_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cycleId: uuid('cycle_id').references(() => cycles.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  flowIntensity: flowIntensityEnum('flow_intensity'),
  symptoms: jsonb('symptoms'), // Array of symptom IDs
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Symptoms table (predefined symptoms)
export const symptoms = pgTable('symptoms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  category: symptomTypeEnum('category').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User symptom logs
export const symptomLogs = pgTable('symptom_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  symptomId: uuid('symptom_id').references(() => symptoms.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  intensity: intensityEnum('intensity'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mood logs
export const moodLogs = pgTable('mood_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  mood: moodEnum('mood').notNull(),
  intensity: intensityEnum('intensity'),
  notes: text('notes'),
  triggers: jsonb('triggers'), // Array of trigger strings
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// BBT (Basal Body Temperature) logs
export const bbtLogs = pgTable('bbt_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  temperature: decimal('temperature', { precision: 4, scale: 2 }).notNull(), // e.g., 98.60
  time: time('time'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cervical mucus logs
export const cervicalMucusLogs = pgTable('cervical_mucus_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  type: cervicalMucusTypeEnum('type').notNull(),
  amount: intensityEnum('amount'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Pregnancy records
export const pregnancies = pgTable('pregnancies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  conceptionDate: date('conception_date'),
  dueDate: date('due_date'),
  deliveryDate: date('delivery_date'),
  isActive: boolean('is_active').default(true),
  outcome: varchar('outcome', { length: 50 }), // 'live_birth', 'miscarriage', 'stillbirth', 'ongoing'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Pregnancy logs (weekly progress)
export const pregnancyLogs = pgTable('pregnancy_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  pregnancyId: uuid('pregnancy_id').references(() => pregnancies.id, { onDelete: 'cascade' }).notNull(),
  week: integer('week').notNull(),
  weight: decimal('weight', { precision: 5, scale: 2 }),
  symptoms: jsonb('symptoms'),
  notes: text('notes'),
  appointments: jsonb('appointments'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Postpartum logs
export const postpartumLogs = pgTable('postpartum_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  pregnancyId: uuid('pregnancy_id').references(() => pregnancies.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  bleeding: flowIntensityEnum('bleeding'),
  mood: moodEnum('mood'),
  breastfeeding: boolean('breastfeeding'),
  sleep: integer('sleep_hours'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Menopause logs
export const menopauseLogs = pgTable('menopause_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  hotFlashes: integer('hot_flashes_count'),
  nightSweats: boolean('night_sweats'),
  moodChanges: moodEnum('mood_changes'),
  sleepQuality: sleepQualityEnum('sleep_quality'),
  symptoms: jsonb('symptoms'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Birth control records
export const birthControlRecords = pgTable('birth_control_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: birthControlTypeEnum('type').notNull(),
  brand: varchar('brand', { length: 100 }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  isActive: boolean('is_active').default(true),
  reminderTime: time('reminder_time'),
  reminderDays: jsonb('reminder_days'), // Array of day numbers (0-6)
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Birth control adherence logs
export const birthControlLogs = pgTable('birth_control_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  birthControlId: uuid('birth_control_id').references(() => birthControlRecords.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  taken: boolean('taken').notNull(),
  takenAt: timestamp('taken_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Water intake logs
export const waterIntakeLogs = pgTable('water_intake_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  amount: integer('amount').notNull(), // in ml
  goal: integer('goal'), // daily goal in ml
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activity logs
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  type: activityTypeEnum('type').notNull(),
  duration: integer('duration'), // in minutes
  intensity: intensityEnum('intensity'),
  calories: integer('calories'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Nutrition logs
export const nutritionLogs = pgTable('nutrition_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  foodItem: varchar('food_item', { length: 200 }).notNull(),
  quantity: decimal('quantity', { precision: 8, scale: 2 }),
  unit: varchar('unit', { length: 50 }),
  calories: integer('calories'),
  protein: decimal('protein', { precision: 6, scale: 2 }),
  carbs: decimal('carbs', { precision: 6, scale: 2 }),
  fat: decimal('fat', { precision: 6, scale: 2 }),
  fiber: decimal('fiber', { precision: 6, scale: 2 }),
  sugar: decimal('sugar', { precision: 6, scale: 2 }),
  sodium: decimal('sodium', { precision: 8, scale: 2 }),
  mealType: varchar('meal_type', { length: 50 }), // breakfast, lunch, dinner, snack
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sleep logs
export const sleepLogs = pgTable('sleep_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  bedtime: timestamp('bedtime'),
  wakeTime: timestamp('wake_time'),
  duration: integer('duration'), // in minutes
  quality: sleepQualityEnum('quality'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Journal entries (encrypted)
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  title: text('title'), // encrypted
  content: text('content').notNull(), // encrypted
  mood: moodEnum('mood'),
  tags: jsonb('tags'), // Array of tag strings
  isEncrypted: boolean('is_encrypted').default(true),
  encryptionKeyId: varchar('encryption_key_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Forum categories
export const forumCategories = pgTable('forum_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: forumCategoryEnum('category').notNull(),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Forum threads
export const forumThreads = pgTable('forum_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => forumCategories.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  isSticky: boolean('is_sticky').default(false),
  isLocked: boolean('is_locked').default(false),
  viewCount: integer('view_count').default(0),
  replyCount: integer('reply_count').default(0),
  lastReplyAt: timestamp('last_reply_at'),
  lastReplyBy: uuid('last_reply_by').references(() => users.id),
  tags: jsonb('tags'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Forum replies - Fixed with proper type annotation and self-reference
export const forumReplies = pgTable('forum_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  parentReplyId: uuid('parent_reply_id'), // for nested replies - removed self-reference to avoid circular dependency
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User forum profiles
export const userForumProfiles = pgTable('user_forum_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  postCount: integer('post_count').default(0),
  reputationScore: integer('reputation_score').default(0),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at'),
});

// Achievements
export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  type: achievementTypeEnum('type').notNull(),
  criteria: jsonb('criteria').notNull(), // JSON object defining achievement criteria
  badgeIcon: varchar('badge_icon', { length: 100 }),
  points: integer('points').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User achievements
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  achievementId: uuid('achievement_id').references(() => achievements.id, { onDelete: 'cascade' }).notNull(),
  progress: integer('progress').default(0),
  isUnlocked: boolean('is_unlocked').default(false),
  unlockedAt: timestamp('unlocked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User settings
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  theme: varchar('theme', { length: 20 }).default('light'),
  language: varchar('language', { length: 10 }).default('en'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  dateFormat: varchar('date_format', { length: 20 }).default('MM/DD/YYYY'),
  temperatureUnit: varchar('temperature_unit', { length: 10 }).default('fahrenheit'),
  weightUnit: varchar('weight_unit', { length: 10 }).default('lbs'),
  cycleLength: integer('cycle_length').default(28),
  periodLength: integer('period_length').default(5),
  lutealPhaseLength: integer('luteal_phase_length').default(14),
  dailyWaterGoal: integer('daily_water_goal').default(2000), // in ml
  enableNotifications: boolean('enable_notifications').default(true),
  enableDataSync: boolean('enable_data_sync').default(true),
  enableAnalytics: boolean('enable_analytics').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notification settings
export const notificationSettings = pgTable('notification_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: notificationTypeEnum('type').notNull(),
  isEnabled: boolean('is_enabled').default(true),
  time: time('time'),
  daysInAdvance: integer('days_in_advance'),
  customMessage: text('custom_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Privacy consents
export const privacyConsents = pgTable('privacy_consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  consentType: privacyConsentTypeEnum('consent_type').notNull(),
  isGranted: boolean('is_granted').notNull(),
  grantedAt: timestamp('granted_at'),
  revokedAt: timestamp('revoked_at'),
  version: varchar('version', { length: 20 }).default('1.0'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Data export requests
export const dataExportRequests = pgTable('data_export_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, processing, completed, failed
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  downloadUrl: text('download_url'),
  expiresAt: timestamp('expires_at'),
  fileSize: integer('file_size'),
  format: varchar('format', { length: 10 }).default('json'), // json, csv, pdf
});

// Account deletion requests
export const accountDeletionRequests = pgTable('account_deletion_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reason: text('reason'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, processing, completed, cancelled
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  scheduledFor: timestamp('scheduled_for'), // Grace period
  completedAt: timestamp('completed_at'),
  cancellationToken: varchar('cancellation_token', { length: 100 }),
});

// Dashboard widgets
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  widgetType: varchar('widget_type', { length: 50 }).notNull(),
  position: integer('position').notNull(),
  isVisible: boolean('is_visible').default(true),
  configuration: jsonb('configuration'), // Widget-specific settings
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Partner sharing
export const partnerSharing = pgTable('partner_sharing', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  partnerEmail: varchar('partner_email', { length: 255 }).notNull(),
  partnerId: uuid('partner_id').references(() => users.id),
  permissions: jsonb('permissions').notNull(), // Array of permission strings
  status: varchar('status', { length: 20 }).default('pending'), // pending, accepted, declined, revoked
  inviteToken: varchar('invite_token', { length: 100 }),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  revokedAt: timestamp('revoked_at'),
  expiresAt: timestamp('expires_at'),
});

// Audit logs for sensitive operations
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  resourceId: uuid('resource_id'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Relations - Fixed to add proper return type annotations
export const forumRepliesRelations = relations(forumReplies, ({ one, many }) => ({
  parentReply: one(forumReplies, {
    fields: [forumReplies.parentReplyId],
    references: [forumReplies.id],
  }),
  childReplies: many(forumReplies),
}));