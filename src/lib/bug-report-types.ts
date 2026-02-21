// Bug Report Severity
export type BugReportSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

// Bug Report Status
export type BugReportStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed' | 'WontFix';

// Bug Report Attachment
export interface BugReportAttachment {
  id: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  storageUrl: string;
  createdAt: string;
}

// Bug Report (full details)
export interface BugReport {
  id: string;
  title: string;
  pageSection: string;
  severity: BugReportSeverity;
  description: string;
  status: BugReportStatus;
  ticketNumber: string;
  appVersion: string | null;
  browser: string | null;
  operatingSystem: string | null;
  reportedByUserId: string | null;
  reportedByUserName: string | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  resolvedByUserName: string | null;
  createdAt: string;
  lastModifiedAt: string | null;
  attachments: BugReportAttachment[];
}

// Bug Report Summary (for lists)
export interface BugReportSummary {
  id: string;
  title: string;
  pageSection: string;
  severity: BugReportSeverity;
  status: BugReportStatus;
  ticketNumber: string;
  reportedByUserName: string | null;
  createdAt: string;
  attachmentCount: number;
}

// Create Bug Report Request
export interface CreateBugReportRequest {
  title: string;
  pageSection: string;
  severity: BugReportSeverity;
  description: string;
  appVersion?: string;
  browser?: string;
  operatingSystem?: string;
}

// Update Bug Report Request
export interface UpdateBugReportRequest {
  title?: string;
  pageSection?: string;
  severity?: BugReportSeverity;
  description?: string;
  status?: BugReportStatus;
  resolutionNotes?: string;
}

// Page section options
export const PAGE_SECTION_OPTIONS = [
  { value: 'Landing Page', label: 'Landing Page' },
  { value: 'Questionnaire', label: 'Questionnaire' },
  { value: 'User Dashboard', label: 'User Dashboard' },
  { value: 'Settings', label: 'Settings' },
  { value: 'API Integration', label: 'API Integration' },
  { value: 'Business Plan', label: 'Business Plan' },
  { value: 'Admin Panel', label: 'Admin Panel' },
  { value: 'CMS Editor', label: 'CMS Editor' },
  { value: 'Other', label: 'Other' },
] as const;

// Severity options
export const SEVERITY_OPTIONS = [
  { value: 'Low', label: 'Low', color: 'blue' },
  { value: 'Medium', label: 'Medium', color: 'yellow' },
  { value: 'High', label: 'High', color: 'orange' },
  { value: 'Critical', label: 'Critical', color: 'red' },
] as const;

// Status options
export const STATUS_OPTIONS = [
  { value: 'Open', label: 'Open', color: 'blue' },
  { value: 'InProgress', label: 'In Progress', color: 'yellow' },
  { value: 'Resolved', label: 'Resolved', color: 'green' },
  { value: 'Closed', label: 'Closed', color: 'gray' },
  { value: 'WontFix', label: "Won't Fix", color: 'red' },
] as const;
