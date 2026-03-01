import { apiClient } from './api-client';
import {
  CreateGitHubIssueRequest,
  GitHubIssueResponse,
  GitHubIssueListResponse,
  GitHubIssueDetailResponse,
  GitHubIssueStats,
  ListIssuesParams,
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
   * List GitHub issues with filtering and pagination
   */
  async listIssues(params: ListIssuesParams = {}): Promise<GitHubIssueListResponse> {
    const searchParams = new URLSearchParams();
    if (params.repository) searchParams.append('repository', params.repository);
    if (params.state) searchParams.append('state', params.state);
    if (params.label) searchParams.append('label', params.label);
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.direction) searchParams.append('direction', params.direction);

    const response = await apiClient.get<GitHubIssueListResponse>(
      `/api/v1/github-issues?${searchParams.toString()}`
    );
    return unwrap<GitHubIssueListResponse>(response.data);
  },

  /**
   * Get a single GitHub issue by number
   */
  async getIssue(repository: string, issueNumber: number): Promise<GitHubIssueDetailResponse> {
    const response = await apiClient.get<GitHubIssueDetailResponse>(
      `/api/v1/github-issues/${repository}/${issueNumber}`
    );
    return unwrap<GitHubIssueDetailResponse>(response.data);
  },

  /**
   * Get issue statistics
   */
  async getStats(): Promise<GitHubIssueStats> {
    const response = await apiClient.get<GitHubIssueStats>('/api/v1/github-issues/stats');
    return unwrap<GitHubIssueStats>(response.data);
  },

  /**
   * Update the state of a GitHub issue (open/close)
   */
  async updateIssueState(repository: string, issueNumber: number, state: 'open' | 'closed'): Promise<GitHubIssueDetailResponse> {
    const response = await apiClient.patch<GitHubIssueDetailResponse>(
      `/api/v1/github-issues/${repository}/${issueNumber}`,
      { state }
    );
    return unwrap<GitHubIssueDetailResponse>(response.data);
  },

  /**
   * Update a GitHub issue (title, body, priority, category, state)
   */
  async updateIssue(
    repository: string,
    issueNumber: number,
    updates: {
      title?: string;
      body?: string;
      priority?: string;
      category?: string;
      state?: 'open' | 'closed';
    }
  ): Promise<GitHubIssueDetailResponse> {
    const response = await apiClient.patch<GitHubIssueDetailResponse>(
      `/api/v1/github-issues/${repository}/${issueNumber}`,
      updates
    );
    return unwrap<GitHubIssueDetailResponse>(response.data);
  },

  /**
   * Archive (soft delete) a GitHub issue
   * Note: GitHub doesn't support deleting issues, so we close and label as archived
   */
  async archiveIssue(repository: string, issueNumber: number, reason?: string): Promise<GitHubIssueDetailResponse> {
    const response = await apiClient.delete<GitHubIssueDetailResponse>(
      `/api/v1/github-issues/${repository}/${issueNumber}`,
      { data: reason ? { reason } : undefined }
    );
    return unwrap<GitHubIssueDetailResponse>(response.data);
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
