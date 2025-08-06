export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          first_name: string | null
          last_name: string | null
          date_of_birth: string | null
          gender: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say' | null
          timezone: string | null
          is_email_verified: boolean | null
          profile_picture: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
          is_active: boolean | null
          deleted_at: string | null
        }
        Insert: {
          id: string
          email: string
          password_hash?: string
          first_name?: string | null
          last_name?: string | null
          date_of_birth?: string | null
          gender?: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say' | null
          timezone?: string | null
          is_email_verified?: boolean | null
          profile_picture?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          first_name?: string | null
          last_name?: string | null
          date_of_birth?: string | null
          gender?: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say' | null
          timezone?: string | null
          is_email_verified?: boolean | null
          profile_picture?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean | null
          deleted_at?: string | null
        }
      }
      cycles: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string | null
          cycle_length: number | null
          period_length: number | null
          predicted_next_period: string | null
          predicted_ovulation: string | null
          actual_ovulation: string | null
          notes: string | null
          is_complete: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date?: string | null
          cycle_length?: number | null
          period_length?: number | null
          predicted_next_period?: string | null
          predicted_ovulation?: string | null
          actual_ovulation?: string | null
          notes?: string | null
          is_complete?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string | null
          cycle_length?: number | null
          period_length?: number | null
          predicted_next_period?: string | null
          predicted_ovulation?: string | null
          actual_ovulation?: string | null
          notes?: string | null
          is_complete?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      period_logs: {
        Row: {
          id: string
          user_id: string
          cycle_id: string | null
          date: string
          flow_intensity: 'spotting' | 'light' | 'medium' | 'heavy' | null
          symptoms: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cycle_id?: string | null
          date: string
          flow_intensity?: 'spotting' | 'light' | 'medium' | 'heavy' | null
          symptoms?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cycle_id?: string | null
          date?: string
          flow_intensity?: 'spotting' | 'light' | 'medium' | 'heavy' | null
          symptoms?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      symptoms: {
        Row: {
          id: string
          name: string
          category: 'physical' | 'emotional' | 'behavioral'
          description: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'physical' | 'emotional' | 'behavioral'
          description?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'physical' | 'emotional' | 'behavioral'
          description?: string | null
          is_active?: boolean | null
          created_at?: string
        }
      }
      symptom_logs: {
        Row: {
          id: string
          user_id: string
          symptom_id: string
          date: string
          intensity: 'low' | 'medium' | 'high' | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symptom_id: string
          date: string
          intensity?: 'low' | 'medium' | 'high' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symptom_id?: string
          date?: string
          intensity?: 'low' | 'medium' | 'high' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mood_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          mood: 'happy' | 'sad' | 'anxious' | 'angry' | 'neutral' | 'excited' | 'stressed' | 'calm'
          intensity: 'low' | 'medium' | 'high' | null
          notes: string | null
          triggers: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          mood: 'happy' | 'sad' | 'anxious' | 'angry' | 'neutral' | 'excited' | 'stressed' | 'calm'
          intensity?: 'low' | 'medium' | 'high' | null
          notes?: string | null
          triggers?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          mood?: 'happy' | 'sad' | 'anxious' | 'angry' | 'neutral' | 'excited' | 'stressed' | 'calm'
          intensity?: 'low' | 'medium' | 'high' | null
          notes?: string | null
          triggers?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      water_intake_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          amount: number
          goal: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          amount: number
          goal?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          amount?: number
          goal?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: string | null
          language: string | null
          timezone: string | null
          date_format: string | null
          temperature_unit: string | null
          weight_unit: string | null
          cycle_length: number | null
          period_length: number | null
          luteal_phase_length: number | null
          daily_water_goal: number | null
          enable_notifications: boolean | null
          enable_data_sync: boolean | null
          enable_analytics: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string | null
          language?: string | null
          timezone?: string | null
          date_format?: string | null
          temperature_unit?: string | null
          weight_unit?: string | null
          cycle_length?: number | null
          period_length?: number | null
          luteal_phase_length?: number | null
          daily_water_goal?: number | null
          enable_notifications?: boolean | null
          enable_data_sync?: boolean | null
          enable_analytics?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string | null
          language?: string | null
          timezone?: string | null
          date_format?: string | null
          temperature_unit?: string | null
          weight_unit?: string | null
          cycle_length?: number | null
          period_length?: number | null
          luteal_phase_length?: number | null
          daily_water_goal?: number | null
          enable_notifications?: boolean | null
          enable_data_sync?: boolean | null
          enable_analytics?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type: 'cardio' | 'strength' | 'yoga' | 'walking' | 'running' | 'cycling' | 'swimming' | 'other'
      achievement_type: 'milestone' | 'streak' | 'exploration' | 'consistency'
      birth_control_type: 'pill' | 'patch' | 'ring' | 'injection' | 'implant' | 'iud' | 'condom' | 'diaphragm' | 'natural'
      cervical_mucus_type: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white'
      flow_intensity: 'spotting' | 'light' | 'medium' | 'heavy'
      forum_category: 'general' | 'periods' | 'fertility' | 'pregnancy' | 'menopause' | 'birth_control' | 'wellness' | 'support'
      gender: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say'
      intensity: 'low' | 'medium' | 'high'
      mood: 'happy' | 'sad' | 'anxious' | 'angry' | 'neutral' | 'excited' | 'stressed' | 'calm'
      notification_type: 'period_reminder' | 'ovulation_reminder' | 'birth_control_reminder' | 'symptom_log_reminder' | 'appointment_reminder'
      privacy_consent_type: 'data_collection' | 'analytics' | 'research' | 'marketing' | 'third_party_sharing'
      sleep_quality: 'poor' | 'fair' | 'good' | 'excellent'
      symptom_type: 'physical' | 'emotional' | 'behavioral'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}