import { apiClient } from './api-client';
import type {
  Notification,
  NotificationListResponse,
  UnreadCountResponse,
} from './notification-types';

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

export const notificationService = {
  async getNotifications(
    pageNumber = 1,
    pageSize = 20,
    isRead?: boolean,
    category?: string,
  ): Promise<NotificationListResponse> {
    const params: Record<string, string> = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };
    if (isRead !== undefined) params.isRead = isRead.toString();
    if (category) params.category = category;
    const response = await apiClient.get<NotificationListResponse>(
      '/api/v1/notifications',
      params,
    );
    return unwrap<NotificationListResponse>(response.data);
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await apiClient.get<UnreadCountResponse>(
      '/api/v1/notifications/unread-count',
    );
    return unwrap<UnreadCountResponse>(response.data);
  },

  async getNotification(id: string): Promise<Notification> {
    const response = await apiClient.get<Notification>(
      `/api/v1/notifications/${id}`,
    );
    return unwrap<Notification>(response.data);
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/api/v1/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/api/v1/notifications/mark-all-read');
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/notifications/${id}`);
  },
};
