import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Inbox, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService } from '../lib/notification-service';
import type { Notification, NotificationCategory } from '../lib/notification-types';
import NotificationItem from '../components/notifications/NotificationItem';

type ReadFilter = 'all' | 'unread' | 'read';

const CATEGORIES: { value: NotificationCategory | ''; labelFr: string; labelEn: string }[] = [
  { value: '', labelFr: 'Toutes', labelEn: 'All' },
  { value: 'BusinessPlan', labelFr: "Plan d'affaires", labelEn: 'Business Plan' },
  { value: 'Organization', labelFr: 'Organisation', labelEn: 'Organization' },
  { value: 'Subscription', labelFr: 'Abonnement', labelEn: 'Subscription' },
  { value: 'System', labelFr: 'Systeme', labelEn: 'System' },
  { value: 'AI', labelFr: 'IA', labelEn: 'AI' },
  { value: 'Collaboration', labelFr: 'Collaboration', labelEn: 'Collaboration' },
];

export default function NotificationsPage() {
  const { language } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = useCallback(
    async (page: number, append = false) => {
      setIsLoading(true);
      try {
        const isRead = readFilter === 'unread' ? false : readFilter === 'read' ? true : undefined;
        const result = await notificationService.getNotifications(
          page,
          20,
          isRead,
          categoryFilter || undefined,
        );
        setNotifications(prev => (append ? [...prev, ...result.items] : result.items));
        setHasNextPage(result.hasNextPage);
        setTotalCount(result.totalCount);
        setPageNumber(page);
      } catch {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    },
    [readFilter, categoryFilter],
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
      );
    } catch {
      // Silently fail
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotalCount(prev => prev - 1);
    } catch {
      // Silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
      );
    } catch {
      // Silently fail
    }
  };

  const handleLoadMore = () => {
    fetchNotifications(pageNumber + 1, true);
  };

  const readFilterTabs: { value: ReadFilter; labelFr: string; labelEn: string }[] = [
    { value: 'all', labelFr: 'Toutes', labelEn: 'All' },
    { value: 'unread', labelFr: 'Non lues', labelEn: 'Unread' },
    { value: 'read', labelFr: 'Lues', labelEn: 'Read' },
  ];

  const unreadInView = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {language === 'fr' ? 'Notifications' : 'Notifications'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalCount} {language === 'fr' ? 'notification(s)' : 'notification(s)'}
            </p>
          </div>
        </div>

        {unreadInView > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            {language === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Read/Unread tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {readFilterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setReadFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                readFilter === tab.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
              )}
            >
              {language === 'fr' ? tab.labelFr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 appearance-none cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {language === 'fr' ? cat.labelFr : cat.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <Inbox className="h-12 w-12 mb-3" />
            <p className="text-base font-medium">
              {language === 'fr' ? 'Aucune notification' : 'No notifications'}
            </p>
            <p className="text-sm mt-1">
              {language === 'fr'
                ? 'Vous recevrez des notifications ici'
                : "You'll receive notifications here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasNextPage && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading
                ? (language === 'fr' ? 'Chargement...' : 'Loading...')
                : (language === 'fr' ? 'Charger plus' : 'Load more')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
