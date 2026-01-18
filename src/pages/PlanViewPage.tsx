import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  Building2,
  AlertCircle,
  Share2,
  X,
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
  ChevronUp,
  Upload,
  Trash2,
  Menu,
  Target,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Rocket,
  Heart,
  BarChart3,
  Settings
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import type { BusinessPlan } from '../lib/types';
import RichTextEditor from '../components/RichTextEditor';
import { useTheme } from '../contexts/ThemeContext';
import { financialService } from '../lib/financial-service';
import BalanceSheetTable, { BalanceSheetData } from '../components/BalanceSheetTable';
import CashFlowTable, { CashFlowData } from '../components/CashFlowTable';
import PlanViewTour from '../components/PlanViewTour';
import SEO from '../components/SEO';

// Markdown parser function
const parseMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Check if content is already fully HTML without markdown patterns
  // Be more aggressive in detecting markdown - check for any #, ##, ###, etc.
  const hasMarkdown = /#{1,6}\s|\*\*[^*]+\*\*|^\* |^\d+\.\s|\[.*\]\(.*\)/m.test(html) || 
                      html.includes('##') || html.includes('###') || html.includes('####');
  const hasCompleteHTML = /<[a-z]+[^>]*>[\s\S]*<\/[a-z]+>/i.test(html);
  
  // If it's already complete HTML without markdown, return as-is
  if (hasCompleteHTML && !hasMarkdown) {
    return html;
  }
  
  // Pre-process: Convert all markdown headings to HTML FIRST (before escaping)
  // This ensures we catch headings anywhere in the content
  const headingPlaceholders: { [key: string]: string } = {};
  let placeholderIndex = 0;
  
  // More aggressive heading detection - match headings at start of line or after newline
  // Also handle headings that might have extra spaces
  html = html.replace(/(^|\n)(\s*)(#{1,6})\s+([^\n]+?)(?:\n|$)/g, (match, prefix, indent, hashes, text) => {
    const level = hashes.length;
    const headingClass = level === 1 
      ? 'text-4xl font-bold mt-12 mb-6 text-gray-900 dark:text-white'
      : level === 2
      ? 'text-3xl font-bold mt-10 mb-5 text-gray-900 dark:text-white'
      : level === 3
      ? 'text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white'
      : level === 4
      ? 'text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white'
      : level === 5
      ? 'text-lg font-bold mt-5 mb-2 text-gray-900 dark:text-white'
      : 'text-base font-bold mt-4 mb-2 text-gray-900 dark:text-white';
    const headingHtml = `${prefix}${indent}<h${Math.min(level, 6)} class="${headingClass}">${text.trim()}</h${Math.min(level, 6)}>`;
    const key = `__HEADING_${placeholderIndex++}__`;
    headingPlaceholders[key] = headingHtml;
    return key;
  });
  
  // Also catch headings that appear in the middle of lines (less common but possible)
  // This handles cases where headings might be embedded in paragraphs
  html = html.replace(/([^\n])(#{1,6})\s+([^\n#]+)/g, (match, before, hashes, text) => {
    // Only process if it looks like a standalone heading (not part of a URL or code)
    if (before.match(/[a-zA-Z0-9]/) && !before.endsWith('http') && !before.endsWith('https')) {
      const level = hashes.length;
      const headingClass = level === 1 
        ? 'text-4xl font-bold mt-12 mb-6 text-gray-900 dark:text-white'
        : level === 2
        ? 'text-3xl font-bold mt-10 mb-5 text-gray-900 dark:text-white'
        : level === 3
        ? 'text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white'
        : level === 4
        ? 'text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white'
        : level === 5
        ? 'text-lg font-bold mt-5 mb-2 text-gray-900 dark:text-white'
        : 'text-base font-bold mt-4 mb-2 text-gray-900 dark:text-white';
      const headingHtml = `<h${Math.min(level, 6)} class="${headingClass}">${text.trim()}</h${Math.min(level, 6)}>`;
      const key = `__HEADING_${placeholderIndex++}__`;
      headingPlaceholders[key] = headingHtml;
      return `${before}${key}`;
    }
    return match;
  });
  
  // Simple HTML escaping - escape all < and >, then we'll create new HTML tags
  // Protect existing HTML entities first
  const entityPlaceholders: { [key: string]: string } = {};
  html = html.replace(/&[a-z0-9#]+;/gi, (match) => {
    const key = `__ENTITY_${placeholderIndex++}__`;
    entityPlaceholders[key] = match;
    return key;
  });
  
  // Escape < and > 
  html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Restore headings (they're already HTML, so they won't be escaped)
  Object.keys(headingPlaceholders).forEach(key => {
    html = html.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), headingPlaceholders[key]);
  });
  
  // Split into lines for processing
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  
  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const listTag = listType === 'ul' ? 'ul' : 'ol';
      const listClass = listType === 'ul' 
        ? 'my-6 space-y-3 ml-6 list-disc' 
        : 'my-6 space-y-3 ml-6 list-decimal';
      processedLines.push(`<${listTag} class="${listClass}">`);
      processedLines.push(...listItems);
      processedLines.push(`</${listTag}>`);
      listItems = [];
    }
    inList = false;
    listType = null;
  };
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmedLine = line.trim();
    
    // Empty line - flush list if active
    if (!trimmedLine) {
      flushList();
      continue;
    }
      
    // Check if line is already a processed heading (from pre-processing)
    if (trimmedLine.match(/^<h[1-6]/)) {
      flushList();
      processedLines.push(trimmedLine);
      continue;
    }
    
    // Headings (must be processed before other formatting)
    // Match #, ##, ###, ####, #####, ###### at start of line
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const headingClass = level === 1 
        ? 'text-4xl font-bold mt-12 mb-6 text-gray-900 dark:text-white'
        : level === 2
        ? 'text-3xl font-bold mt-10 mb-5 text-gray-900 dark:text-white'
        : level === 3
        ? 'text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white'
        : level === 4
        ? 'text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white'
        : level === 5
        ? 'text-lg font-bold mt-5 mb-2 text-gray-900 dark:text-white'
        : 'text-base font-bold mt-4 mb-2 text-gray-900 dark:text-white';
      processedLines.push(`<h${Math.min(level, 6)} class="${headingClass}">${text}</h${Math.min(level, 6)}>`);
      continue;
    }
    
    
    // Unordered list items
    if (trimmedLine.match(/^[\*\-]\s+/)) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      const text = trimmedLine.replace(/^[\*\-]\s+/, '');
      listItems.push(`<li class="mb-2">${processInlineMarkdown(text)}</li>`);
      continue;
    }
    
    // Ordered list items
    if (trimmedLine.match(/^\d+\.\s+/)) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      const text = trimmedLine.replace(/^\d+\.\s+/, '');
      listItems.push(`<li class="mb-2">${processInlineMarkdown(text)}</li>`);
      continue;
    }
    
    // Regular paragraph
    flushList();
    const processedLine = processInlineMarkdown(trimmedLine);
    processedLines.push(`<p class="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">${processedLine}</p>`);
  }
  
  // Flush any remaining list
  flushList();
  
  // Restore HTML entities
  let result = processedLines.join('\n');
  Object.keys(entityPlaceholders).forEach(key => {
    result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), entityPlaceholders[key]);
  });
  
  return result;
};

