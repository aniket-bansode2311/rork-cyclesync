import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { User as SupabaseUser } from '@supabase/supabase-js';

import { supabase } from "@/lib/supabase";
import { AuthState, LoginCredentials, SignupCredentials, User } from "@/types/auth";
import { handleAPIError, isRetryableError, getRetryDelay } from "@/utils/errorHandler";
import React from "react";

// Storage keys
const TOKEN_KEY = "cyclesync_auth_token";
const USER_KEY = "cyclesync_user";

// Create auth context
export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  const router = useRouter();
  const segments = useSegments();

  // Check if user is authenticated on mount and listen to auth changes
  useEffect(() => {
    loadStoredAuth();
    
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.firstName || '',
            lastName: session.user.user_metadata?.lastName || '',
            isEmailVerified: session.user.email_confirmed_at !== null,
            createdAt: session.user.created_at,
          };
          
          await saveAuthData(session.access_token, user);
          
          setState({
            user,
            token: session.access_token,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          });
        } else {
          await clearAuthData();
          setState({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
          });
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    
    if (state.isLoading) {
      // Still loading, don't redirect yet
      return;
    }
    
    if (!state.isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      router.replace("/(auth)/login");
    } else if (state.isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth group
      router.replace("/(app)");
    }
  }, [state.isAuthenticated, segments, state.isLoading]);

  // Load stored authentication data
  const loadStoredAuth = async () => {
    try {
      // Check if there's an active Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.firstName || '',
          lastName: session.user.user_metadata?.lastName || '',
          isEmailVerified: session.user.email_confirmed_at !== null,
          createdAt: session.user.created_at,
        };
        
        await saveAuthData(session.access_token, user);
        
        setState({
          user,
          token: session.access_token,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Failed to load auth data:", error);
      setState(prev => ({ ...prev, isLoading: false, error: "Failed to restore session" }));
    }
  };

  // Save authentication data to storage
  const saveAuthData = async (token: string, user: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  };

  // Clear authentication data from storage
  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  };

  // Retry logic for auth operations
  const retryAuthOperation = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = handleAPIError(error);
        
        if (attempt < maxRetries && isRetryableError(lastError)) {
          const delay = getRetryDelay(attempt, lastError);
          console.log(`Auth operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw lastError;
      }
    }
    
    throw lastError;
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user && data.session) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: data.user.user_metadata?.firstName || '',
          lastName: data.user.user_metadata?.lastName || '',
          isEmailVerified: data.user.email_confirmed_at !== null,
          createdAt: data.user.created_at,
        };
        
        await saveAuthData(data.session.access_token, user);
        
        setState({
          user,
          token: data.session.access_token,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Login failed',
        isAuthenticated: false,
      }));
      
      return false;
    }
  };

  // Signup function
  const signup = async (credentials: SignupCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            firstName: credentials.firstName,
            lastName: credentials.lastName,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // For signup, user might need email confirmation
        if (data.session) {
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            isEmailVerified: data.user.email_confirmed_at !== null,
            createdAt: data.user.created_at,
          };
          
          await saveAuthData(data.session.access_token, user);
          
          setState({
            user,
            token: data.session.access_token,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          });
        } else {
          // Email confirmation required
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Please check your email to confirm your account',
            isAuthenticated: false,
          }));
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Signup error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Signup failed',
        isAuthenticated: false,
      }));
      
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    await clearAuthData();
    
    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
    });
    
    router.replace("/(auth)/login");
  };

  // Clear error
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };
});

// Custom hook for protected routes
export function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, segments]);
}