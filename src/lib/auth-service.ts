import { apiClient, setAccessToken, getAccessToken, clearAccessToken, isTokenExpired } from './api-client';
import { LoginRequest, RegisterRequest, LoginResponse, User, ApiResponse, GoogleAuthRequest, LinkGoogleAccountRequest, MicrosoftAuthRequest } from './types';
import { activityLogger } from './activity-logger';

// Microsoft OAuth configuration
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
const MICROSOFT_REDIRECT_URI = import.meta.env.VITE_MICROSOFT_REDIRECT_URI || `${window.location.origin}/auth/microsoft/callback`;
const MICROSOFT_TENANT = import.meta.env.VITE_MICROSOFT_TENANT || 'common';

/** Set a same-domain is_authenticated cookie so synchronous checks work */
function setAuthCookie(expiresAt?: string) {
  const maxAge = expiresAt
    ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    : 3600;
  document.cookie = `is_authenticated=true; path=/; max-age=${maxAge}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

function clearAuthCookie() {
  document.cookie = 'is_authenticated=; path=/; max-age=0';
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<any>('/api/v1/auth/login', credentials);
      const data = response.data;

      // Handle wrapped response format (isSuccess/value)
      if (data.isSuccess && data.value) {
        const value = data.value;

        // Check if 2FA is required
        if (value.requiresTwoFactor) {
          return {
            requiresTwoFactor: true,
            twoFactorToken: value.twoFactorToken,
            accessToken: '',
            refreshToken: '',
            expiresAt: '',
            user: null as any,
          };
        }

        // Store token in memory for Authorization header (works even when cross-origin cookies are blocked)
        const token = value.token || value.accessToken;
        if (token) setAccessToken(token);

        localStorage.removeItem('demoMode');
        setAuthCookie(value.expiresAt);
        activityLogger.logLogin().catch(console.error); // fire-and-forget
        return value;
      }

      // Handle direct 2FA challenge response
      if (data.requiresTwoFactor) {
        return {
          requiresTwoFactor: true,
          twoFactorToken: data.twoFactorToken,
          accessToken: '',
          refreshToken: '',
          expiresAt: '',
          user: null as any,
        };
      }

      // Handle direct response format (token/refreshToken at root level)
      if (data.token || data.accessToken) {
        const accessToken = data.token || data.accessToken;
        const refreshToken = data.refreshToken;

        // Store token in memory for Authorization header
        if (accessToken) setAccessToken(accessToken);

        localStorage.removeItem('demoMode');
        setAuthCookie(data.expiresAt);
        activityLogger.logLogin().catch(console.error); // fire-and-forget

        return {
          accessToken,
          refreshToken,
          expiresAt: data.expiresAt,
          user: data.user
        };
      }

      throw new Error(data.errorMessage || data.message || 'Login failed');
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('The server is taking too long to respond. It may be starting up. Please wait a moment and try again.');
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
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

  async verifyTwoFactorLogin(twoFactorToken: string, code: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<any>('/api/v1/auth/login/verify-2fa', {
        twoFactorToken,
        code,
      });
      const data = response.data;

      // Handle wrapped response format
      if (data.isSuccess && data.value) {
        const value = data.value;
        const accessToken = value.accessToken || value.token;
        const refreshToken = value.refreshToken;

        if (accessToken) setAccessToken(accessToken);

        localStorage.removeItem('demoMode');
        setAuthCookie(value.expiresAt);
        activityLogger.logLogin().catch(console.error);

        return {
          accessToken,
          refreshToken,
          expiresAt: value.expiresAt,
          user: value.user,
        };
      }

      // Handle direct response format
      if (data.token || data.accessToken) {
        const accessToken = data.token || data.accessToken;
        const refreshToken = data.refreshToken;

        if (accessToken) setAccessToken(accessToken);

        localStorage.removeItem('demoMode');
        setAuthCookie(data.expiresAt);
        activityLogger.logLogin().catch(console.error);

        return {
          accessToken,
          refreshToken,
          expiresAt: data.expiresAt,
          user: data.user,
        };
      }

      throw new Error(data.errorMessage || data.message || '2FA verification failed');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || '2FA verification failed. Please try again.');
    }
  },

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<any>('/api/v1/auth/register', userData);
      const data = response.data;

      // Handle wrapped response format (isSuccess/value)
      if (data.isSuccess && data.value) {
        const value = data.value;
        const accessToken = value.token || value.accessToken;
        const refreshToken = value.refreshToken || value.RefreshToken || '';

        if (accessToken) {
          setAccessToken(accessToken);
          setAuthCookie(value.expiresAt);
        }

        localStorage.removeItem('demoMode');
        activityLogger.logLogin().catch(console.error);

        return {
          accessToken: accessToken || '',
          refreshToken,
          expiresAt: value.expiresAt || new Date(Date.now() + 3600000).toISOString(),
          user: value.user || value.User,
        };
      }

      // Handle direct auth response format (token/user at root level)
      if (data.token || data.accessToken) {
        const accessToken = data.token || data.accessToken;
        setAccessToken(accessToken);
        setAuthCookie(data.expiresAt);
        localStorage.removeItem('demoMode');
        activityLogger.logLogin().catch(console.error);

        return {
          accessToken,
          refreshToken: data.refreshToken || '',
          expiresAt: data.expiresAt || new Date(Date.now() + 3600000).toISOString(),
          user: data.user,
        };
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
      const response = await apiClient.get<any>('/api/v1/auth/me');
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
      const response = await apiClient.post<any>('/api/v1/auth/google', tokens);
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

        setAccessToken(accessToken);
        localStorage.removeItem('demoMode');
        setAuthCookie(authResponse.expiresAt);
        activityLogger.logLogin().catch(console.error); // fire-and-forget

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

        setAccessToken(accessToken);
        localStorage.removeItem('demoMode');
        setAuthCookie(data.expiresAt);
        activityLogger.logLogin().catch(console.error); // fire-and-forget

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
      const data = error.response?.data;
      if (data?.details) {
        console.error('Google auth server details:', data.details);
      }
      const serverMessage = data?.errorMessage || data?.message;
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

      // Generate cryptographically secure random state for CSRF protection
      const stateBytes = new Uint8Array(16);
      crypto.getRandomValues(stateBytes);
      const state = Array.from(stateBytes).map(b => b.toString(16).padStart(2, '0')).join('');
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
      const response = await apiClient.post<any>('/api/v1/auth/microsoft', request);
      const data = response.data;

      // Handle wrapped response format
      if (data.isSuccess && data.value) {
        const authResponse = data.value;
        const accessToken = authResponse.token || authResponse.accessToken || authResponse.Token;
        const refreshToken = authResponse.refreshToken || authResponse.RefreshToken;

        if (!accessToken || !refreshToken) {
          throw new Error('Invalid response format from server');
        }

        setAccessToken(accessToken);
        localStorage.removeItem('demoMode');
        setAuthCookie(authResponse.expiresAt);
        activityLogger.logLogin().catch(console.error); // fire-and-forget

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

        setAccessToken(accessToken);
        localStorage.removeItem('demoMode');
        setAuthCookie(data.expiresAt);
        activityLogger.logLogin().catch(console.error); // fire-and-forget

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
      // Backend clears HttpOnly cookies on logout
      await apiClient.post('/api/v1/auth/logout', {});
    } catch (error) {
      if (import.meta.env.DEV) console.error('Logout error:', error);
    } finally {
      clearAccessToken();
      clearAuthCookie();
    }
  },

  async refreshToken(): Promise<LoginResponse> {
    try {
      // Cookies sent automatically — backend reads tokens from cookies
      // Authorization header also sent if token is in memory
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/refresh-token', {});
      const data = response.data;

      if (data.isSuccess && data.value) {
        // Store new token in memory
        const token = (data.value as any).token || data.value.accessToken;
        if (token) setAccessToken(token);
        setAuthCookie(data.value.expiresAt);
        return data.value;
      }
      throw new Error(data.errorMessage || 'Token refresh failed');
    } catch (error: any) {
      clearAccessToken();
      clearAuthCookie();
      throw new Error(error.message || 'Token refresh failed');
    }
  },

  async revokeToken(token: string): Promise<void> {
    await apiClient.post('/api/v1/auth/revoke-token', { token });
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await apiClient.post<any>('/api/v1/auth/forgot-password', { email });
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
      const response = await apiClient.post<any>('/api/v1/auth/reset-password', { token, newPassword });
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
      const response = await apiClient.post<any>('/api/v1/auth/send-verification-email');
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
      const response = await apiClient.post<any>('/api/v1/auth/verify-email', { token });
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
      const response = await apiClient.post<any>('/api/v1/2fa/setup');
      const data = response.data;
      // Handle wrapped response format
      if (data.isSuccess && data.value) {
        return data.value;
      }
      // Handle direct response format
      if (data.qrCodeUrl) {
        return data;
      }
      throw new Error(data.errorMessage || data.message || 'Failed to setup 2FA');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to setup 2FA.');
    }
  },

  async enable2FA(code: string): Promise<{ backupCodes: string[] }> {
    try {
      const response = await apiClient.post<any>('/api/v1/2fa/enable', { verificationCode: code });
      const data = response.data;
      // Handle wrapped response format
      if (data.isSuccess && data.value) {
        return data.value;
      }
      // Handle direct response format
      if (data.backupCodes) {
        return data;
      }
      throw new Error(data.errorMessage || data.message || 'Failed to enable 2FA');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to enable 2FA.');
    }
  },

  async verify2FA(code: string): Promise<void> {
    try {
      const response = await apiClient.post<any>('/api/v1/2fa/verify', { code });
      const data = response.data;
      if (data.isSuccess === false && (data.errorMessage || data.message)) {
        throw new Error(data.errorMessage || data.message);
      }
      // 200 OK = success (direct format returns empty body or success indicator)
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to verify 2FA code.');
    }
  },

  async disable2FA(code: string): Promise<void> {
    try {
      const response = await apiClient.post<any>('/api/v1/2fa/disable', { code });
      const data = response.data;
      if (data.isSuccess === false && (data.errorMessage || data.message)) {
        throw new Error(data.errorMessage || data.message);
      }
      // 200 OK = success
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to disable 2FA.');
    }
  },

  async get2FAStatus(): Promise<{ isEnabled: boolean; remainingBackupCodes: number }> {
    try {
      const response = await apiClient.get<any>('/api/v1/2fa/status');
      const data = response.data;
      // Handle wrapped response format
      if (data.isSuccess && data.value) {
        return data.value;
      }
      // Handle direct response format
      if (data.isEnabled !== undefined) {
        return data;
      }
      throw new Error(data.errorMessage || data.message || 'Failed to get 2FA status');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to get 2FA status.');
    }
  },

  async regenerateBackupCodes(): Promise<{ backupCodes: string[] }> {
    try {
      const response = await apiClient.post<any>('/api/v1/2fa/backup-codes/regenerate');
      const data = response.data;
      // Handle wrapped response format
      if (data.isSuccess && data.value) {
        return data.value;
      }
      // Handle direct response format
      if (data.backupCodes) {
        return data;
      }
      throw new Error(data.errorMessage || data.message || 'Failed to regenerate backup codes');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to regenerate backup codes.');
    }
  },

  isAuthenticated(): boolean {
    // Check in-memory token first (works when cross-origin cookies are blocked)
    const token = getAccessToken();
    if (token && !isTokenExpired(token)) return true;
    // Fallback: check the non-HttpOnly flag cookie (has natural expiry via max-age)
    return document.cookie.split(';').some(c => c.trim().startsWith('is_authenticated='));
  },

  /**
   * Re-hydrate the in-memory token on page reload / new tab.
   * Called once on app startup — if we have a cookie but no in-memory token,
   * performs a token refresh to restore the session without a visible 401 round-trip.
   * Returns true if the session was restored.
   */
  async rehydrateToken(): Promise<boolean> {
    // Already have a valid in-memory token — nothing to do
    const existing = getAccessToken();
    if (existing && !isTokenExpired(existing)) return true;

    // No cookie either — user is genuinely not authenticated
    const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('is_authenticated='));
    if (!hasCookie) return false;

    // Have a cookie but no in-memory token — refresh to restore the session
    try {
      await this.refreshToken();
      return !!getAccessToken();
    } catch {
      return false;
    }
  }
};
