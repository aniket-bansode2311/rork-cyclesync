# CycleSync REST API Documentation

## Overview

CycleSync provides a comprehensive REST API built with Node.js, Hono, and tRPC. The API supports all aspects of menstrual cycle tracking, fertility monitoring, wellness logging, and community features.

## Base URL
```
https://your-domain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- 100 requests per minute per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when rate limit resets

## API Endpoints

### Authentication

#### POST /trpc/auth.signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "female"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "female",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 604800
}
```

#### POST /trpc/auth.login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### POST /trpc/auth.refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

#### POST /trpc/auth.logout
Logout user (invalidate token).

### User Management

#### GET /trpc/users.profile.get
Get current user profile and settings.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "female",
    "profilePicture": "url",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "settings": {
    "theme": "light",
    "language": "en",
    "cycleLength": 28,
    "periodLength": 5,
    "dailyWaterGoal": 2000
  }
}
```

#### POST /trpc/users.profile.update
Update user profile information.

#### POST /trpc/users.profile.updateSettings
Update user settings and preferences.

### Cycle Tracking

#### GET /trpc/cycles.tracking.getCurrentCycle
Get current active cycle.

#### GET /trpc/cycles.tracking.getCycles
Get user's cycle history.

**Query Parameters:**
- `limit`: Number of cycles to return (default: 10)

#### POST /trpc/cycles.tracking.startCycle
Start a new menstrual cycle.

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "predictedNextPeriod": "2024-01-29",
  "predictedOvulation": "2024-01-15"
}
```

#### GET /trpc/cycles.tracking.getPeriodLogs
Get period logs within date range.

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

#### POST /trpc/cycles.tracking.logPeriod
Log period data for a specific date.

**Request Body:**
```json
{
  "date": "2024-01-01",
  "flowIntensity": "medium",
  "symptoms": ["cramps", "bloating"],
  "notes": "Mild discomfort",
  "cycleId": "uuid"
}
```

#### GET /trpc/cycles.tracking.getSymptomLogs
Get symptom logs within date range.

#### POST /trpc/cycles.tracking.logSymptom
Log symptom data.

**Request Body:**
```json
{
  "symptomId": "uuid",
  "date": "2024-01-01",
  "intensity": "medium",
  "notes": "Mild headache"
}
```

#### GET /trpc/cycles.tracking.getMoodLogs
Get mood logs within date range.

#### POST /trpc/cycles.tracking.logMood
Log mood data.

**Request Body:**
```json
{
  "date": "2024-01-01",
  "mood": "happy",
  "intensity": "high",
  "notes": "Feeling great today",
  "triggers": ["exercise", "good_sleep"]
}
```

### Fertility Tracking

#### GET /trpc/fertility.bbt.getLogs
Get Basal Body Temperature logs.

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `limit`: Number of logs to return (default: 30)

#### POST /trpc/fertility.bbt.log
Log BBT measurement.

**Request Body:**
```json
{
  "date": "2024-01-01",
  "temperature": 98.6,
  "time": "07:00",
  "notes": "Measured immediately upon waking"
}
```

#### PUT /trpc/fertility.bbt.update
Update existing BBT log.

#### DELETE /trpc/fertility.bbt.delete
Delete BBT log.

#### GET /trpc/fertility.bbt.getTrends
Get BBT trends over specified period.

#### GET /trpc/fertility.cervicalMucus.getLogs
Get cervical mucus logs.

#### POST /trpc/fertility.cervicalMucus.log
Log cervical mucus observation.

**Request Body:**
```json
{
  "date": "2024-01-01",
  "type": "egg_white",
  "amount": "medium",
  "notes": "Clear and stretchy"
}
```

#### GET /trpc/fertility.predictions.getFertilityPredictions
Get fertility predictions for current cycle.

#### GET /trpc/fertility.predictions.getOvulationPrediction
Get ovulation prediction.

#### GET /trpc/fertility.predictions.getFertilityWindow
Get fertile window dates.

#### GET /trpc/fertility.predictions.getCyclePredictions
Get cycle predictions for upcoming months.

### Wellness Tracking

#### GET /trpc/wellness.water.getLogs
Get water intake logs.

#### POST /trpc/wellness.water.log
Log water intake.

**Request Body:**
```json
{
  "date": "2024-01-01",
  "amount": 250,
  "goal": 2000
}
```

#### GET /trpc/wellness.nutrition.getLogs
Get nutrition logs.

**Query Parameters:**
- `date`: Specific date
- `startDate`: Start date range
- `endDate`: End date range
- `mealType`: Filter by meal type

#### POST /trpc/wellness.nutrition.log
Log nutrition data.

**Request Body:**
```json
{
  "date": "2024-01-01",
  "foodItem": "Apple",
  "quantity": 1,
  "unit": "medium",
  "calories": 95,
  "protein": 0.5,
  "carbs": 25,
  "fat": 0.3,
  "fiber": 4,
  "mealType": "snack"
}
```

