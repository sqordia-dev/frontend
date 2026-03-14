import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Notification, NotificationPreference } from '../lib/notification-types';
import { notificationService } from '../lib/notification-service';
import { startConnection, stopConnection, getConnection } from '../lib/signalr-service';
import { playNotificationSound } from '../lib/notification-sound';

interface NotificationContextValue {
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  isRealtime: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const POLL_INTERVAL = 60_000; // 60s fallback (SignalR is primary)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRealtime, setIsRealtime] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const prefsRef = useRef<NotificationPreference[]>([]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationService.getUnreadCount();
      if (mountedRef.current) setUnreadCount(result.count);
    } catch {
      // Silently fail
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch count and list independently so one failure doesn't block the other
      const countPromise = notificationService.getUnreadCount()
        .then(r => { if (mountedRef.current) setUnreadCount(r.count); })
        .catch(err => console.error('[Notifications] Failed to fetch unread count:', err));

      const listPromise = notificationService.getNotifications(1, 10)
        .then(r => { if (mountedRef.current) setNotifications(r.items); })
        .catch(err => console.error('[Notifications] Failed to fetch notification list:', err));

      await Promise.all([countPromise, listPromise]);
    } catch (err) {
      console.error('[Notifications] Unexpected error in refreshNotifications:', err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => {
        const wasUnread = prev.some(n => n.id === id && !n.isRead);
        if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n.id !== id);
      });
    } catch {
      // Silently fail
    }
  }, []);

  // SignalR connection
  useEffect(() => {
    // Auth is handled via HttpOnly cookies

    let cancelled = false;

    // Load preferences for sound setting
    notificationService.getPreferences()
      .then(prefs => { prefsRef.current = prefs; })
      .catch(() => { /* non-critical */ });

    const connectSignalR = async () => {
      try {
        await startConnection();
        const conn = getConnection();
        if (!conn || cancelled) return;

        const handleReceive = (notification: Notification) => {
          if (!mountedRef.current) return;
          setNotifications(prev => {
            if (prev.some(n => n.id === notification.id)) return prev;
            return [notification, ...prev].slice(0, 20);
          });
          setUnreadCount(prev => prev + 1);

          // Play sound if enabled for this notification type
          const pref = prefsRef.current.find(p => p.notificationType === notification.type);
          if (!pref || pref.soundEnabled) {
            playNotificationSound();
          }
        };

        const handleCountUpdated = (count: number) => {
          if (mountedRef.current) setUnreadCount(count);
        };

        conn.on('ReceiveNotification', handleReceive);
        conn.on('UnreadCountUpdated', handleCountUpdated);
        conn.onreconnected(() => {
          if (cancelled) return;
          setIsRealtime(true);
          fetchUnreadCount();
        });
        conn.onclose(() => {
          if (cancelled || !mountedRef.current) return;
          setIsRealtime(false);
        });

        setIsRealtime(true);
      } catch {
        setIsRealtime(false);
      }
    };

    connectSignalR();

    return () => {
      cancelled = true;
      const conn = getConnection();
      if (conn) {
        conn.off('ReceiveNotification');
        conn.off('UnreadCountUpdated');
      }
    };
  }, [fetchUnreadCount]);

  // Fallback polling (slower interval since SignalR is primary)
  useEffect(() => {
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUnreadCount]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopConnection();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        isLoading,
        isRealtime,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}

export function useUnreadCount() {
  const ctx = useContext(NotificationContext);
  return ctx?.unreadCount ?? 0;
}
