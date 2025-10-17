import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, SignupRequest, AuthContextType, SocialProvider } from '../types/auth';
import { authService } from '../services/authService';
import { setAuthToken, clearAuthToken } from '../services/apiClient';
import { SocialAuthService } from '../services/socialAuthService';

const _AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Apply token to shared api client
          setAuthToken(token);
          // Verify the token with the backend
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('authToken');
        clearAuthToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', credentials);
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      // Store token
  localStorage.setItem('authToken', response.token);
  setAuthToken(response.token);
      
      setUser(response.user);
      console.log('Login successful, user set:', response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupRequest): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Attempting signup with:', userData);
      const response = await authService.signup(userData);
      console.log('Signup response:', response);
      
      // Automatically log in after successful signup
  localStorage.setItem('authToken', response.token);
  setAuthToken(response.token);
      
      setUser(response.user);
      console.log('Signup successful, user set:', response.user);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: SocialProvider): Promise<void> => {
    try {
      // Check if this is a callback from OAuth provider
      if (SocialAuthService.isOAuthCallback()) {
        setIsLoading(true);
        const response = await SocialAuthService.handleCallback();
        
  // Store token
  localStorage.setItem('authToken', response.token);
  setAuthToken(response.token);
  setUser(response.user);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // Initiate OAuth flow
        SocialAuthService.initiateLogin(provider);
      }
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('authToken');
    clearAuthToken();
    setUser(null);
  };

  const refreshToken = async (): Promise<void> => {
    try {
      // In a real app, implement token refresh logic
      console.log('Token refresh would happen here');
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    socialLogin,
    logout,
    refreshToken,
  };

  return (
    <_AuthContext.Provider value={value}>
      {children}
    </_AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(_AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};