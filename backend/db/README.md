# CycleSync Database Schema

This document describes the PostgreSQL database schema for CycleSync, a comprehensive menstrual health tracking application.

## Overview

The database is designed to handle all aspects of menstrual health tracking, including:
- User management and authentication
- Menstrual cycle tracking
- Symptom and mood logging
- Fertility tracking (BBT, cervical mucus)
- Pregnancy and postpartum tracking
- Menopause support
- Birth control management
- Wellness data (water, activity, nutrition, sleep)
- Journal entries (encrypted)
- Community features (forum)
- Achievement system
- Privacy and consent management

## Database Structure

### Core Tables

#### Users (`users`)
- Primary user account information
- Authentication details (hashed passwords)
- Profile information (name, DOB, gender)
- Account status and timestamps

#### Cycles (`cycles`)
- Menstrual cycle records
- Start/end dates, cycle length
- Predicted and actual ovulation dates
- Completion status

#### Period Logs (`period_logs`)
- Daily period tracking
- Flow intensity, symptoms, notes
- Linked to cycles and users

### Health Tracking Tables

#### Symptoms (`symptoms`)
- Predefined symptom catalog
- Categories: physical, emotional, behavioral
- Used for consistent symptom tracking

#### Symptom Logs (`symptom_logs`)
- User-specific symptom entries
- Intensity levels and notes
- Date-based tracking

#### Mood Logs (`mood_logs`)
- Daily mood tracking
- Mood types, intensity, triggers
- Notes for context

### Fertility Tracking

#### BBT Logs (`bbt_logs`)
- Basal Body Temperature tracking
- Temperature readings with time
- Notes for context

#### Cervical Mucus Logs (`cervical_mucus_logs`)
- Cervical mucus observations
- Type, amount, notes
- Important for fertility tracking

### Reproductive Health

#### Pregnancies (`pregnancies`)
- Pregnancy records
- Conception, due, delivery dates
- Outcome tracking

#### Pregnancy Logs (`pregnancy_logs`)
- Weekly pregnancy progress
- Weight, symptoms, appointments
- Structured tracking by week

#### Postpartum Logs (`postpartum_logs`)
- Post-delivery tracking
- Bleeding, mood, breastfeeding
- Recovery monitoring

#### Menopause Logs (`menopause_logs`)
- Menopause-specific symptoms
- Hot flashes, night sweats
- Sleep quality tracking

### Birth Control

#### Birth Control Records (`birth_control_records`)
- Active birth control methods
- Type, brand, dates
- Reminder settings

#### Birth Control Logs (`birth_control_logs`)
- Daily adherence tracking
- Taken status and timing
- Notes for missed doses

### Wellness Tracking

#### Water Intake Logs (`water_intake_logs`)
- Daily water consumption
- Amount vs. goal tracking
- Hydration monitoring

#### Activity Logs (`activity_logs`)
- Exercise and activity tracking
- Type, duration, intensity
- Calorie estimation

#### Nutrition Logs (`nutrition_logs`)
- Food intake tracking
- Nutritional information
- Meal categorization

#### Sleep Logs (`sleep_logs`)
- Sleep pattern tracking
- Bedtime, wake time, quality
- Duration calculation

### Personal Data

#### Journal Entries (`journal_entries`)
- Private journal entries
- Encrypted content
- Mood and tag associations

### Community Features

#### Forum Categories (`forum_categories`)
- Discussion categories
- Topic organization
- Active status management

#### Forum Threads (`forum_threads`)
- Discussion topics
- View counts, reply counts
- Sticky and locked status

#### Forum Replies (`forum_replies`)
- Thread responses
- Nested reply support
- Deletion status

#### User Forum Profiles (`user_forum_profiles`)
- Forum-specific user data
- Post counts, reputation
- Activity tracking

### Gamification

#### Achievements (`achievements`)
- Available achievements
- Criteria and rewards
- Badge information

#### User Achievements (`user_achievements`)
- User progress tracking
- Unlock status and dates
- Progress percentages

### Settings and Preferences

#### User Settings (`user_settings`)
- App preferences
- Units, formats, goals
- Notification preferences

