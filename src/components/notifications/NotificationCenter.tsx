import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Inbox,
  X,
  Settings,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { groupNotificationsByDate } from '../../lib/utils';
import NotificationItem from './NotificationItem';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    notifications,
    isLoading,
    isRealtime,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
  } = useNotifications();
  const { language } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const filteredNotifications = useMemo(
    () => filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications,
    [filter, notifications],
  );
  const groups = useMemo(
    () => groupNotificationsByDate(filteredNotifications, language),
    [filteredNotifications, language],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[70]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-950 shadow-2xl z-[80] flex flex-col border-l border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      {language === 'fr' ? 'Notifications' : 'Notifications'}
                    </h2>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isRealtime ? (
                      <Wifi className="h-3 w-3 text-green-500" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {isRealtime
                        ? (language === 'fr' ? 'Temps réel' : 'Real-time')
                        : (language === 'fr' ? 'Polling' : 'Polling')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title={language === 'fr' ? 'Tout marquer comme lu' : 'Mark all read'}
                  >
                    <CheckCheck className="h-4.5 w-4.5" />
                  </button>
                )}
                <Link
                  to="/notifications/preferences"
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={language === 'fr' ? 'Paramètres' : 'Settings'}
                >
                  <Settings className="h-4.5 w-4.5" />
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 px-5 py-2 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {language === 'fr' ? 'Toutes' : 'All'}
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filter === 'unread'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {language === 'fr' ? 'Non lues' : 'Unread'}
                {unreadCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold text-blue-500">{unreadCount}</span>
                )}
              </button>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                    <Inbox className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium">
                    {filter === 'unread'
                      ? (language === 'fr' ? 'Aucune notification non lue' : 'No unread notifications')
                      : (language === 'fr' ? 'Aucune notification' : 'No notifications')}
                  </p>
                  <p className="text-xs mt-1 text-gray-400">
                    {language === 'fr'
                      ? 'Vous recevrez des notifications ici'
                      : "You'll receive notifications here"}
                  </p>
                </div>
              ) : (
                <div>
                  {groups.map(group => (
                    <div key={group.label}>
                      <div className="sticky top-0 z-10 px-5 py-2 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          {language === 'fr' ? group.labelFr : group.label}
                        </span>
                      </div>
                      <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {group.notifications.map(notification => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkRead={markAsRead}
                            onDelete={deleteNotification}
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
            <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3">
              <Link
                to="/notifications"
                onClick={onClose}
                className="block w-full text-center py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                {language === 'fr' ? 'Voir toutes les notifications' : 'View all notifications'}
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
