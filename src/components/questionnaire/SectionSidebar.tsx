// frontend/src/components/questionnaire/SectionSidebar.tsx
import { CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface SectionInfo {
  number: number;
  title: string;
  titleFr: string;
  icon: React.ElementType;
  questionCount: number;
  answeredCount: number;
}

interface SectionSidebarProps {
  sections: SectionInfo[];
  currentIndex: number;
  globalPercent: number;
  estimatedMinutes: number;
  onSectionClick: (index: number) => void;
}

const T = {
  en: {
    progress: 'Progress',
    remaining: 'min remaining',
    selectSection: 'Select section',
  },
  fr: {
    progress: 'Progression',
    remaining: 'min restantes',
    selectSection: 'Choisir la section',
  },
};

export default function SectionSidebar({
  sections,
  currentIndex,
  globalPercent,
  estimatedMinutes,
  onSectionClick,
}: SectionSidebarProps) {
  const { theme, language } = useTheme();
  const t = T[language as keyof typeof T] ?? T.en;
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentSection = sections[currentIndex];
  const currentTitle = language === 'fr'
    ? currentSection?.titleFr ?? currentSection?.title
    : currentSection?.title;

  const bg = theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const border = theme === 'dark' ? 'border-slate-800' : 'border-slate-200/80';
  const text = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const muted = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  const sectionList = (
    <ul className="space-y-1">
      {sections.map((section, idx) => {
        const isCurrent = idx === currentIndex;
        const isComplete = section.questionCount > 0 && section.answeredCount === section.questionCount;
        const SectionIcon = section.icon;
        const sectionTitle = language === 'fr' ? (section.titleFr ?? section.title) : section.title;

        return (
          <li key={section.number}>
            <button
              onClick={() => {
                onSectionClick(idx);
                setMobileOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                ${isCurrent
                  ? 'bg-momentum-orange/5 dark:bg-momentum-orange/10 border-l-[3px] border-momentum-orange pl-[9px]'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-l-[3px] border-transparent pl-[9px]'
                }
              `}
            >
              <div className={`
                w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                ${isComplete
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : isCurrent
                    ? 'bg-momentum-orange/10 dark:bg-momentum-orange/20 text-momentum-orange'
                    : theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                }
              `}>
                {isComplete ? <CheckCircle2 size={14} /> : <SectionIcon size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm block truncate ${
                  isCurrent ? `font-semibold ${text}` : `font-medium ${muted}`
                }`}>
                  {sectionTitle}
                </span>
              </div>
              <span className={`text-xs font-medium flex-shrink-0 ${
                isComplete ? 'text-green-500' : muted
              }`}>
                {section.answeredCount}/{section.questionCount}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:block w-[220px] flex-shrink-0 sticky top-[61px] self-start max-h-[calc(100vh-61px)] overflow-y-auto`}>
        <div className={`${bg} rounded-2xl border ${border} p-3 mt-6`}>
          {sectionList}

          {/* Progress footer */}
          <div className={`mt-4 pt-3 border-t ${border}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${muted}`}>{t.progress}</span>
              <span className={`text-xs font-bold ${text}`}>{globalPercent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-momentum-orange rounded-full transition-all duration-700 ease-out"
                style={{ width: `${globalPercent}%` }}
              />
            </div>
            {estimatedMinutes > 0 && (
              <div className={`flex items-center gap-1 mt-2 ${muted}`}>
                <Clock size={11} />
                <span className="text-[11px]">~{estimatedMinutes} {t.remaining}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile dropdown */}
      <div className="lg:hidden px-4 pt-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl ${bg} border ${border} transition-all`}
        >
          <div className="flex items-center gap-2">
            {currentSection && (() => {
              const Icon = currentSection.icon;
              return <Icon size={16} className="text-momentum-orange" />;
            })()}
            <span className={`text-sm font-semibold ${text}`}>{currentTitle}</span>
            <span className={`text-xs ${muted}`}>
              {currentSection?.answeredCount}/{currentSection?.questionCount}
            </span>
          </div>
          <ChevronDown size={16} className={`${muted} transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>

        {mobileOpen && (
          <div className={`mt-2 ${bg} rounded-xl border ${border} p-2 shadow-lg`}>
            {sectionList}
          </div>
        )}
      </div>
    </>
  );
}
