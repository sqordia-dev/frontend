import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  Download,
  FileText,
  Calendar,
  Building2,
  AlertCircle,
  Share2,
  X,
  Eye,
  Save,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  Pencil,
  ArrowUpCircle,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import type { BusinessPlan } from '../lib/types';
import RichTextEditor from '../components/RichTextEditor';
import { useTheme } from '../contexts/ThemeContext';

interface Section {
  sectionName: string;
  title: string;
  content: string | null;
  hasContent: boolean;
  wordCount: number;
  characterCount: number;
  lastUpdated: string | null;
  isRequired: boolean;
  order: number;
  description: string | null;
  isAIGenerated: boolean;
  status: string;
}

export default function PlanViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTheme();
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const lightAIGrey = '#F4F7FA';

  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [saving, setSaving] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<{ [key: string]: 'improve' | 'expand' | 'simplify' | 'help' | null }>({});
  const [lastSaved, setLastSaved] = useState<{ [key: string]: string }>({});
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [shares, setShares] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'ReadOnly' | 'Edit' | 'FullAccess'>('ReadOnly');
  const [publicShareLink, setPublicShareLink] = useState<string | null>(null);
  const [loadingShares, setLoadingShares] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'word' | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (id) {
      loadPlan();
      loadSections();
    }
  }, [id]);

  useEffect(() => {
    if (sections.length > 0 && !activeSection) {
      setActiveSection(sections[0].sectionName);
      // Initialize all sections as expanded by default
      setExpandedSections(new Set(sections.map(s => s.sectionName)));
    }
  }, [sections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -60% 0px' }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [sections]);

  const loadPlan = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const planData = await businessPlanService.getBusinessPlan(id);
      setPlan(planData);
    } catch (err) {
      console.error('Failed to load business plan:', err);
      setError('Failed to load business plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    if (!id) return;

    try {
      const sectionsData: any = await businessPlanService.getSections(id);
      const sectionsArray: Section[] = Array.isArray(sectionsData) 
        ? sectionsData 
        : (sectionsData?.sections || []);
      
      if (sectionsArray.length > 0) {
        const sortedSections = sectionsArray.sort((a: Section, b: Section) => a.order - b.order);
        setSections(sortedSections);
      }
    } catch (err) {
      console.error('Failed to load sections:', err);
    }
  };

  const scrollToSection = (sectionName: string) => {
    setActiveSection(sectionName);
    // Ensure section is expanded when navigating to it
    setExpandedSections(prev => new Set([...prev, sectionName]));
    const element = sectionRefs.current[sectionName];
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  const toggleAllSections = () => {
    const allSectionNames = sections.map(s => s.sectionName);
    const allExpanded = allSectionNames.every(name => expandedSections.has(name));
    
    if (allExpanded) {
      // Collapse all
      setExpandedSections(new Set());
    } else {
      // Expand all
      setExpandedSections(new Set(allSectionNames));
    }
  };

  const startEditing = (section: Section) => {
    setEditingSection(section.sectionName);
    setEditingContent(section.content || '');
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditingContent('');
  };

  const saveSection = async (sectionName: string) => {
    if (!id) return;

    try {
      setSaving(sectionName);
      await businessPlanService.updateSection(id, sectionName, {
        content: editingContent
      });
      setLastSaved({ ...lastSaved, [sectionName]: new Date().toLocaleString() });
      await loadSections();
      setEditingSection(null);
      setEditingContent('');
    } catch (err: any) {
      console.error('Failed to save section:', err);
      alert(`Failed to save: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(null);
    }
  };

  const handleHelpMeWrite = async (sectionName: string) => {
    if (!id) return;

    try {
      setAiLoading({ ...aiLoading, [sectionName]: 'help' });
      const section = sections.find(s => s.sectionName === sectionName);
      if (!section) return;

      const planType = (plan as any)?.planType || plan?.businessType || 'BusinessPlan';
      const result = await businessPlanService.improveSection(id, sectionName, section.content || '', planType);

      if (result?.improvedContent) {
        setEditingContent(result.improvedContent);
      } else if (result?.content) {
        setEditingContent(result.content);
      } else {
        console.warn('Unexpected AI response structure:', result);
        alert('Received unexpected response from AI service. Please try again.');
      }
    } catch (err: any) {
      console.error('Failed to get AI help:', err);
      let errorMessage = 'AI service may be unavailable';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(`Failed to get AI help: ${errorMessage}`);
    } finally {
      setAiLoading({ ...aiLoading, [sectionName]: null });
    }
  };

  const getSectionInstructions = (sectionName: string): string => {
    const instructionsMap: { [key: string]: string } = {
      'executive-summary': 'Provide a comprehensive overview of your business plan highlighting key objectives, strategies, and financial projections. This should be compelling and capture the essence of your business.',
      'business-concept': 'Describe your innovative business idea that addresses market needs and creates value for customers. Explain what makes your concept unique and valuable.',
      'target-market': 'Provide detailed analysis of your ideal customer demographics, behaviors, and market segments. Include information about market size and growth potential.',
      'market-analysis': 'Include in-depth research of industry trends, market size, growth potential, and competitive landscape. Support your analysis with data and research.',
      'competitive-advantage': 'Explain unique features and strategies that differentiate your business from competitors. Highlight what gives you a sustainable competitive edge.',
      'marketing-strategy': 'Describe your comprehensive plan for reaching and engaging your target audience through various channels. Include specific tactics and channels.',
      'operations-plan': 'Detail your day-to-day operational structure, processes, and resources required to run your business. Include information about facilities, equipment, and processes.',
      'management-team': 'Introduce key team members, their roles, experience, and how they contribute to business success. Highlight relevant expertise and achievements.',
      'financial-projections': 'Provide detailed revenue forecasts, expense budgets, cash flow analysis, and break-even projections for the next 3-5 years. Include assumptions and key metrics.',
      'risk-analysis': 'Identify potential risks and mitigation strategies to ensure business continuity. Include both internal and external risks with specific mitigation plans.',
    };
    return instructionsMap[sectionName.toLowerCase()] || 'Add content to this section. Be specific and provide detailed information that supports your business plan.';
  };

  const handleAISuggestion = async (sectionName: string, action: 'improve' | 'expand' | 'simplify') => {
    if (!id) return;

    try {
      setAiLoading({ ...aiLoading, [sectionName]: action });
      const section = sections.find(s => s.sectionName === sectionName);
      if (!section) return;

      if (!section.hasContent || !section.content) {
        alert('Please add content to this section before using AI enhancements.');
        setAiLoading({ ...aiLoading, [sectionName]: null });
        return;
      }

      const planType = (plan as any)?.planType || plan?.businessType || 'BusinessPlan';
      let result: any;
      if (action === 'improve') {
        result = await businessPlanService.improveSection(id, sectionName, section.content, planType);
      } else if (action === 'expand') {
        result = await businessPlanService.expandSection(id, sectionName, section.content, planType);
      } else {
        result = await businessPlanService.simplifySection(id, sectionName, section.content, planType);
      }

      if (result?.improvedContent) {
        setEditingContent(result.improvedContent);
      } else if (result?.content) {
        setEditingContent(result.content);
      } else {
        console.warn('Unexpected AI response structure:', result);
        alert('Received unexpected response from AI service. Please try again.');
      }
    } catch (err: any) {
      console.error(`Failed to ${action} section:`, err);
      let errorMessage = 'AI service may be unavailable';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(`Failed to ${action} section: ${errorMessage}`);
    } finally {
      setAiLoading({ ...aiLoading, [sectionName]: null });
    }
  };

  const handleExport = async (format: 'pdf' | 'word') => {
    if (!id) return;
    
    try {
      setExporting(format);
      let blob: Blob;
      let filename: string;
      
      if (format === 'pdf') {
        blob = await businessPlanService.exportToPDF(id);
        filename = `${plan?.title || 'business-plan'}_${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        blob = await businessPlanService.exportToWord(id);
        filename = `${plan?.title || 'business-plan'}_${new Date().toISOString().split('T')[0]}.docx`;
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(`Failed to export to ${format}:`, error);
      alert(`Failed to export to ${format.toUpperCase()}: ${error.message}`);
    } finally {
      setExporting(null);
    }
  };

  const loadShares = async () => {
    if (!id) return;
    try {
      setLoadingShares(true);
      const data = await businessPlanService.getShares(id);
      setShares(data);
    } catch (error: any) {
      console.error('Failed to load shares:', error);
    } finally {
      setLoadingShares(false);
    }
  };

  const handleCreatePublicShare = async () => {
    if (!id) return;
    try {
      const result = await businessPlanService.createPublicShare(id, sharePermission);
      const link = `${window.location.origin}/plans/shared/${result.publicToken}`;
      setPublicShareLink(link);
      await loadShares();
    } catch (error: any) {
      console.error('Failed to create public share:', error);
      alert(`Failed to create public share: ${error.message}`);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    if (!id) return;
    try {
      await businessPlanService.revokeShare(id, shareId);
      await loadShares();
    } catch (error: any) {
      console.error('Failed to revoke share:', error);
      alert(`Failed to revoke share: ${error.message}`);
    }
  };

  const permissionToString = (permission: number | string): 'ReadOnly' | 'Edit' | 'FullAccess' => {
    if (typeof permission === 'string') {
      return permission as 'ReadOnly' | 'Edit' | 'FullAccess';
    }
    const permissionMap: Record<number, 'ReadOnly' | 'Edit' | 'FullAccess'> = {
      0: 'ReadOnly',
      1: 'Edit',
      2: 'FullAccess'
    };
    return permissionMap[permission] || 'ReadOnly';
  };

  const getPermissionDisplayName = (share: any): string => {
    if (share.permissionName) {
      return share.permissionName;
    }
    return permissionToString(share.permission);
  };

  useEffect(() => {
    if (showShareModal) {
      loadShares();
    }
  }, [showShareModal, id]);

  // Move useMemo BEFORE early returns to follow Rules of Hooks
  const navSections = useMemo(() => [
    { id: 'cover', title: t('planView.cover'), icon: FileText },
    { id: 'contents', title: t('planView.contents'), icon: BookOpen },
    ...(sections || []).map(s => ({ id: s.sectionName, title: s.title, icon: FileText }))
  ], [sections, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: momentumOrange }}></div>
          <p className="text-gray-600 dark:text-gray-400">{t('planView.loadingText')}</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4" size={48} style={{ color: momentumOrange }} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('planView.planNotFound')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || t('planView.planNotFoundDesc')}</p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 rounded-lg transition-colors text-white font-semibold"
            style={{ backgroundColor: momentumOrange }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
          >
            {t('planView.backToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">{t('planView.dashboard')}</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting === 'pdf'}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {exporting === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span className="hidden sm:inline">{t('planView.pdf')}</span>
              </button>
              <button
                onClick={() => handleExport('word')}
                disabled={exporting === 'word'}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: momentumOrange }}
                onMouseEnter={(e) => !(exporting === 'word') && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                onMouseLeave={(e) => !(exporting === 'word') && (e.currentTarget.style.backgroundColor = momentumOrange)}
              >
                {exporting === 'word' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span className="hidden sm:inline">{t('planView.word')}</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={t('planView.share')}
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r-2 border-gray-300 dark:border-gray-700 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto z-30">
          <div className="p-6">
            {/* Collapse/Expand All Button */}
            {sections.length > 0 && (
              <div className="mb-4 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                <button
                  onClick={toggleAllSections}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all text-sm font-semibold"
                  style={{
                    backgroundColor: sections.every(s => expandedSections.has(s.sectionName)) ? momentumOrange : lightAIGrey,
                    color: sections.every(s => expandedSections.has(s.sectionName)) ? 'white' : strategyBlue
                  }}
                  onMouseEnter={(e) => {
                    if (!sections.every(s => expandedSections.has(s.sectionName))) {
                      e.currentTarget.style.backgroundColor = momentumOrange;
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!sections.every(s => expandedSections.has(s.sectionName))) {
                      e.currentTarget.style.backgroundColor = lightAIGrey;
                      e.currentTarget.style.color = strategyBlue;
                    }
                  }}
                >
                  <span className="flex items-center gap-2">
                    {sections.every(s => expandedSections.has(s.sectionName)) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    <span>{sections.every(s => expandedSections.has(s.sectionName)) ? t('planView.collapseAll') : t('planView.expandAll')}</span>
                  </span>
                </button>
              </div>
            )}
            <div className="space-y-2">
              {navSections.map((section, index) => {
                const isActive = activeSection === section.id || (section.id === 'cover' && !activeSection);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      if (section.id === 'cover') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (section.id === 'contents') {
                        if (sections.length > 0) {
                          scrollToSection(sections[0].sectionName);
                        }
                      } else {
                        scrollToSection(section.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
                      isActive
                        ? 'bg-gray-900 dark:bg-gray-700 text-white border-l-4'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                    }`}
                    style={isActive ? { borderLeftColor: momentumOrange } : {}}
                  >
                    <section.icon size={18} className="flex-shrink-0" />
                    <span className={`text-sm flex-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>{section.title}</span>
                    {index > 1 && (
                      <span className={`text-xs font-mono ${isActive ? 'text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {index - 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Cover Section */}
          <section className="relative bg-gray-900 dark:bg-gray-950 border-b-8" style={{ borderBottomColor: momentumOrange }}>
            <div className="relative py-24 px-8">
              <div className="max-w-5xl mx-auto">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {plan.title}
                </h1>
                {plan.description && (
                  <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {plan.description}
                  </p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    <span>{plan.businessType || plan.industry || 'Business Plan'}</span>
                  </div>
                  {plan.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <div className="bg-white dark:bg-gray-900">
            {sections.length === 0 ? (
              <div className="text-center py-32">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400 text-lg">{t('planView.noSections')}</p>
              </div>
            ) : (
              sections.map((section, sectionIndex) => {
                const sectionAiLoading = aiLoading[section.sectionName];
                const isEditing = editingSection === section.sectionName;

                return (
                  <section
                    key={section.sectionName}
                    id={section.sectionName}
                    ref={(el) => (sectionRefs.current[section.sectionName] = el)}
                    className="py-20 px-8 max-w-4xl mx-auto border-b border-gray-200 dark:border-gray-800 last:border-b-0 relative group"
                    onMouseEnter={() => setHoveredSection(section.sectionName)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    {/* Chapter Header */}
                    <div className="mb-12 pb-8 border-b-2 border-gray-300 dark:border-gray-700">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-900 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                            <span className="text-2xl font-serif text-white font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                              {sectionIndex + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <button
                                onClick={() => toggleSection(section.sectionName)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0 mt-1"
                                title={expandedSections.has(section.sectionName) ? 'Collapse section' : 'Expand section'}
                              >
                                {expandedSections.has(section.sectionName) ? (
                                  <ChevronUp size={20} style={{ color: momentumOrange }} />
                                ) : (
                                  <ChevronDown size={20} style={{ color: momentumOrange }} />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">
                                  {t('planView.chapter')} {sectionIndex + 1}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                                  {section.title}
                                </h2>
                              </div>
                            </div>
                            {/* Edit Button - Shows on Hover */}
                            {hoveredSection === section.sectionName && !isEditing && (
                              <button
                                onClick={() => startEditing(section)}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-white rounded-lg transition-all flex-shrink-0"
                                style={{ 
                                  backgroundColor: hoveredSection === section.sectionName ? momentumOrange : 'transparent',
                                  color: hoveredSection === section.sectionName ? 'white' : undefined
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = momentumOrange;
                                  e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '';
                                }}
                                title="Edit section"
                              >
                                <Pencil size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Content - Collapsible */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedSections.has(section.sectionName) 
                          ? 'max-h-[10000px] opacity-100' 
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="pt-4">
                        {section.content ? (
                          <div 
                            className="prose max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
                            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                            dangerouslySetInnerHTML={{ __html: section.content }}
                          />
                        ) : (
                          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <p className="text-gray-400 dark:text-gray-500 italic mb-4">{t('planView.noContent')}</p>
                        <button
                          onClick={() => startEditing(section)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-semibold"
                          style={{ backgroundColor: momentumOrange }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
                        >
                          <Pencil size={16} />
                          {t('planView.addContent')}
                        </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sections.find(s => s.sectionName === editingSection)?.title || t('planView.editSection')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {getSectionInstructions(editingSection)}
                </p>
              </div>
              <button
                onClick={cancelEditing}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <RichTextEditor
                value={editingContent}
                onChange={setEditingContent}
                placeholder="Start writing here..."
                instructions={getSectionInstructions(editingSection)}
                onHelpMeWrite={() => handleHelpMeWrite(editingSection)}
                helpMeWriteLoading={aiLoading[editingSection] === 'help'}
                wordCount={sections.find(s => s.sectionName === editingSection)?.wordCount}
                lastSaved={lastSaved[editingSection] || (sections.find(s => s.sectionName === editingSection)?.lastUpdated ? `on ${new Date(sections.find(s => s.sectionName === editingSection)!.lastUpdated!).toLocaleDateString()}` : undefined)}
              />

              {/* AI Enhancement Buttons */}
              {sections.find(s => s.sectionName === editingSection)?.hasContent && (
                <div className="mt-6 pt-6 border-t-2 dark:border-gray-700" style={{ borderColor: lightAIGrey }}>
                  <div className="border-2 rounded-xl p-5 dark:bg-gray-800" style={{ 
                    borderColor: momentumOrange,
                    backgroundColor: lightAIGrey
                  }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: momentumOrange }}>
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm dark:text-white" style={{ color: strategyBlue }}>AI Enhancements</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Enhance your content with AI</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleAISuggestion(editingSection, 'improve')}
                        disabled={!!sectionAiLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all disabled:opacity-50 text-sm font-semibold shadow-sm hover:shadow-md"
                        style={{ 
                          backgroundColor: sectionAiLoading === 'improve' ? momentumOrange : 'white',
                          color: sectionAiLoading === 'improve' ? 'white' : strategyBlue,
                          border: sectionAiLoading === 'improve' ? 'none' : `2px solid ${momentumOrange}`
                        }}
                        onMouseEnter={(e) => {
                          if (!sectionAiLoading && sectionAiLoading !== 'improve') {
                            e.currentTarget.style.backgroundColor = momentumOrange;
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!sectionAiLoading && sectionAiLoading !== 'improve') {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = strategyBlue;
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                      >
                        {sectionAiLoading === 'improve' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ArrowUp size={16} />
                        )}
                        Improve
                      </button>
                      <button
                        onClick={() => handleAISuggestion(editingSection, 'expand')}
                        disabled={!!sectionAiLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all disabled:opacity-50 text-sm font-semibold shadow-sm hover:shadow-md"
                        style={{ 
                          backgroundColor: sectionAiLoading === 'expand' ? momentumOrange : 'white',
                          color: sectionAiLoading === 'expand' ? 'white' : strategyBlue,
                          border: sectionAiLoading === 'expand' ? 'none' : `2px solid ${momentumOrange}`
                        }}
                        onMouseEnter={(e) => {
                          if (!sectionAiLoading && sectionAiLoading !== 'expand') {
                            e.currentTarget.style.backgroundColor = momentumOrange;
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!sectionAiLoading && sectionAiLoading !== 'expand') {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = strategyBlue;
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                      >
                        {sectionAiLoading === 'expand' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ArrowDown size={16} />
                        )}
                        Expand
                      </button>
                      <button
                        onClick={() => handleAISuggestion(editingSection, 'simplify')}
                        disabled={!!sectionAiLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all disabled:opacity-50 text-sm font-semibold shadow-sm hover:shadow-md"
                        style={{ 
                          backgroundColor: sectionAiLoading === 'simplify' ? momentumOrange : 'white',
                          color: sectionAiLoading === 'simplify' ? 'white' : strategyBlue,
                          border: sectionAiLoading === 'simplify' ? 'none' : `2px solid ${momentumOrange}`
                        }}
                        onMouseEnter={(e) => {
                          if (!sectionAiLoading && sectionAiLoading !== 'simplify') {
                            e.currentTarget.style.backgroundColor = momentumOrange;
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!sectionAiLoading && sectionAiLoading !== 'simplify') {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = strategyBlue;
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                      >
                        {sectionAiLoading === 'simplify' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Minus size={16} />
                        )}
                        Simplify
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t-2 border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                {t('planView.cancel')}
              </button>
              <button
                onClick={() => saveSection(editingSection)}
                disabled={saving === editingSection}
                className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold"
                style={{ backgroundColor: momentumOrange }}
                onMouseEnter={(e) => !(saving === editingSection) && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                onMouseLeave={(e) => !(saving === editingSection) && (e.currentTarget.style.backgroundColor = momentumOrange)}
              >
                {saving === editingSection ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t('planView.save')}...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('planView.saveChanges')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('planView.sharePlan')}</h3>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setPublicShareLink(null);
                    setShareEmail('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingShares ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: momentumOrange }}></div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('planView.shareEmail')}</h4>
                    <div className="space-y-3 mb-6">
                      <input
                        type="email"
                        placeholder={t('planView.enterEmail')}
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <select
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value as 'ReadOnly' | 'Edit' | 'FullAccess')}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        <option value="ReadOnly">{t('planView.readOnly')}</option>
                        <option value="Edit">{t('planView.edit')}</option>
                        <option value="FullAccess">{t('planView.fullAccess')}</option>
                      </select>
                      <button
                        onClick={async () => {
                          if (!id || !shareEmail.trim()) return;
                          try {
                            await businessPlanService.shareBusinessPlan(id, shareEmail, sharePermission, true);
                            setShareEmail('');
                            await loadShares();
                            alert(t('planView.shareInvitationSent'));
                          } catch (error: any) {
                            console.error('Failed to share:', error);
                            alert(`Failed to share: ${error.message}`);
                          }
                        }}
                        disabled={!shareEmail.trim()}
                        className="w-full px-4 py-2 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                        style={{ backgroundColor: momentumOrange }}
                        onMouseEnter={(e) => !(!shareEmail.trim()) && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                        onMouseLeave={(e) => !(!shareEmail.trim()) && (e.currentTarget.style.backgroundColor = momentumOrange)}
                      >
                        Send Invitation
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('planView.createPublicLink')}</h4>
                    <div className="space-y-3">
                      <select
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value as 'ReadOnly' | 'Edit' | 'FullAccess')}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        <option value="ReadOnly">{t('planView.readOnly')}</option>
                        <option value="Edit">{t('planView.edit')}</option>
                        <option value="FullAccess">{t('planView.fullAccess')}</option>
                      </select>
                      <button
                        onClick={handleCreatePublicShare}
                        className="w-full px-4 py-2 text-white rounded-lg transition-colors font-semibold"
                        style={{ backgroundColor: momentumOrange }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
                      >
                        {t('planView.createPublicLink')}
                      </button>
                      {publicShareLink && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('planView.shareLink')}</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={publicShareLink}
                              readOnly
                              className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(publicShareLink);
                                alert(t('planView.linkCopied'));
                              }}
                              className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold"
                            >
                              {t('planView.copy')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('planView.activeShares')}</h4>
                    {shares.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('planView.noShares')}</p>
                    ) : (
                      <div className="space-y-2">
                        {shares.map((share: any) => (
                          <div
                            key={share.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {share.isPublic ? t('planView.publicLink') : (share.sharedWithEmail || `User ${share.sharedWithUserId?.substring(0, 8)}...`)}
                                </span>
                                {share.isPublic && share.publicToken && (
                                  <span className="px-2 py-0.5 text-xs rounded font-semibold" style={{ backgroundColor: lightAIGrey, color: strategyBlue }}>
                                    {t('planView.public')}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {getPermissionDisplayName(share)} • {share.accessCount || 0} {t('planView.views')}
                                {share.lastAccessedAt && ` • ${t('planView.lastAccessed')} ${new Date(share.lastAccessedAt).toLocaleDateString()}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={permissionToString(share.permission)}
                                onChange={async (e) => {
                                  if (!id) return;
                                  try {
                                    await businessPlanService.updateSharePermission(id, share.id, e.target.value as 'ReadOnly' | 'Edit' | 'FullAccess');
                                    await loadShares();
                                  } catch (error: any) {
                                    console.error('Failed to update permission:', error);
                                    alert(`Failed to update permission: ${error.message}`);
                                  }
                                }}
                                className="px-2 py-1 text-xs border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                              >
                                <option value="ReadOnly">Read Only</option>
                                <option value="Edit">Edit</option>
                                <option value="FullAccess">Full Access</option>
                              </select>
                              <button
                                onClick={() => handleRevokeShare(share.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm p-1"
                                title={t('planView.revoke')}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-3 text-white rounded-full shadow-lg transition-colors z-10"
        style={{ backgroundColor: momentumOrange }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
        title="Scroll to top"
      >
        <ArrowUpCircle size={24} />
      </button>
    </div>
  );
}