#### GET /trpc/wellness.nutrition.getSummary
Get daily nutrition summary.

#### GET /trpc/wellness.activity.getLogs
Get activity logs.

#### POST /trpc/wellness.activity.log
Log physical activity.

**Request Body:**
```json
{
  "date": "2024-01-01",
  "type": "running",
  "duration": 30,
  "intensity": "medium",
  "calories": 300,
  "notes": "Morning jog in the park"
}
```

#### GET /trpc/wellness.activity.getSummary
Get activity summary for date range.

#### GET /trpc/wellness.sleep.getLogs
Get sleep logs.

#### POST /trpc/wellness.sleep.log
Log sleep data.

**Request Body:**
```json
{
  "date": "2024-01-01",
  "bedtime": "2024-01-01T22:30:00Z",
  "wakeTime": "2024-01-02T07:00:00Z",
  "duration": 510,
  "quality": "good",
  "notes": "Slept well, no interruptions"
}
```

#### GET /trpc/wellness.sleep.getTrends
Get sleep trends over specified period.

### Journal

#### GET /trpc/journal.entries.get
Get journal entries.

**Query Parameters:**
- `startDate`: Start date
- `endDate`: End date
- `tags`: Filter by tags
- `mood`: Filter by mood
- `limit`: Number of entries (default: 20)
- `offset`: Pagination offset (default: 0)

#### POST /trpc/journal.entries.create
Create new journal entry.

**Request Body:**
```json
{
  "date": "2024-01-01",
  "title": "Great Day",
  "content": "Had a wonderful day today...",
  "mood": "happy",
  "tags": ["gratitude", "exercise"]
}
```

#### PUT /trpc/journal.entries.update
Update existing journal entry.

#### DELETE /trpc/journal.entries.delete
Delete journal entry.

#### GET /trpc/journal.entries.getStats
Get journal statistics.

### Community Forum

#### GET /trpc/forum.categories.get
Get forum categories.

#### GET /trpc/forum.threads.get
Get forum threads.

**Query Parameters:**
- `categoryId`: Filter by category
- `category`: Filter by category type
- `tags`: Filter by tags
- `sortBy`: Sort order (recent, popular, replies)
- `limit`: Number of threads (default: 20)
- `offset`: Pagination offset (default: 0)

#### GET /trpc/forum.threads.getById
Get specific forum thread.

#### POST /trpc/forum.threads.create
Create new forum thread.

**Request Body:**
```json
{
  "categoryId": "uuid",
  "title": "Question about cycle tracking",
  "content": "I have a question about...",
  "tags": ["cycles", "tracking"]
}
```

#### PUT /trpc/forum.threads.update
Update forum thread.

#### DELETE /trpc/forum.threads.delete
Delete forum thread.

#### GET /trpc/forum.replies.get
Get thread replies.

#### POST /trpc/forum.replies.create
Create thread reply.

#### PUT /trpc/forum.replies.update
Update reply.

#### DELETE /trpc/forum.replies.delete
Delete reply.

### Birth Control

#### GET /trpc/birthControl.tracking.getRecords
Get birth control records.

#### POST /trpc/birthControl.tracking.createRecord
Create birth control record.

**Request Body:**
```json
{
  "type": "pill",
  "brand": "Brand Name",
  "startDate": "2024-01-01",
  "reminderTime": "09:00",
  "reminderDays": [1, 2, 3, 4, 5, 6, 7],
  "notes": "Take with food"
}
```

#### PUT /trpc/birthControl.tracking.updateRecord
Update birth control record.

#### DELETE /trpc/birthControl.tracking.deleteRecord
Delete birth control record.

#### GET /trpc/birthControl.tracking.getLogs
Get adherence logs.

#### POST /trpc/birthControl.tracking.logAdherence
Log birth control adherence.

**Request Body:**
```json
{
  "birthControlId": "uuid",
  "date": "2024-01-01",
  "taken": true,
  "takenAt": "2024-01-01T09:00:00Z",
  "notes": "Taken on time"
}
```

#### GET /trpc/birthControl.tracking.getAdherenceStats
Get adherence statistics.

### Pregnancy Tracking

#### GET /trpc/pregnancy.tracking.getPregnancies
Get pregnancy records.

#### POST /trpc/pregnancy.tracking.create
Create pregnancy record.

#### PUT /trpc/pregnancy.tracking.update
Update pregnancy record.

#### GET /trpc/pregnancy.tracking.getLogs
Get pregnancy logs.

#### POST /trpc/pregnancy.tracking.createLog
Create pregnancy log entry.

#### PUT /trpc/pregnancy.tracking.updateLog
Update pregnancy log.

