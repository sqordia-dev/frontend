import { useCallback, useEffect, useState } from 'react';
import {
  Type,
  LayoutGrid,
  HelpCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavSection {
  id: string;
  label: string;
  icon: typeof Type;
}

const sections: NavSection[] = [
  { id: 'hero-heading', label: 'Hero', icon: Type },
  { id: 'features', label: 'Features', icon: LayoutGrid },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'main-content', label: 'CTA', icon: Sparkles },
];

interface CmsPreviewNavRailProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function CmsPreviewNavRail({ scrollContainerRef }: CmsPreviewNavRailProps) {
  const [activeSection, setActiveSection] = useState<string>('hero-heading');

  // Track which section is currently in view
  useEffect(() => {
    const container = scrollContainerRef?.current || window;
    const handleScroll = () => {
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom > 200) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  const handleClick = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-2">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => handleClick(section.id)}
            className={cn(
              'group relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
              isActive
                ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300',
            )}
            title={section.label}
          >
            <Icon className="w-4 h-4" />
            {/* Tooltip */}
            <span className="absolute right-full mr-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {section.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
