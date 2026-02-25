import { apiClient } from './api-client';
import {
  CreateGitHubIssueRequest,
  GitHubIssueResponse,
  SystemInfo,
} from './github-issue-types';

// Helper to unwrap backend responses that may be Result<T> wrapped
function unwrap<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'isSuccess' in data) {
    const result = data as { isSuccess: boolean; value?: T; error?: { message: string } };
    if (result.isSuccess && result.value !== undefined) {
      return result.value;
    }
    if (!result.isSuccess) {
      throw new Error(result.error?.message || 'Operation failed');
    }
  }
  return data as T;
}

export const gitHubIssueService = {
  /**
   * Create a new GitHub issue
   */
  async createIssue(request: CreateGitHubIssueRequest): Promise<GitHubIssueResponse> {
    const response = await apiClient.post<GitHubIssueResponse>('/api/v1/github-issues', request);
    return unwrap<GitHubIssueResponse>(response.data);
  },

  /**
   * Upload a screenshot and return the URL
   */
  async uploadScreenshot(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ url: string }>('/api/v1/github-issues/upload-screenshot', formData);
    const data = unwrap<{ url: string }>(response.data);
    return data.url;
  },

  /**
   * Auto-detect system information from the browser
   */
  getSystemInfo(): SystemInfo {
    const ua = navigator.userAgent;

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      const match = ua.match(/Chrome\/(\d+)/);
      browser = match ? `Chrome ${match[1]}` : 'Chrome';
    } else if (ua.includes('Firefox')) {
      const match = ua.match(/Firefox\/(\d+)/);
      browser = match ? `Firefox ${match[1]}` : 'Firefox';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      const match = ua.match(/Version\/(\d+)/);
      browser = match ? `Safari ${match[1]}` : 'Safari';
    } else if (ua.includes('Edg')) {
      const match = ua.match(/Edg\/(\d+)/);
      browser = match ? `Edge ${match[1]}` : 'Edge';
    }

    // Detect OS
    let operatingSystem = 'Unknown';
    if (ua.includes('Win')) operatingSystem = 'Windows';
    else if (ua.includes('Mac')) operatingSystem = 'macOS';
    else if (ua.includes('Linux')) operatingSystem = 'Linux';
    else if (ua.includes('Android')) operatingSystem = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) operatingSystem = 'iOS';

    return {
      browser,
      operatingSystem,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      currentPageUrl: window.location.href,
    };
  },
};
