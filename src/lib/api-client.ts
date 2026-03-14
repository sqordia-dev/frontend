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

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const mode = import.meta.env.MODE;
    if (mode === 'development' && typeof console !== 'undefined' && console.log) {
      console.log('[API Client] Initialized with base URL:', API_BASE_URL || '(relative)');
    }

    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      withCredentials: true, // Send HttpOnly cookies with every request
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Remove Content-Type header for FormData - axios will set it automatically with boundary
        if (config.data instanceof FormData && config.headers) {
          delete config.headers['Content-Type'];
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
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<boolean> {
    try {
      // Build the refresh token URL - handle empty base URL for proxy
      const refreshUrl = API_BASE_URL
        ? `${API_BASE_URL}/api/v1/auth/refresh-token`
        : '/api/v1/auth/refresh-token';

      // Cookies are sent automatically via withCredentials
      // Send empty body — backend reads tokens from cookies
      const response = await axios.post(refreshUrl, {}, { withCredentials: true });

      const data = response.data;

      // Handle wrapped response format (isSuccess/value)
      if (data.isSuccess && data.value?.token) {
        return true;
      }

      // Handle direct response format
      if (data.token || data.accessToken) {
        return true;
      }

      return false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Token refresh failed:', error);
      }
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
