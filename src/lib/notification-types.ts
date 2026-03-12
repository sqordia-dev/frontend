export type NotificationType =
  | 'BusinessPlanGenerated'
  | 'BusinessPlanShared'
  | 'OrganizationInvitation'
  | 'SubscriptionExpiring'
  | 'SystemAnnouncement'
  | 'ExportCompleted'
  | 'AICoachReply'
  | 'CommentAdded';

export type NotificationCategory =
  | 'BusinessPlan'
  | 'Organization'
  | 'Subscription'
  | 'System'
  | 'AI'
  | 'Collaboration';

export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type NotificationFrequency = 'Instant' | 'DailyDigest' | 'WeeklyDigest' | 'Disabled';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  titleFr: string;
  titleEn: string;
  messageFr: string;
  messageEn: string;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  metadataJson: string | null;
  relatedEntityId: string | null;
  groupKey: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationPreference {
  id: string;
  notificationType: NotificationType;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  emailFrequency: NotificationFrequency;
  soundEnabled: boolean;
}

export interface NotificationPreferencesListResponse {
  preferences: NotificationPreference[];
}

// Grouping helpers
export interface NotificationGroup {
  label: string;
  labelFr: string;
  notifications: Notification[];
}
