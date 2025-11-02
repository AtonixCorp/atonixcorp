import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, SignupRequest, AuthContextType, SocialProvider, Organization, OrganizationRegistrationRequest } from '../types/auth';
import { authService } from '../services/authService';
import { SocialAuthService } from '../services/socialAuthService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Verify the token with the backend
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('authToken');
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
    setUser(null);
  };

  const registerOrganization = async (orgData: OrganizationRegistrationRequest): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Registering organization:', orgData);
      // Mock organization registration for demo
      const mockOrg: Organization = {
        id: Date.now(),
        name: orgData.name,
        domain: orgData.domain,
        description: orgData.description,
        website: orgData.website,
        industry: orgData.industry,
        size: orgData.size,
        location: orgData.location,
        is_registered: true,
        registration_date: new Date().toISOString(),
        subscription_plan: 'enterprise',
        features_enabled: ['dashboard', 'analytics', 'security', 'compliance'],
      };

      setOrganization(mockOrg);

      // Update user with organization info
      if (user) {
        setUser({ ...user, organization: mockOrg });
      }

      console.log('Organization registered successfully:', mockOrg);
    } catch (error) {
      console.error('Organization registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signupOrganization = async (userData: SignupRequest, orgData: OrganizationRegistrationRequest): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Attempting organization signup with:', { userData, orgData });

      // First create the user account
      const signupResponse = await authService.signup(userData);
      console.log('User signup response:', signupResponse);

      // Store token and set user
      localStorage.setItem('authToken', signupResponse.token);
      setUser(signupResponse.user);

      // Then register the organization
      const mockOrg: Organization = {
        id: Date.now(),
        name: orgData.name,
        domain: orgData.domain,
        description: orgData.description,
        website: orgData.website,
        industry: orgData.industry,
        size: orgData.size,
        location: orgData.location,
        is_registered: true,
        registration_date: new Date().toISOString(),
        subscription_plan: 'enterprise',
        features_enabled: ['dashboard', 'analytics', 'security', 'compliance', 'enterprise-features'],
      };

      setOrganization(mockOrg);

      // Update user with organization info
      setUser({ ...signupResponse.user, organization: mockOrg });

      console.log('Organization signup successful, user and org set:', { user: signupResponse.user, org: mockOrg });
    } catch (error) {
      console.error('Organization signup failed:', error);
      // Clean up on failure
      localStorage.removeItem('authToken');
      setUser(null);
      setOrganization(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verify and refresh token with backend
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    organization,
    isAuthenticated: !!user,
    isOrganizationRegistered: !!organization?.is_registered,
    isLoading,
    login,
    signup,
    signupOrganization,
    socialLogin,
    registerOrganization,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
