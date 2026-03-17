import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Get API URL from environment variable
// Vite automatically loads .env.development for `npm run dev`
// and .env.production for `npm run build`
const getApiBaseUrl = (): string => {
  const mode = import.meta.env.MODE;
  const envUrl = import.meta.env.VITE_API_URL;

  // In development mode, ALWAYS use relative URLs to leverage Vite proxy
  // This avoids CORS issues since the proxy forwards requests to the backend
  if (mode === 'development') {
    if (typeof console !== 'undefined' && console.log) {
      console.log('[API Config] Using relative URL for Vite proxy (development)');
    }
    return '';
  }

  // Production mode: use environment variable or default
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }

  // Default to production API when VITE_API_URL is not set at build time
  return 'https://sqordia-production-api.proudwater-90136d2c.canadacentral.azurecontainerapps.io';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * In-memory token storage for cross-origin auth.
 * Modern browsers block third-party cookies (SameSite=None) when frontend and API
 * are on different domains. Storing the token in memory and sending it via
 * Authorization header ensures auth works regardless of cookie policy.
 *
 * Security note: In-memory is more secure than localStorage (cleared on tab close).
 * An XSS attack within the same origin can still access it via getAccessToken(),
 * but this is an acceptable tradeoff vs. broken auth with cookie-only transport.
 */
let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function clearAccessToken() {
  _accessToken = null;
}

/**
 * Check if a JWT token is expired by decoding its exp claim.
 * Returns true if expired or if the token cannot be parsed.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

class ApiClient {
  private client: AxiosInstance;
  /** Deduplicates concurrent refresh calls — prevents token rotation races */
  private _refreshPromise: Promise<boolean> | null = null;

  constructor() {
    const mode = import.meta.env.MODE;
    if (mode === 'development' && typeof console !== 'undefined' && console.log) {
      console.log('[API Client] Initialized with base URL:', API_BASE_URL || '(relative)');
    }

    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      withCredentials: true, // Send HttpOnly cookies with every request (fallback)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Remove Content-Type header for FormData - axios will set it automatically with boundary
        if (config.data instanceof FormData && config.headers) {
          delete config.headers['Content-Type'];
        }

        // Proactive token refresh: if access token expires within 5 minutes,
        // refresh it BEFORE sending the request (avoids 401 round-trip).
        // Skip for refresh-token endpoint itself to avoid infinite loop.
        if (_accessToken && !config.url?.includes('refresh-token')) {
          try {
            const payload = JSON.parse(atob(_accessToken.split('.')[1]));
            const expiresIn = payload.exp * 1000 - Date.now();
            if (expiresIn < 5 * 60 * 1000) { // less than 5 minutes left
              await this.refreshToken();
            }
          } catch { /* ignore parse errors */ }
        }

        // Attach in-memory access token as Authorization header (primary auth transport)
        // Backend checks Authorization header first, then falls back to cookies
        if (_accessToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${_accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const errorDetails = {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
          // Never log request body — may contain passwords, tokens, or PII
        };

        // Don't log expected 404s from endpoints where "not found" is normal
        const isExpected404 = error.response?.status === 404 && (
          error.config?.url?.includes('/api/v1/content/') ||  // CMS content (no published version)
          error.config?.url?.includes('/api/v1/subscriptions/current')  // No subscription
        );
        if (!isExpected404 && import.meta.env.DEV) {
          console.error('API Error:', errorDetails);
        }

        // Handle CORS and network errors
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          const isDevelopment = import.meta.env.MODE === 'development';
          if (isDevelopment) {
            console.error('Network Error Details:', {
              message: error.message,
              code: error.code,
              url: error.config?.url,
            });
          }

          // Attempt a token refresh before giving up
          if (error.config && !error.config._networkRetried) {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              error.config._networkRetried = true;
              return this.client.request(error.config);
            }
            window.location.href = '/login';
            return Promise.reject(error);
          }

          const errorMessage = isDevelopment
            ? 'Network error: Make sure the backend API is running on http://localhost:5241 and CORS is properly configured. If using Vite proxy, ensure the proxy is configured correctly.'
            : 'Network error: Unable to connect to the server. Please check your internet connection.';
          error.userMessage = errorMessage;
        }

        // Handle rate limiting (429)
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const errorMessage = retryAfter
            ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
            : 'Too many requests. Please wait a moment before trying again.';
          error.userMessage = errorMessage;
          console.warn('Rate limit exceeded:', { retryAfter, url: error.config?.url });
        }

        // Log full error response only in development
        if (error.response?.data && !isExpected404 && import.meta.env.DEV) {
          console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
        }

        if (error.response?.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed && error.config) {
            return this.client.request(error.config);
          }
          clearAccessToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Deduplicated refresh — concurrent 401s share a single in-flight request.
   * This prevents token rotation races when multiple API calls fail simultaneously.
   */
  private async refreshToken(): Promise<boolean> {
    if (this._refreshPromise) return this._refreshPromise;
    this._refreshPromise = this._doRefreshToken().finally(() => {
      this._refreshPromise = null;
    });
    return this._refreshPromise;
  }

  /**
   * Actual refresh implementation.
   * Uses raw axios (not this.client) to avoid interceptor loops.
   */
  private async _doRefreshToken(): Promise<boolean> {
    try {
      // Build the refresh token URL - handle empty base URL for proxy
      const refreshUrl = API_BASE_URL
        ? `${API_BASE_URL}/api/v1/auth/refresh-token`
        : '/api/v1/auth/refresh-token';

      // Cookies are sent automatically via withCredentials
      // Also send Authorization header if we have a token (for cross-origin where cookies may be blocked)
      const headers: Record<string, string> = {};
      if (_accessToken) {
        headers['Authorization'] = `Bearer ${_accessToken}`;
      }
      const response = await axios.post(refreshUrl, {}, { withCredentials: true, headers });

      const data = response.data;

      // Handle wrapped response format (isSuccess/value)
      if (data.isSuccess && data.value?.token) {
        setAccessToken(data.value.token);
        return true;
      }

      // Handle direct response format
      if (data.token || data.accessToken) {
        setAccessToken(data.token || data.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Token refresh failed:', error);
      }
      clearAccessToken();
      return false;
    }
  }

  public get<T>(url: string, params?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.get(url, { params, ...config });
  }

  public post<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  public put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put(url, data);
  }

  public delete<T>(url: string, config?: { data?: any }): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }

  public patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data);
  }
}

export const apiClient = new ApiClient();
