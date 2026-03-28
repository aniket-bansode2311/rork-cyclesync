import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];

// Generic CRUD operations for Supabase tables
export class SupabaseService {
  // Get current user data
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Generic select with RLS
  static async select<T extends keyof Tables>(
    table: T,
    options?: {
      select?: string;
      eq?: { column: string; value: any };
      order?: { column: string; ascending?: boolean };
      limit?: number;
    }
  ) {
    let query = supabase.from(table).select(options?.select || '*');
    
    if (options?.eq) {
      query = query.eq(options.eq.column, options.eq.value);
    }
    
    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Generic insert with RLS
  static async insert<T extends keyof Tables>(
    table: T,
    data: Tables[T]['Insert']
  ) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  // Generic update with RLS
  static async update<T extends keyof Tables>(
    table: T,
    id: string,
    data: Tables[T]['Update']
  ) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  // Generic delete with RLS
  static async delete<T extends keyof Tables>(
    table: T,
    id: string
  ) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // User-specific operations
  static async getUserCycles(userId?: string) {
    const user = userId || (await this.getCurrentUser())?.id;
    if (!user) throw new Error('User not authenticated');

    return this.select('cycles', {
      eq: { column: 'user_id', value: user },
      order: { column: 'start_date', ascending: false }
    });
  }

  static async getUserPeriodLogs(userId?: string, limit?: number) {
    const user = userId || (await this.getCurrentUser())?.id;
    if (!user) throw new Error('User not authenticated');

    return this.select('period_logs', {
      eq: { column: 'user_id', value: user },
      order: { column: 'date', ascending: false },
      limit
    });
  }

  static async getUserSymptomLogs(userId?: string, limit?: number) {
    const user = userId || (await this.getCurrentUser())?.id;
    if (!user) throw new Error('User not authenticated');

    return this.select('symptom_logs', {
      eq: { column: 'user_id', value: user },
      order: { column: 'date', ascending: false },
      limit
    });
  }

  static async getUserMoodLogs(userId?: string, limit?: number) {
    const user = userId || (await this.getCurrentUser())?.id;
    if (!user) throw new Error('User not authenticated');

    return this.select('mood_logs', {
      eq: { column: 'user_id', value: user },
      order: { column: 'date', ascending: false },
      limit
    });
  }

  static async getUserWaterIntake(userId?: string, date?: string) {
    const user = userId || (await this.getCurrentUser())?.id;
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('water_intake_logs')
      .select('*')
      .eq('user_id', user);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async getUserSettings(userId?: string) {
    const user = userId || (await this.getCurrentUser())?.id;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }

    return data;
  }

  // Real-time subscriptions
  static subscribeToUserData<T extends keyof Tables>(
    table: T,
    userId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`${table}_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table as string,
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  // Batch operations
  static async batchInsert<T extends keyof Tables>(
    table: T,
    data: Tables[T]['Insert'][]
  ) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  }

  // Analytics and aggregations
  static async getUserStats(userId?: string) {
    const user = userId || (await this.getCurrentUser())?.id;
    if (!user) throw new Error('User not authenticated');

    // Get cycle statistics
    const { data: cycles } = await supabase
      .from('cycles')
      .select('cycle_length, period_length')
      .eq('user_id', user)
      .not('cycle_length', 'is', null);

    // Get recent symptoms
    const { data: symptoms } = await supabase
      .from('symptom_logs')
      .select('symptom_id, intensity, date')
      .eq('user_id', user)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    // Get mood trends
    const { data: moods } = await supabase
      .from('mood_logs')
      .select('mood, intensity, date')
      .eq('user_id', user)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    return {
      cycles: cycles || [],
      symptoms: symptoms || [],
      moods: moods || []
    };
  }
}

export default SupabaseService;