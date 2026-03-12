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
  Flame,
  Eye,
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
  BusinessPlanGenerated: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
  BusinessPlanShared: 'text-strategy-blue bg-strategy-blue/10 dark:bg-strategy-blue/20 dark:text-blue-300',
  OrganizationInvitation: 'text-momentum-orange bg-momentum-orange/10 dark:bg-momentum-orange/20 dark:text-momentum-orange',
  SubscriptionExpiring: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  SystemAnnouncement: 'text-strategy-blue bg-strategy-blue/10 dark:bg-strategy-blue/20 dark:text-blue-300',
  ExportCompleted: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400',
  AICoachReply: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400',
  CommentAdded: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
};

function formatRelativeTime(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (lang === 'fr') {
    if (diffMin < 1) return "A l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-CA');
  }

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-CA');
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete?: (id: string) => void;
  onNavigate?: () => void;
  compact?: boolean;
}

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
  compact = false,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const { language } = useTheme();

  const Icon = ICON_MAP[notification.type] ?? Megaphone;
  const iconColor = ICON_COLOR_MAP[notification.type] ?? 'text-muted-foreground bg-muted';
  const title = language === 'fr' ? notification.titleFr : notification.titleEn;
  const message = language === 'fr' ? notification.messageFr : notification.messageEn;
  const priority = notification.priority || 'Normal';
  const isUnread = !notification.isRead;

  const handleClick = () => {
    if (isUnread) onMarkRead(notification.id);
    if (notification.actionUrl) {
      onNavigate?.();
      navigate(notification.actionUrl);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative flex items-start gap-3 transition-colors cursor-pointer',
        compact ? 'px-4 py-2.5' : 'px-5 py-4',
        isUnread
          ? 'bg-momentum-orange/[0.04] hover:bg-momentum-orange/[0.07] dark:bg-momentum-orange/[0.06] dark:hover:bg-momentum-orange/[0.1]'
          : 'hover:bg-muted/50',
        priority === 'Urgent' && 'border-l-2 border-l-red-500',
        priority === 'High' && 'border-l-2 border-l-amber-500',
      )}
    >
      {/* Unread dot */}
      {isUnread && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
          <span className="block h-1.5 w-1.5 rounded-full bg-momentum-orange" />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-lg shrink-0',
          compact ? 'h-8 w-8' : 'h-10 w-10',
          iconColor,
        )}
      >
        <Icon className={compact ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]'} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              'truncate leading-snug',
              compact ? 'text-[13px]' : 'text-[14px]',
              isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80',
            )}
          >
            {title}
          </p>
          {priority === 'Urgent' && (
            <Flame className="h-3 w-3 text-red-500 shrink-0" />
          )}
          {priority === 'High' && (
            <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
          )}
        </div>
        <p
          className={cn(
            'text-muted-foreground leading-relaxed mt-0.5',
            compact ? 'text-[12px] line-clamp-1' : 'text-[13px] line-clamp-2',
          )}
        >
          {message}
        </p>
        <p className="text-[11px] text-muted-foreground/50 mt-0.5">
          {formatRelativeTime(notification.createdAt, language)}
        </p>
      </div>

      {/* Hover actions */}
      <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUnread && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-momentum-orange hover:bg-momentum-orange/10 transition-colors"
            title={language === 'fr' ? 'Marquer comme lu' : 'Mark as read'}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title={language === 'fr' ? 'Supprimer' : 'Delete'}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
