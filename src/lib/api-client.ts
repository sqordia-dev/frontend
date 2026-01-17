import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Get API URL from environment variable
// Vite automatically loads .env.development for `npm run dev`
// and .env.production for `npm run build`
const getApiBaseUrl = (): string => {
  const mode = import.meta.env.MODE;
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Debug logging
  console.log('[API Config] VITE_API_URL from env:', envUrl);
  console.log('[API Config] import.meta.env.MODE:', mode);
  
  // In development mode, ALWAYS use relative URLs to leverage Vite proxy
  // This avoids CORS issues since the proxy forwards requests to the backend
  if (mode === 'development') {
    // Always use relative URL to go through Vite proxy in development
    // The proxy is configured in vite.config.ts to forward /api requests to http://localhost:5241
    console.log('[API Config] Using relative URL for Vite proxy in development (ignoring VITE_API_URL to avoid CORS)');
    return '';
  }
  
  // Production mode: use environment variable or default
  if (envUrl && envUrl.trim() !== '') {
    console.log('[API Config] Using environment variable:', envUrl);
    return envUrl;
  }
  
  // Default to production API
  const productionUrl = 'https://sqordia-production-api.proudwater-90136d2c.canadacentral.azurecontainerapps.io';
  console.log('[API Config] No VITE_API_URL found, using production default:', productionUrl);
  return productionUrl;
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const mode = import.meta.env.MODE;
    console.log(`[${mode.toUpperCase()}] API Client initialized with base URL:`, API_BASE_URL);

    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
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
          requestData: error.config?.data ? (typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data) : null
        };
        console.error('API Error:', errorDetails);
        
        // Handle CORS and network errors
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          const isDevelopment = import.meta.env.MODE === 'development';
          const errorMessage = isDevelopment
            ? 'Network error: Make sure the backend API is running on http://localhost:5241 and CORS is properly configured. If using Vite proxy, ensure the proxy is configured correctly.'
            : 'Network error: Unable to connect to the server. Please check your internet connection.';
          console.error('Network Error Details:', {
            message: error.message,
            code: error.code,
            config: error.config,
            isDevelopment,
            apiBaseUrl: API_BASE_URL
          });
          // Don't throw here, let the calling code handle it
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
        
        // Also log the full error response data for debugging
        if (error.response?.data) {
          console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
        }

        if (error.response?.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed && error.config) {
            return this.client.request(error.config);
          }
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      // Build the refresh token URL - handle empty base URL for proxy
      const refreshUrl = API_BASE_URL 
        ? `${API_BASE_URL}/api/v1/auth/refresh-token`
        : '/api/v1/auth/refresh-token';

      // Backend expects both Token and RefreshToken in the request
      const response = await axios.post(refreshUrl, {
        token: accessToken || '',
        refreshToken: refreshToken,
      });

      const data = response.data;
      
      // Handle wrapped response format (isSuccess/value)
      if (data.isSuccess && data.value) {
        localStorage.setItem('accessToken', data.value.token || data.value.accessToken);
        localStorage.setItem('refreshToken', data.value.refreshToken);
        return true;
      }
      
      // Handle direct response format (token/refreshToken at root level)
      if (data.token || data.accessToken) {
        const newAccessToken = data.token || data.accessToken;
        const newRefreshToken = data.refreshToken;
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
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

  public delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url);
  }

  public patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data);
  }
}

export const apiClient = new ApiClient();
