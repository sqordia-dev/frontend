// frontend/src/components/questionnaire/CoachPanel.tsx
import { X, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface CoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
  expertAdvice: string;
  language: 'en' | 'fr';
}

const T = {
  en: { title: 'Expert Insight', proTip: 'Pro Tip', got: 'Got it' },
  fr: { title: 'Conseil expert', proTip: 'Astuce', got: 'Compris' },
};

export default function CoachPanel({ isOpen, onClose, expertAdvice, language }: CoachPanelProps) {
  const { theme } = useTheme();
  const t = T[language] ?? T.en;

  // Parse pro tip from content
  const tipMatch = expertAdvice.match(/\s*(Astuce\s*:|Pro tip\s*:|Tip\s*:)([\s\S]*)$/i);
  const mainContent = tipMatch ? expertAdvice.slice(0, tipMatch.index).trim() : expertAdvice.trim();
  const tipContent = tipMatch ? tipMatch[2].trim() : null;

  const bg = theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';
  const text = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const muted = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel — right side on desktop, bottom sheet on mobile */}
          <motion.div
            className={`
              fixed z-50 border shadow-xl
              ${bg}
              bottom-0 left-0 right-0 rounded-t-2xl max-h-[70vh] overflow-y-auto
              lg:bottom-auto lg:top-16 lg:left-auto lg:right-4 lg:rounded-2xl lg:w-80 lg:max-h-[calc(100vh-5rem)]
            `}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{}}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-momentum-orange flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <span className={`font-semibold text-sm ${text}`}>{t.title}</span>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-4 space-y-3">
              {mainContent.split('\n').filter(Boolean).map((line, i) => {
                const isBullet = /^[•\-\*]/.test(line.trim());
                return isBullet ? (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-orange-500" />
                    <span className={muted}>{line.replace(/^[•\-\*]\s*/, '')}</span>
                  </div>
                ) : (
                  <p key={i} className={`text-sm leading-relaxed ${muted}`}>{line}</p>
                );
              })}

              {tipContent && (
                <div className={`flex items-start gap-3 p-3 rounded-xl mt-2 ${theme === 'dark' ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-orange-50 border border-orange-200'}`}>
                  <Sparkles size={15} className="flex-shrink-0 mt-0.5 text-orange-500" />
                  <div>
                    <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>{t.proTip}</span>
                    <p className={`text-sm mt-1 leading-relaxed ${muted}`}>{tipContent}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-4 py-3 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'} flex justify-end`}>
              <button
                onClick={onClose}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${theme === 'dark' ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
              >
                <CheckCircle2 size={15} />
                {t.got}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
