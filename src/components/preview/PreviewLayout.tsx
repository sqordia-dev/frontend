import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Menu, Download, Share2, Loader2, BookOpen, List, CheckCircle2, Sun, Moon, Settings, LogOut, User } from 'lucide-react';
import { PlanSection } from '../../types/preview';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../lib/auth-service';
import type { User as UserType } from '../../lib/types';
import CollapsibleSidebar, { ExportFormat } from './CollapsibleSidebar';
import QuickNavPill from './QuickNavPill';
import ReadingProgressBar from './ReadingProgressBar';
import MobileDrawer from './MobileDrawer';
import { Button } from '../ui/button';
import LanguageDropdown from '../layout/LanguageDropdown';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../ui/dropdown-menu';

/**
 * Context for sharing layout state between components
 */
interface PreviewLayoutContextValue {
  activeSectionId: string | null;
  sections: PlanSection[];
  scrollToSection: (sectionId: string) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const PreviewLayoutContext = createContext<PreviewLayoutContextValue | null>(null);

export function usePreviewLayout() {
  const context = useContext(PreviewLayoutContext);
  if (!context) {
    throw new Error('usePreviewLayout must be used within PreviewLayout');
  }
  return context;
}

interface PreviewLayoutProps {
  children: React.ReactNode;
  planTitle: string;
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
}

/**
 * PreviewLayout - Modern, minimal layout for business plan preview
 *
 * Features:
 * - Collapsible sidebar (desktop) with clean white design
 * - Mobile header + drawer navigation
 * - QuickNav pill for touch-friendly navigation
 * - Reading progress bar
 * - Warm gray background
 */
export default function PreviewLayout({
  children,
  planTitle,
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
  exportingFormat = null,
}: PreviewLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileNavigationTarget, setMobileNavigationTarget] = useState<string | null>(null);

  // Current section index for QuickNav
  const currentSectionIndex = activeSectionId
    ? sections.findIndex(s => s.id === activeSectionId)
    : 0;

  // Scroll to section handler
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onSectionClick(sectionId);
  }, [onSectionClick]);

  // QuickNav navigation handlers
  const handlePrevious = useCallback(() => {
    if (currentSectionIndex > 0) {
      const prevSection = sections[currentSectionIndex - 1];
      scrollToSection(prevSection.id);
    }
  }, [currentSectionIndex, sections, scrollToSection]);

  const handleNext = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      const nextSection = sections[currentSectionIndex + 1];
      scrollToSection(nextSection.id);
    }
  }, [currentSectionIndex, sections, scrollToSection]);

  // Context value
  const contextValue: PreviewLayoutContextValue = {
    activeSectionId,
    sections,
    scrollToSection,
    isSidebarCollapsed,
    setSidebarCollapsed: setIsSidebarCollapsed,
    isMobileMenuOpen,
    setMobileMenuOpen: setIsMobileMenuOpen,
  };

  return (
    <PreviewLayoutContext.Provider value={contextValue}>
      <div className="min-h-screen document-background">
        {/* Reading Progress Bar */}
        <ReadingProgressBar className="fixed top-0 left-0 right-0 z-50" />

        {/* Desktop Sidebar */}
        <CollapsibleSidebar
          planName={planTitle}
          planStatus={planStatus}
          sections={sections}
          activeSectionId={activeSectionId}
          onSectionClick={scrollToSection}
          onExportClick={onExportClick}
          onShareClick={onShareClick}
          isCoverPageActive={isCoverPageActive}
          onCoverPageClick={onCoverPageClick}
          isTOCActive={isTOCActive}
          onTOCClick={onTOCClick}
          isExporting={isExporting}
          exportingFormat={exportingFormat}
          defaultCollapsed={isSidebarCollapsed}
          onCollapseChange={setIsSidebarCollapsed}
        />

        {/* Mobile Header */}
        <MobileHeader
          planTitle={planTitle}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onExportClick={() => onExportClick()}
          onShareClick={onShareClick}
          isExporting={isExporting}
        />

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          planName={planTitle}
          navigationTarget={mobileNavigationTarget}
          onNavigationComplete={() => setMobileNavigationTarget(null)}
        >
          <MobileDrawerContent
            sections={sections}
            activeSectionId={activeSectionId}
            onSectionClick={(sectionId: string) => {
              // Set navigation target first, then close drawer
              // The drawer will scroll to the target after cleanup
              setMobileNavigationTarget(sectionId);
              onSectionClick(sectionId);
              setIsMobileMenuOpen(false);
            }}
            isCoverPageActive={isCoverPageActive}
            onCoverPageClick={() => {
              onCoverPageClick?.();
              setIsMobileMenuOpen(false);
            }}
            isTOCActive={isTOCActive}
            onTOCClick={() => {
              onTOCClick?.();
              setIsMobileMenuOpen(false);
            }}
            onExportClick={onExportClick}
            onShareClick={onShareClick}
            isExporting={isExporting}
          />
        </MobileDrawer>

        {/* Main Content Area */}
        <main id="main-content" className={cn(
          'min-h-screen',
          'pt-16 lg:pt-6 pb-32 lg:pb-16',
          'px-4 sm:px-6 lg:px-8'
        )}>
          {/* Desktop content with sidebar margin */}
          <div className="hidden lg:block">
            <motion.div
              animate={{
                marginLeft: isSidebarCollapsed ? 56 : 260,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="transition-[margin]"
            >
              <div className="mx-auto max-w-[880px] py-6">
                {/* Prominent Export CTA */}
                <ExportCTA
                  onExportClick={onExportClick}
                  isExporting={isExporting}
                  exportingFormat={exportingFormat}
                />
                <div className="document-page">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile/Tablet content (no sidebar margin) */}
          <div className="lg:hidden">
            <div className="mx-auto max-w-[880px]">
              {/* Prominent Export CTA */}
              <ExportCTA
                onExportClick={onExportClick}
                isExporting={isExporting}
                exportingFormat={exportingFormat}
              />
              <div className="document-page">
                {children}
              </div>
            </div>
          </div>
        </main>

        {/* Quick Nav Pill */}
        <QuickNavPill
          sections={sections}
          activeSectionId={activeSectionId}
          currentSectionIndex={currentSectionIndex >= 0 ? currentSectionIndex : 0}
          onSectionClick={scrollToSection}
          onPrevious={handlePrevious}
          onNext={handleNext}
          showThreshold={300}
          sidebarWidth={isSidebarCollapsed ? 56 : 260}
        />
      </div>
    </PreviewLayoutContext.Provider>
  );
}

