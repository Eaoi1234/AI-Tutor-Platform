import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthUser, AuthState, LoginCredentials, RegisterData } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<AuthUser> }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Mock user data for demo when Supabase is not available
const mockUser: AuthUser = {
  id: '1',
  email: 'demo@example.com',
  username: 'demo',
  firstName: 'Demo',
  lastName: 'User',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  bio: 'Demo user for testing the application.',
  dateOfBirth: new Date('2000-05-15'),
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  joinDate: new Date('2024-01-15'),
  lastLogin: new Date(),
  isEmailVerified: true,
  preferences: {
    notifications: {
      email: true,
      push: true,
      assignments: true,
      grades: true,
      announcements: false,
    },
    theme: 'light',
    language: 'en',
  },
};

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(supabaseUrl && supabaseAnonKey);
  } catch {
    return false;
  }
};

// Check if credentials are demo credentials
const isDemoCredentials = (email: string, password: string) => {
  return email === 'demo@example.com' && password === 'password';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using mock authentication');
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    // Only try to initialize Supabase if it's configured
    const initializeAuth = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        
        // Get initial session
        dispatch({ type: 'SET_LOADING', payload: true });
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
            dispatch({ type: 'LOGOUT' });
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const loadUserProfile = async (user: any) => {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Failed to load user profile' });
        return;
      }

      // If no profile exists, the database trigger should create one automatically
      // We'll wait a moment and try again, or show a loading state
      if (!profile) {
        console.log('Profile not found, waiting for database trigger to create it...');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const authUser = convertToAuthUser(user, profile);
      dispatch({ type: 'LOGIN_SUCCESS', payload: authUser });
    } catch (error) {
      console.error('Error loading profile:', error);
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Failed to load user profile' });
    }
  };

  // Helper function to convert database profile to AuthUser
  const convertToAuthUser = (user: any, profile: any): AuthUser => {
    return {
      id: user.id,
      email: user.email!,
      username: profile.username,
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatar: profile.avatar_url,
      bio: profile.bio,
      dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
      phone: profile.phone,
      location: profile.location,
      joinDate: new Date(profile.created_at),
      lastLogin: new Date(),
      isEmailVerified: true, // Always true since we removed email confirmation
      preferences: profile.preferences,
    };
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Always check for demo credentials first, regardless of Supabase configuration
      if (isDemoCredentials(credentials.email, credentials.password)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const user = { ...mockUser, lastLogin: new Date() };
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        return;
      }

      // If Supabase is not configured, only allow demo credentials
      if (!isSupabaseConfigured()) {
        throw new Error('Invalid email or password. Try demo@example.com / password');
      }

      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        let errorMessage = error.message || 'Login failed';
        
        // Handle email confirmation error specifically
        if (error.message === 'Email not confirmed') {
          errorMessage = 'Your email address has not been confirmed yet. Please check your email for a confirmation link, or contact support if you need assistance. You can also try the demo account (demo@example.com / password).';
        } else if (error.message === 'Invalid login credentials') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again, or use the demo account (demo@example.com / password).';
        }
        
        dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
        return;
      }

      if (data.user) {
        await loadUserProfile(data.user);
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed - no user data received' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || 'An unexpected error occurred' });
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // If Supabase is not configured, use mock registration
      if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newUser: AuthUser = {
          ...mockUser,
          id: Date.now().toString(),
          email: data.email,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          joinDate: new Date(),
          lastLogin: new Date(),
        };
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
        return;
      }

      const { supabase } = await import('../lib/supabase');
      
      // Sign up without email confirmation
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation redirect
          data: {
            username: data.username,
            first_name: data.firstName,
            last_name: data.lastName,
          }
        }
      });

      if (error) {
        // Handle specific registration errors
        if (error.message.includes('email_not_confirmed') || error.message === 'Email not confirmed') {
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Registration successful! However, your Supabase project requires email confirmation. Please check your email for a confirmation link before logging in, or contact support to disable email confirmation. You can use the demo account (demo@example.com / password) in the meantime.' });
          return;
        }
        throw error;
      }

      // Check if user was created successfully
      if (authData.user) {
        // If we have a session, user is immediately signed in (email confirmation disabled)
        if (authData.session) {
          setTimeout(async () => {
            await loadUserProfile(authData.user!);
          }, 1000);
        } else {
          // Email confirmation is still enabled - inform user
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Registration successful! Please check your email for a confirmation link before logging in. You can also use the demo account (demo@example.com / password) to explore the app.' });
        }
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Registration failed - no user data received' });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || 'Registration failed' });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Logout initiated...');
      
      if (isSupabaseConfigured()) {
        const { supabase } = await import('../lib/supabase');
        console.log('Signing out from Supabase...');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Supabase logout error:', error);
          // Continue with logout even if Supabase fails
        }
      }
      
      console.log('Dispatching logout action...');
      dispatch({ type: 'LOGOUT' });
      console.log('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
      // Still dispatch logout even if there's an error
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>): Promise<void> => {
    if (!state.user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      if (!isSupabaseConfigured()) {
        // Mock update for demo
        await new Promise(resolve => setTimeout(resolve, 500));
        dispatch({ type: 'UPDATE_PROFILE', payload: updates });
        return;
      }

      const { supabase } = await import('../lib/supabase');
      
      const profileUpdates: any = {};
      
      if (updates.firstName) profileUpdates.first_name = updates.firstName;
      if (updates.lastName) profileUpdates.last_name = updates.lastName;
      if (updates.username) profileUpdates.username = updates.username;
      if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.location !== undefined) profileUpdates.location = updates.location;
      if (updates.dateOfBirth) profileUpdates.date_of_birth = updates.dateOfBirth.toISOString().split('T')[0];
      if (updates.avatar !== undefined) profileUpdates.avatar_url = updates.avatar;
      if (updates.preferences) profileUpdates.preferences = updates.preferences;

      const { error } = await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', state.user.id);

      if (error) {
        throw error;
      }

      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      // Mock reset for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    const { supabase } = await import('../lib/supabase');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        resetPassword,
      }}
    >
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