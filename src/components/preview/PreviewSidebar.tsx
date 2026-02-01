import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Share2,
  FileText,
  FileType,
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
  ChevronUp,
  Loader2,
  Edit3,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { PlanSection } from '../../types/preview';

export type ExportFormat = 'pdf' | 'word';

interface PreviewSidebarProps {
  /** Plan name/title */
  planName: string;
  /** Plan status */
  planStatus?: string;
  /** List of sections */
  sections: PlanSection[];
  /** Currently active section ID */
  activeSectionId: string | null;
  /** Callback when section is clicked */
  onSectionClick: (sectionId: string) => void;
  /** Callback when export is clicked with format */
  onExportClick: (format?: ExportFormat) => void;
  /** Callback when share is clicked */
  onShareClick: () => void;
  /** Callback when edit cover page is clicked */
  onEditCoverPage?: () => void;
  /** Whether cover page section is active */
  isCoverPageActive?: boolean;
  /** Callback when cover page section is clicked */
  onCoverPageClick?: () => void;
  /** Whether export is loading */
  isExporting?: boolean;
  /** Current export format being processed */
  exportingFormat?: ExportFormat | null;
  /** Whether Table of Contents is active */
  isTOCActive?: boolean;
  /** Callback when Table of Contents is clicked */
  onTOCClick?: () => void;
  /** Callback when plan title edit is clicked */
  onEditPlanTitle?: () => void;
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
  'products/services': Package,
  'marketing': Megaphone,
  'marketing strategy': Megaphone,
  'marketing plan': Megaphone,
  'operations': Cog,
  'operations plan': Cog,
  'management': Users,
  'management team': Users,
  'team': Users,
  'organization': Users,
  'financial': DollarSign,
  'financial projections': DollarSign,
  'financials': DollarSign,
  'funding': Wallet,
  'funding request': Wallet,
  'investment': Wallet,
  'appendix': Paperclip,
  'appendices': Paperclip,
  'swot': Grid3X3,
  'swot analysis': Grid3X3,
  'risk': AlertTriangle,
  'risk assessment': AlertTriangle,
  'risks': AlertTriangle,
  'timeline': Calendar,
  'implementation': Calendar,
  'implementation timeline': Calendar,
  'milestones': Calendar,
  'exit': LogOut,
  'exit strategy': LogOut,
};

/**
 * Get icon for a section based on its title
 */
export function getSectionIcon(title: string): LucideIcon {
  const normalizedTitle = title.toLowerCase().trim();

  // Try exact match first
  if (sectionIconMap[normalizedTitle]) {
    return sectionIconMap[normalizedTitle];
  }

  // Try partial match
  for (const [key, icon] of Object.entries(sectionIconMap)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
      return icon;
    }
  }

  // Default icon
  return FileText;
}

/**
 * Get status badge styling based on status
 */
function getStatusBadgeClasses(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes('complete') || normalizedStatus.includes('done')) {
    return 'bg-green-600/50 text-green-300';
  }
  if (normalizedStatus.includes('progress') || normalizedStatus.includes('active')) {
    return 'bg-amber-600/50 text-amber-300';
  }
  // Default: Draft
  return 'bg-gray-600/50 text-gray-300';
}

/**
 * Navigation item animation variants
 */
const navItemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  hover: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
};

/**
 * PreviewSidebar - Dark navy sidebar for business plan preview
 *
 * Features:
 * - Dark navy background (#1A2B47 "Strategy Blue")
 * - Full-height, fixed position on desktop (w-72)
 * - Business plan title with optional edit icon
 * - Vertical section list with Lucide icons
 * - Active section highlighting with momentum-orange left border
 * - Hover states with subtle background change
 * - Section numbers next to titles
 * - Smooth transitions using Framer Motion
 * - Progress bar showing completion percentage
 * - Export dropdown (PDF/Word) and Share button
 */
