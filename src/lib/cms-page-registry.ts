import {
  Type,
  LayoutGrid,
  HelpCircle,
  MessageSquare,
  Palette,
  Globe,
  Building2,
  FileText,
  LayoutDashboard,
  UserCircle,
  ShieldCheck,
  Monitor,
  CreditCard,
  Rocket,
  LogIn,
  UserPlus,
  KeyRound,
  MailCheck,
  Scale,
  Lock,
  Navigation,
  Lightbulb,
  Target,
  Layers,
  PenLine,
  LucideIcon,
} from 'lucide-react';
import { createElement } from 'react';
import { cmsRegistryService, CmsPageRegistryResponse } from './cms-registry-service';

export interface CmsPageDefinition {
  key: string;
  label: string;
  icon: React.ReactNode;
  sections: CmsSectionDefinition[];
  /** If set, this page uses a custom renderer instead of the standard CMS block editor */
  specialRenderer?: string;
}

export interface CmsSectionDefinition {
  key: string;
  label: string;
  icon: React.ReactNode;
  sortOrder: number;
}

const icon = (Icon: React.ElementType) => createElement(Icon, { className: 'w-4 h-4' });

export const CMS_PAGE_REGISTRY: CmsPageDefinition[] = [
  {
    key: 'landing',
    label: 'Landing Page',
    icon: icon(Globe),
    sections: [
      { key: 'landing.hero', label: 'Hero', icon: icon(Type), sortOrder: 0 },
      { key: 'landing.features', label: 'Features', icon: icon(LayoutGrid), sortOrder: 1 },
      { key: 'landing.faq', label: 'FAQ', icon: icon(HelpCircle), sortOrder: 2 },
      { key: 'landing.testimonials', label: 'Testimonials', icon: icon(MessageSquare), sortOrder: 3 },
    ],
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: icon(LayoutDashboard),
    sections: [
      { key: 'dashboard.labels', label: 'Labels & Titles', icon: icon(Type), sortOrder: 0 },
      { key: 'dashboard.empty_states', label: 'Empty States', icon: icon(FileText), sortOrder: 1 },
      { key: 'dashboard.tips', label: 'Tips & Tour', icon: icon(Lightbulb), sortOrder: 2 },
    ],
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: icon(UserCircle),
    sections: [
      { key: 'profile.labels', label: 'Labels & Titles', icon: icon(Type), sortOrder: 0 },
      { key: 'profile.security', label: 'Security', icon: icon(ShieldCheck), sortOrder: 1 },
      { key: 'profile.sessions', label: 'Sessions', icon: icon(Monitor), sortOrder: 2 },
    ],
  },
  {
    key: 'question_templates',
    label: 'Questions',
    icon: icon(HelpCircle),
    specialRenderer: 'question-templates',
    sections: [
      { key: 'question_templates.step1', label: 'Step 1: Vision & Mission', icon: icon(Target), sortOrder: 0 },
      { key: 'question_templates.step2', label: 'Step 2: Market & Customers', icon: icon(Target), sortOrder: 1 },
      { key: 'question_templates.step3', label: 'Step 3: Products & Services', icon: icon(Target), sortOrder: 2 },
      { key: 'question_templates.step4', label: 'Step 4: Strategy & Operations', icon: icon(Target), sortOrder: 3 },
      { key: 'question_templates.step5', label: 'Step 5: Financials & Growth', icon: icon(Target), sortOrder: 4 },
    ],
  },
  {
    key: 'auth',
    label: 'Authentication',
    icon: icon(LogIn),
    sections: [
      { key: 'auth.login', label: 'Login', icon: icon(LogIn), sortOrder: 0 },
      { key: 'auth.register', label: 'Registration', icon: icon(UserPlus), sortOrder: 1 },
      { key: 'auth.forgot_password', label: 'Forgot Password', icon: icon(KeyRound), sortOrder: 2 },
      { key: 'auth.reset_password', label: 'Reset Password', icon: icon(Lock), sortOrder: 3 },
      { key: 'auth.verify_email', label: 'Email Verification', icon: icon(MailCheck), sortOrder: 4 },
    ],
  },
  {
    key: 'global',
    label: 'Global / Shared',
    icon: icon(Globe),
    sections: [
      { key: 'global.branding', label: 'Branding', icon: icon(Palette), sortOrder: 0 },
      { key: 'global.social', label: 'Social Links', icon: icon(Globe), sortOrder: 1 },
      { key: 'global.contact', label: 'Contact Information', icon: icon(Building2), sortOrder: 2 },
      { key: 'global.footer', label: 'Footer', icon: icon(FileText), sortOrder: 3 },
      { key: 'global.navigation', label: 'Navigation', icon: icon(Navigation), sortOrder: 4 },
    ],
  },
];

