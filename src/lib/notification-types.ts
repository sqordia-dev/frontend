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

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  titleFr: string;
  titleEn: string;
  messageFr: string;
  messageEn: string;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  metadataJson: string | null;
  relatedEntityId: string | null;
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
