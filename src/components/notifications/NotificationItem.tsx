import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Share2,
  UserPlus,
  AlertTriangle,
  Megaphone,
  Download,
  Bot,
  MessageSquare,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import type { Notification, NotificationType } from '../../lib/notification-types';

const ICON_MAP: Record<NotificationType, LucideIcon> = {
  BusinessPlanGenerated: FileCheck,
  BusinessPlanShared: Share2,
  OrganizationInvitation: UserPlus,
  SubscriptionExpiring: AlertTriangle,
  SystemAnnouncement: Megaphone,
  ExportCompleted: Download,
  AICoachReply: Bot,
  CommentAdded: MessageSquare,
};

const ICON_COLOR_MAP: Record<NotificationType, string> = {
  BusinessPlanGenerated: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  BusinessPlanShared: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  OrganizationInvitation: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  SubscriptionExpiring: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  SystemAnnouncement: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  ExportCompleted: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
  AICoachReply: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  CommentAdded: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
};

function formatRelativeTime(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (lang === 'fr') {
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-CA');
  }

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-CA');
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  compact = false,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const { language } = useTheme();

  const Icon = ICON_MAP[notification.type] ?? Megaphone;
  const iconColor = ICON_COLOR_MAP[notification.type] ?? 'text-gray-500 bg-gray-50 dark:bg-gray-800';
  const title = language === 'fr' ? notification.titleFr : notification.titleEn;
  const message = language === 'fr' ? notification.messageFr : notification.messageEn;

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex items-start gap-3 rounded-lg transition-colors cursor-pointer',
        compact ? 'px-3 py-2.5' : 'px-4 py-3',
        !notification.isRead
          ? 'bg-blue-50/50 dark:bg-blue-900/10'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
      )}
    >
      {/* Unread indicator */}
      <div className="flex items-center pt-1 shrink-0">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            !notification.isRead ? 'bg-blue-500' : 'bg-transparent',
          )}
        />
      </div>

      {/* Icon */}
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', iconColor)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm truncate',
            !notification.isRead
              ? 'font-semibold text-gray-900 dark:text-white'
              : 'font-medium text-gray-700 dark:text-gray-300',
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'text-xs text-gray-500 dark:text-gray-400 mt-0.5',
            compact ? 'truncate' : 'line-clamp-2',
          )}
        >
          {message}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
          {formatRelativeTime(notification.createdAt, language)}
        </p>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-all"
          title={language === 'fr' ? 'Supprimer' : 'Delete'}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
