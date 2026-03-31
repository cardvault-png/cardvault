import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginResponse } from '../services/auth';

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  username: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  twoFactorEnabled: boolean;
  termsAccepted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ userId: string; requiresVerification: boolean; identifier: string }>;
  logout: () => Promise<void>;
  verifyOtp: (identifier: string, code: string, type: string) => Promise<void>;
  resendOtp: (identifier: string, type: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  username: string;
  referralCode?: string;
  termsAccepted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const TOKEN_KEY = 'gcp_token';
const REFRESH_TOKEN_KEY = 'gcp_refresh_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[AuthContext] Checking authentication...');
      
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        
        if (!token) {
          console.log('[AuthContext] No token found');
          setIsLoading(false);
          return;
        }

        console.log('[AuthContext] Token found, fetching user...');
        const userData = await authService.getCurrentUser();
        
        if (userData) {
          console.log('[AuthContext] User authenticated:', userData.email);
          setUser(userData);
        }
      } catch (err: any) {
        console.error('[AuthContext] Auth check failed:', err);
        // Clear invalid tokens
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string, twoFactorCode?: string) => {
    console.log('[AuthContext] Login called');
    setError(null);
    
    try {
      const response = await authService.login(email, password, twoFactorCode);
      
      // Handle 2FA required
      if (response.requiresTwoFactor) {
        console.log('[AuthContext] 2FA required');
        throw new Error('2FA_REQUIRED');
      }
      
      // Store tokens
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      
      // Set user
      setUser(response.user as User);
      
      console.log('[AuthContext] Login successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err);
      
      // Handle specific error types
      if (err.message === '2FA_REQUIRED') {
        throw err; // Re-throw for component to handle
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    }
  }, [navigate]);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    console.log('[AuthContext] Register called');
    setError(null);
    
    try {
      const response = await authService.register(data);
      
      console.log('[AuthContext] Registration successful');
      
      return {
        userId: response.data?.userId,
        requiresVerification: response.data?.requiresVerification,
        identifier: response.data?.identifier,
      };
    } catch (err: any) {
      console.error('[AuthContext] Registration error:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    console.log('[AuthContext] Logout called');
    
    try {
      await authService.logout();
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    } finally {
      // Always clear local state
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      navigate('/login');
    }
  }, [navigate]);

  // Verify OTP
  const verifyOtp = useCallback(async (identifier: string, code: string, type: string) => {
    console.log('[AuthContext] Verify OTP called');
    setError(null);
    
    try {
      const response = await authService.verifyOtp(identifier, code, type);
      
      // Store tokens
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      
      // Set user
      setUser(response.user as User);
      
      console.log('[AuthContext] OTP verification successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[AuthContext] OTP verification error:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Verification failed. Please try again.';
      setError(errorMessage);
      throw err;
    }
  }, [navigate]);

  // Resend OTP
  const resendOtp = useCallback(async (identifier: string, type: string) => {
    console.log('[AuthContext] Resend OTP called');
    setError(null);
    
    try {
      await authService.resendOtp(identifier, type);
    } catch (err: any) {
      console.error('[AuthContext] Resend OTP error:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resend code.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    console.log('[AuthContext] Refresh user called');
    
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err: any) {
      console.error('[AuthContext] Refresh user error:', err);
      
      // If unauthorized, logout
      if (err.response?.status === 401) {
        await logout();
      }
      
      throw err;
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    login,
    register,
    logout,
    verifyOtp,
    resendOtp,
    refreshUser,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
