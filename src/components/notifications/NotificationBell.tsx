import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ArrowRight, Inbox, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useNotifications, useUnreadCount } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { groupNotificationsByDate } from '../../lib/utils';
import NotificationItem from './NotificationItem';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useUnreadCount();
  const {
    notifications,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const { language } = useTheme();
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const t = (fr: string, en: string) => (language === 'fr' ? fr : en);

  // Calculate dropdown position from bell button
  const updatePosition = useCallback(() => {
    if (!bellRef.current) return;
    const rect = bellRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, []);

  // Refresh when opening + calculate position
  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
      updatePosition();
    }
  }, [isOpen, refreshNotifications, updatePosition]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        bellRef.current && !bellRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const filteredNotifications = useMemo(
    () => (filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications),
    [filter, notifications],
  );

  const groups = useMemo(
    () => groupNotificationsByDate(filteredNotifications, language),
    [filteredNotifications, language],
  );

  return (
    <>
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center justify-center h-9 w-9 rounded-lg transition-all',
          isOpen
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-[18px] w-[18px]" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-momentum-orange text-white text-[10px] font-semibold px-0.5 ring-2 ring-background"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown - fixed position, rendered at top level */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Invisible backdrop to catch clicks */}
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />

            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed w-[380px] max-h-[520px] flex flex-col bg-background rounded-xl border border-border shadow-xl z-[9999] overflow-hidden"
              style={{
                top: dropdownPos.top,
                right: dropdownPos.right,
                transformOrigin: 'top right',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-semibold text-foreground">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-momentum-orange/10 text-momentum-orange text-[11px] font-semibold px-1.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    title={t('Tout marquer comme lu', 'Mark all as read')}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {t('Tout lu', 'Read all')}
                  </button>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-border shrink-0">
                <button
                  onClick={() => setFilter('all')}
                  className={cn(
                    'px-3 py-1 text-[12px] font-medium rounded-md transition-colors',
                    filter === 'all'
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  {t('Toutes', 'All')}
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={cn(
                    'px-3 py-1 text-[12px] font-medium rounded-md transition-colors flex items-center gap-1.5',
                    filter === 'unread'
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  {t('Non lues', 'Unread')}
                  {unreadCount > 0 && filter !== 'unread' && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-momentum-orange text-white text-[10px] font-semibold px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Notification list */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {isLoading && notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="h-6 w-6 border-2 border-muted border-t-foreground/30 rounded-full animate-spin" />
                    <p className="text-[12px] text-muted-foreground mt-3">
                      {t('Chargement...', 'Loading...')}
                    </p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted mb-3">
                      {filter === 'unread' ? (
                        <Sparkles className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Inbox className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-foreground text-center">
                      {filter === 'unread'
                        ? t('Tout est lu !', 'All caught up!')
                        : t('Aucune notification', 'No notifications')}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-1 text-center max-w-[220px]">
                      {filter === 'unread'
                        ? t(
                            'Vous avez lu toutes vos notifications.',
                            "You've read all your notifications.",
                          )
                        : t(
                            'Vos notifications apparaitront ici.',
                            'Notifications will appear here.',
                          )}
                    </p>
                    {filter === 'unread' && notifications.length > 0 && (
                      <button
                        onClick={() => setFilter('all')}
                        className="mt-2 text-[12px] font-medium text-momentum-orange hover:underline"
                      >
                        {t('Voir toutes', 'View all')}
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {groups.map((group) => (
                      <div key={group.label}>
                        <div className="sticky top-0 z-10 px-4 py-1.5 bg-muted/60 backdrop-blur-sm">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                            {language === 'fr' ? group.labelFr : group.label}
                          </span>
                        </div>
                        <div>
                          {group.notifications.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkRead={markAsRead}
                              onDelete={deleteNotification}
                              onNavigate={() => setIsOpen(false)}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-2 shrink-0">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-center gap-1.5 w-full py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted"
                >
                  {t('Voir toutes les notifications', 'View all notifications')}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
