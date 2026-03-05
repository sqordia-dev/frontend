import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  FileText,
  Building2,
  BarChart3,
  Package,
  Megaphone,
  Cog,
  Users,
  DollarSign,
  Wallet,
  Paperclip,
  Grid3X3,
  AlertTriangle,
  Calendar,
  LogOut,
  BookOpen,
  List,
  Check,
  Loader2,
  FileType,
  ArrowLeft,
  Home,
  Sun,
  Moon,
  Settings,
  User,
  type LucideIcon,
} from 'lucide-react';
import { PlanSection } from '../../types/preview';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../lib/auth-service';
import type { User as UserType } from '../../lib/types';
import LanguageDropdown from '../layout/LanguageDropdown';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export type ExportFormat = 'pdf' | 'word';

interface CollapsibleSidebarProps {
  planName: string;
  planStatus?: string;
  sections: PlanSection[];
  activeSectionId: string | null;
  onSectionClick: (sectionId: string) => void;
  onExportClick: (format?: ExportFormat) => void;
  onShareClick: () => void;
  isCoverPageActive?: boolean;
  onCoverPageClick?: () => void;
  isTOCActive?: boolean;
  onTOCClick?: () => void;
  isExporting?: boolean;
  exportingFormat?: ExportFormat | null;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
}

// Icon mapping for section titles
const sectionIconMap: Record<string, LucideIcon> = {
  'executive summary': FileText,
  'company overview': Building2,
  'company description': Building2,
  'market analysis': BarChart3,
  'market research': BarChart3,
  'products': Package,
  'services': Package,
  'products and services': Package,
  'marketing': Megaphone,
  'marketing strategy': Megaphone,
  'operations': Cog,
  'operations plan': Cog,
  'management': Users,
  'management team': Users,
  'team': Users,
  'financial': DollarSign,
  'financial projections': DollarSign,
  'financials': DollarSign,
  'funding': Wallet,
  'funding request': Wallet,
  'swot': Grid3X3,
  'swot analysis': Grid3X3,
  'risk': AlertTriangle,
  'risks': AlertTriangle,
  'timeline': Calendar,
  'milestones': Calendar,
  'exit': LogOut,
  'exit strategy': LogOut,
  'appendix': Paperclip,
};

function getSectionIcon(title: string): LucideIcon {
  const normalizedTitle = title.toLowerCase().trim();
  if (sectionIconMap[normalizedTitle]) return sectionIconMap[normalizedTitle];
  for (const [key, icon] of Object.entries(sectionIconMap)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) return icon;
  }
  return FileText;
}

/**
 * CollapsibleSidebar - Clean, minimal sidebar for preview page
 *
 * Features:
 * - Collapsible: 260px expanded, 56px collapsed
 * - Clean white background with subtle border
 * - Minimal section list with orange active indicator
 * - Progress bar at bottom
 * - Export/Share actions
 */
