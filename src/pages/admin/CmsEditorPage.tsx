import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../lib/auth-service';
import { useTheme } from '../../contexts/ThemeContext';
import { MobileBottomNav, type NavItemConfig } from '@/components/layout/MobileBottomNav';
import {
  ArrowLeft,
  History,
  Calendar,
  Send,
  Loader2,
  X,
  Globe,
  ChevronRight,
  ChevronDown,
  FileText,
  Layers,
  HelpCircle,
  Quote,
  CreditCard,
  Type,
  Inbox,
  Lightbulb,
  Shield,
  Monitor,
  ListOrdered,
  Hand,
  CheckCircle,
  Palette,
  Share2,
  Mail,
  Menu,
  ClipboardList,
  LayoutDashboard,
  User,
  FileQuestion,
  Rocket,
  LogIn,
  Scale,
  Search,
  ArrowRight,
  Pencil,
  Save,
  Users,
  Database,
  ListTodo,
} from 'lucide-react';
import { CmsProvider, useCms } from '../../contexts/CmsContext';
import { CmsMobileDrawer } from '../../components/cms/CmsMobileDrawer';
import { CmsVersionHistorySidebar } from '../../components/cms/modals/CmsVersionHistorySidebar';
import { CmsScheduleDialog } from '../../components/cms/modals/CmsScheduleDialog';
import { CmsBlockCard } from '../../components/cms/blocks/CmsBlockCard';
import { loadCmsPages, CmsPageDefinition } from '../../lib/cms-page-registry';
import { CmsContentBlock } from '../../lib/cms-types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Language = 'en' | 'fr';

// Icon mapping for pages
const pageIconMap: Record<string, React.ElementType> = {
  landing: Globe,
  dashboard: LayoutDashboard,
  profile: User,
  questionnaire: FileQuestion,
  question_templates: HelpCircle,
  create_plan: FileText,
  subscription: CreditCard,
  onboarding: Rocket,
  auth: LogIn,
  legal: Scale,
  global: Globe,
};

// Icon mapping for sections
const sectionIconMap: Record<string, React.ElementType> = {
  hero: Layers,
  features: Layers,
  faq: HelpCircle,
  testimonials: Quote,
  pricing: CreditCard,
  labels: Type,
  empty_states: Inbox,
  tips: Lightbulb,
  security: Shield,
  sessions: Monitor,
  steps: ListOrdered,
  welcome: Hand,
  completion: CheckCircle,
  branding: Palette,
  social: Share2,
  contact: Mail,
  footer: FileText,
  navigation: Menu,
};

// Color mapping for pages
const pageColorMap: Record<string, string> = {
  landing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  dashboard: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  profile: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  questionnaire: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  question_templates: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  subscription: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  onboarding: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  auth: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  legal: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  global: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
};

interface CmsEditorContentProps {
  pages: CmsPageDefinition[];
}

