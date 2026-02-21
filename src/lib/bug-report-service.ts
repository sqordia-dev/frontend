import { apiClient } from './api-client';
import {
  BugReport,
  BugReportSummary,
  BugReportAttachment,
  CreateBugReportRequest,
  UpdateBugReportRequest,
} from './bug-report-types';

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

export const bugReportService = {
  // Get all bug reports
  async getBugReports(
    status?: string,
    severity?: string
  ): Promise<BugReportSummary[]> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (severity) params.severity = severity;
    const response = await apiClient.get<BugReportSummary[]>('/api/v1/bug-reports', params);
    return unwrap<BugReportSummary[]>(response.data);
  },

  // Get a bug report by ID
  async getBugReport(id: string): Promise<BugReport> {
    const response = await apiClient.get<BugReport>(`/api/v1/bug-reports/${id}`);
    return unwrap<BugReport>(response.data);
  },

  // Get a bug report by ticket number
  async getBugReportByTicketNumber(ticketNumber: string): Promise<BugReport> {
    const response = await apiClient.get<BugReport>(`/api/v1/bug-reports/by-ticket/${ticketNumber}`);
    return unwrap<BugReport>(response.data);
  },

  // Create a new bug report
  async createBugReport(request: CreateBugReportRequest): Promise<BugReport> {
    const response = await apiClient.post<BugReport>('/api/v1/bug-reports', request);
    return unwrap<BugReport>(response.data);
  },

  // Update a bug report
  async updateBugReport(id: string, request: UpdateBugReportRequest): Promise<BugReport> {
    const response = await apiClient.put<BugReport>(`/api/v1/bug-reports/${id}`, request);
    return unwrap<BugReport>(response.data);
  },

  // Delete a bug report
  async deleteBugReport(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/bug-reports/${id}`);
  },

  // Add an attachment
  async addAttachment(bugReportId: string, file: File): Promise<BugReportAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<BugReportAttachment>(
      `/api/v1/bug-reports/${bugReportId}/attachments`,
      formData
    );
    return unwrap<BugReportAttachment>(response.data);
  },

  // Remove an attachment
  async removeAttachment(bugReportId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/api/v1/bug-reports/${bugReportId}/attachments/${attachmentId}`);
  },

  // Get next ticket number (for preview)
  async getNextTicketNumber(): Promise<string> {
    const response = await apiClient.get<{ ticketNumber: string }>('/api/v1/bug-reports/next-ticket-number');
    const data = unwrap<{ ticketNumber: string }>(response.data);
    return data.ticketNumber;
  },

  // Download PDF export
  async downloadPdf(bugReportId: string, ticketNumber: string): Promise<void> {
    const response = await fetch(`/api/v1/bug-reports/${bugReportId}/export/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticketNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  // Download Word export
  async downloadWord(bugReportId: string, ticketNumber: string): Promise<void> {
    const response = await fetch(`/api/v1/bug-reports/${bugReportId}/export/word`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download Word document');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticketNumber}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  // Get system info for auto-fill
  getSystemInfo(): { appVersion: string; browser: string; operatingSystem: string } {
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
    if (ua.includes('Win')) {
      operatingSystem = 'Windows';
    } else if (ua.includes('Mac')) {
      operatingSystem = 'macOS';
    } else if (ua.includes('Linux')) {
      operatingSystem = 'Linux';
    } else if (ua.includes('Android')) {
      operatingSystem = 'Android';
    } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
      operatingSystem = 'iOS';
    }

    return {
      appVersion: 'Draft v4', // This could be fetched from app config
      browser,
      operatingSystem,
    };
  },
};
