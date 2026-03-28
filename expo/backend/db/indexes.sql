-- Performance indexes for CycleSync database
-- Run these after creating the tables

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- Cycles table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cycles_user_id ON cycles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cycles_start_date ON cycles(start_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cycles_user_start_date ON cycles(user_id, start_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cycles_active ON cycles(user_id, is_complete) WHERE is_complete = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cycles_predicted_period ON cycles(predicted_next_period);

-- Period logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_period_logs_user_id ON period_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_period_logs_date ON period_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_period_logs_user_date ON period_logs(user_id, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_period_logs_cycle_id ON period_logs(cycle_id);

-- Symptom logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_symptom_logs_user_id ON symptom_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_symptom_logs_date ON symptom_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_symptom_logs_user_date ON symptom_logs(user_id, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_symptom_logs_symptom_id ON symptom_logs(symptom_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_symptom_logs_user_symptom ON symptom_logs(user_id, symptom_id);

-- Mood logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mood_logs_user_id ON mood_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mood_logs_date ON mood_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mood_logs_mood ON mood_logs(mood);

-- BBT logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bbt_logs_user_id ON bbt_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bbt_logs_date ON bbt_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bbt_logs_user_date ON bbt_logs(user_id, date DESC);

-- Cervical mucus logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cervical_mucus_logs_user_id ON cervical_mucus_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cervical_mucus_logs_date ON cervical_mucus_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cervical_mucus_logs_user_date ON cervical_mucus_logs(user_id, date DESC);

-- Pregnancies table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pregnancies_user_id ON pregnancies(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pregnancies_active ON pregnancies(user_id, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pregnancies_due_date ON pregnancies(due_date);

-- Pregnancy logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pregnancy_logs_pregnancy_id ON pregnancy_logs(pregnancy_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pregnancy_logs_week ON pregnancy_logs(pregnancy_id, week);

-- Postpartum logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_postpartum_logs_pregnancy_id ON postpartum_logs(pregnancy_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_postpartum_logs_date ON postpartum_logs(date);

-- Menopause logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menopause_logs_user_id ON menopause_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menopause_logs_date ON menopause_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menopause_logs_user_date ON menopause_logs(user_id, date DESC);

-- Birth control records table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_birth_control_records_user_id ON birth_control_records(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_birth_control_records_active ON birth_control_records(user_id, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_birth_control_records_type ON birth_control_records(type);

-- Birth control logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_birth_control_logs_birth_control_id ON birth_control_logs(birth_control_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_birth_control_logs_date ON birth_control_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_birth_control_logs_taken ON birth_control_logs(birth_control_id, date, taken);

-- Water intake logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_water_intake_logs_user_id ON water_intake_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_water_intake_logs_date ON water_intake_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_water_intake_logs_user_date ON water_intake_logs(user_id, date DESC);

-- Activity logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_date ON activity_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_date ON activity_logs(user_id, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);

-- Nutrition logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nutrition_logs_date ON nutrition_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nutrition_logs_meal_type ON nutrition_logs(meal_type);

-- Sleep logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleep_logs_user_id ON sleep_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleep_logs_date ON sleep_logs(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, date DESC);

-- Journal entries table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, date DESC);

-- Forum categories table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_categories_active ON forum_categories(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_categories_sort_order ON forum_categories(sort_order);

-- Forum threads table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_threads_last_reply ON forum_threads(last_reply_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_threads_sticky ON forum_threads(is_sticky, last_reply_at DESC) WHERE is_sticky = true;

-- Forum replies table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_replies_created_at ON forum_replies(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_replies_parent ON forum_replies(parent_reply_id) WHERE parent_reply_id IS NOT NULL;

-- User forum profiles table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_forum_profiles_user_id ON user_forum_profiles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_forum_profiles_reputation ON user_forum_profiles(reputation_score DESC);

-- User achievements table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(user_id, is_unlocked) WHERE is_unlocked = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC) WHERE unlocked_at IS NOT NULL;

-- User settings table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Notification settings table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_settings_type ON notification_settings(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_settings_enabled ON notification_settings(user_id, is_enabled) WHERE is_enabled = true;

-- Privacy consents table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_privacy_consents_user_id ON privacy_consents(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_privacy_consents_type ON privacy_consents(consent_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_privacy_consents_granted ON privacy_consents(user_id, consent_type, is_granted);

-- Data export requests table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_data_export_requests_user_id ON data_export_requests(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_data_export_requests_status ON data_export_requests(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_data_export_requests_requested_at ON data_export_requests(requested_at DESC);

-- Account deletion requests table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_deletion_requests_status ON account_deletion_requests(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_deletion_requests_scheduled ON account_deletion_requests(scheduled_for);

-- Dashboard widgets table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_widgets_position ON dashboard_widgets(user_id, position);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_widgets_visible ON dashboard_widgets(user_id, is_visible) WHERE is_visible = true;

-- Partner sharing table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_partner_sharing_user_id ON partner_sharing(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_partner_sharing_partner_id ON partner_sharing(partner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_partner_sharing_status ON partner_sharing(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_partner_sharing_token ON partner_sharing(invite_token);

-- Audit logs table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cycles_user_complete_date ON cycles(user_id, is_complete, start_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_symptom_logs_user_symptom_date ON symptom_logs(user_id, symptom_id, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_threads_category_sticky_reply ON forum_threads(category_id, is_sticky DESC, last_reply_at DESC);

-- Partial indexes for better performance on filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_email ON users(email) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cycles_incomplete ON cycles(user_id, start_date DESC) WHERE is_complete = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_birth_control_active ON birth_control_records(user_id, start_date DESC) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_threads_not_locked ON forum_threads(category_id, last_reply_at DESC) WHERE is_locked = false;

-- GIN indexes for JSONB columns (for better search performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_period_logs_symptoms_gin ON period_logs USING GIN (symptoms);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mood_logs_triggers_gin ON mood_logs USING GIN (triggers);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_criteria_gin ON achievements USING GIN (criteria);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_widgets_config_gin ON dashboard_widgets USING GIN (configuration);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_partner_sharing_permissions_gin ON partner_sharing USING GIN (permissions);