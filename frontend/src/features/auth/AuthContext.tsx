import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  getProfile,
  refreshToken as refreshTokenApi,
  type UserProfile,
} from '../../services/authApi';
import { ApiError } from '../../services/apiClient';

const TOKEN_KEY = 'globestay_token';
const REFRESH_TOKEN_KEY = 'globestay_refresh_token';

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const refreshAuth = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) throw new Error('No refresh token available');
    const tokens = await refreshTokenApi(storedRefreshToken);
    storeTokens(tokens.access_token, tokens.refresh_token);
    const profile = await getProfile();
    setUser(profile);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginUser({ email, password });
    storeTokens(tokens.access_token, tokens.refresh_token);
    const profile = await getProfile();
    setUser(profile);
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const tokens = await registerUser({ full_name: fullName, email, password });
    storeTokens(tokens.access_token, tokens.refresh_token);
    const profile = await getProfile();
    setUser(profile);
  }, []);

  // On mount: restore session from stored token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 401) {
            // Try refresh
            try {
              await refreshAuth();
            } catch {
              clearTokens();
              setUser(null);
            }
          } else if (error.status === 0) {
            // Backend offline — keep the token, don't clear session
            // The user will see an error when they try to do something
            console.warn('Backend unreachable during init. Session preserved.');
          } else {
            clearTokens();
            setUser(null);
          }
        } else {
          clearTokens();
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshAuth]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
