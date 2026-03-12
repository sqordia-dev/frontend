import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Inbox,
  Filter,
  Trash2,
  FileCheck,
  Share2,
  UserPlus,
  AlertTriangle,
  Megaphone,
  Download,
  Bot,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { notificationService } from '../lib/notification-service';
import type {
  Notification,
  NotificationCategory,
  NotificationType,
  NotificationGroup,
} from '../lib/notification-types';
import NotificationItem from '../components/notifications/NotificationItem';

type ReadFilter = 'all' | 'unread' | 'read';

const CATEGORIES: { value: NotificationCategory | ''; labelFr: string; labelEn: string; icon: LucideIcon }[] = [
  { value: '', labelFr: 'Toutes', labelEn: 'All', icon: Bell },
  { value: 'BusinessPlan', labelFr: "Plan d'affaires", labelEn: 'Business Plan', icon: FileCheck },
  { value: 'Organization', labelFr: 'Organisation', labelEn: 'Organization', icon: UserPlus },
  { value: 'Subscription', labelFr: 'Abonnement', labelEn: 'Subscription', icon: AlertTriangle },
  { value: 'System', labelFr: 'Système', labelEn: 'System', icon: Megaphone },
  { value: 'AI', labelFr: 'IA', labelEn: 'AI', icon: Bot },
  { value: 'Collaboration', labelFr: 'Collaboration', labelEn: 'Collaboration', icon: MessageSquare },
];

function groupByDate(notifications: Notification[], lang: string): NotificationGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const monthAgo = new Date(today.getTime() - 30 * 86400000);

  const groups: Record<string, NotificationGroup> = {};

  for (const n of notifications) {
    const date = new Date(n.createdAt);
    let key: string, label: string, labelFr: string;

    if (date >= today) {
      key = 'today'; label = 'Today'; labelFr = "Aujourd'hui";
    } else if (date >= yesterday) {
      key = 'yesterday'; label = 'Yesterday'; labelFr = 'Hier';
    } else if (date >= weekAgo) {
      key = 'this-week'; label = 'This week'; labelFr = 'Cette semaine';
    } else if (date >= monthAgo) {
      key = 'this-month'; label = 'This month'; labelFr = 'Ce mois';
    } else {
      key = 'older'; label = 'Older'; labelFr = 'Plus ancien';
    }

    if (!groups[key]) groups[key] = { label, labelFr, notifications: [] };
    groups[key].notifications.push(n);
  }

  return ['today', 'yesterday', 'this-week', 'this-month', 'older']
    .filter(k => groups[k])
    .map(k => groups[k]);
}

export default function NotificationsPage() {
  const { language } = useTheme();
  const { markAsRead: ctxMarkAsRead, markAllAsRead: ctxMarkAllAsRead, deleteNotification: ctxDelete, refreshNotifications } = useNotifications();
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
          page, 30, isRead, categoryFilter || undefined,
        );
        setNotifications(prev => (append ? [...prev, ...result.items] : result.items));
        setHasNextPage(result.hasNextPage);
        setTotalCount(result.totalCount);
        setPageNumber(page);
      } catch {
        // Silently fail
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
    await ctxMarkAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
    );
  };

  const handleDelete = async (id: string) => {
    await ctxDelete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setTotalCount(prev => prev - 1);
  };

  const handleMarkAllRead = async () => {
    await ctxMarkAllAsRead();
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
    );
  };

  const handleLoadMore = () => fetchNotifications(pageNumber + 1, true);

  const readFilterTabs: { value: ReadFilter; labelFr: string; labelEn: string }[] = [
    { value: 'all', labelFr: 'Toutes', labelEn: 'All' },
    { value: 'unread', labelFr: 'Non lues', labelEn: 'Unread' },
    { value: 'read', labelFr: 'Lues', labelEn: 'Read' },
  ];

  const unreadInView = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
  const groups = useMemo(() => groupByDate(notifications, language), [notifications, language]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'fr' ? 'Centre de notifications' : 'Notification Center'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {totalCount} {language === 'fr' ? 'notification(s)' : 'notification(s)'}
              {unreadInView > 0 && (
                <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                  {unreadInView} {language === 'fr' ? 'non lue(s)' : 'unread'}
                </span>
              )}
            </p>
          </div>
        </div>

        {unreadInView > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            {language === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Read/Unread tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {readFilterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setReadFilter(tab.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                readFilter === tab.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
              )}
            >
              {language === 'fr' ? tab.labelFr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = categoryFilter === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                )}
              >
                <Icon className="h-3 w-3" />
                {language === 'fr' ? cat.labelFr : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
              <Inbox className="h-8 w-8" />
            </div>
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
          <div>
            {groups.map(group => (
              <div key={group.label}>
                <div className="sticky top-0 z-10 px-5 py-2.5 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {language === 'fr' ? group.labelFr : group.label}
                    <span className="ml-2 text-gray-400 dark:text-gray-500 font-normal">
                      ({group.notifications.length})
                    </span>
                  </span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {group.notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasNextPage && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors disabled:opacity-50"
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
