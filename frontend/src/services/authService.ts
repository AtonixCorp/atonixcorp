import axios from 'axios';
import {
  User,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  CommunityMember,
  Discussion
} from '../types/auth';

// Create axios instance for auth
const ____authApi = axios.create({
  baseURL: '/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
____authApi.interceptors.request.use((config) => {
  console.log('Auth API request:', config.method?.toUpperCase(), config.url, config.data);
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Add response interceptor for debugging
____authApi.interceptors.response.use(
  (response) => {
    console.log('Auth API response success:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Auth API response error:', error.response?.status, error.response?.data, error.message);
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('AuthService login called with:', credentials);
    
    // Mock authentication for demo
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      const mockUser: User = {
        id: 1,
        username: 'johndoe',
        email: 'demo@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: '/avatars/john.jpg',
        bio: 'Full-stack developer with expertise in React and Python.',
        github_url: 'https://github.com/johndoe',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        location: 'New York, NY',
        skills: ['React', 'Python', 'Django', 'TypeScript'],
        is_active: true,
        is_admin: true,
        role: 'admin',
        date_joined: '2024-01-15T10:30:00Z',
        last_login: '2024-03-20T14:45:00Z',
        user_type: 'individual',
      };
      
      const mockResponse: LoginResponse = {
        message: 'Login successful',
        token: 'mock-jwt-token',
        user: mockUser,
      };
      
      console.log('Mock login successful:', mockResponse);
      return mockResponse;
    }
    
    // Check for registered users in localStorage
    const userCredentials = JSON.parse(localStorage.getItem('user_credentials') || '[]');
    const credential = userCredentials.find((c: any) => c.email === credentials.email && c.password === credentials.password);
    
    if (credential) {
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const user = registeredUsers.find((u: any) => u.id === credential.id);
      
      if (user) {
        // Update last login
        user.last_login = new Date().toISOString();
        localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
        
        const loginResponse: LoginResponse = {
          message: 'Login successful',
          token: `mock-jwt-token-${user.id}`,
          user: user,
        };
        
        console.log('Registered user login successful:', loginResponse);
        return loginResponse;
      }
    }
    
    // For other credentials, try real API (will fail gracefully)
    try {
      const response = await ____authApi.post<any>('/login/', credentials);
      console.log('AuthService login response:', response.data);

      // Normalize backend user payload to frontend User shape
      const backendUser = response.data.user;
      const normalizedUser: any = {
        id: backendUser.id,
        uuid: backendUser.uuid,
        username: backendUser.username,
        email: backendUser.email,
        first_name: backendUser.first_name,
        last_name: backendUser.last_name,
        avatar: backendUser.avatar,
        bio: backendUser.bio,
        github_url: backendUser.github_url,
        linkedin_url: backendUser.linkedin_url,
        website_url: backendUser.website_url,
        location: backendUser.location,
        skills: backendUser.skills || [],
        is_active: backendUser.is_active,
        // Map admin flags
        is_admin: !!backendUser.is_staff || !!backendUser.is_superuser,
        role: backendUser.is_superuser ? 'admin' : (backendUser.is_staff ? 'staff' : undefined),
        date_joined: backendUser.date_joined,
        last_login: backendUser.last_login,
        user_type: backendUser.user_type || 'individual',
      };

      const loginResp: LoginResponse = {
        message: response.data.message || 'Login successful',
        token: response.data.token,
        user: normalizedUser,
      };

      return loginResp;
    } catch (error) {
      console.error('AuthService login error:', error);
      throw new Error('Invalid credentials. Please check your email and password, or use demo@example.com / password for demo.');
    }
  },

  signup: async (userData: SignupRequest): Promise<SignupResponse> => {
    console.log('AuthService signup called with:', userData);
    
    // Store user credentials separately for authentication
    const userCredentials = JSON.parse(localStorage.getItem('user_credentials') || '[]');
    
    // Check if user already exists
    const existingCredential = userCredentials.find((c: any) => c.email === userData.email);
    if (existingCredential) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: Date.now(), // Generate a unique ID
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
      user_type: 'individual',
    };
    
    // Store credentials separately
    userCredentials.push({
      id: newUser.id,
      email: userData.email,
      password: userData.password,
      user_type: 'individual'
    });
    localStorage.setItem('user_credentials', JSON.stringify(userCredentials));
    
    // Store user data
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    registeredUsers.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(registeredUsers));
    
    const mockResponse: SignupResponse = {
      message: 'Account created successfully',
      token: `mock-jwt-token-${newUser.id}`,
      user: newUser,
    };
    
    console.log('Individual signup successful:', mockResponse);
    return mockResponse;
    
    // For real API (commented out for now)
    // try {
    //   const response = await authApi.post<SignupResponse>('/signup/', userData);
    //   console.log('AuthService signup response:', response.data);
    //   return response.data;
    // } catch (error) {
    //   console.error('AuthService signup error:', error);
    //   throw error;
    // }
  },

  logout: async (): Promise<void> => {
    await ____authApi.post('/logout/');
  },

  getCurrentUser: async (): Promise<User> => {
    const token = localStorage.getItem('authToken');
    
    // Handle mock authentication
    if (token === 'mock-jwt-token') {
      return {
        id: 1,
        username: 'johndoe',
        email: 'demo@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: '/avatars/john.jpg',
        bio: 'Full-stack developer with expertise in React and Python.',
        github_url: 'https://github.com/johndoe',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        location: 'New York, NY',
        skills: ['React', 'Python', 'Django', 'TypeScript'],
        is_active: true,
        is_admin: true,
        role: 'admin',
        date_joined: '2024-01-15T10:30:00Z',
        last_login: '2024-03-20T14:45:00Z',
        user_type: 'individual',
      };
    }
    
    // Check for registered users
    if (token && token.startsWith('mock-jwt-token-')) {
      const userId = parseInt(token.replace('mock-jwt-token-', ''));
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const user = registeredUsers.find((u: any) => u.id === userId);
      if (user) {
        return user;
      }
    }
    
    // Try real API
    const response = await ____authApi.get<any>('/me/');
    const backendUser = response.data.user;
    return {
      id: backendUser.id,
      uuid: backendUser.uuid,
      username: backendUser.username,
      email: backendUser.email,
      first_name: backendUser.first_name,
      last_name: backendUser.last_name,
      avatar: backendUser.avatar,
      bio: backendUser.bio,
      github_url: backendUser.github_url,
      linkedin_url: backendUser.linkedin_url,
      website_url: backendUser.website_url,
      location: backendUser.location,
      skills: backendUser.skills || [],
      is_active: backendUser.is_active,
      is_admin: !!backendUser.is_staff || !!backendUser.is_superuser,
      role: backendUser.is_superuser ? 'admin' : (backendUser.is_staff ? 'staff' : undefined),
      date_joined: backendUser.date_joined,
      last_login: backendUser.last_login,
      user_type: backendUser.user_type || 'individual',
    } as User;
  },
};

// Mock Community Services (for features not yet implemented in backend)
export const mockCommunityService = {
  getMembers: async (): Promise<CommunityMember[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 1,
        user: {
          id: 1,
          username: 'johndoe',
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
          avatar: '/avatars/john.jpg',
          bio: 'Full-stack developer with expertise in React and Python.',
          github_url: 'https://github.com/johndoe',
          linkedin_url: 'https://linkedin.com/in/johndoe',
          location: 'New York, NY',
          skills: ['React', 'Python', 'Django', 'TypeScript'],
          is_active: true,
          date_joined: '2024-01-15T10:30:00Z',
          last_login: '2024-03-20T14:45:00Z',
          user_type: 'individual',
        },
        role: 'maintainer',
        contributions: 156,
        reputation: 2847,
        badges: ['Contributor', 'Code Reviewer', 'Community Helper'],
        joined_date: '2024-01-15T10:30:00Z',
        last_active: '2024-03-20T14:45:00Z',
      },
      {
        id: 2,
        user: {
          id: 2,
          username: 'sarahchen',
          email: 'sarah@example.com',
          first_name: 'Sarah',
          last_name: 'Chen',
          avatar: '/avatars/sarah.jpg',
          bio: 'DevOps engineer passionate about cloud infrastructure.',
          github_url: 'https://github.com/sarahchen',
          skills: ['Docker', 'Kubernetes', 'AWS', 'Python'],
          is_active: true,
          date_joined: '2024-02-01T09:15:00Z',
          last_login: '2024-03-19T16:20:00Z',
          user_type: 'individual',
        },
        role: 'contributor',
        contributions: 89,
        reputation: 1523,
        badges: ['Contributor', 'DevOps Expert'],
        joined_date: '2024-02-01T09:15:00Z',
        last_active: '2024-03-19T16:20:00Z',
      },
      {
        id: 3,
        user: {
          id: 3,
          username: 'mikewilson',
          email: 'mike@example.com',
          first_name: 'Mike',
          last_name: 'Wilson',
          avatar: '/avatars/mike.jpg',
          bio: 'Frontend specialist with a focus on user experience.',
          github_url: 'https://github.com/mikewilson',
          linkedin_url: 'https://linkedin.com/in/mikewilson',
          skills: ['React', 'TypeScript', 'CSS', 'UX Design'],
          is_active: true,
          date_joined: '2024-01-20T14:20:00Z',
          last_login: '2024-03-18T11:30:00Z',
          user_type: 'individual',
        },
        role: 'member',
        contributions: 42,
        reputation: 756,
        badges: ['Contributor'],
        joined_date: '2024-01-20T14:20:00Z',
        last_active: '2024-03-18T11:30:00Z',
      },
    ];
  },

  getDiscussions: async (): Promise<Discussion[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 1,
        title: 'Best practices for microservices architecture',
        content: 'I\'m working on a new project that requires a microservices architecture. What are some best practices you would recommend for designing and implementing microservices?',
        author: {
          id: 1,
          username: 'johndoe',
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
          skills: [],
          is_active: true,
          date_joined: '2024-01-15T10:30:00Z',
          user_type: 'individual',
        },
        category: 'general',
        tags: ['microservices', 'architecture', 'best-practices'],
        likes: 15,
        replies: 8,
        is_pinned: false,
        is_locked: false,
        created_at: '2024-03-15T10:30:00Z',
        updated_at: '2024-03-18T14:20:00Z',
      },
      {
        id: 2,
        title: 'Help with Docker containerization',
        content: 'I\'m having trouble containerizing my Django application. The container builds successfully but crashes when I try to run it. Here\'s my Dockerfile...',
        author: {
          id: 3,
          username: 'mikewilson',
          email: 'mike@example.com',
          first_name: 'Mike',
          last_name: 'Wilson',
          skills: [],
          is_active: true,
          date_joined: '2024-01-20T14:20:00Z',
          user_type: 'individual',
        },
        category: 'help',
        tags: ['docker', 'django', 'containerization'],
        likes: 7,
        replies: 12,
        is_pinned: false,
        is_locked: false,
        created_at: '2024-03-14T09:15:00Z',
        updated_at: '2024-03-17T16:45:00Z',
      },
      {
        id: 3,
        title: 'Showcase: AI-powered analytics dashboard',
        content: 'I\'ve been working on an analytics dashboard that uses machine learning to provide predictive insights. Here\'s a demo and the source code...',
        author: {
          id: 2,
          username: 'sarahchen',
          email: 'sarah@example.com',
          first_name: 'Sarah',
          last_name: 'Chen',
          skills: [],
          is_active: true,
          date_joined: '2024-02-01T09:15:00Z',
          user_type: 'individual',
        },
        category: 'showcase',
        tags: ['ai', 'machine-learning', 'dashboard', 'analytics'],
        likes: 23,
        replies: 6,
        is_pinned: true,
        is_locked: false,
        created_at: '2024-03-12T15:20:00Z',
        updated_at: '2024-03-16T10:30:00Z',
      },
    ];
  },
};

export default authService;