export default function CollapsibleSidebar({
  planName,
  planStatus = 'Draft',
  sections,
  activeSectionId,
  onSectionClick,
  onExportClick,
  onShareClick,
  isCoverPageActive = false,
  onCoverPageClick,
  isTOCActive = false,
  onTOCClick,
  isExporting = false,
  exportingFormat: _exportingFormat = null,
  defaultCollapsed = false,
  onCollapseChange,
}: CollapsibleSidebarProps) {
  const navigate = useNavigate();
  const { language, t, theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserType | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    authService.getCurrentUser()
      .then((u) => { setUser(u); setImgError(false); })
      .catch(() => {});
  }, []);

  const initials = user
    ? `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`
    : '';

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem('sqordia-sidebar-collapsed');
    return stored ? JSON.parse(stored) : defaultCollapsed;
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem('sqordia-sidebar-collapsed', JSON.stringify(isCollapsed));
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate completion
  const completedCount = sections.filter(s => s.content && s.content.trim().length > 0).length;
  const completionPercent = sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0;

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Sidebar widths
  const EXPANDED_WIDTH = 260;
  const COLLAPSED_WIDTH = 56;

  return (
    <motion.aside
      className={cn(
        'fixed left-0 top-0 h-full z-40',
        'bg-white dark:bg-card',
        'border-r border-warm-gray-100 dark:border-border',
        'flex flex-col',
        'shadow-sm',
        'hidden lg:flex' // Hide on mobile
      )}
      initial={false}
      animate={{ width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
    >
      {/* Header */}
      <div className={cn(
        'border-b border-warm-gray-100 dark:border-border',
        isCollapsed ? 'px-2 py-3' : 'px-3 py-3'
      )}>
        {/* Back to Dashboard button */}
        <button
          onClick={() => navigate('/dashboard')}
          className={cn(
            'flex items-center gap-2 w-full rounded-lg transition-colors duration-150',
            'text-warm-gray-500 hover:text-warm-gray-700 dark:text-warm-gray-400 dark:hover:text-warm-gray-200',
            'hover:bg-warm-gray-100 dark:hover:bg-secondary',
            isCollapsed ? 'p-2 justify-center' : 'px-2 py-1.5 mb-3'
          )}
          aria-label={t('preview.sidebar.backToDashboard')}
        >
          {isCollapsed ? (
            <Home size={18} />
          ) : (
            <>
              <ArrowLeft size={16} />
              <span className="text-xs font-medium">
                {t('preview.sidebar.dashboard')}
              </span>
            </>
          )}
        </button>

        {/* Plan name and collapse toggle */}
        <div className={cn(
          'flex items-center gap-2',
          isCollapsed ? 'justify-center' : ''
        )}>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0 mr-1"
              >
                <h2
                  className="font-semibold text-warm-gray-900 dark:text-white text-sm leading-tight line-clamp-2"
                  title={planName}
                >
                  {planName}
                </h2>
                <div className="mt-1">
                  <span className={cn(
                    'inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded',
                    planStatus.toLowerCase().includes('generated') || planStatus.toLowerCase().includes('généré')
                      ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-warm-gray-100 text-warm-gray-500 dark:bg-secondary dark:text-warm-gray-400'
                  )}>
                    {planStatus}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleCollapse}
            className={cn(
              'flex-shrink-0 p-1.5 rounded-md',
              'text-warm-gray-400 hover:text-warm-gray-600 dark:hover:text-warm-gray-300',
              'hover:bg-warm-gray-100 dark:hover:bg-secondary',
              'transition-colors duration-150'
            )}
            aria-label={isCollapsed ? t('preview.sidebar.expandSidebar') : t('preview.sidebar.collapseSidebar')}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        'flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-warm-gray-200 dark:scrollbar-thumb-warm-gray-700',
        isCollapsed ? 'py-2 px-1' : 'py-3 px-2'
      )}>
        {/* Cover Page */}
        {onCoverPageClick && (
          <NavItem
            icon={BookOpen}
            label={t('preview.sidebar.coverPage')}
            isActive={isCoverPageActive}
            isCollapsed={isCollapsed}
            onClick={onCoverPageClick}
          />
        )}

        {/* Table of Contents */}
        {onTOCClick && (
          <NavItem
            icon={List}
            label={t('preview.sidebar.toc')}
            isActive={isTOCActive}
            isCollapsed={isCollapsed}
            onClick={onTOCClick}
          />
        )}

        {/* Divider */}
        {!isCollapsed && (
          <div className="my-2 mx-2 border-t border-warm-gray-100 dark:border-border" />
        )}
        {isCollapsed && <div className="my-2" />}

        {/* Sections */}
        <div className={cn(!isCollapsed && 'space-y-0.5')}>
          {sections.map((section, index) => {
            const Icon = getSectionIcon(section.title);
            const hasContent = Boolean(section.content && section.content.trim().length > 0);
            const isActive = activeSectionId === section.id;

            return (
              <NavItem
                key={section.id}
                icon={Icon}
                label={section.title}
                number={index + 1}
                isActive={isActive}
                isCollapsed={isCollapsed}
                isCompleted={hasContent}
                onClick={() => onSectionClick(section.id)}
              />
            );
          })}
        </div>
      </nav>

      {/* Progress Section */}
      <div className={cn(
        'border-t border-warm-gray-100 dark:border-border',
        isCollapsed ? 'px-2 py-3' : 'px-4 py-3'
      )}>
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-warm-gray-500 dark:text-warm-gray-400 uppercase tracking-wide">
                  {t('preview.sidebar.progress')}
                </span>
                <span className="text-sm font-semibold text-momentum-orange">
                  {completionPercent}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-warm-gray-100 dark:bg-secondary overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-momentum-orange to-orange-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
              <p className="text-[11px] text-warm-gray-400 dark:text-warm-gray-500 mt-1.5">
                {completedCount} / {sections.length} {t('preview.sidebar.sections')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-8 h-8 relative">
                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-warm-gray-100 dark:text-secondary"
                  />
                  <motion.circle
                    cx="16"
                    cy="16"
                    r="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-momentum-orange"
                    initial={{ strokeDasharray: '0 75.4' }}
                    animate={{ strokeDasharray: `${completionPercent * 0.754} 75.4` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-warm-gray-600 dark:text-warm-gray-300">
                  {completionPercent}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Controls */}
      <div className={cn(
        'border-t border-warm-gray-100 dark:border-border',
        isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'px-3 py-2 flex items-center gap-2'
      )}>
        {!isCollapsed && <LanguageDropdown variant="toggle" className="flex-shrink-0" />}

        <button
          onClick={toggleTheme}
          className={cn(
            'flex-shrink-0 p-1.5 rounded-md',
            'text-warm-gray-400 hover:text-warm-gray-600 dark:hover:text-warm-gray-300',
            'hover:bg-warm-gray-100 dark:hover:bg-secondary',
            'transition-colors duration-150'
          )}
          aria-label={theme === 'light' ? t('nav.switchToDark') : t('nav.switchToLight')}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center justify-center w-7 h-7 rounded-full ring-1 ring-warm-gray-200 dark:ring-border hover:ring-momentum-orange/50 transition-all overflow-hidden shrink-0"
              aria-label="User menu"
            >
              {user?.profilePictureUrl && !imgError ? (
                <img
                  src={user.profilePictureUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center bg-momentum-orange text-white text-[10px] font-semibold">
                  {initials || <User className="w-3.5 h-3.5" />}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side={isCollapsed ? 'right' : 'top'} className="w-48" sideOffset={8}>
            {user && (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                {t('nav.settings')}
              </Link>
            </DropdownMenuItem>
            {isCollapsed && (
              <div className="px-2 py-1.5">
                <LanguageDropdown variant="toggle" className="w-full justify-center" />
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4" />
              {t('nav.logout') || 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actions */}
      <div className={cn(
        'border-t border-warm-gray-100 dark:border-border',
        isCollapsed ? 'p-2 space-y-2' : 'p-3 flex gap-2'
      )}>
        {/* Export */}
        <div ref={exportMenuRef} className={cn('relative', !isCollapsed && 'flex-1')}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg',
              'bg-momentum-orange text-white font-medium',
              'hover:bg-orange-600 active:bg-orange-700',
              'transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-momentum-orange/50 focus:ring-offset-1',
              isCollapsed ? 'w-10 h-10' : 'w-full px-4 py-2.5 text-sm'
            )}
            title={t('preview.sidebar.export')}
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {!isCollapsed && (
              <span>
                {isExporting
                  ? t('preview.sidebar.exporting')
                  : t('preview.sidebar.export')}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showExportMenu && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute bottom-full left-0 right-0 mb-2',
                  'bg-white dark:bg-secondary',
                  'border border-warm-gray-200 dark:border-border',
                  'rounded-lg shadow-elevated overflow-hidden'
                )}
              >
                <button
                  onClick={() => { onExportClick('pdf'); setShowExportMenu(false); }}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2.5 text-sm',
                    'text-warm-gray-700 dark:text-warm-gray-200',
                    'hover:bg-warm-gray-50 dark:hover:bg-secondary',
                    'transition-colors'
                  )}
                >
                  <Download size={15} className="text-red-500" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => { onExportClick('word'); setShowExportMenu(false); }}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2.5 text-sm',
                    'text-warm-gray-700 dark:text-warm-gray-200',
                    'hover:bg-warm-gray-50 dark:hover:bg-secondary',
                    'transition-colors'
                  )}
                >
                  <FileType size={15} className="text-blue-500" />
                  <span>Word</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Share */}
        <button
          onClick={onShareClick}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg',
            'border border-warm-gray-200 dark:border-border',
            'text-warm-gray-600 dark:text-warm-gray-300',
            'hover:bg-warm-gray-50 dark:hover:bg-secondary',
            'hover:border-warm-gray-300 dark:hover:border-border',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-warm-gray-300/50 focus:ring-offset-1',
            isCollapsed ? 'w-10 h-10' : 'px-4 py-2.5 text-sm font-medium'
          )}
          title={t('preview.sidebar.share')}
        >
          <Share2 size={16} />
          {!isCollapsed && (
            <span>{t('preview.sidebar.share')}</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

/**
 * Navigation item component
 */
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  number?: number;
  isActive: boolean;
  isCollapsed: boolean;
  isCompleted?: boolean;
  onClick: () => void;
}

function NavItem({
  icon: Icon,
  label,
  number,
  isActive,
  isCollapsed,
  isCompleted = false,
  onClick,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full flex items-center group',
        'text-left transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange/50',
        isCollapsed
          ? 'justify-center px-0 py-2 mx-auto rounded-lg w-10 h-10'
          : 'gap-2.5 px-3 py-2 rounded-lg',
        isActive
          ? 'bg-orange-50 dark:bg-orange-900/20 text-warm-gray-900 dark:text-white'
          : 'text-warm-gray-600 dark:text-warm-gray-400 hover:bg-warm-gray-50 dark:hover:bg-secondary/50'
      )}
      title={isCollapsed ? `${number ? `${number}. ` : ''}${label}` : undefined}
    >
      {/* Active indicator - left bar */}
      {isActive && !isCollapsed && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-momentum-orange rounded-r-full"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}

      {/* Number badge (only when expanded) */}
      {!isCollapsed && number && (
        <span className={cn(
          'flex-shrink-0 w-5 h-5 flex items-center justify-center',
          'text-[10px] font-medium rounded',
          isActive
            ? 'text-momentum-orange'
            : 'text-warm-gray-400 dark:text-warm-gray-500'
        )}>
          {number}.
        </span>
      )}

      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 flex items-center justify-center',
        isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
        isActive
          ? 'text-momentum-orange'
          : 'text-warm-gray-400 dark:text-warm-gray-500 group-hover:text-warm-gray-600 dark:group-hover:text-warm-gray-300'
      )}>
        <Icon size={isCollapsed ? 18 : 16} />
      </div>

      {/* Label */}
      {!isCollapsed && (
        <span className={cn(
          'flex-1 text-[13px] leading-tight',
          'truncate',
          isActive ? 'font-medium' : ''
        )}>
          {label}
        </span>
      )}

      {/* Completed indicator */}
      {!isCollapsed && isCompleted && (
        <Check
          size={14}
          className="flex-shrink-0 text-green-500"
          strokeWidth={2.5}
        />
      )}

      {/* Completed dot in collapsed mode */}
      {isCollapsed && isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-card"
        />
      )}

      {/* Active indicator for collapsed mode - bottom bar */}
      {isActive && isCollapsed && (
        <motion.div
          layoutId="sidebar-active-indicator-collapsed"
          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-momentum-orange rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </button>
  );
}