/**
 * Mobile Header Component
 */
interface MobileHeaderProps {
  planTitle: string;
  onMenuClick: () => void;
  onExportClick: () => void;
  onShareClick: () => void;
  isExporting?: boolean;
}

function MobileHeader({
  planTitle,
  onMenuClick,
  onExportClick,
  onShareClick,
  isExporting = false,
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const { t, theme, toggleTheme } = useTheme();
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

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40',
        'lg:hidden',
        'h-14',
        'bg-white/95 dark:bg-card/95',
        'backdrop-blur-xl',
        'border-b border-warm-gray-200/50 dark:border-border/50'
      )}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Back + Menu */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate('/dashboard')}
            className="-ml-1 text-warm-gray-500 hover:text-warm-gray-700 dark:text-warm-gray-400 dark:hover:text-warm-gray-200"
            aria-label={t('preview.sidebar.backToDashboard')}
          >
            <ArrowLeft size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMenuClick}
            className="text-warm-gray-500 hover:text-warm-gray-700 dark:text-warm-gray-400 dark:hover:text-warm-gray-200"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Center: Title */}
        <h1 className="text-sm font-medium text-warm-gray-900 dark:text-white truncate max-w-[160px] sm:max-w-[220px]">
          {planTitle}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onExportClick}
            disabled={isExporting}
            className="text-warm-gray-500 hover:text-momentum-orange dark:text-warm-gray-400 dark:hover:text-momentum-orange"
            aria-label={t('preview.sidebar.export')}
          >
            {isExporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onShareClick}
            className="text-warm-gray-500 hover:text-warm-gray-700 dark:text-warm-gray-400 dark:hover:text-warm-gray-200"
            aria-label={t('preview.sidebar.share')}
          >
            <Share2 size={18} />
          </Button>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-warm-gray-200 dark:ring-border hover:ring-momentum-orange/50 transition-all overflow-hidden shrink-0"
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
                  <span className="w-full h-full flex items-center justify-center bg-momentum-orange text-white text-xs font-semibold">
                    {initials || <User className="w-4 h-4" />}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
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

              {/* Language toggle inside dropdown on mobile */}
              <div className="px-2 py-1.5">
                <LanguageDropdown variant="toggle" className="w-full justify-center" />
              </div>

              {/* Theme toggle */}
              <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-2 cursor-pointer">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {theme === 'light' ? t('nav.switchToDark') : t('nav.switchToLight')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4" />
                {t('nav.logout') || 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

/**
 * Prominent Export CTA - Always-visible export button in the main content header
 * Responsive: full text on desktop ("Export Plan"), icon-only on smallest mobile
 */
interface ExportCTAProps {
  onExportClick: (format?: ExportFormat) => void;
  isExporting?: boolean;
  exportingFormat?: ExportFormat | null;
}

function ExportCTA({
  onExportClick,
  isExporting = false,
  exportingFormat: _exportingFormat = null,
}: ExportCTAProps) {
  const { t } = useTheme();

  return (
    <div className="flex items-center justify-end mb-6">
      <button
        onClick={() => onExportClick()}
        disabled={isExporting}
        className={cn(
          'group relative inline-flex items-center justify-center gap-2.5',
          'bg-gradient-to-r from-[#FF6B00] to-[#E55F00]',
          'text-white font-semibold',
          'rounded-xl',
          'shadow-lg shadow-[#FF6B00]/25',
          'hover:from-[#E55F00] hover:to-[#CC4A00]',
          'hover:shadow-xl hover:shadow-[#FF6B00]/30',
          'hover:-translate-y-0.5 active:translate-y-0',
          'transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
          'focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 focus:ring-offset-2',
          'h-11 w-11 sm:w-auto sm:h-12 sm:px-6 sm:py-3'
        )}
        aria-label={t('preview.sidebar.exportPlan')}
      >
        {isExporting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Download size={20} className="shrink-0" />
        )}
        <span className="hidden sm:inline">
          {isExporting
            ? t('preview.sidebar.exporting')
            : t('preview.sidebar.exportPlan')}
        </span>
      </button>
    </div>
  );
}