#### Notification Settings (`notification_settings`)
- Notification preferences by type
- Timing and custom messages
- Enable/disable controls

### Privacy and Compliance

#### Privacy Consents (`privacy_consents`)
- GDPR/privacy compliance
- Consent tracking by type
- Version and audit trail

#### Data Export Requests (`data_export_requests`)
- User data export requests
- Status tracking
- Download management

#### Account Deletion Requests (`account_deletion_requests`)
- Account deletion requests
- Grace period management
- Cancellation tokens

### Customization

#### Dashboard Widgets (`dashboard_widgets`)
- User dashboard customization
- Widget positioning
- Configuration storage

### Sharing Features

#### Partner Sharing (`partner_sharing`)
- Data sharing with partners
- Permission management
- Invitation system

### Audit and Security

#### Audit Logs (`audit_logs`)
- Security audit trail
- Action tracking
- Change history

## Data Types and Enums

### Enums Used
- `gender`: female, male, non_binary, prefer_not_to_say
- `symptom_type`: physical, emotional, behavioral
- `intensity`: low, medium, high
- `mood`: happy, sad, anxious, angry, neutral, excited, stressed, calm
- `flow_intensity`: spotting, light, medium, heavy
- `cervical_mucus_type`: dry, sticky, creamy, watery, egg_white
- `birth_control_type`: pill, patch, ring, injection, implant, iud, condom, diaphragm, natural
- `activity_type`: cardio, strength, yoga, walking, running, cycling, swimming, other
- `sleep_quality`: poor, fair, good, excellent
- `achievement_type`: milestone, streak, exploration, consistency
- `notification_type`: period_reminder, ovulation_reminder, birth_control_reminder, symptom_log_reminder, appointment_reminder
- `privacy_consent_type`: data_collection, analytics, research, marketing, third_party_sharing
- `forum_category`: general, periods, fertility, pregnancy, menopause, birth_control, wellness, support

## Security Features

### Data Protection
- Password hashing for authentication
- Encrypted journal entries
- Audit logging for sensitive operations
- Privacy consent tracking

### Access Control
- User-based data isolation
- Partner sharing permissions
- Forum moderation capabilities
- Admin audit trails

### Compliance
- GDPR-compliant data export
- Right to be forgotten (deletion)
- Consent management
- Data retention policies

## Performance Optimizations

### Indexing Strategy
- Primary keys on all tables
- Foreign key indexes
- Composite indexes for common queries
- Partial indexes for filtered queries
- GIN indexes for JSONB columns

### Query Optimization
- Date range queries optimized
- User-specific data isolation
- Efficient joins with proper indexing
- Pagination support

## Setup Instructions

### Prerequisites
- PostgreSQL 12+
- Node.js 18+
- Drizzle ORM

### Installation
1. Install dependencies:
   ```bash
   npm install drizzle-orm postgres @types/pg drizzle-kit
   ```

2. Set environment variables:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/cyclesync"
   ```

3. Generate and run migrations:
   ```bash
   npx drizzle-kit generate:pg
   npx drizzle-kit push:pg
   ```

4. Run seed data:
   ```bash
   npm run db:seed
   ```

5. Apply performance indexes:
   ```bash
   psql -d cyclesync -f backend/db/indexes.sql
   ```

## Maintenance

### Regular Tasks
- Monitor query performance
- Update statistics
- Vacuum and analyze tables
- Review audit logs
- Clean up expired tokens

### Backup Strategy
- Daily automated backups
- Point-in-time recovery
- Encrypted backup storage
- Regular restore testing

### Monitoring
- Connection pool monitoring
- Query performance tracking
- Storage usage monitoring
- Error rate tracking

## API Integration

The database integrates with the tRPC API layer for:
- Type-safe database operations
- Automatic query optimization
- Real-time subscriptions
- Caching strategies

## Future Enhancements

### Planned Features
- Multi-language support
- Advanced analytics
- Machine learning insights
- Wearable device integration
- Telemedicine integration

### Scalability Considerations
- Read replicas for analytics
- Partitioning for large datasets
- Caching layer implementation
- CDN for static assets