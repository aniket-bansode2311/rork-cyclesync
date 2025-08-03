import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import createContextHook from "@nkzw/create-context-hook";

import { loginApi, signupApi } from "@/api/auth";
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

  // Check if user is authenticated on mount
  useEffect(() => {
    loadStoredAuth();
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
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser) as User;
        setState({
          user,
          token: storedToken,
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
      const response = await retryAuthOperation(() => loginApi(credentials));
      
      await saveAuthData(response.token, response.user);
      
      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });
      
      return true;
    } catch (error) {
      const apiError = handleAPIError(error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: apiError.message,
        isAuthenticated: false,
      }));
      
      return false;
    }
  };

  // Signup function
  const signup = async (credentials: SignupCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await retryAuthOperation(() => signupApi(credentials));
      
      await saveAuthData(response.token, response.user);
      
      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });
      
      return true;
    } catch (error) {
      const apiError = handleAPIError(error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: apiError.message,
        isAuthenticated: false,
      }));
      
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
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