import {
  Type,
  LayoutGrid,
  HelpCircle,
  MessageSquare,
  Palette,
  Globe,
  Building2,
  FileText,
  ClipboardList,
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
} from 'lucide-react';
import { createElement } from 'react';

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
    key: 'questionnaire',
    label: 'Questionnaire',
    icon: icon(ClipboardList),
    sections: [
      { key: 'questionnaire.steps', label: 'Step Configuration', icon: icon(Layers), sortOrder: 0 },
      { key: 'questionnaire.labels', label: 'Labels & Buttons', icon: icon(Type), sortOrder: 1 },
      { key: 'questionnaire.tips', label: 'Generation Tips', icon: icon(Lightbulb), sortOrder: 2 },
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
    key: 'create_plan',
    label: 'Create Plan',
    icon: icon(PenLine),
    sections: [
      { key: 'create_plan.labels', label: 'Labels & Titles', icon: icon(Type), sortOrder: 0 },
      { key: 'create_plan.types', label: 'Plan Types', icon: icon(Target), sortOrder: 1 },
    ],
  },
  {
    key: 'subscription',
    label: 'Subscription Plans',
    icon: icon(CreditCard),
    sections: [
      { key: 'subscription.labels', label: 'Labels & Titles', icon: icon(Type), sortOrder: 0 },
      { key: 'subscription.plans', label: 'Plan Definitions', icon: icon(CreditCard), sortOrder: 1 },
    ],
  },
  {
    key: 'onboarding',
    label: 'Onboarding',
    icon: icon(Rocket),
    sections: [
      { key: 'onboarding.welcome', label: 'Welcome', icon: icon(Rocket), sortOrder: 0 },
      { key: 'onboarding.steps', label: 'Steps', icon: icon(Layers), sortOrder: 1 },
      { key: 'onboarding.completion', label: 'Completion', icon: icon(MailCheck), sortOrder: 2 },
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
    key: 'legal',
    label: 'Legal Pages',
    icon: icon(Scale),
    sections: [
      { key: 'legal.terms', label: 'Terms of Service', icon: icon(FileText), sortOrder: 0 },
      { key: 'legal.privacy', label: 'Privacy Policy', icon: icon(Lock), sortOrder: 1 },
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