#### GET /trpc/pregnancy.tracking.getPostpartumLogs
Get postpartum logs.

#### POST /trpc/pregnancy.tracking.createPostpartumLog
Create postpartum log entry.

### Menopause Tracking

#### GET /trpc/menopause.tracking.getLogs
Get menopause logs.

#### POST /trpc/menopause.tracking.log
Log menopause symptoms.

**Request Body:**
```json
{
  "date": "2024-01-01",
  "hotFlashes": 3,
  "nightSweats": true,
  "moodChanges": "anxious",
  "sleepQuality": "poor",
  "symptoms": ["hot_flashes", "mood_swings"],
  "notes": "Difficult day with symptoms"
}
```

#### PUT /trpc/menopause.tracking.update
Update menopause log.

#### DELETE /trpc/menopause.tracking.delete
Delete menopause log.

#### GET /trpc/menopause.tracking.getTrends
Get menopause symptom trends.

### AI Insights

#### POST /trpc/insights.ai.generate
Generate AI insights.

**Request Body:**
```json
{
  "type": "cycle",
  "timeframe": "month"
}
```

#### GET /trpc/insights.ai.getUserInsights
Get user's AI insights.

#### GET /trpc/insights.ai.getCycleInsights
Get cycle-specific insights.

#### GET /trpc/insights.ai.getHealthInsights
Get health insights.

#### GET /trpc/insights.ai.getRecommendations
Get personalized recommendations.

### Privacy & Data Management

#### GET /trpc/privacy.settings.getConsents
Get privacy consents.

#### POST /trpc/privacy.settings.updateConsent
Update privacy consent.

**Request Body:**
```json
{
  "consentType": "data_collection",
  "isGranted": true
}
```

#### POST /trpc/privacy.settings.requestDataExport
Request data export.

**Request Body:**
```json
{
  "format": "json"
}
```

#### GET /trpc/privacy.settings.getDataExportRequests
Get data export requests.

#### POST /trpc/privacy.settings.requestAccountDeletion
Request account deletion.

**Request Body:**
```json
{
  "reason": "No longer needed",
  "gracePeriodDays": 30
}
```

#### POST /trpc/privacy.settings.cancelAccountDeletion
Cancel account deletion request.

#### GET /trpc/privacy.settings.getAccountDeletionRequest
Get account deletion request status.

### Notifications

#### GET /trpc/notifications.settings.get
Get notification settings.

#### PUT /trpc/notifications.settings.update
Update notification setting.

#### POST /trpc/notifications.settings.create
Create notification setting.

#### DELETE /trpc/notifications.settings.delete
Delete notification setting.

### Dashboard

#### GET /trpc/dashboard.widgets.get
Get dashboard widgets.

#### PUT /trpc/dashboard.widgets.update
Update widget configuration.

#### POST /trpc/dashboard.widgets.create
Create new widget.

#### DELETE /trpc/dashboard.widgets.delete
Delete widget.

#### POST /trpc/dashboard.widgets.reorder
Reorder dashboard widgets.

### Achievements

#### GET /trpc/achievements.progress.get
Get user achievement progress.

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to access this resource"
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required or invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `BAD_REQUEST`: Invalid request data
- `CONFLICT`: Resource already exists
- `INTERNAL_SERVER_ERROR`: Server error
- `TOO_MANY_REQUESTS`: Rate limit exceeded

## Data Types

### Enums

**Gender:**
- `female`
- `male`
- `non_binary`
- `prefer_not_to_say`

**Flow Intensity:**
- `spotting`
- `light`
- `medium`
- `heavy`

**Intensity:**
- `low`
- `medium`
- `high`

**Mood:**
- `happy`
- `sad`
- `anxious`
- `angry`
- `neutral`
- `excited`
- `stressed`
- `calm`

**Cervical Mucus Type:**
- `dry`
- `sticky`
- `creamy`
- `watery`
- `egg_white`

**Birth Control Type:**
- `pill`
- `patch`
- `ring`
- `injection`
- `implant`
- `iud`
- `condom`
- `diaphragm`
- `natural`

**Activity Type:**
- `cardio`
- `strength`
- `yoga`
- `walking`
- `running`
- `cycling`
- `swimming`
- `other`

**Sleep Quality:**
- `poor`
- `fair`
- `good`
- `excellent`

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing using bcrypt with 12 salt rounds
- Rate limiting to prevent abuse
- Input validation using Zod schemas
- CORS protection
- SQL injection prevention through parameterized queries
- Audit logging for sensitive operations

## Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large result sets
- Efficient query patterns with Drizzle ORM
- Response caching where appropriate
- Connection pooling for database connections

## Data Privacy

- GDPR-compliant data handling
- User consent management
- Data export functionality
- Account deletion with grace period
- Encrypted storage for sensitive data (journal entries)
- Audit trails for data access and modifications