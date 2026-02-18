import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, SignupRequest, AuthContextType, SocialProvider, Organization, OrganizationRegistrationRequest } from '../types/auth';
import { authService } from '../services/authService';
import { setAuthToken, clearAuthToken } from '../services/apiClient';
import { SocialAuthService } from '../services/socialAuthService';

const ____AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper functions for dashboard access logic
  const isIndividualUser = (user: User | null): boolean => {
    return user?.user_type === 'individual';
  };

  const isOrganizationUser = (user: User | null): boolean => {
    return user?.user_type === 'organization' && !!organization?.is_registered;
  };

  const getUserDashboardType = (user: User | null): 'individual' | 'organization' | null => {
    if (!user) return null;
    if (isIndividualUser(user)) return 'individual';
    if (isOrganizationUser(user)) return 'organization';
    return null;
  };

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      try {
        // Apply token to shared api client
        setAuthToken(token);
        // Verify the token with the backend (short timeout so offline backend doesn't block the UI)
        const userData = await Promise.race([
          authService.getCurrentUser(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Auth check timed out')), 3000)
          ),
        ]);
        setUser(userData as any);
        const ud = userData as any;
        if (ud.user_type === 'organization' && ud.organization) {
          setOrganization(ud.organization);
        }
      } catch (error) {
        console.warn('Auth init skipped (backend offline or token invalid):', error);
        localStorage.removeItem('authToken');
        clearAuthToken();
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

      // Ensure user has proper user_type (fallback for existing users)
      const userWithType = {
        ...response.user,
        user_type: response.user.user_type || (response.user.organization ? 'organization' : 'individual')
      };

      // Store token and set user
      localStorage.setItem('authToken', response.token);
      setAuthToken(response.token);
      setUser(userWithType);

      // Set organization if user is organization type
      if (userWithType.user_type === 'organization' && userWithType.organization) {
        setOrganization(userWithType.organization);
      }

      console.log('Login successful, user set:', userWithType);
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
      console.log('Attempting individual signup with:', userData);
      const response = await authService.signup(userData);
      console.log('Individual signup response:', response);

      // Ensure user is tagged as individual
      const individualUser = { ...response.user, user_type: 'individual' as const };

      // Store token and set user
      localStorage.setItem('authToken', response.token);
      setAuthToken(response.token);
      setUser(individualUser);
      console.log('Individual signup successful, user set:', individualUser);
    } catch (error) {
      console.error('Individual signup failed:', error);
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

      // Store organization user credentials separately
      const userCredentials = JSON.parse(localStorage.getItem('user_credentials') || '[]');
      
      // Check if user already exists
      const existingCredential = userCredentials.find((c: any) => c.email === userData.email);
      if (existingCredential) {
        throw new Error('User with this email already exists');
      }

      // Create organization
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

      // Create organization user
      const orgUser: User = {
        id: Date.now() + 1, // Ensure different ID from organization
        username: userData.username || userData.email.split('@')[0],
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        avatar: undefined,
        bio: '',
        github_url: '',
        linkedin_url: '',
        location: '',
        skills: [],
        is_active: true,
        date_joined: new Date().toISOString(),
        last_login: new Date().toISOString(),
        user_type: 'organization',
        organization: mockOrg,
      };

      // Store credentials separately
      userCredentials.push({
        id: orgUser.id,
        email: userData.email,
        password: userData.password,
        user_type: 'organization'
      });
      localStorage.setItem('user_credentials', JSON.stringify(userCredentials));

      // Store user data
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      registeredUsers.push(orgUser);
      localStorage.setItem('registered_users', JSON.stringify(registeredUsers));

      setOrganization(mockOrg);

      // Store token and set user
      const token = `mock-jwt-token-${orgUser.id}`;
      localStorage.setItem('authToken', token);
      setAuthToken(token);
      setUser(orgUser);

      console.log('Organization signup successful, user and org set:', { user: orgUser, org: mockOrg });
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
    isIndividualUser: isIndividualUser(user),
    isOrganizationUser: isOrganizationUser(user),
    userDashboardType: getUserDashboardType(user),
    login,
    signup,
    signupOrganization,
    socialLogin,
    registerOrganization,
    logout,
    refreshToken,
  };

  return (
    <____AuthContext.Provider value={value}>
      {children}
    </____AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(____AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
