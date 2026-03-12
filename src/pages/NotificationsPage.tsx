import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Inbox,
  Settings,
  FileCheck,
  Share2,
  UserPlus,
  AlertTriangle,
  Megaphone,
  Download,
  Bot,
  MessageSquare,
  ChevronDown,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { notificationService } from '../lib/notification-service';
import type {
  Notification,
  NotificationCategory,
  NotificationGroup,
} from '../lib/notification-types';
import NotificationItem from '../components/notifications/NotificationItem';

type ReadFilter = 'all' | 'unread' | 'read';

const CATEGORIES: { value: NotificationCategory | ''; labelFr: string; labelEn: string; icon: LucideIcon }[] = [
  { value: '', labelFr: 'Toutes', labelEn: 'All', icon: Bell },
  { value: 'BusinessPlan', labelFr: "Plan d'affaires", labelEn: 'Business Plan', icon: FileCheck },
  { value: 'Organization', labelFr: 'Organisation', labelEn: 'Organization', icon: UserPlus },
  { value: 'Subscription', labelFr: 'Abonnement', labelEn: 'Subscription', icon: AlertTriangle },
  { value: 'System', labelFr: 'Systeme', labelEn: 'System', icon: Megaphone },
  { value: 'AI', labelFr: 'IA', labelEn: 'AI', icon: Bot },
  { value: 'Collaboration', labelFr: 'Collaboration', labelEn: 'Collaboration', icon: MessageSquare },
];

function groupByDate(notifications: Notification[], _lang: string): NotificationGroup[] {
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
  const { markAsRead: ctxMarkAsRead, markAllAsRead: ctxMarkAllAsRead, deleteNotification: ctxDelete } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = useCallback(
    async (page: number, append = false) => {
      if (page === 1) setIsLoading(true);
      try {
        const isRead = readFilter === 'unread' ? false : readFilter === 'read' ? true : undefined;
        const result = await notificationService.getNotifications(
          page, 30, isRead, categoryFilter || undefined,
        );
        setNotifications(prev => (append ? [...prev, ...result.items] : result.items));
        setHasNextPage(result.hasNextPage);
        setTotalCount(result.totalCount);
        setPageNumber(page);
      } catch (err) {
        console.error('[NotificationsPage] Failed to fetch notifications:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [readFilter, categoryFilter],
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications(1);
    setIsRefreshing(false);
  };

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
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-strategy-blue text-white shadow-lg shadow-strategy-blue/20">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-display-sm font-heading text-foreground tracking-tight">
              {language === 'fr' ? 'Centre de notifications' : 'Notification Center'}
            </h1>
            <p className="text-body-sm text-muted-foreground mt-0.5">
              {totalCount} {language === 'fr' ? 'notification(s)' : 'notification(s)'}
              {unreadInView > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-label-sm bg-momentum-orange/10 text-momentum-orange font-semibold">
                  {unreadInView} {language === 'fr' ? 'non lue(s)' : 'unread'}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 text-label-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all disabled:opacity-50"
            title={language === 'fr' ? 'Rafraichir' : 'Refresh'}
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </button>
          {unreadInView > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 text-label-sm font-medium text-momentum-orange hover:bg-momentum-orange/10 rounded-xl transition-all"
            >
              <CheckCheck className="h-4 w-4" />
              {language === 'fr' ? 'Tout marquer lu' : 'Mark all read'}
            </button>
          )}
          <Link
            to="/notifications/preferences"
            className="flex items-center gap-2 px-4 py-2 text-label-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
          >
            <Settings className="h-4 w-4" />
            {language === 'fr' ? 'Preferences' : 'Preferences'}
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
      >
        {/* Read/Unread tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl shrink-0">
          {readFilterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setReadFilter(tab.value)}
              className={cn(
                'px-4 py-2 text-label-sm rounded-lg transition-all',
                readFilter === tab.value
                  ? 'bg-card text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
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
                  'flex items-center gap-1.5 px-3 py-1.5 text-label-sm rounded-full border transition-all',
                  isActive
                    ? 'bg-momentum-orange/10 border-momentum-orange/30 text-momentum-orange font-semibold'
                    : 'bg-card border-border text-muted-foreground hover:border-momentum-orange/30 hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {language === 'fr' ? cat.labelFr : cat.labelEn}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Notifications list */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
      >
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-8 w-8 border-2 border-muted border-t-momentum-orange rounded-full animate-spin" />
            <p className="text-label-sm text-muted-foreground mt-4">
              {language === 'fr' ? 'Chargement...' : 'Loading...'}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
              <Inbox className="h-7 w-7" />
            </div>
            <p className="text-heading-sm font-heading text-foreground">
              {language === 'fr' ? 'Aucune notification' : 'No notifications'}
            </p>
            <p className="text-body-sm text-muted-foreground mt-1.5 max-w-xs text-center">
              {language === 'fr'
                ? 'Vos notifications apparaitront ici lorsque vous en recevrez.'
                : "You'll see notifications here when you get them."}
            </p>
          </div>
        ) : (
          <div>
            {groups.map((group, groupIdx) => (
              <div key={group.label}>
                <div className="sticky top-0 z-10 px-5 py-2.5 bg-muted/80 backdrop-blur-sm border-b border-border">
                  <span className="text-label-sm uppercase tracking-wider text-muted-foreground font-semibold">
                    {language === 'fr' ? group.labelFr : group.label}
                    <span className="ml-2 text-muted-foreground/60 font-normal">
                      ({group.notifications.length})
                    </span>
                  </span>
                </div>
                <div className="divide-y divide-border/50">
                  {group.notifications.map((notification, idx) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                    >
                      <NotificationItem
                        notification={notification}
                        onMarkRead={handleMarkRead}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasNextPage && (
          <div className="border-t border-border p-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-label-sm font-medium text-momentum-orange hover:bg-momentum-orange/10 rounded-xl transition-all disabled:opacity-50"
            >
              <ChevronDown className="h-4 w-4" />
              {isLoading
                ? (language === 'fr' ? 'Chargement...' : 'Loading...')
                : (language === 'fr' ? 'Charger plus' : 'Load more')}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