export default function PreviewSidebar({
  planName,
  planStatus = 'Draft',
  sections,
  activeSectionId,
  onSectionClick,
  onExportClick,
  onShareClick,
  onEditCoverPage,
  isCoverPageActive = false,
  onCoverPageClick,
  isExporting = false,
  exportingFormat = null,
  isTOCActive = false,
  onTOCClick,
  onEditPlanTitle,
}: PreviewSidebarProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: ExportFormat) => {
    setIsExportMenuOpen(false);
    onExportClick(format);
  };

  // Calculate completion statistics
  const { completedCount, completionPercentage } = useMemo(() => {
    const completed = sections.filter(
      (s) => s.content && s.content.trim().length > 0
    ).length;
    const percentage =
      sections.length > 0
        ? Math.round((completed / sections.length) * 100)
        : 0;
    return { completedCount: completed, completionPercentage: percentage };
  }, [sections]);

  return (
    <div className="flex flex-col h-full">
      {/* Plan Info Section with Edit Icon */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-white truncate flex-1">{planName}</h2>
          {onEditPlanTitle && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEditPlanTitle}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Edit plan title"
            >
              <Edit3 size={14} aria-hidden="true" />
            </motion.button>
          )}
        </div>
        <span
          className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-md font-medium ${getStatusBadgeClasses(
            planStatus
          )}`}
        >
          {planStatus}
        </span>
      </div>

      {/* Section Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin" aria-label="Document sections">
        {/* Cover Page Entry */}
        {onCoverPageClick && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3 px-3">
              Cover
            </p>
            <SidebarNavItem
              icon={BookOpen}
              label="Cover Page"
              isActive={isCoverPageActive}
              onClick={onCoverPageClick}
              editLabel={onEditCoverPage ? 'Edit' : undefined}
              onEdit={onEditCoverPage}
            />
          </div>
        )}

        {/* Table of Contents Link */}
        {onTOCClick && (
          <div className="mb-4">
            <SidebarNavItem
              icon={List}
              label="Table of Contents"
              isActive={isTOCActive}
              onClick={onTOCClick}
            />
          </div>
        )}

        {/* Sections Label */}
        <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3 px-3">
          Sections
        </p>

        {/* Section List */}
        <ul className="space-y-1">
          <AnimatePresence mode="popLayout">
            {sections.map((section, index) => {
              const Icon = getSectionIcon(section.title);
              const hasContent = section.content && section.content.trim().length > 0;
              const isActive = activeSectionId === section.id;

              return (
                <motion.li
                  key={section.id}
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  layout
                >
                  <SectionNavItem
                    section={section}
                    sectionNumber={index + 1}
                    icon={Icon}
                    isActive={isActive}
                    hasContent={hasContent}
                    onClick={() => onSectionClick(section.id)}
                  />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </nav>

      {/* Progress Section */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Completion</span>
          <span className="text-xs font-semibold text-[#FF6B00]">
            {completionPercentage}%
          </span>
        </div>
        <div
          className="h-2 bg-white/10 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Document completion: ${completionPercentage}%`}
        >
          <motion.div
            className="h-full bg-[#FF6B00] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {completedCount} of {sections.length} sections
        </p>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-white/10 space-y-2">
        {/* Export Button with Dropdown */}
        <div ref={exportMenuRef} className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#1A2B47]"
            aria-haspopup="true"
            aria-expanded={isExportMenuOpen}
          >
            {isExporting ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <Download size={18} aria-hidden="true" />
            )}
            {isExporting ? 'Exporting...' : 'Export'}
            <ChevronUp
              size={16}
              className={`ml-auto transition-transform duration-200 ${isExportMenuOpen ? '' : 'rotate-180'}`}
              aria-hidden="true"
            />
          </motion.button>

          {/* Export Dropdown Menu */}
          <AnimatePresence>
            {isExportMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 overflow-hidden"
                role="menu"
              >
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
                  role="menuitem"
                >
                  {exportingFormat === 'pdf' ? (
                    <Loader2 size={18} className="animate-spin text-red-500" />
                  ) : (
                    <FileText size={18} className="text-red-500" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-medium">Export as PDF</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Professional format</p>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('word')}
                  disabled={isExporting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
                  role="menuitem"
                >
                  {exportingFormat === 'word' ? (
                    <Loader2 size={18} className="animate-spin text-blue-500" />
                  ) : (
                    <FileType size={18} className="text-blue-500" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-medium">Export as Word</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Editable .docx format</p>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShareClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1A2B47]"
        >
          <Share2 size={18} aria-hidden="true" />
          Share
        </motion.button>
      </div>
    </div>
  );
}

/**
 * Generic sidebar navigation item component
 */
interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
  editLabel?: string;
  onEdit?: () => void;
}

function SidebarNavItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  editLabel,
  onEdit,
}: SidebarNavItemProps) {
  return (
    <motion.button
      whileHover={{ backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1A2B47] relative ${
        isActive
          ? 'bg-white/10 text-white font-medium'
          : 'text-gray-400 hover:text-white'
      }`}
      aria-current={isActive ? true : undefined}
    >
      {/* Active indicator - orange left border */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FF6B00] rounded-r-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <Icon
        size={16}
        className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
      {editLabel && onEdit && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              e.preventDefault();
              onEdit();
            }
          }}
          className="ml-auto text-xs text-gray-500 hover:text-[#FF6B00] transition-colors duration-200 cursor-pointer"
        >
          {editLabel}
        </span>
      )}
    </motion.button>
  );
}

/**
 * Section navigation item with number, icon, and completion status
 */
interface SectionNavItemProps {
  section: PlanSection;
  sectionNumber: number;
  icon: LucideIcon;
  isActive: boolean;
  hasContent: boolean;
  onClick: () => void;
}

function SectionNavItem({
  section,
  sectionNumber,
  icon: Icon,
  isActive,
  hasContent,
  onClick,
}: SectionNavItemProps) {
  return (
    <motion.button
      whileHover={{
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
      }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1A2B47] relative ${
        isActive
          ? 'bg-white/10 text-white font-medium'
          : 'text-gray-400 hover:text-white'
      }`}
      aria-current={isActive ? true : undefined}
      aria-label={`${sectionNumber}. ${section.title}${hasContent ? ' (completed)' : ''}`}
    >
      {/* Active indicator - momentum-orange left border */}
      {isActive && (
        <motion.div
          layoutId="section-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FF6B00] rounded-r-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Section icon with completion indicator */}
      <div className="relative flex-shrink-0">
        <Icon
          size={16}
          className={`${
            hasContent
              ? 'text-green-400'
              : isActive
              ? 'text-white'
              : 'text-gray-500'
          }`}
          aria-hidden="true"
        />
        {/* Small completion checkmark badge */}
        {hasContent && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full flex items-center justify-center"
          >
            <Check size={8} className="text-white" strokeWidth={3} aria-hidden="true" />
          </motion.div>
        )}
      </div>

      {/* Section number and title */}
      <span className="truncate">
        <span className="font-medium">{sectionNumber}.</span> {section.title}
      </span>
    </motion.button>
  );
}