function CmsEditorContent({ pages }: CmsEditorContentProps) {
  const { activeVersion, isLoading, isDirty, lastSaved, createVersion, saveBlocks, publishVersion, setIsDirty } = useCms();
  const navigate = useNavigate();
  const { theme, toggleTheme, language: appLanguage, setLanguage: setAppLanguage, t } = useTheme();

  // UI state
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set(['landing']));
  const [language, setLanguage] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Section editor state
  const [editingSection, setEditingSection] = useState<{
    pageKey: string;
    sectionKey: string;
    pageLabel: string;
    sectionLabel: string;
  } | null>(null);
  const [sectionBlocks, setSectionBlocks] = useState<CmsContentBlock[]>([]);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Logout handler
  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  // Mobile navigation items
  const mobileMainNav: NavItemConfig[] = [
    { name: appLanguage === 'fr' ? 'Aperçu' : 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: appLanguage === 'fr' ? 'Utilisateurs' : 'Users', href: '/admin/users', icon: Users },
    { name: 'CMS', href: '/admin/cms', icon: Palette },
  ];

  const mobileMoreNav: NavItemConfig[] = [
    { name: appLanguage === 'fr' ? 'Prompts' : 'Prompts', href: '/admin/prompt-registry', icon: Database },
    { name: appLanguage === 'fr' ? 'Problèmes' : 'Issues', href: '/admin/bug-report', icon: ListTodo },
  ];

  // Build dynamic pages with labels from CMS content
  const dynamicPages = useMemo(() => {
    if (!activeVersion) return pages;

    return pages.map(page => {
      if (page.key === 'question_templates') {
        const updatedSections = page.sections.map(section => {
          const labelBlock = activeVersion.contentBlocks.find(
            b => b.blockKey === `${section.key}.label` && b.language === language
          );
          if (labelBlock) {
            return { ...section, label: labelBlock.content };
          }
          return section;
        });
        return { ...page, sections: updatedSections };
      }
      return page;
    });
  }, [pages, activeVersion, language]);

  // Filter pages based on search
  const filteredPages = useMemo(() => {
    if (!searchQuery) return dynamicPages;
    const query = searchQuery.toLowerCase();
    return dynamicPages.filter(page =>
      page.label.toLowerCase().includes(query) ||
      page.sections.some(s => s.label.toLowerCase().includes(query))
    );
  }, [dynamicPages, searchQuery]);

  // Load blocks when editing section changes
  useEffect(() => {
    if (activeVersion && editingSection) {
      const blocks = activeVersion.contentBlocks.filter(
        b => b.sectionKey === editingSection.sectionKey && b.language === language
      );
      setSectionBlocks(blocks);
      const initial: Record<string, string> = {};
      blocks.forEach(b => {
        initial[b.id] = b.content;
      });
      setEditedContent(initial);
    } else {
      setSectionBlocks([]);
      setEditedContent({});
    }
  }, [activeVersion, editingSection, language]);

  // Get content preview for a section
  const getSectionPreview = useCallback((sectionKey: string): string => {
    if (!activeVersion) return '';
    const blocks = activeVersion.contentBlocks.filter(
      b => b.sectionKey === sectionKey && b.language === language
    );
    if (blocks.length === 0) return 'No content';

    // Get first text block content as preview
    const textBlock = blocks.find(b => b.blockType === 'Text' || b.blockType === 'RichText');
    if (textBlock) {
      const content = textBlock.content.replace(/<[^>]*>/g, '').trim();
      return content.length > 60 ? content.substring(0, 60) + '...' : content;
    }
    return `${blocks.length} content block${blocks.length > 1 ? 's' : ''}`;
  }, [activeVersion, language]);

  // Handle content change
  const handleContentChange = useCallback((blockId: string, content: string) => {
    setEditedContent(prev => ({ ...prev, [blockId]: content }));
    setIsDirty(true);
  }, [setIsDirty]);

  // Handle save section
  const handleSaveSection = useCallback(async () => {
    if (!activeVersion) return;

    setIsSaving(true);
    try {
      const blocksToUpdate = Object.entries(editedContent).map(([id, content]) => ({
        id,
        content,
      }));

      if (blocksToUpdate.length > 0) {
        await saveBlocks(activeVersion.id, { blocks: blocksToUpdate });
      }
    } finally {
      setIsSaving(false);
    }
  }, [activeVersion, editedContent, saveBlocks]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (!activeVersion) return;

    setIsPublishing(true);
    try {
      if (isDirty) {
        await handleSaveSection();
      }
      await publishVersion(activeVersion.id);
      await createVersion();
    } catch (err) {
      console.error('Failed to publish:', err);
    } finally {
      setIsPublishing(false);
    }
  }, [activeVersion, isDirty, handleSaveSection, publishVersion, createVersion]);

  // Toggle page expansion
  const togglePage = (pageKey: string) => {
    setExpandedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageKey)) {
        newSet.delete(pageKey);
      } else {
        newSet.add(pageKey);
      }
      return newSet;
    });
  };

  // Open section editor
  const openSectionEditor = (pageKey: string, sectionKey: string, pageLabel: string, sectionLabel: string) => {
    setEditingSection({ pageKey, sectionKey, pageLabel, sectionLabel });
  };

  // Close section editor
  const closeSectionEditor = () => {
    setEditingSection(null);
  };

  // Time since last saved
  const getTimeSinceLastSaved = () => {
    if (!lastSaved) return null;
    const diff = Date.now() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} min ago`;
  };

  // Get icons
  const getPageIcon = (pageKey: string) => pageIconMap[pageKey] || FileText;
  const getSectionIcon = (sectionKey: string) => {
    const lastPart = sectionKey.split('.').pop() || '';
    return sectionIconMap[lastPart] || FileText;
  };
  const getPageColor = (pageKey: string) => pageColorMap[pageKey] || 'bg-gray-500/10 text-gray-600';

  // Block type helpers
  const getBlockTypeIcon = (blockType: string): string => {
    const iconMap: Record<string, string> = {
      Text: 'format_size',
      RichText: 'subject',
      Image: 'image',
      Link: 'link',
      Json: 'data_object',
      Number: 'tag',
      Boolean: 'toggle_on',
    };
    return iconMap[blockType] || 'article';
  };

  const getBlockTypeColor = (blockType: string): string => {
    const colorMap: Record<string, string> = {
      Text: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      RichText: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      Image: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
      Link: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
      Json: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
      Number: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
      Boolean: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    };
    return colorMap[blockType] || 'bg-gray-50 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-screen flex items-center justify-center pb-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-momentum-orange mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading CMS Editor...</p>
          </div>
        </div>
        <MobileBottomNav
          mainNavItems={mobileMainNav}
          moreMenuItems={mobileMoreNav}
          backLink={{
            label: appLanguage === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard',
            href: '/dashboard',
          }}
          onLogout={handleLogout}
          t={t}
          theme={theme}
          onThemeToggle={toggleTheme}
          language={appLanguage}
          onLanguageChange={setAppLanguage}
          showUserProfile={false}
        />
      </div>
    );
  }

  if (!activeVersion) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-screen flex items-center justify-center pb-20">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 bg-momentum-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-momentum-orange" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Active Draft</h2>
            <p className="text-muted-foreground mb-6">Create a new draft to start editing content.</p>
            <Button
              onClick={() => createVersion()}
              className="bg-momentum-orange hover:bg-momentum-orange/90 text-white"
            >
              Create New Draft
            </Button>
          </div>
        </div>
        <MobileBottomNav
          mainNavItems={mobileMainNav}
          moreMenuItems={mobileMoreNav}
          backLink={{
            label: appLanguage === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard',
            href: '/dashboard',
          }}
          onLogout={handleLogout}
          t={t}
          theme={theme}
          onThemeToggle={toggleTheme}
          language={appLanguage}
          onLanguageChange={setAppLanguage}
          showUserProfile={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border/50">
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <div className="h-14 flex items-center justify-between gap-2">
            {/* Left */}
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to="/dashboard"
                className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors shrink-0"
                title="Back to Dashboard"
              >
                <ArrowLeft size={18} />
              </Link>

              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground shrink-0"
              >
                <Menu size={18} />
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                  <span className="sm:hidden">CMS</span>
                  <span className="hidden sm:inline">Sqordia CMS</span>
                </h1>
                <Badge variant="warning" className="text-[9px] font-bold shrink-0 hidden sm:inline-flex">
                  Draft v{activeVersion.versionNumber}
                </Badge>
                {isDirty && (
                  <span className="text-[10px] text-amber-600 font-medium hidden sm:inline">Unsaved</span>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVersionHistoryOpen(true)}
                className="h-8 w-8 p-0 hidden sm:flex"
              >
                <History size={16} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsScheduleDialogOpen(true)}
                className="h-8 w-8 p-0 hidden sm:flex"
              >
                <Calendar size={16} />
              </Button>

              {/* Language toggle */}
              <div className="flex items-center bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    'px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all',
                    language === 'en'
                      ? 'bg-card text-momentum-orange shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('fr')}
                  className={cn(
                    'px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all',
                    language === 'fr'
                      ? 'bg-card text-momentum-orange shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  FR
                </button>
              </div>

              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-momentum-orange hover:bg-momentum-orange/90 text-white h-8 text-xs px-2 sm:px-3"
              >
                {isPublishing ? (
                  <Loader2 size={14} className="sm:mr-1.5 animate-spin" />
                ) : (
                  <Send size={14} className="sm:mr-1.5" />
                )}
                <span className="hidden sm:inline">Publish</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pages and sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border/60 rounded-xl bg-card focus:bg-background focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-all"
            />
          </div>
        </div>

        {/* Question Templates CTA */}
        <Link
          to="/admin/cms/questionnaire"
          className="block mb-6 p-4 rounded-xl border-2 border-dashed border-momentum-orange/30 bg-momentum-orange/5 hover:bg-momentum-orange/10 hover:border-momentum-orange/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-momentum-orange/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-momentum-orange" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Question Templates</h3>
                <p className="text-xs text-muted-foreground">Manage questionnaire content and flow</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-momentum-orange">
              <span className="text-xs font-medium">Manage Questions</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        {/* Pages List */}
        <div className="space-y-3">
          {filteredPages.filter(p => p.key !== 'question_templates').map((page) => {
            const isExpanded = expandedPages.has(page.key);
            const PageIcon = getPageIcon(page.key);
            const pageColor = getPageColor(page.key);
            const sectionCount = page.sections.length;

            // Count sections with content
            const sectionsWithContent = page.sections.filter(s =>
              activeVersion.contentBlocks.some(b => b.sectionKey === s.key && b.language === language)
            ).length;

            return (
              <div
                key={page.key}
                className="bg-card rounded-xl border border-border/50 overflow-hidden"
              >
                {/* Page Header */}
                <button
                  onClick={() => togglePage(page.key)}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', pageColor)}>
                      <PageIcon className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-foreground">{page.label}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {sectionsWithContent}/{sectionCount} sections with content
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {sectionCount} sections
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown size={18} className="text-muted-foreground" />
                    ) : (
                      <ChevronRight size={18} className="text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Sections List */}
                {isExpanded && (
                  <div className="border-t border-border/50">
                    {page.sections.map((section, index) => {
                      const SectionIcon = getSectionIcon(section.key);
                      const preview = getSectionPreview(section.key);
                      const hasContent = activeVersion.contentBlocks.some(
                        b => b.sectionKey === section.key && b.language === language
                      );

                      return (
                        <div
                          key={section.key}
                          className={cn(
                            "group flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer",
                            index !== page.sections.length - 1 && "border-b border-border/30"
                          )}
                          onClick={() => openSectionEditor(page.key, section.key, page.label, section.label)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                              <SectionIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{section.label}</p>
                              <p className={cn(
                                "text-xs truncate",
                                hasContent ? "text-muted-foreground" : "text-muted-foreground/50 italic"
                              )}>
                                {preview}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-momentum-orange font-medium">Edit</span>
                            <Pencil size={14} className="text-momentum-orange" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No pages match your search</p>
          </div>
        )}
      </main>

      {/* Section Editor Slide-over */}
      {editingSection && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={closeSectionEditor}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border/50 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Panel Header */}
            <div className="h-14 border-b border-border/50 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={closeSectionEditor}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{editingSection.pageLabel}</span>
                    <ChevronRight size={12} className="text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{editingSection.sectionLabel}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSaveSection}
                disabled={isSaving || !isDirty}
                className="bg-momentum-orange hover:bg-momentum-orange/90 text-white h-8 text-xs"
              >
                {isSaving ? (
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                ) : (
                  <Save size={14} className="mr-1.5" />
                )}
                Save Changes
              </Button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {sectionBlocks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No content blocks</h3>
                  <p className="text-sm text-muted-foreground">This section has no editable content yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sectionBlocks
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((block) => (
                      <CmsBlockCard
                        key={block.id}
                        block={block}
                        content={editedContent[block.id] ?? block.content}
                        onContentChange={(content) => handleContentChange(block.id, content)}
                        icon={getBlockTypeIcon(block.blockType)}
                        iconColorClass={getBlockTypeColor(block.blockType)}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile Drawer */}
      <CmsMobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        pages={dynamicPages}
        selectedPageKey=""
        selectedSectionKey=""
        expandedPages={expandedPages}
        onPageClick={togglePage}
        onSectionClick={(pageKey, sectionKey) => {
          const page = dynamicPages.find(p => p.key === pageKey);
          const section = page?.sections.find(s => s.key === sectionKey);
          if (page && section) {
            openSectionEditor(pageKey, sectionKey, page.label, section.label);
            setIsMobileDrawerOpen(false);
          }
        }}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Version History Sidebar */}
      <CmsVersionHistorySidebar
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        versionId={activeVersion.id}
      />

      {/* Schedule Dialog */}
      <CmsScheduleDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        versionId={activeVersion.id}
        versionNumber={activeVersion.versionNumber}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        mainNavItems={mobileMainNav}
        moreMenuItems={mobileMoreNav}
        backLink={{
          label: appLanguage === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard',
          href: '/dashboard',
        }}
        onLogout={handleLogout}
        t={t}
        theme={theme}
        onThemeToggle={toggleTheme}
        language={appLanguage}
        onLanguageChange={setAppLanguage}
        showUserProfile={false}
      />
    </div>
  );
}

export default function CmsEditorPage() {
  const [pages, setPages] = useState<CmsPageDefinition[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(true);

  useEffect(() => {
    loadCmsPages().then(p => {
      setPages(p);
      setIsLoadingPages(false);
    });
  }, []);

  if (isLoadingPages) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-momentum-orange" />
      </div>
    );
  }

  return (
    <CmsProvider>
      <CmsEditorContent pages={pages} />
    </CmsProvider>
  );
}