/** Find a page definition by key */
export function getPageDefinition(pageKey: string): CmsPageDefinition | undefined {
  return CMS_PAGE_REGISTRY.find((p) => p.key === pageKey);
}

/** Get section definitions for a specific page */
export function getPageSections(pageKey: string): CmsSectionDefinition[] {
  return getPageDefinition(pageKey)?.sections ?? [];
}

/** Get section label from the registry, with fallback */
export function getSectionLabel(sectionKey: string): string {
  for (const page of CMS_PAGE_REGISTRY) {
    const section = page.sections.find((s) => s.key === sectionKey);
    if (section) return section.label;
  }
  // Fallback: extract last part and capitalize
  const parts = sectionKey.split('.');
  const last = parts[parts.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/([A-Z])/g, ' $1');
}

/** Get section icon from the registry, with fallback */
export function getSectionIcon(sectionKey: string): React.ReactNode {
  for (const page of CMS_PAGE_REGISTRY) {
    const section = page.sections.find((s) => s.key === sectionKey);
    if (section) return section.icon;
  }
  return icon(FileText);
}

/** Icon name to Lucide component mapping */
const ICON_MAP: Record<string, LucideIcon> = {
  Type,
  LayoutGrid,
  HelpCircle,
  MessageSquare,
  Palette,
  Globe,
  Building2,
  FileText,
  LayoutDashboard,
  UserCircle,
  ShieldCheck,
  Monitor,
  CreditCard,
  Rocket,
  LogIn,
  UserPlus,
  KeyRound,
  MailCheck,
  Scale,
  Lock,
  Navigation,
  Lightbulb,
  Target,
  Layers,
  PenLine,
};

/** Get icon from name string */
function getIconFromName(iconName: string | null): React.ReactNode {
  if (!iconName) return icon(FileText);
  const IconComponent = ICON_MAP[iconName];
  return IconComponent ? icon(IconComponent) : icon(FileText);
}

/** Pages to exclude from the CMS sidebar */
const EXCLUDED_PAGES = ['questionnaire', 'create_plan', 'subscription', 'onboarding', 'legal', 'activity_logs', 'system_health', 'settings'];

/** Convert API response to local CmsPageDefinition format */
function convertApiResponse(apiPages: CmsPageRegistryResponse[]): CmsPageDefinition[] {
  return apiPages
    .filter((page) => !EXCLUDED_PAGES.includes(page.key))
    .map((page) => ({
      key: page.key,
      label: page.label,
      icon: getIconFromName(page.iconName),
      specialRenderer: page.specialRenderer ?? undefined,
      sections: page.sections.map((section) => ({
        key: section.key,
        label: section.label,
        icon: getIconFromName(section.iconName),
        sortOrder: section.sortOrder,
      })),
    }));
}

/** Cache for loaded pages */
let cachedPages: CmsPageDefinition[] | null = null;
let loadPromise: Promise<CmsPageDefinition[]> | null = null;

/**
 * Load CMS pages from the API with fallback to static registry.
 * Results are cached after first successful load.
 */
export async function loadCmsPages(): Promise<CmsPageDefinition[]> {
  // Return cached if available
  if (cachedPages) {
    return cachedPages;
  }

  // Return existing promise if loading
  if (loadPromise) {
    return loadPromise;
  }

  // Start loading
  loadPromise = (async () => {
    try {
      const apiPages = await cmsRegistryService.getPages();
      if (apiPages.length > 0) {
        cachedPages = convertApiResponse(apiPages);
        return cachedPages;
      }
      // Fall back to static if API returned empty
      cachedPages = CMS_PAGE_REGISTRY;
      return cachedPages;
    } catch (error) {
      console.warn('Failed to load CMS pages from API, using static fallback:', error);
      cachedPages = CMS_PAGE_REGISTRY;
      return cachedPages;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * Clear the cached pages (useful for admin operations that modify the registry)
 */
export function clearCmsPagesCache(): void {
  cachedPages = null;
  loadPromise = null;
}