/**
 * Mobile Drawer Content Component
 */
interface MobileDrawerContentProps {
  sections: PlanSection[];
  activeSectionId: string | null;
  onSectionClick: (sectionId: string) => void;
  isCoverPageActive?: boolean;
  onCoverPageClick?: () => void;
  isTOCActive?: boolean;
  onTOCClick?: () => void;
  onExportClick: (format?: ExportFormat) => void;
  onShareClick: () => void;
  isExporting?: boolean;
}

function MobileDrawerContent({
  sections,
  activeSectionId,
  onSectionClick,
  isCoverPageActive = false,
  onCoverPageClick,
  isTOCActive = false,
  onTOCClick,
  onExportClick,
  onShareClick,
  isExporting = false,
}: MobileDrawerContentProps) {
  const { t } = useTheme();

  return (
    <div className="space-y-1">
      {/* Cover Page & TOC */}
      {onCoverPageClick && (
        <button
          onClick={onCoverPageClick}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
            isCoverPageActive
              ? 'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-momentum-orange'
              : 'hover:bg-warm-gray-100 dark:hover:bg-secondary'
          )}
        >
          <BookOpen size={18} className={isCoverPageActive ? 'text-momentum-orange' : 'text-warm-gray-400'} />
          <span className={cn(
            'text-sm font-medium',
            isCoverPageActive ? 'text-momentum-orange' : 'text-warm-gray-700 dark:text-warm-gray-300'
          )}>
            {t('preview.drawer.coverPage')}
          </span>
        </button>
      )}

      {onTOCClick && (
        <button
          onClick={onTOCClick}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
            isTOCActive
              ? 'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-momentum-orange'
              : 'hover:bg-warm-gray-100 dark:hover:bg-secondary'
          )}
        >
          <List size={18} className={isTOCActive ? 'text-momentum-orange' : 'text-warm-gray-400'} />
          <span className={cn(
            'text-sm font-medium',
            isTOCActive ? 'text-momentum-orange' : 'text-warm-gray-700 dark:text-warm-gray-300'
          )}>
            {t('preview.drawer.toc')}
          </span>
        </button>
      )}

      {/* Divider */}
      <div className="my-2 mx-3 border-t border-warm-gray-200 dark:border-border" />

      {/* Section label */}
      <p className="text-[11px] uppercase tracking-widest text-warm-gray-400 dark:text-warm-gray-500 font-semibold mb-2 px-4 py-1">
        {t('preview.drawer.sections')}
      </p>

      {/* Section list */}
      {sections.map((section, index) => {
        const isActive = activeSectionId === section.id;
        const hasContent = section.content && section.content.trim().length > 0;

        return (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
              isActive
                ? 'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-momentum-orange'
                : 'hover:bg-warm-gray-100 dark:hover:bg-secondary'
            )}
          >
            {/* Status indicator */}
            <div className="flex-shrink-0">
              {hasContent ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : isActive ? (
                <div className="w-[18px] h-[18px] rounded-full bg-momentum-orange flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              ) : (
                <div className="w-[18px] h-[18px] rounded-full border-2 border-warm-gray-300 dark:border-border" />
              )}
            </div>

            {/* Section title */}
            <span className={cn(
              'text-sm font-medium truncate',
              isActive
                ? 'text-momentum-orange'
                : hasContent
                  ? 'text-warm-gray-600 dark:text-warm-gray-300'
                  : 'text-warm-gray-700 dark:text-warm-gray-300'
            )}>
              {index + 1}. {section.title}
            </span>
          </button>
        );
      })}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-warm-gray-200 dark:border-border space-y-2">
        <Button
          variant="brand"
          onClick={() => onExportClick()}
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          {isExporting ? t('preview.drawer.exporting') : t('preview.sidebar.exportPlan')}
        </Button>

        <Button
          variant="outline"
          onClick={onShareClick}
          className="w-full text-warm-gray-600 dark:text-warm-gray-300"
        >
          <Share2 size={18} />
          {t('preview.drawer.share')}
        </Button>
      </div>
    </div>
  );
}
