import {
  Circle,
  BarChart3,
  Target,
  Settings,
  DollarSign,
  AlertTriangle,
  Paperclip,
  type LucideIcon,
} from 'lucide-react';
import { PlanSection } from '../../types/preview';

/**
 * TOC category names
 */
export type TOCCategory =
  | 'INTRODUCTION'
  | 'MARKET ANALYSIS'
  | 'STRATEGY'
  | 'OPERATIONS & TEAM'
  | 'FINANCIAL'
  | 'RISK ANALYSIS'
  | 'APPENDIX';

/**
 * Category display order
 */
export const CATEGORY_ORDER: TOCCategory[] = [
  'INTRODUCTION',
  'MARKET ANALYSIS',
  'STRATEGY',
  'OPERATIONS & TEAM',
  'FINANCIAL',
  'RISK ANALYSIS',
  'APPENDIX',
];

/**
 * Map section titles to categories
 */
const sectionToCategoryMap: Record<string, TOCCategory> = {
  // Introduction
  'executive summary': 'INTRODUCTION',
  'company overview': 'INTRODUCTION',
  'company description': 'INTRODUCTION',
  'business overview': 'INTRODUCTION',
  'introduction': 'INTRODUCTION',

  // Market Analysis
  'market analysis': 'MARKET ANALYSIS',
  'competitive analysis': 'MARKET ANALYSIS',
  'industry analysis': 'MARKET ANALYSIS',
  'market research': 'MARKET ANALYSIS',
  'target market': 'MARKET ANALYSIS',
  'customer analysis': 'MARKET ANALYSIS',

  // Strategy
  'business model': 'STRATEGY',
  'marketing strategy': 'STRATEGY',
  'marketing plan': 'STRATEGY',
  'products and services': 'STRATEGY',
  'products': 'STRATEGY',
  'services': 'STRATEGY',
  'sales strategy': 'STRATEGY',
  'go-to-market strategy': 'STRATEGY',
  'growth strategy': 'STRATEGY',

  // Operations & Team
  'operations plan': 'OPERATIONS & TEAM',
  'operations': 'OPERATIONS & TEAM',
  'management team': 'OPERATIONS & TEAM',
  'team': 'OPERATIONS & TEAM',
  'key personnel': 'OPERATIONS & TEAM',
  'organization': 'OPERATIONS & TEAM',
  'organizational structure': 'OPERATIONS & TEAM',

  // Financial
  'financial projections': 'FINANCIAL',
  'financials': 'FINANCIAL',
  'funding requirements': 'FINANCIAL',
  'funding request': 'FINANCIAL',
  'financial summary': 'FINANCIAL',
  'revenue model': 'FINANCIAL',
  'investment': 'FINANCIAL',

  // Risk Analysis
  'risk analysis': 'RISK ANALYSIS',
  'risks': 'RISK ANALYSIS',
  'risk assessment': 'RISK ANALYSIS',
  'swot analysis': 'RISK ANALYSIS',
  'swot': 'RISK ANALYSIS',

  // Appendix
  'appendix': 'APPENDIX',
  'appendices': 'APPENDIX',
  'supporting documents': 'APPENDIX',
};

/**
 * Icons for each category
 */
export const categoryIcons: Record<TOCCategory, LucideIcon> = {
  'INTRODUCTION': Circle,
  'MARKET ANALYSIS': BarChart3,
  'STRATEGY': Target,
  'OPERATIONS & TEAM': Settings,
  'FINANCIAL': DollarSign,
  'RISK ANALYSIS': AlertTriangle,
  'APPENDIX': Paperclip,
};

/**
 * Get the category for a section based on its title
 */
export function getSectionCategory(title: string): TOCCategory {
  const normalizedTitle = title.toLowerCase().trim();

  // Try exact match first
  if (sectionToCategoryMap[normalizedTitle]) {
    return sectionToCategoryMap[normalizedTitle];
  }

  // Try partial match
  for (const [key, category] of Object.entries(sectionToCategoryMap)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
      return category;
    }
  }

  // Default to Introduction for unknown sections
  return 'INTRODUCTION';
}

/**
 * Section with its category and order number
 */
export interface CategorizedSection extends PlanSection {
  category: TOCCategory;
  orderNumber: number;
}

/**
 * Grouped sections by category
 */
export interface GroupedSections {
  category: TOCCategory;
  sections: CategorizedSection[];
}

/**
 * Group sections by their categories
 * Preserves original section order within each category
 */
export function groupSectionsByCategory(sections: PlanSection[]): GroupedSections[] {
  // First, categorize all sections
  const categorizedSections: CategorizedSection[] = sections.map((section, index) => ({
    ...section,
    category: getSectionCategory(section.title),
    orderNumber: index + 1,
  }));

  // Group by category
  const categoryMap = new Map<TOCCategory, CategorizedSection[]>();

  categorizedSections.forEach((section) => {
    const existing = categoryMap.get(section.category) || [];
    existing.push(section);
    categoryMap.set(section.category, existing);
  });

  // Convert to array and sort by category order
  const grouped: GroupedSections[] = [];

  CATEGORY_ORDER.forEach((category) => {
    const sections = categoryMap.get(category);
    if (sections && sections.length > 0) {
      grouped.push({
        category,
        sections,
      });
    }
  });

  return grouped;
}

/**
 * Get the icon component for a category
 */
export function getCategoryIconComponent(category: TOCCategory): LucideIcon {
  return categoryIcons[category] || Circle;
}

/**
 * Map of section title keywords to emoji icons for modern/magazine styles
 */
const sectionTitleToEmoji: Record<string, string> = {
  'executive': '&#128221;', // memo
  'summary': '&#128221;',
  'company': '&#127970;', // office building
  'overview': '&#127970;',
  'market': '&#128200;', // chart increasing
  'competitive': '&#9876;', // swords
  'industry': '&#127981;', // factory
  'business model': '&#128161;', // light bulb
  'strategy': '&#127919;', // dart
  'marketing': '&#128227;', // megaphone
  'products': '&#128230;', // package
  'services': '&#128188;', // briefcase
  'operations': '&#9881;', // gear
  'management': '&#128101;', // busts in silhouette
  'team': '&#128101;',
  'financial': '&#128176;', // money bag
  'funding': '&#128178;', // dollar bills
  'risk': '&#9888;', // warning
  'swot': '&#128202;', // bar chart
  'appendix': '&#128206;', // paperclip
};

/**
 * Get emoji icon for a section based on its title (for modern/magazine styles)
 */
export function getCategoryIcon(title: string): string {
  const normalizedTitle = title.toLowerCase();

  for (const [keyword, emoji] of Object.entries(sectionTitleToEmoji)) {
    if (normalizedTitle.includes(keyword)) {
      return emoji;
    }
  }

  return '&#128196;'; // default: page facing up
}
