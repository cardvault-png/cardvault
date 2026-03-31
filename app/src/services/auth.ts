import api from './api';

export interface LoginResponse {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string;
    username: string;
    role: string;
    kycStatus: string;
    twoFactorEnabled: boolean;
  };
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
}

export interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  username: string;
  referralCode?: string;
  termsAccepted: boolean;
}

export const authService = {
  async login(email: string, password: string, twoFactorCode?: string): Promise<LoginResponse> {
    console.log('[AuthService] Login attempt:', { email, has2FA: !!twoFactorCode });
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        twoFactorCode,
      });
      
      console.log('[AuthService] Login response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('[AuthService] Login error:', error);
      
      // Handle specific error cases
      if (error.response?.data?.requiresTwoFactor) {
        return { requiresTwoFactor: true } as any;
      }
      
      throw error;
    }
  },

  async register(data: RegisterData): Promise<any> {
    console.log('[AuthService] Register attempt:', { email: data.email, username: data.username });
    
    try {
      const response = await api.post('/auth/register', data);
      
      console.log('[AuthService] Register response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Register error:', error);
      throw error;
    }
  },

  async verifyOtp(identifier: string, code: string, type: string): Promise<LoginResponse> {
    console.log('[AuthService] Verify OTP:', { identifier, type });
    
    try {
      const response = await api.post('/auth/verify-otp', {
        identifier,
        code,
        type,
      });
      
      console.log('[AuthService] OTP verification response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Verification failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('[AuthService] OTP verification error:', error);
      throw error;
    }
  },

  async resendOtp(identifier: string, type: string): Promise<void> {
    console.log('[AuthService] Resend OTP:', { identifier, type });
    
    try {
      await api.post('/auth/resend-otp', { identifier, type });
    } catch (error: any) {
      console.error('[AuthService] Resend OTP error:', error);
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    console.log('[AuthService] Forgot password:', { email });
    
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error: any) {
      console.error('[AuthService] Forgot password error:', error);
      throw error;
    }
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    console.log('[AuthService] Reset password:', { email });
    
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
    } catch (error: any) {
      console.error('[AuthService] Reset password error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<any> {
    console.log('[AuthService] Get current user');
    
    try {
      const response = await api.get('/auth/me');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get user');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('[AuthService] Get current user error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    console.log('[AuthService] Logout');
    
    try {
      await api.post('/auth/logout');
    } catch (error: any) {
      console.error('[AuthService] Logout error:', error);
      // Don't throw on logout error - just clear local storage
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  async setup2FA(): Promise<{ secret: string; qrCode: string }> {
    console.log('[AuthService] Setup 2FA');
    
    try {
      const response = await api.post('/auth/2fa/setup');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to setup 2FA');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('[AuthService] Setup 2FA error:', error);
      throw error;
    }
  },

  async verify2FA(code: string): Promise<void> {
    console.log('[AuthService] Verify 2FA');
    
    try {
      const response = await api.post('/auth/2fa/verify', { code });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to verify 2FA');
      }
    } catch (error: any) {
      console.error('[AuthService] Verify 2FA error:', error);
      throw error;
    }
  },

  async disable2FA(code: string): Promise<void> {
    console.log('[AuthService] Disable 2FA');
    
    try {
      const response = await api.post('/auth/2fa/disable', { code });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to disable 2FA');
      }
    } catch (error: any) {
      console.error('[AuthService] Disable 2FA error:', error);
      throw error;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    console.log('[AuthService] Change password');
    
    try {
      await api.post('/user/change-password', { currentPassword, newPassword });
    } catch (error: any) {
      console.error('[AuthService] Change password error:', error);
      throw error;
    }
  },

  async updateProfile(data: { fullName?: string; phone?: string }): Promise<void> {
    console.log('[AuthService] Update profile:', data);
    
    try {
      await api.patch('/user/profile', data);
    } catch (error: any) {
      console.error('[AuthService] Update profile error:', error);
      throw error;
    }
  },
};

export default authService;
