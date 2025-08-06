# Supabase Integration Setup Guide

## 1. Supabase Project Setup

### Create a new Supabase project:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### Site URL and Redirect URLs:
- **Site URL**: `https://rork.com/`
- **Redirect URLs**: 
  - `https://rork.com/`
  - `exp://192.168.1.100:8081` (for local development - replace with your IP)
  - `cylesync://` (for mobile app deep linking)

## 2. Environment Variables

Update your `.env` file with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your-jwt-secret-here
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# Environment
NODE_ENV=development
```

## 3. Database Migration

Run the migration script in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `backend/db/supabase-migration.sql`
4. Run the migration

## 4. Authentication Setup

### Enable Email Authentication:
1. Go to Authentication > Settings in your Supabase dashboard
2. Enable Email authentication
3. Configure email templates if needed

### Configure Auth Settings:
- **Site URL**: `https://rork.com/`
- **Redirect URLs**: Add the URLs mentioned above
- **JWT expiry**: 3600 seconds (1 hour)
- **Refresh token expiry**: 604800 seconds (7 days)

## 5. Row Level Security (RLS)

The migration script automatically sets up RLS policies for:
- Users can only access their own data
- Automatic user creation when signing up through Supabase Auth
- Default user settings creation

## 6. API Integration

The app is now configured to:
- Use Supabase Auth for authentication
- Automatically sync users between Supabase Auth and your database
- Include Supabase JWT tokens in tRPC requests
- Handle both Supabase and legacy JWT tokens

## 7. Testing

1. Start your development server
2. Try signing up with a new email
3. Check that the user is created in both Supabase Auth and your users table
4. Test login/logout functionality
5. Verify that protected routes work correctly

## 8. Production Deployment

When deploying to production:
1. Update the Site URL to your production domain
2. Add production redirect URLs
3. Update environment variables with production values
4. Enable email confirmations if desired
5. Configure custom SMTP settings for emails

## Features Integrated:

✅ **Authentication**: Supabase Auth with email/password
✅ **Database**: PostgreSQL with Row Level Security
✅ **User Management**: Automatic user sync between Supabase and app database
✅ **API Security**: JWT token validation for tRPC routes
✅ **Data Protection**: RLS policies ensure users only access their own data
✅ **Real-time**: Ready for Supabase real-time subscriptions
✅ **Mobile Support**: Deep linking and mobile auth flow

## Next Steps:

1. Add social authentication (Google, Apple, etc.)
2. Implement real-time subscriptions for live data updates
3. Add email templates customization
4. Set up webhook handlers for auth events
5. Configure backup and monitoring