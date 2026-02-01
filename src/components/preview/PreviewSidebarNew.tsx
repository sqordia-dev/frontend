import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  type LucideIcon,
} from 'lucide-react';
import { PlanSection } from '../../types/preview';

export type ExportFormat = 'pdf' | 'word';

interface PreviewSidebarNewProps {
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
function getSectionIcon(title: string): LucideIcon {
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
 * PreviewSidebarNew - Dark navy sidebar for business plan preview
 * Full-height fixed sidebar with section navigation
 */
export default function PreviewSidebarNew({
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
}: PreviewSidebarNewProps) {
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
  // Calculate completion
  const completedCount = sections.filter(
    (s) => s.content && s.content.trim().length > 0
  ).length;
  const completionPercentage =
    sections.length > 0
      ? Math.round((completedCount / sections.length) * 100)
      : 0;

  return (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold font-heading text-white">Sqordia</h1>
      </div>

      {/* Plan Info Section */}
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-sm font-medium text-white truncate">{planName}</h2>
        <span
          className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${getStatusBadgeClasses(
            planStatus
          )}`}
        >
          {planStatus}
        </span>
      </div>

      {/* Section Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Document sections">
        {/* Cover Page Entry */}
        {onCoverPageClick && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3 px-2">
              Cover
            </p>
            <button
              onClick={onCoverPageClick}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-strategy-blue ${
                isCoverPageActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              aria-current={isCoverPageActive ? 'true' : undefined}
            >
              <BookOpen
                size={16}
                className={isCoverPageActive ? 'text-white' : 'text-gray-500'}
                aria-hidden="true"
              />
              <span className="truncate">Cover Page</span>
              {onEditCoverPage && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCoverPage();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      e.preventDefault();
                      onEditCoverPage();
                    }
                  }}
                  className="ml-auto text-xs text-gray-500 hover:text-momentum-orange transition-colors cursor-pointer"
                >
                  Edit
                </span>
              )}
            </button>
          </div>
        )}

        {/* Table of Contents Link */}
        {onTOCClick && (
          <div className="mb-4">
            <button
              onClick={onTOCClick}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-strategy-blue ${
                isTOCActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              aria-current={isTOCActive ? 'true' : undefined}
            >
              <List
                size={16}
                className={isTOCActive ? 'text-white' : 'text-gray-500'}
                aria-hidden="true"
              />
              <span className="truncate">Table of Contents</span>
            </button>
          </div>
        )}

        <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3 px-2">
          Sections
        </p>
        <ul className="space-y-1">
          {sections.map((section, index) => {
            const Icon = getSectionIcon(section.title);
            const hasContent = section.content && section.content.trim().length > 0;
            const isActive = activeSectionId === section.id;

            return (
              <li key={section.id}>
                <button
                  onClick={() => onSectionClick(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-strategy-blue ${
                    isActive
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {/* Section icon */}
                  <Icon
                    size={16}
                    className={`flex-shrink-0 ${
                      hasContent
                        ? 'text-green-400'
                        : isActive
                        ? 'text-white'
                        : 'text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {/* Section title with number */}
                  <span className="truncate">
                    {index + 1}. {section.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Progress Section */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Completion</span>
          <span className="text-xs font-semibold text-momentum-orange">
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
            className="h-full bg-momentum-orange rounded-full"
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
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-momentum-orange hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-strategy-blue"
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
              className={`ml-auto transition-transform ${isExportMenuOpen ? '' : 'rotate-180'}`}
              aria-hidden="true"
            />
          </button>

          {/* Export Dropdown Menu */}
          {isExportMenuOpen && (
            <div
              className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
              role="menu"
            >
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
            </div>
          )}
        </div>

        <button
          onClick={onShareClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-strategy-blue"
        >
          <Share2 size={18} aria-hidden="true" />
          Share
        </button>
      </div>
    </>
  );
}
