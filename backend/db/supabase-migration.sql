-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types/enums
CREATE TYPE gender AS ENUM ('female', 'male', 'non_binary', 'prefer_not_to_say');
CREATE TYPE symptom_type AS ENUM ('physical', 'emotional', 'behavioral');
CREATE TYPE intensity AS ENUM ('low', 'medium', 'high');
CREATE TYPE mood AS ENUM ('happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'stressed', 'calm');
CREATE TYPE flow_intensity AS ENUM ('spotting', 'light', 'medium', 'heavy');
CREATE TYPE cervical_mucus_type AS ENUM ('dry', 'sticky', 'creamy', 'watery', 'egg_white');
CREATE TYPE birth_control_type AS ENUM ('pill', 'patch', 'ring', 'injection', 'implant', 'iud', 'condom', 'diaphragm', 'natural');
CREATE TYPE activity_type AS ENUM ('cardio', 'strength', 'yoga', 'walking', 'running', 'cycling', 'swimming', 'other');
CREATE TYPE sleep_quality AS ENUM ('poor', 'fair', 'good', 'excellent');
CREATE TYPE achievement_type AS ENUM ('milestone', 'streak', 'exploration', 'consistency');
CREATE TYPE notification_type AS ENUM ('period_reminder', 'ovulation_reminder', 'birth_control_reminder', 'symptom_log_reminder', 'appointment_reminder');
CREATE TYPE privacy_consent_type AS ENUM ('data_collection', 'analytics', 'research', 'marketing', 'third_party_sharing');
CREATE TYPE forum_category AS ENUM ('general', 'periods', 'fertility', 'pregnancy', 'menopause', 'birth_control', 'wellness', 'support');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender gender,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_email_verified BOOLEAN DEFAULT FALSE,
    profile_picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, is_email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'lastName',
        NEW.email_confirmed_at IS NOT NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create cycles table
CREATE TABLE public.cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    cycle_length INTEGER,
    period_length INTEGER,
    predicted_next_period DATE,
    predicted_ovulation DATE,
    actual_ovulation DATE,
    notes TEXT,
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cycles" ON public.cycles
    FOR ALL USING (auth.uid() = user_id);

-- Create period_logs table
CREATE TABLE public.period_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    cycle_id UUID REFERENCES public.cycles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    flow_intensity flow_intensity,
    symptoms JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.period_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own period logs" ON public.period_logs
    FOR ALL USING (auth.uid() = user_id);

-- Create symptoms table
CREATE TABLE public.symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category symptom_type NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default symptoms
INSERT INTO public.symptoms (name, category, description) VALUES
('Cramps', 'physical', 'Menstrual cramps or abdominal pain'),
('Bloating', 'physical', 'Abdominal bloating or swelling'),
('Headache', 'physical', 'Head pain or tension'),
('Breast Tenderness', 'physical', 'Sore or tender breasts'),
('Fatigue', 'physical', 'Feeling tired or exhausted'),
('Mood Swings', 'emotional', 'Rapid changes in mood'),
('Irritability', 'emotional', 'Feeling easily annoyed or frustrated'),
('Anxiety', 'emotional', 'Feeling worried or anxious'),
('Depression', 'emotional', 'Feeling sad or down'),
('Food Cravings', 'behavioral', 'Craving specific foods');

-- Create symptom_logs table
CREATE TABLE public.symptom_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    symptom_id UUID REFERENCES public.symptoms(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    intensity intensity,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own symptom logs" ON public.symptom_logs
    FOR ALL USING (auth.uid() = user_id);

-- Create mood_logs table
CREATE TABLE public.mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    mood mood NOT NULL,
    intensity intensity,
    notes TEXT,
    triggers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own mood logs" ON public.mood_logs
    FOR ALL USING (auth.uid() = user_id);

-- Create water_intake_logs table
CREATE TABLE public.water_intake_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    amount INTEGER NOT NULL, -- in ml
    goal INTEGER, -- daily goal in ml
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.water_intake_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own water intake logs" ON public.water_intake_logs
    FOR ALL USING (auth.uid() = user_id);

-- Create user_settings table
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    temperature_unit VARCHAR(10) DEFAULT 'fahrenheit',
    weight_unit VARCHAR(10) DEFAULT 'lbs',
    cycle_length INTEGER DEFAULT 28,
    period_length INTEGER DEFAULT 5,
    luteal_phase_length INTEGER DEFAULT 14,
    daily_water_goal INTEGER DEFAULT 2000, -- in ml
    enable_notifications BOOLEAN DEFAULT TRUE,
    enable_data_sync BOOLEAN DEFAULT TRUE,
    enable_analytics BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON public.user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Create function to create default user settings
CREATE OR REPLACE FUNCTION public.create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for default user settings
CREATE TRIGGER on_user_created_settings
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_settings();

-- Create indexes for better performance
CREATE INDEX idx_cycles_user_id ON public.cycles(user_id);
CREATE INDEX idx_cycles_start_date ON public.cycles(start_date);
CREATE INDEX idx_period_logs_user_id ON public.period_logs(user_id);
CREATE INDEX idx_period_logs_date ON public.period_logs(date);
CREATE INDEX idx_symptom_logs_user_id ON public.symptom_logs(user_id);
CREATE INDEX idx_symptom_logs_date ON public.symptom_logs(date);
CREATE INDEX idx_mood_logs_user_id ON public.mood_logs(user_id);
CREATE INDEX idx_mood_logs_date ON public.mood_logs(date);
CREATE INDEX idx_water_intake_logs_user_id ON public.water_intake_logs(user_id);
CREATE INDEX idx_water_intake_logs_date ON public.water_intake_logs(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cycles_updated_at BEFORE UPDATE ON public.cycles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_period_logs_updated_at BEFORE UPDATE ON public.period_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_symptom_logs_updated_at BEFORE UPDATE ON public.symptom_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mood_logs_updated_at BEFORE UPDATE ON public.mood_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_water_intake_logs_updated_at BEFORE UPDATE ON public.water_intake_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();