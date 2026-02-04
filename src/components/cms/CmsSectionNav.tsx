import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SectionGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  children?: { key: string; label: string }[];
}

interface CmsSectionNavProps {
  sections: SectionGroup[];
  activeSection: string;
  onSectionClick: (sectionKey: string) => void;
  modifiedSections: Set<string>;
}

export default function CmsSectionNav({
  sections,
  activeSection,
  onSectionClick,
  modifiedSections,
}: CmsSectionNavProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Expand the group that contains the active section
    const initial = new Set<string>();
    for (const section of sections) {
      if (
        section.key === activeSection ||
        section.children?.some((c) => c.key === activeSection)
      ) {
        initial.add(section.key);
      }
    }
    return initial;
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isActive = (key: string) => activeSection === key;
  const isModified = (key: string) => modifiedSections.has(key);

  return (
    <>
      {/* Desktop: Vertical sidebar */}
      <nav className="hidden lg:block w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        <div className="py-3 px-2 space-y-0.5">
          {sections.map((section) => {
            const hasChildren = section.children && section.children.length > 0;
            const isExpanded = expandedGroups.has(section.key);
            const groupModified =
              isModified(section.key) ||
              (section.children?.some((c) => isModified(c.key)) ?? false);

            return (
              <div key={section.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (hasChildren) {
                      toggleGroup(section.key);
                    }
                    onSectionClick(section.key);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative',
                    isActive(section.key)
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-[#FF6B00] border-l-3 border-[#FF6B00]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {section.icon}
                  </span>
                  <span className="truncate flex-1 text-left">{section.label}</span>
                  {groupModified && (
                    <span className="w-2 h-2 rounded-full bg-[#FF6B00] flex-shrink-0" />
                  )}
                  {hasChildren && (
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  )}
                </button>

                {hasChildren && isExpanded && (
                  <div className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-700">
                    {section.children!.map((child) => (
                      <button
                        key={child.key}
                        type="button"
                        onClick={() => onSectionClick(child.key)}
                        className={cn(
                          'w-full flex items-center gap-2 pl-4 pr-3 py-1.5 text-sm rounded-r-lg transition-all duration-200',
                          isActive(child.key)
                            ? 'bg-orange-50 dark:bg-orange-900/20 text-[#FF6B00] font-medium border-l-2 border-[#FF6B00] -ml-[2px]'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                        )}
                      >
                        <span className="truncate flex-1 text-left">{child.label}</span>
                        {isModified(child.key) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Mobile/Tablet: Horizontal scrollable pill bar */}
      <div className="lg:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex overflow-x-auto py-2 px-3 gap-2 scrollbar-none">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => onSectionClick(section.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 flex-shrink-0',
                isActive(section.key)
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                {section.icon}
              </span>
              {section.label}
              {isModified(section.key) && (
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isActive(section.key) ? 'bg-white' : 'bg-[#FF6B00]'
                  )}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