// Process inline markdown (bold, italic, links) within a line
const processInlineMarkdown = (text: string): string => {
  let result = text;
  
  // Links [text](url) - process before bold/italic
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Bold text (**text** or __text__) - process before italic to avoid conflicts
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
  result = result.replace(/__([^_]+)__/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
  
  // Italic text (*text* or _text_) - process after bold to avoid conflicts
  // Only process single asterisks/underscores that weren't part of bold
  // Since bold was already processed, we can safely process remaining single markers
  result = result.replace(/\*([^*\n]+?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');
  result = result.replace(/_([^_\n]+?)_/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');
  
  return result;
};

// Convert markdown to HTML for RichTextEditor (Quill expects HTML)
// This is a simpler version that converts markdown to HTML without CSS classes
// since Quill will handle the styling
const markdownToHTML = (content: string): string => {
  if (!content) return '';
  
  // Check if content is already HTML (from Quill)
  const hasHTMLTags = /<[a-z]+[^>]*>[\s\S]*<\/[a-z]+>/i.test(content);
  const hasMarkdown = /#{1,6}\s|\*\*[^*]+\*\*|^\* |^\d+\.\s|\[.*\]\(.*\)/m.test(content) || 
                      content.includes('##') || content.includes('###') || content.includes('**');
  
  // If it's already HTML without markdown, return as-is
  if (hasHTMLTags && !hasMarkdown) {
    return content;
  }
  
  // Split into lines first to process block-level elements (headings, lists, paragraphs)
  const lines = content.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  
  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const listTag = listType === 'ul' ? 'ul' : 'ol';
      processedLines.push(`<${listTag}>`);
      processedLines.push(...listItems);
      processedLines.push(`</${listTag}>`);
      listItems = [];
    }
    inList = false;
    listType = null;
  };
  
  // Helper function to process inline markdown within a line
  const processInline = (text: string): string => {
    let result = text;
    // Links first
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // Bold (**text** or __text__)
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    // Italic (*text* or _text_) - only single asterisks/underscores
    result = result.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
    result = result.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
    return result;
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      flushList();
      continue;
    }
    
    // Headings (must be processed before other formatting)
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      // Process inline formatting within heading
      const processedText = processInline(text);
      processedLines.push(`<h${Math.min(level, 6)}>${processedText}</h${Math.min(level, 6)}>`);
      continue;
    }
    
    // Unordered list
    if (trimmedLine.match(/^[\*\-]\s+/)) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      const text = trimmedLine.replace(/^[\*\-]\s+/, '');
      listItems.push(`<li>${processInline(text)}</li>`);
      continue;
    }
    
    // Ordered list
    if (trimmedLine.match(/^\d+\.\s+/)) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      const text = trimmedLine.replace(/^\d+\.\s+/, '');
      listItems.push(`<li>${processInline(text)}</li>`);
      continue;
    }
    
    // Regular paragraph
    flushList();
    processedLines.push(`<p>${processInline(trimmedLine)}</p>`);
  }
  
  flushList();
  
  return processedLines.join('\n');
};

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
  const { t, language } = useTheme();
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Introduction', 'Market', 'Strategy', 'Operations', 'Financial', 'BusinessPlan', 'StrategicPlan']));
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
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverBackgroundColor, setCoverBackgroundColor] = useState<string>('#1A202C');
  const [coverAccentColor, setCoverAccentColor] = useState<string>('#FF6B00');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [savingCover, setSavingCover] = useState(false);
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData[]>([]);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (id) {
      loadPlan();
      loadSections();
      loadFinancialData();
    }
  }, [id]);

  const loadFinancialData = async () => {
    if (!id) return;

    try {
      setLoadingFinancials(true);
      
      // Load balance sheet data
      try {
        const balanceSheet = await financialService.getBalanceSheet(id);
        if (balanceSheet) {
          // Handle different response formats
          let dataArray: any[] = [];
          
          if (Array.isArray(balanceSheet)) {
            dataArray = balanceSheet;
          } else if (balanceSheet.data && Array.isArray(balanceSheet.data)) {
            dataArray = balanceSheet.data;
          } else if (balanceSheet.value && Array.isArray(balanceSheet.value)) {
            dataArray = balanceSheet.value;
          } else if (balanceSheet.years && Array.isArray(balanceSheet.years)) {
            // If it's organized by years
            dataArray = balanceSheet.years;
          } else {
            // Try to extract year data from object
            const years = Object.keys(balanceSheet).filter(k => /^\d{4}$/.test(k));
            if (years.length > 0) {
              dataArray = years.map(year => ({ year: parseInt(year), ...balanceSheet[year] }));
            }
          }

          if (dataArray.length > 0) {
            // Transform API response to our format
            const transformed = dataArray.map((item: any) => ({
              year: item.year || new Date().getFullYear(),
              shortTermAssets: {
                cash: item.cash || item.shortTermAssets?.cash || item.assets?.cash || null,
                accountsReceivable: item.accountsReceivable || item.shortTermAssets?.accountsReceivable || item.assets?.accountsReceivable || null,
                inventory: item.inventory || item.shortTermAssets?.inventory || item.assets?.inventory || null,
                otherShortTermAssets: item.otherShortTermAssets || item.shortTermAssets?.other || item.assets?.otherShortTerm || null
              },
              fixedAssets: {
                total: item.fixedAssets || item.fixedAssetsTotal || item.assets?.fixedAssets || null
              },
              otherAssets: item.otherAssets || item.assets?.other || null
            }));
            setBalanceSheetData(transformed);
          }
        }
      } catch (err) {
        console.warn('Failed to load balance sheet:', err);
      }

      // Load cash flow data
      try {
        const cashFlow = await financialService.getCashFlow(id);
        if (cashFlow) {
          // Handle different response formats
          let dataArray: any[] = [];
          
          if (Array.isArray(cashFlow)) {
            dataArray = cashFlow;
          } else if (cashFlow.data && Array.isArray(cashFlow.data)) {
            dataArray = cashFlow.data;
          } else if (cashFlow.value && Array.isArray(cashFlow.value)) {
            dataArray = cashFlow.value;
          } else if (cashFlow.months && Array.isArray(cashFlow.months)) {
            dataArray = cashFlow.months;
          }

          if (dataArray.length > 0) {
            // Transform API response to our format
            const transformed = dataArray.map((item: any) => {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const year = item.year || new Date().getFullYear();
              const monthNum = item.month || item.monthNumber || 1;
              const monthName = monthNames[monthNum - 1] || 'Jan';
              const monthLabel = `${monthName}-${String(year).slice(-2)}`;
              
              return {
                month: item.month || monthLabel,
                year: year,
                rawMaterials: item.rawMaterials || item.rawMaterialPurchase || item.purchases || null,
                salesExpenses: item.salesExpenses || item.sellingExpenses || item.marketingExpenses || null,
                administrativeExpenses: item.administrativeExpenses || item.adminExpenses || item.operatingExpenses || null,
                laborAndSocialCharges: item.laborAndSocialCharges || item.laborCosts || item.salaries || null,
                fixedAssetAcquisition: item.fixedAssetAcquisition || item.capitalExpenditure || item.capex || null,
                salesTaxesPaid: item.salesTaxesPaid || item.taxesPaid || null,
                salesTaxRemitted: item.salesTaxRemitted || item.taxRemitted || null,
                taxPayable: item.taxPayable || item.taxes || null,
                creditLineInterest: item.creditLineInterest || item.interestExpense || null,
                debtRepaymentPrincipal: item.debtRepaymentPrincipal || item.debtPrincipal || null,
                debtRepaymentInterest: item.debtRepaymentInterest || item.debtInterest || null
              };
            });
            setCashFlowData(transformed);
          }
        }
      } catch (err) {
        console.warn('Failed to load cash flow:', err);
      }
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoadingFinancials(false);
    }
  };

  useEffect(() => {
    if (sections.length > 0 && !activeSection) {
      setActiveSection(sections[0].sectionName);
      // Initialize all sections as expanded by default
      setExpandedSections(new Set(sections.map(s => s.sectionName)));
      // Auto-expand all categories on load
      setExpandedCategories(new Set(Object.keys(SECTION_CATEGORIES)));
    }
  }, [sections]);

  // Scroll modal content to top when it opens
  useEffect(() => {
    if (editingSection && modalContentRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.scrollTop = 0;
        }
      }, 10);
    }
  }, [editingSection]);

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
      
      // Load cover settings if they exist
      if (planData.coverSettings) {
        setCoverBackgroundColor(planData.coverSettings.backgroundColor || '#1A202C');
        setCoverAccentColor(planData.coverSettings.accentColor || '#FF6B00');
        setCoverImageUrl(planData.coverSettings.coverImageUrl || null);
      }
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
    // Convert markdown to HTML for RichTextEditor (Quill expects HTML)
    const content = section.content || '';
    const htmlContent = markdownToHTML(content);
    setEditingContent(htmlContent);
    // Scroll to top when modal opens
    setTimeout(() => {
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }, 0);
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
        setEditingContent(markdownToHTML(result.improvedContent));
      } else if (result?.content) {
        setEditingContent(markdownToHTML(result.content));
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
        result = await businessPlanService.improveSection(id, sectionName, section.content, planType, language);
      } else if (action === 'expand') {
        result = await businessPlanService.expandSection(id, sectionName, section.content, planType, language);
      } else {
        result = await businessPlanService.simplifySection(id, sectionName, section.content, planType, language);
      }

      if (result?.improvedContent) {
        setEditingContent(markdownToHTML(result.improvedContent));
      } else if (result?.content) {
        setEditingContent(markdownToHTML(result.content));
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
      
      // Sanitize filename - remove invalid characters for file systems
      const sanitizeFilename = (name: string): string => {
        return name
          .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters with underscore
          .replace(/\s+/g, '_') // Replace spaces with underscore
          .replace(/_{2,}/g, '_') // Replace multiple underscores with single
          .substring(0, 200); // Limit length
      };
      
      const sanitizedFilename = sanitizeFilename(filename);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = sanitizedFilename;
      link.style.display = 'none'; // Hide the link
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error: any) {
      console.error(`Failed to export to ${format}:`, error);
      alert(`Failed to export to ${format.toUpperCase()}: ${error.message || 'Unknown error'}`);
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

  // Function to translate section titles
  const translateSectionTitle = (title: string): string => {
    const titleMap: { [key: string]: { en: string; fr: string } } = {
      'Executive Summary': { en: 'Executive Summary', fr: 'Résumé Exécutif' },
      'Market Analysis': { en: 'Market Analysis', fr: 'Analyse de Marché' },
      'Competitive Analysis': { en: 'Competitive Analysis', fr: 'Analyse Concurrentielle' },
      'Business Model': { en: 'Business Model', fr: 'Modèle d\'Affaires' },
      'Marketing Strategy': { en: 'Marketing Strategy', fr: 'Stratégie Marketing' },
      'Operations Plan': { en: 'Operations Plan', fr: 'Plan d\'Opérations' },
      'Management Team': { en: 'Management Team', fr: 'Équipe de Direction' },
      'Financial Projections': { en: 'Financial Projections', fr: 'Projections Financières' },
      'Financial': { en: 'Financial', fr: 'Financier' },
      'Risk Analysis': { en: 'Risk Analysis', fr: 'Analyse des Risques' },
      'SWOT Analysis': { en: 'SWOT Analysis', fr: 'Analyse SWOT' },
      'Problem Statement': { en: 'Problem Statement', fr: 'Énoncé du Problème' },
      'Solution': { en: 'Solution', fr: 'Solution' },
      'Target Market': { en: 'Target Market', fr: 'Marché Cible' },
      'Competitive Advantage': { en: 'Competitive Advantage', fr: 'Avantage Concurrentiel' },
      'Funding Requirements': { en: 'Funding Requirements', fr: 'Besoins de Financement' },
      'Exit Strategy': { en: 'Exit Strategy', fr: 'Stratégie de Sortie' },
      'Mission Statement': { en: 'Mission Statement', fr: 'Énoncé de Mission' },
      'Social Impact': { en: 'Social Impact', fr: 'Impact Social' },
      'Beneficiary Profile': { en: 'Beneficiary Profile', fr: 'Profil des Bénéficiaires' },
      'Grant Strategy': { en: 'Grant Strategy', fr: 'Stratégie de Subvention' },
      'Sustainability Plan': { en: 'Sustainability Plan', fr: 'Plan de Durabilité' },
      'Branding Strategy': { en: 'Branding Strategy', fr: 'Stratégie de Marque' },
      'Business Concept': { en: 'Business Concept', fr: 'Concept d\'Affaires' },
    };

    const normalizedTitle = title.trim();
    const translation = titleMap[normalizedTitle];
    
    if (translation) {
      return language === 'fr' ? translation.fr : translation.en;
    }
    
    // If no translation found, return original title
    return title;
  };

  // Group sections by category
  const groupedSections = useMemo(() => {
    if (!sections || sections.length === 0) return {};
    
    const planType = plan?.planType || 'BusinessPlan';
    const groups: Record<string, Section[]> = {};
    
    // Initialize all categories
    Object.keys(SECTION_CATEGORIES).forEach(category => {
      groups[category] = [];
    });
    
    // Group sections by category
    sections.forEach(section => {
      for (const [category, config] of Object.entries(SECTION_CATEGORIES)) {
        if (config.sections.includes(section.sectionName)) {
          // Only include BusinessPlan/StrategicPlan categories if they match the plan type
          if (category === 'BusinessPlan' && planType !== 'BusinessPlan') continue;
          if (category === 'StrategicPlan' && planType !== 'StrategicPlan') continue;
          
          groups[category].push(section);
          break;
        }
      }
    });
    
    // Remove empty categories
    Object.keys(groups).forEach(category => {
      if (groups[category].length === 0) {
        delete groups[category];
      }
    });
    
    return groups;
  }, [sections, plan?.planType]);

  // Move useMemo BEFORE early returns to follow Rules of Hooks
  const navSections = useMemo(() => [
    { id: 'cover', title: t('planView.cover'), icon: FileText },
    { id: 'contents', title: t('planView.contents'), icon: BookOpen },
    ...(sections || []).map(s => ({ id: s.sectionName, title: translateSectionTitle(s.title), icon: FileText }))
  ], [sections, t, language]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

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
      <SEO
        title={plan ? `${plan.title} | ${t('planView.title') || 'Business Plan'} | Sqordia` : `${t('planView.title') || 'Business Plan'} | Sqordia`}
        description={plan?.description || t('planView.description') || 'View and edit your business plan'}
        noindex={true}
        nofollow={true}
      />
      {/* Top Navigation Bar */}
      <nav className="plan-view-header bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
        <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3">
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
              {/* Mobile Sidebar Toggle */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={language === 'fr' ? 'Menu' : 'Menu'}
              >
                <Menu size={24} />
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('planViewTourCompleted');
                  (window as any).startPlanViewTour?.();
                }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                title={language === 'fr' ? 'Afficher la visite guidée' : 'Show tour guide'}
              >
                <Sparkles size={18} />
                <span className="text-sm">{language === 'fr' ? 'Visite guidée' : 'Show Tour'}</span>
              </button>
              <div className="plan-export-buttons flex items-center gap-1 sm:gap-2 flex-wrap">
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting === 'pdf'}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {exporting === 'pdf' ? <Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" /> : <Download size={14} className="sm:w-4 sm:h-4" />}
                <span className="hidden xs:inline sm:inline">{t('planView.pdf')}</span>
              </button>
              <button
                onClick={() => handleExport('word')}
                disabled={exporting === 'word'}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: momentumOrange }}
                onMouseEnter={(e) => !(exporting === 'word') && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                onMouseLeave={(e) => !(exporting === 'word') && (e.currentTarget.style.backgroundColor = momentumOrange)}
              >
                {exporting === 'word' ? <Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" /> : <Download size={14} className="sm:w-4 sm:h-4" />}
                <span className="hidden xs:inline sm:inline">{t('planView.word')}</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={t('planView.share')}
              >
                <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Layout */}
      <div className="flex min-h-screen overflow-x-hidden">
        {/* Sidebar Navigation */}
        <aside className={`plan-sidebar fixed lg:sticky inset-y-0 left-0 z-50 lg:z-30 w-[280px] sm:w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r-2 border-gray-300 dark:border-gray-700 lg:top-[57px] h-screen lg:h-[calc(100vh-57px)] overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          {/* Mobile Close Button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b-2 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('planView.contents')}</h3>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={language === 'fr' ? 'Fermer' : 'Close'}
            >
              <X size={20} />
            </button>
          </div>
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
            <div className="space-y-1">
              {/* Cover and Contents */}
              {navSections.filter(s => s.id === 'cover' || s.id === 'contents').map((section) => {
                const isActive = activeSection === section.id || (section.id === 'cover' && !activeSection);
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      if (section.id === 'cover') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else if (section.id === 'contents') {
                        const contentsElement = sectionRefs.current['contents'];
                        if (contentsElement) {
                          const offset = 120;
                          const elementPosition = contentsElement.getBoundingClientRect().top;
                          const offsetPosition = elementPosition + window.pageYOffset - offset;
                          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                          setActiveSection('contents');
                        }
                      }
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
                      isActive
                        ? 'bg-gray-900 dark:bg-gray-700 text-white border-l-4'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                    }`}
                    style={isActive ? { borderLeftColor: momentumOrange } : {}}
                  >
                    <section.icon size={18} className="flex-shrink-0" />
                    <span className={`text-sm flex-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>{translateSectionTitle(section.title)}</span>
                  </button>
                );
              })}
              
              {/* Grouped Sections */}
              {Object.entries(SECTION_CATEGORIES)
                .sort((a, b) => a[1].order - b[1].order)
                .map(([category, config]) => {
                  const categorySections = groupedSections[category] || [];
                  if (categorySections.length === 0) return null;
                  
                  const isCategoryExpanded = expandedCategories.has(category);
                  const CategoryIcon = config.icon;
                  
                  return (
                    <div key={category} className="space-y-1">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded transition-all text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-l-4 border-transparent"
                      >
                        <CategoryIcon size={16} className="flex-shrink-0 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex-1">
                          {getCategoryDisplayName(category, language)}
                        </span>
                        {isCategoryExpanded ? (
                          <ChevronUp size={14} className="text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                      
                      {/* Category Sections */}
                      {isCategoryExpanded && (
                        <div className="ml-4 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                          {categorySections
                            .sort((a, b) => {
                              const aIndex = config.sections.indexOf(a.sectionName);
                              const bIndex = config.sections.indexOf(b.sectionName);
                              return aIndex - bIndex;
                            })
                            .map((section) => {
                              const isActive = activeSection === section.sectionName;
                              return (
                                <button
                                  key={section.sectionName}
                                  onClick={() => {
                                    scrollToSection(section.sectionName);
                                    setMobileSidebarOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all text-left ${
                                    isActive
                                      ? 'bg-gray-900 dark:bg-gray-700 text-white border-l-4'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                                  }`}
                                  style={isActive ? { borderLeftColor: momentumOrange } : {}}
                                >
                                  <FileText size={14} className="flex-shrink-0" />
                                  <span className={`text-xs flex-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                    {translateSectionTitle(section.title)}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 lg:ml-0">
          {/* Cover Section */}
          <section 
            className="relative border-b-8 group" 
            style={{ 
              backgroundColor: (coverImageUrl || plan?.coverSettings?.coverImageUrl) ? 'transparent' : (plan?.coverSettings?.backgroundColor || coverBackgroundColor || '#1A202C'),
              borderBottomColor: plan?.coverSettings?.accentColor || coverAccentColor || momentumOrange,
              backgroundImage: (coverImageUrl || plan?.coverSettings?.coverImageUrl) ? `url(${coverImageUrl || plan?.coverSettings?.coverImageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {(coverImageUrl || plan?.coverSettings?.coverImageUrl) && (
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            )}
            <div className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg break-words" style={{ fontFamily: 'Georgia, serif' }}>
                      {plan.title}
                    </h1>
                    {plan.description && (
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 md:mb-10 max-w-3xl leading-relaxed drop-shadow-md break-words" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        {plan.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="sm:w-4 sm:h-4" />
                        <span className="break-words">{plan.businessType || plan.industry || 'Business Plan'}</span>
                      </div>
                      {plan.createdAt && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="sm:w-4 sm:h-4" />
                          <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Initialize modal state with current cover settings
                      if (plan?.coverSettings) {
                        setCoverBackgroundColor(plan.coverSettings.backgroundColor || '#1A202C');
                        setCoverAccentColor(plan.coverSettings.accentColor || momentumOrange);
                        setCoverImageUrl(plan.coverSettings.coverImageUrl || null);
                      }
                      setShowCoverModal(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg"
                    title="Customize cover"
                  >
                    <Pencil size={20} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Table of Contents Section */}
          {sections.length > 0 && (
            <section 
              id="contents"
              ref={(el) => (sectionRefs.current['contents'] = el as HTMLDivElement | null)}
              className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
            >
              <div className="mb-12 pb-8 border-b-2 border-gray-300 dark:border-gray-700">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-900 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                      <BookOpen size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">
                      {t('planView.tableOfContents')}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                      {t('planView.tableOfContents')}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(SECTION_CATEGORIES)
                  .sort((a, b) => a[1].order - b[1].order)
                  .map(([category, config]) => {
                    const categorySections = groupedSections[category] || [];
                    if (categorySections.length === 0) return null;
                    
                    const CategoryIcon = config.icon;
                    const categoryDisplayName = getCategoryDisplayName(category, language);
                    
                    return (
                      <div key={category} className="space-y-3">
                        {/* Category Header in TOC */}
                        <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                          <CategoryIcon size={18} className="text-gray-600 dark:text-gray-400" />
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            {categoryDisplayName}
                          </h3>
                        </div>
                        
                        {/* Category Sections in TOC */}
                        <div className="space-y-2 ml-4">
                          {categorySections
                            .sort((a, b) => {
                              const aIndex = config.sections.indexOf(a.sectionName);
                              const bIndex = config.sections.indexOf(b.sectionName);
                              return aIndex - bIndex;
                            })
                            .map((section, sectionIndex) => {
                              const globalIndex = sections.findIndex(s => s.sectionName === section.sectionName) + 1;
                              return (
                                <button
                                  key={section.sectionName}
                                  onClick={() => scrollToSection(section.sectionName)}
                                  className="w-full flex items-center justify-between gap-4 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left group"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 group-hover:border-orange-500 transition-colors">
                                      <span className="text-sm font-serif text-gray-700 dark:text-gray-300 font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                                        {globalIndex}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                        {translateSectionTitle(section.title)}
                                      </h4>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-orange-500 transition-colors">
                                    <ChevronDown size={16} className="transform rotate-[-90deg]" />
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })
                  .filter(Boolean)}
              </div>
            </section>
          )}

          {/* Content Sections */}
          <div className="bg-white dark:bg-gray-900">
            {sections.length === 0 ? (
              <div className="text-center py-32">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400 text-lg">{t('planView.noSections')}</p>
              </div>
            ) : (
              (() => {
                let globalSectionIndex = 0;
                return Object.entries(SECTION_CATEGORIES)
                  .sort((a, b) => a[1].order - b[1].order)
                  .map(([category, config]) => {
                    const categorySections = groupedSections[category] || [];
                    if (categorySections.length === 0) return null;
                    
                    const CategoryIcon = config.icon;
                    const categoryDisplayName = getCategoryDisplayName(category, language);
                    
                    return (
                      <div key={category} className="category-group">
                        {/* Category Header in Main Content */}
                        <div className="py-8 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto border-b-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gray-900 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                                <CategoryIcon size={20} className="text-white" />
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">
                                {t('planView.category') || 'Category'}
                              </div>
                              <h2 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-white" style={{ fontFamily: 'Georgia, serif' }}>
                                {categoryDisplayName}
                              </h2>
                            </div>
                          </div>
                        </div>
                        
                        {/* Category Sections */}
                        {categorySections
                          .sort((a, b) => {
                            const aIndex = config.sections.indexOf(a.sectionName);
                            const bIndex = config.sections.indexOf(b.sectionName);
                            return aIndex - bIndex;
                          })
                          .map((section) => {
                            const sectionIndex = globalSectionIndex++;
                            return (
                              <section
                                key={section.sectionName}
                                id={section.sectionName}
                                ref={(el) => (sectionRefs.current[section.sectionName] = el as HTMLDivElement | null)}
                                className="plan-content-section py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto border-b border-gray-200 dark:border-gray-800 last:border-b-0 relative group"
                                onMouseEnter={() => setHoveredSection(section.sectionName)}
                                onMouseLeave={() => setHoveredSection(null)}
                              >
                                {(() => {
                                  const isEditing = editingSection === section.sectionName;
                                  return (
                                    <>
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
                                                  onClick={() => startEditing(section)}
                                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                                  title={t('planView.edit') || 'Edit'}
                                                >
                                                  <Pencil size={18} />
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                  <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">
                                                    {t('planView.chapter')} {sectionIndex + 1}
                                                  </div>
                                                  <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                                                    {translateSectionTitle(section.title)}
                                                  </h2>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Section Content */}
                                      {isEditing ? (
                                        <div className="space-y-4">
                                          <RichTextEditor
                                            value={editingContent}
                                            onChange={setEditingContent}
                                            placeholder={getSectionInstructions(section.sectionName)}
                                          />
                                          <div className="flex items-center justify-end gap-3">
                                            <button
                                              onClick={cancelEditing}
                                              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                              {t('planView.cancel') || 'Cancel'}
                                            </button>
                                            <button
                                              onClick={() => saveSection(section.sectionName)}
                                              disabled={saving === section.sectionName}
                                              className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                                              style={{ backgroundColor: momentumOrange }}
                                              onMouseEnter={(e) => !(saving === section.sectionName) && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                                              onMouseLeave={(e) => !(saving === section.sectionName) && (e.currentTarget.style.backgroundColor = momentumOrange)}
                                            >
                                              {saving === section.sectionName ? (
                                                <span className="flex items-center gap-2">
                                                  <Loader2 size={16} className="animate-spin" />
                                                  {t('planView.saving') || 'Saving...'}
                                                </span>
                                              ) : (
                                                <span className="flex items-center gap-2">
                                                  <Save size={16} />
                                                  {t('planView.save') || 'Save'}
                                                </span>
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="prose prose-lg dark:prose-invert max-w-none">
                                          {section.content ? (
                                            <>
                                              <div
                                                className="section-content text-gray-700 dark:text-gray-300 leading-relaxed rich-text-content mb-8 break-words overflow-wrap-anywhere"
                                                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                                                dangerouslySetInnerHTML={{ __html: parseMarkdown(section.content) }}
                                              />
                                              
                                              {/* Financial Tables - Show in FinancialProjections section */}
                                              {(section.sectionName === 'FinancialProjections' || section.sectionName === 'financial-projections') && (
                                                <div className="mt-8 space-y-12">
                                                  {loadingFinancials ? (
                                                    <div className="flex items-center justify-center py-8">
                                                      <Loader2 size={24} className="animate-spin" style={{ color: momentumOrange }} />
                                                    </div>
                                                  ) : (
                                                    <>
                                                      {balanceSheetData.length > 0 && (
                                                        <BalanceSheetTable 
                                                          data={balanceSheetData}
                                                          currency="$"
                                                          className="my-8"
                                                        />
                                                      )}
                                                      {cashFlowData.length > 0 && (
                                                        <CashFlowTable 
                                                          data={cashFlowData}
                                                          currency="$"
                                                          className="my-8"
                                                        />
                                                      )}
                                                    </>
                                                  )}
                                                </div>
                                              )}
                                              
                                              <style>{`
                                                .rich-text-content {
                                                  color: #374151;
                                                }
                                                .dark .rich-text-content {
                                                  color: #f3f4f6;
                                                }
                                                .rich-text-content h1,
                                                .rich-text-content h2,
                                                .rich-text-content h3,
                                                .rich-text-content h4,
                                                .rich-text-content h5,
                                                .rich-text-content h6 {
                                                  font-weight: 700;
                                                  margin-top: 1.5em;
                                                  margin-bottom: 0.75em;
                                                  color: #111827;
                                                }
                                                .dark .rich-text-content h1,
                                                .dark .rich-text-content h2,
                                                .dark .rich-text-content h3,
                                                .dark .rich-text-content h4,
                                                .dark .rich-text-content h5,
                                                .dark .rich-text-content h6 {
                                                  color: #ffffff;
                                                }
                                                .rich-text-content p {
                                                  margin-bottom: 1em;
                                                  line-height: 1.75;
                                                }
                                                .rich-text-content strong,
                                                .rich-text-content b {
                                                  font-weight: 700;
                                                  color: #111827;
                                                }
                                                .dark .rich-text-content strong,
                                                .dark .rich-text-content b {
                                                  color: #ffffff;
                                                }
                                                .rich-text-content em,
                                                .rich-text-content i {
                                                  font-style: italic;
                                                }
                                                .rich-text-content ul,
                                                .rich-text-content ol {
                                                  margin: 1em 0;
                                                  padding-left: 2em;
                                                }
                                                .rich-text-content li {
                                                  margin-bottom: 0.5em;
                                                }
                                                .rich-text-content a {
                                                  color: #2563eb;
                                                  text-decoration: underline;
                                                }
                                                .dark .rich-text-content a {
                                                  color: #60a5fa;
                                                }
                                                .rich-text-content blockquote {
                                                  border-left: 4px solid #e5e7eb;
                                                  padding-left: 1em;
                                                  margin: 1em 0;
                                                  font-style: italic;
                                                  color: #6b7280;
                                                }
                                                .dark .rich-text-content blockquote {
                                                  border-left-color: #4b5563;
                                                  color: #9ca3af;
                                                }
                                              `}</style>
                                            </>
                                          ) : (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('planView.noContent') || 'No content yet'}</p>
                                              <button
                                                onClick={() => startEditing(section)}
                                                className="px-4 py-2 text-white rounded-lg transition-colors"
                                                style={{ backgroundColor: momentumOrange }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = momentumOrange)}
                                              >
                                                {t('planView.addContent') || 'Add Content'}
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* AI Actions */}
                                      {!isEditing && section.hasContent && (
                                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3">
                                          <button
                                            onClick={() => handleAISuggestion(section.sectionName, 'improve')}
                                            disabled={aiLoading[section.sectionName] === 'improve'}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                          >
                                            {aiLoading[section.sectionName] === 'improve' ? (
                                              <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                              <Sparkles size={16} />
                                            )}
                                            {t('planView.improve') || 'Improve'}
                                          </button>
                                          <button
                                            onClick={() => handleAISuggestion(section.sectionName, 'expand')}
                                            disabled={aiLoading[section.sectionName] === 'expand'}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                          >
                                            {aiLoading[section.sectionName] === 'expand' ? (
                                              <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                              <ArrowUpCircle size={16} />
                                            )}
                                            {t('planView.expand') || 'Expand'}
                                          </button>
                                          <button
                                            onClick={() => handleAISuggestion(section.sectionName, 'simplify')}
                                            disabled={aiLoading[section.sectionName] === 'simplify'}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                                          >
                                            {aiLoading[section.sectionName] === 'simplify' ? (
                                              <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                              <Minus size={16} />
                                            )}
                                            {t('planView.simplify') || 'Simplify'}
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </section>
                            );
                          })}
                      </div>
                    );
                  })
                  .filter(Boolean);
              })()
            )}
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-xl shadow-2xl max-w-5xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b-2 border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                  {sections.find(s => s.sectionName === editingSection)?.title || t('planView.editSection')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">
                  {getSectionInstructions(editingSection)}
                </p>
              </div>
              <button
                onClick={cancelEditing}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                    <div className="plan-ai-buttons grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleAISuggestion(editingSection, 'improve')}
                        disabled={!!aiLoading[editingSection!]}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all disabled:opacity-50 text-sm font-semibold shadow-sm hover:shadow-md"
                        style={{ 
                          backgroundColor: aiLoading[editingSection!] === 'improve' ? momentumOrange : 'white',
                          color: aiLoading[editingSection!] === 'improve' ? 'white' : strategyBlue,
                          border: aiLoading[editingSection!] === 'improve' ? 'none' : `2px solid ${momentumOrange}`
                        }}
                        onMouseEnter={(e) => {
                          if (!aiLoading[editingSection!]) {
                            e.currentTarget.style.backgroundColor = momentumOrange;
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!aiLoading[editingSection!]) {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = strategyBlue;
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                      >
                        {aiLoading[editingSection!] === 'improve' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ArrowUp size={16} />
                        )}
                        {t('planView.improve')}
                      </button>
                      <button
                        onClick={() => handleAISuggestion(editingSection, 'expand')}
                        disabled={!!aiLoading[editingSection!]}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all disabled:opacity-50 text-sm font-semibold shadow-sm hover:shadow-md"
                        style={{ 
                          backgroundColor: aiLoading[editingSection!] === 'expand' ? momentumOrange : 'white',
                          color: aiLoading[editingSection!] === 'expand' ? 'white' : strategyBlue,
                          border: aiLoading[editingSection!] === 'expand' ? 'none' : `2px solid ${momentumOrange}`
                        }}
                        onMouseEnter={(e) => {
                          if (!aiLoading[editingSection!]) {
                            e.currentTarget.style.backgroundColor = momentumOrange;
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!aiLoading[editingSection!]) {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = strategyBlue;
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                      >
                        {aiLoading[editingSection!] === 'expand' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ArrowDown size={16} />
                        )}
                        Expand
                      </button>
                      <button
                        onClick={() => handleAISuggestion(editingSection, 'simplify')}
                        disabled={!!aiLoading[editingSection!]}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all disabled:opacity-50 text-sm font-semibold shadow-sm hover:shadow-md"
                        style={{ 
                          backgroundColor: aiLoading[editingSection!] === 'simplify' ? momentumOrange : 'white',
                          color: aiLoading[editingSection!] === 'simplify' ? 'white' : strategyBlue,
                          border: aiLoading[editingSection!] === 'simplify' ? 'none' : `2px solid ${momentumOrange}`
                        }}
                        onMouseEnter={(e) => {
                          if (!aiLoading[editingSection!]) {
                            e.currentTarget.style.backgroundColor = momentumOrange;
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!aiLoading[editingSection!]) {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = strategyBlue;
                            e.currentTarget.style.borderColor = momentumOrange;
                          }
                        }}
                      >
                        {aiLoading[editingSection!] === 'simplify' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Minus size={16} />
                        )}
                        {t('planView.simplify')}
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
                className="px-4 py-3 md:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold min-h-[44px] flex items-center justify-center"
              >
                {t('planView.cancel')}
              </button>
              <button
                onClick={() => saveSection(editingSection)}
                disabled={saving === editingSection}
                className="flex items-center gap-2 px-6 py-3 md:py-2 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold min-h-[44px]"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-none md:rounded-lg shadow-xl max-w-2xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto">
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

      {/* Cover Customization Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-none md:rounded-xl shadow-2xl max-w-3xl w-full h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('planView.customizeCover')}</h3>
              <button
                onClick={() => setShowCoverModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Preview */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('planView.preview')}</h4>
                <div 
                  className="relative rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600"
                  style={{ 
                    backgroundColor: coverImageUrl ? 'transparent' : coverBackgroundColor,
                    backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '200px'
                  }}
                >
                  {coverImageUrl && <div className="absolute inset-0 bg-black bg-opacity-40"></div>}
                  <div className="relative p-8">
                    <h2 className="text-3xl font-serif text-white mb-4 drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
                      {plan?.title || 'Business Plan'}
                    </h2>
                    <div className="h-2 rounded" style={{ backgroundColor: coverAccentColor, width: '100px' }}></div>
                  </div>
                </div>
              </div>

              {/* Background Color Options */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('planView.backgroundColor')}</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {[
                    { name: 'Dark Blue', value: '#1A202C' },
                    { name: 'Navy', value: '#1A2B47' },
                    { name: 'Charcoal', value: '#2D3748' },
                    { name: 'Slate', value: '#4A5568' },
                    { name: 'Teal', value: '#2C7A7B' },
                    { name: 'Indigo', value: '#4C51BF' },
                    { name: 'Purple', value: '#6B46C1' },
                    { name: 'Rose', value: '#BE185D' },
                    { name: 'Orange', value: '#C05621' },
                    { name: 'Green', value: '#22543D' },
                    { name: 'Red', value: '#742A2A' },
                    { name: 'Gray', value: '#4A5568' }
                  ].map((color) => (
                    <button
                      key={color.value}
                      onClick={() => {
                        setCoverBackgroundColor(color.value);
                        setCoverImageUrl(null);
                      }}
                      className={`w-full h-16 rounded-lg border-2 transition-all ${
                        coverBackgroundColor === color.value && !coverImageUrl
                          ? 'border-gray-900 dark:border-white ring-2 ring-offset-2'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Accent Color Options */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('planView.accentColor')}</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {[
                    { name: 'Orange', value: '#FF6B00' },
                    { name: 'Blue', value: '#2563EB' },
                    { name: 'Green', value: '#10B981' },
                    { name: 'Red', value: '#EF4444' },
                    { name: 'Purple', value: '#8B5CF6' },
                    { name: 'Pink', value: '#EC4899' },
                    { name: 'Yellow', value: '#F59E0B' },
                    { name: 'Teal', value: '#14B8A6' },
                    { name: 'Indigo', value: '#6366F1' },
                    { name: 'Cyan', value: '#06B6D4' },
                    { name: 'Amber', value: '#F97316' },
                    { name: 'Emerald', value: '#059669' }
                  ].map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setCoverAccentColor(color.value)}
                      className={`w-full h-16 rounded-lg border-2 transition-all ${
                        coverAccentColor === color.value
                          ? 'border-gray-900 dark:border-white ring-2 ring-offset-2'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('planView.coverImage')}</h4>
                <div className="space-y-3">
                  {coverImageUrl && (
                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                      <img 
                        src={coverImageUrl} 
                        alt={plan?.title ? `${plan.title} cover preview` : "Business plan cover preview"}
                        loading="lazy"
                        width={800}
                        height={600} 
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => setCoverImageUrl(null)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title={t('planView.removeImage')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !id) return;

                      try {
                        setUploadingCoverImage(true);
                        // Validate file type
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                        if (!allowedTypes.includes(file.type)) {
                          alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                          return;
                        }

                        // Validate file size (10MB max)
                        const maxSize = 10 * 1024 * 1024;
                        if (file.size > maxSize) {
                          alert('File size must be less than 10MB');
                          return;
                        }

                        const imageUrl = await businessPlanService.uploadCoverImage(id, file);
                        setCoverImageUrl(imageUrl);
                      } catch (error: any) {
                        console.error('Failed to upload cover image:', error);
                        alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
                      } finally {
                        setUploadingCoverImage(false);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => coverImageInputRef.current?.click()}
                    disabled={uploadingCoverImage}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:opacity-50"
                  >
                    {uploadingCoverImage ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-gray-700 dark:text-gray-300">{t('planView.uploading')}...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{coverImageUrl ? t('planView.changeImage') : t('planView.uploadImage')}</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('planView.imageUploadHint')}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t-2 border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                onClick={() => setShowCoverModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                {t('planView.cancel')}
              </button>
              <button
                onClick={async () => {
                  if (!id) return;
                  try {
                    setSavingCover(true);
                    await businessPlanService.updateCoverSettings(id, {
                      backgroundColor: coverBackgroundColor,
                      accentColor: coverAccentColor,
                      coverImageUrl: coverImageUrl || undefined
                    });
                    await loadPlan();
                    setShowCoverModal(false);
                  } catch (error: any) {
                    console.error('Failed to save cover settings:', error);
                    alert(`Failed to save cover settings: ${error.message || 'Unknown error'}`);
                  } finally {
                    setSavingCover(false);
                  }
                }}
                disabled={savingCover}
                className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold"
                style={{ backgroundColor: momentumOrange }}
                onMouseEnter={(e) => !savingCover && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                onMouseLeave={(e) => !savingCover && (e.currentTarget.style.backgroundColor = momentumOrange)}
              >
                {savingCover ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t('planView.saving')}...
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

      {/* Plan View Tour */}
      <PlanViewTour />
    </div>
  );
}

