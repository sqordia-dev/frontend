import { apiClient } from './api-client';
import { LoginRequest, RegisterRequest, LoginResponse, User, ApiResponse, GoogleAuthRequest, LinkGoogleAccountRequest } from './types';
import { activityLogger } from './activity-logger';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Login attempt:', { email: credentials.email });
      const response = await apiClient.post('/api/v1/auth/login', credentials);
      console.log('Login response:', response.data);
      const data = response.data;

      // Handle wrapped response format (isSuccess/value)
      if (data.isSuccess && data.value) {
        localStorage.setItem('accessToken', data.value.accessToken);
        localStorage.setItem('refreshToken', data.value.refreshToken);
        localStorage.removeItem('demoMode');
        console.log('Login successful, tokens stored');
        await activityLogger.logLogin().catch(console.error);
        return data.value;
      }

      // Handle direct response format (token/refreshToken at root level)
      if (data.token || data.accessToken) {
        const accessToken = data.token || data.accessToken;
        const refreshToken = data.refreshToken;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.removeItem('demoMode');
        console.log('Login successful, tokens stored');
        await activityLogger.logLogin().catch(console.error);

        return {
          accessToken,
          refreshToken,
          expiresAt: data.expiresAt,
          user: data.user
        };
      }

      throw new Error(data.errorMessage || 'Login failed');
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('The server is taking too long to respond. It may be starting up. Please wait a moment and try again.');
      }

      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }

      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  },

  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>('/api/v1/auth/register', userData);
      const data = response.data;

      if (data.isSuccess && data.value) {
        return data.value;
      }

      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map((e: any) => `${e.field}: ${e.message}`).join('; ');
        throw new Error(errorMessages);
      }

      throw new Error(data.errorMessage || 'Registration failed');
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          const errorMessages = errors.map((e: any) => `${e.field}: ${e.message}`).join('; ');
          throw new Error(errorMessages);
        }
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get('/api/v1/auth/me');
      const data = response.data;

      // Handle wrapped response format (isSuccess/value)
      if (data.isSuccess && data.value) {
        return data.value;
      }

      // Handle direct response format (user object at root level)
      if (data.id || data.email) {
        return data;
      }

      throw new Error(data.errorMessage || 'Failed to get user');
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to get user information.');
    }
  },

  async googleAuth(tokens: GoogleAuthRequest): Promise<LoginResponse> {
    try {
      console.log('Google auth attempt');
      const response = await apiClient.post('/api/v1/auth/google', tokens);
      console.log('Google auth response:', response.data);
      const data = response.data;

      // Handle wrapped response format (isSuccess/value) - AuthResponse with Token/RefreshToken
      if (data.isSuccess && data.value) {
        const authResponse = data.value;
        // Backend returns Token and RefreshToken, map to accessToken and refreshToken
        const accessToken = authResponse.token || authResponse.accessToken || authResponse.Token;
        const refreshToken = authResponse.refreshToken || authResponse.RefreshToken;
        
        if (!accessToken || !refreshToken) {
          throw new Error('Invalid response format from server');
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.removeItem('demoMode');
        console.log('Google auth successful, tokens stored');
        await activityLogger.logLogin().catch(console.error);

        return {
          accessToken,
          refreshToken,
          expiresAt: authResponse.expiresAt || new Date(Date.now() + 3600000).toISOString(),
          user: authResponse.user || authResponse.User
        };
      }

      // Handle direct response format (token/refreshToken at root level)
      if (data.token || data.accessToken || data.Token) {
        const accessToken = data.token || data.accessToken || data.Token;
        const refreshToken = data.refreshToken || data.RefreshToken;

        if (!accessToken || !refreshToken) {
          throw new Error('Invalid response format from server');
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.removeItem('demoMode');
        console.log('Google auth successful, tokens stored');
        await activityLogger.logLogin().catch(console.error);

        return {
          accessToken,
          refreshToken,
          expiresAt: data.expiresAt || new Date(Date.now() + 3600000).toISOString(),
          user: data.user || data.User
        };
      }

      throw new Error(data.errorMessage || 'Google authentication failed');
    } catch (error: any) {
      console.error('Google auth error:', error);
      
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Google authentication failed.');
    }
  },

  async linkGoogleAccount(tokens: LinkGoogleAccountRequest): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>('/api/v1/auth/google/link', tokens);
      const data = response.data;

      if (data.isSuccess && data.value) {
        return data.value;
      }
      throw new Error(data.errorMessage || 'Failed to link Google account');
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to link Google account.');
    }
  },

  async unlinkGoogleAccount(): Promise<void> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/api/v1/auth/google/unlink');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to unlink Google account');
      }
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to unlink Google account.');
    }
  },

  async logout(): Promise<void> {
    try {
      await activityLogger.logLogout().catch(console.error);
      await apiClient.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  async refreshToken(): Promise<LoginResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/refresh-token', { refreshToken });
      const data = response.data;

      if (data.isSuccess && data.value) {
        localStorage.setItem('accessToken', data.value.accessToken);
        localStorage.setItem('refreshToken', data.value.refreshToken);
        return data.value;
      }
      throw new Error(data.errorMessage || 'Token refresh failed');
    } catch (error: any) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error(error.message || 'Token refresh failed');
    }
  },

  async revokeToken(token: string): Promise<void> {
    await apiClient.post('/api/v1/auth/revoke-token', { token });
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await apiClient.post('/api/v1/auth/forgot-password', { email });
      const data = response.data;
      if (!data.isSuccess && data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to send password reset email.');
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient.post('/api/v1/auth/reset-password', { token, newPassword });
      const data = response.data;
      if (!data.isSuccess && data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to reset password.');
    }
  },

  async sendVerificationEmail(): Promise<void> {
    try {
      const response = await apiClient.post('/api/v1/auth/send-verification-email');
      const data = response.data;
      if (!data.isSuccess && data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to send verification email.');
    }
  },

  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await apiClient.post('/api/v1/auth/verify-email', { token });
      const data = response.data;
      if (!data.isSuccess && data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to verify email.');
    }
  },

  async setup2FA(): Promise<{ qrCodeUrl: string; manualEntryKey: string }> {
    try {
      const response = await apiClient.post('/api/v1/2fa/setup');
      const data = response.data;
      if (data.isSuccess && data.value) {
        return data.value;
      }
      throw new Error(data.errorMessage || 'Failed to setup 2FA');
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to setup 2FA.');
    }
  },

  async enable2FA(code: string): Promise<{ backupCodes: string[] }> {
    try {
      const response = await apiClient.post('/api/v1/2fa/enable', { code });
      const data = response.data;
      if (data.isSuccess && data.value) {
        return data.value;
      }
      throw new Error(data.errorMessage || 'Failed to enable 2FA');
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to enable 2FA.');
    }
  },

  async verify2FA(code: string): Promise<void> {
    try {
      const response = await apiClient.post('/api/v1/2fa/verify', { code });
      const data = response.data;
      if (!data.isSuccess && data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to verify 2FA code.');
    }
  },

  async disable2FA(code: string): Promise<void> {
    try {
      const response = await apiClient.post('/api/v1/2fa/disable', { code });
      const data = response.data;
      if (!data.isSuccess && data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to disable 2FA.');
    }
  },

  async get2FAStatus(): Promise<{ isEnabled: boolean; hasBackupCodes: boolean }> {
    try {
      const response = await apiClient.get('/api/v1/2fa/status');
      const data = response.data;
      if (data.isSuccess && data.value) {
        return data.value;
      }
      throw new Error(data.errorMessage || 'Failed to get 2FA status');
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to get 2FA status.');
    }
  },

  async regenerateBackupCodes(): Promise<{ backupCodes: string[] }> {
    try {
      const response = await apiClient.post('/api/v1/2fa/backup-codes/regenerate');
      const data = response.data;
      if (data.isSuccess && data.value) {
        return data.value;
      }
      throw new Error(data.errorMessage || 'Failed to regenerate backup codes');
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to regenerate backup codes.');
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
};
