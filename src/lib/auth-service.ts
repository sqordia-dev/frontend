import { apiClient } from './api-client';
import { LoginRequest, RegisterRequest, LoginResponse, User, ApiResponse, GoogleAuthRequest, LinkGoogleAccountRequest, MicrosoftAuthRequest } from './types';
import { activityLogger } from './activity-logger';

// Microsoft OAuth configuration
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
const MICROSOFT_REDIRECT_URI = import.meta.env.VITE_MICROSOFT_REDIRECT_URI || `${window.location.origin}/auth/microsoft/callback`;
const MICROSOFT_TENANT = import.meta.env.VITE_MICROSOFT_TENANT || 'common';

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

      // Backend Error class serializes as { code, message, details, type }
      // Direct controller errors use { errorMessage }
      const serverMessage = error.response?.data?.errorMessage || error.response?.data?.message;
      if (serverMessage) {
        throw new Error(serverMessage);
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

  /**
   * Initiate Microsoft OAuth sign-in flow
   * Opens a popup window for Microsoft authentication
   */
  async signInWithMicrosoft(): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
      if (!MICROSOFT_CLIENT_ID) {
        reject(new Error('Microsoft OAuth is not configured. Please contact support.'));
        return;
      }

      // Generate random state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('microsoft_oauth_state', state);

      // Build Microsoft OAuth URL
      const authUrl = new URL(`https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/authorize`);
      authUrl.searchParams.set('client_id', MICROSOFT_CLIENT_ID);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', MICROSOFT_REDIRECT_URI);
      authUrl.searchParams.set('scope', 'openid profile email User.Read');
      authUrl.searchParams.set('response_mode', 'query');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('prompt', 'select_account');

      // Open popup window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authUrl.toString(),
        'microsoft-oauth',
        `width=${width},height=${height},left=${left},top=${top},popup=yes`
      );

      if (!popup) {
        reject(new Error('Failed to open Microsoft sign-in popup. Please allow popups for this site.'));
        return;
      }

      // Listen for callback from popup
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === 'microsoft-oauth-callback') {
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosedInterval);

          const { code, state: returnedState, error } = event.data;

          if (error) {
            reject(new Error(error));
            return;
          }

          // Verify state
          const savedState = sessionStorage.getItem('microsoft_oauth_state');
          sessionStorage.removeItem('microsoft_oauth_state');

          if (returnedState !== savedState) {
            reject(new Error('Invalid OAuth state. Please try again.'));
            return;
          }

          try {
            // Exchange code for tokens via backend
            const response = await this.microsoftAuth({ code, redirectUri: MICROSOFT_REDIRECT_URI });
            resolve(response);
          } catch (err) {
            reject(err);
          }
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was closed without completing auth
      const checkClosedInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosedInterval);
          window.removeEventListener('message', messageHandler);
          sessionStorage.removeItem('microsoft_oauth_state');
          reject(new Error('Microsoft sign-in was cancelled.'));
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
        }
        clearInterval(checkClosedInterval);
        window.removeEventListener('message', messageHandler);
        sessionStorage.removeItem('microsoft_oauth_state');
        reject(new Error('Microsoft sign-in timed out. Please try again.'));
      }, 300000);
    });
  },

  /**
   * Exchange Microsoft OAuth code for tokens
   */
  async microsoftAuth(request: MicrosoftAuthRequest): Promise<LoginResponse> {
    try {
      console.log('Microsoft auth attempt');
      const response = await apiClient.post('/api/v1/auth/microsoft', request);
      console.log('Microsoft auth response:', response.data);
      const data = response.data;

      // Handle wrapped response format
      if (data.isSuccess && data.value) {
        const authResponse = data.value;
        const accessToken = authResponse.token || authResponse.accessToken || authResponse.Token;
        const refreshToken = authResponse.refreshToken || authResponse.RefreshToken;

        if (!accessToken || !refreshToken) {
          throw new Error('Invalid response format from server');
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.removeItem('demoMode');
        console.log('Microsoft auth successful, tokens stored');
        await activityLogger.logLogin().catch(console.error);

        return {
          accessToken,
          refreshToken,
          expiresAt: authResponse.expiresAt || new Date(Date.now() + 3600000).toISOString(),
          user: authResponse.user || authResponse.User
        };
      }

      // Handle direct response format
      if (data.token || data.accessToken || data.Token) {
        const accessToken = data.token || data.accessToken || data.Token;
        const refreshToken = data.refreshToken || data.RefreshToken;

        if (!accessToken || !refreshToken) {
          throw new Error('Invalid response format from server');
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.removeItem('demoMode');
        console.log('Microsoft auth successful, tokens stored');
        await activityLogger.logLogin().catch(console.error);

        return {
          accessToken,
          refreshToken,
          expiresAt: data.expiresAt || new Date(Date.now() + 3600000).toISOString(),
          user: data.user || data.User
        };
      }

      throw new Error(data.errorMessage || 'Microsoft authentication failed');
    } catch (error: any) {
      console.error('Microsoft auth error:', error);

      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Microsoft authentication failed.');
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
