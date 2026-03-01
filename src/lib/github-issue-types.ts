export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueCategory = 'Bug' | 'Feature' | 'Enhancement' | 'Documentation' | 'Performance';
export type TargetRepository = 'frontend' | 'backend';

export interface CreateGitHubIssueRequest {
  title: string;
  description: string;
  severity: IssueSeverity;
  category: IssueCategory;
  repository: TargetRepository;
  reproductionSteps?: string;
  browser?: string;
  operatingSystem?: string;
  screenSize?: string;
  currentPageUrl?: string;
  screenshotUrls?: string[];
}

export interface GitHubIssueResponse {
  issueNumber: number;
  issueUrl: string;
  htmlUrl: string;
  title: string;
  state: string;
  repository: string;
  createdAt: string;
}

export type IssueState = 'open' | 'closed' | 'all';

export interface GitHubLabel {
  name: string;
  color: string;
  description?: string;
}

export interface GitHubUser {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
}

export interface GitHubIssueListItem {
  issueNumber: number;
  htmlUrl: string;
  title: string;
  state: string;
  repository: string;
  createdAt: string;
  updatedAt?: string;
  labels: GitHubLabel[];
  author?: GitHubUser;
  commentsCount: number;
  priority?: string;
  category?: string;
}

export interface GitHubIssueListResponse {
  issues: GitHubIssueListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface GitHubIssueDetailResponse {
  issueNumber: number;
  issueUrl: string;
  htmlUrl: string;
  title: string;
  body: string;
  state: string;
  repository: string;
  createdAt: string;
  updatedAt?: string;
  closedAt?: string;
  labels: GitHubLabel[];
  author?: GitHubUser;
  assignee?: GitHubUser;
  commentsCount: number;
}

export interface GitHubIssueStats {
  totalOpen: number;
  totalClosed: number;
  frontendOpen: number;
  frontendClosed: number;
  backendOpen: number;
  backendClosed: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface ListIssuesParams {
  repository?: 'frontend' | 'backend' | 'all';
  state?: IssueState;
  label?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: 'created' | 'updated';
  direction?: 'asc' | 'desc';
}

export interface SystemInfo {
  browser: string;
  operatingSystem: string;
  screenSize: string;
  currentPageUrl: string;
}

export const SEVERITY_OPTIONS: readonly {
  value: IssueSeverity;
  label: string;
  color: string;
  description: string;
}[] = [
  { value: 'Low', label: 'Low', color: 'blue', description: 'Minor issue, workaround available' },
  { value: 'Medium', label: 'Medium', color: 'yellow', description: 'Affects functionality but not critical' },
  { value: 'High', label: 'High', color: 'orange', description: 'Major functionality affected' },
  { value: 'Critical', label: 'Critical', color: 'red', description: 'System down or data loss' },
] as const;

export const CATEGORY_OPTIONS: readonly {
  value: IssueCategory;
  label: string;
  icon: string;
}[] = [
  { value: 'Bug', label: 'Bug', icon: 'Bug' },
  { value: 'Feature', label: 'Feature Request', icon: 'Lightbulb' },
  { value: 'Enhancement', label: 'Enhancement', icon: 'Sparkles' },
  { value: 'Documentation', label: 'Documentation', icon: 'FileText' },
  { value: 'Performance', label: 'Performance', icon: 'Zap' },
] as const;

export const REPOSITORY_OPTIONS: readonly {
  value: TargetRepository;
  label: string;
  description: string;
}[] = [
  { value: 'frontend', label: 'Frontend', description: 'UI components, pages, styling' },
  { value: 'backend', label: 'Backend', description: 'API, services, database' },
] as const;
