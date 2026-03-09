import { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronRight, CheckCircle2, X, HelpCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface AIInterviewerProps {
  questionText: string;
  helpText?: string;
  questionNumber: number;
  totalQuestions: number;
  sectionTitle: string;
  previousAnswer?: string;
  isAnswered: boolean;
  persona?: 'Entrepreneur' | 'Consultant' | 'OBNL';
  // V3 expert advice from database
  expertAdviceFR?: string;
  expertAdviceEN?: string;
  sectionMode?: boolean;
}

// Translations
const TRANSLATIONS = {
  en: {
    role: 'Business Plan Advisor',
    answered: 'Answered',
    showTips: 'Need help?',
    hideTips: 'Got it, thanks!',
    proTip: 'Pro tip',
    coachIntro: 'Let me share some expert tips to help you nail this answer...',
    coachName: 'Sqordia',
    intros: {
      'Identity & Vision': "Let's start with the foundation of your business. This section helps define who you are.",
      'The Offering': "Now let's explore what makes your product or service unique.",
      'Market Analysis': "Understanding your market is crucial. Let's map out your opportunity.",
      'Operations & People': "Time to think about how you'll run things day-to-day.",
      'Financials & Risks': "Let's get into the numbers - this is where your plan becomes bankable.",
      'Team': "Great teams build great companies. Tell me about yours.",
      'Financials': "Final stretch! Let's nail down your financial projections.",
      'default': "Let's work through this section together.",
    },
    followUps: [
      "Building on that, let me ask you this...",
      "Good context! Now consider this...",
      "That helps paint the picture. Next up...",
      "Perfect, this connects nicely to...",
    ],
  },
  fr: {
    role: 'Conseiller en plan d\'affaires',
    answered: 'Répondu',
    showTips: 'Besoin d\'aide?',
    hideTips: 'Merci, j\'ai compris!',
    proTip: 'Astuce',
    coachIntro: 'Laisse-moi te partager quelques conseils d\'expert pour bien répondre...',
    coachName: 'Sqordia',
    intros: {
      'Identity & Vision': "Commençons par les fondations de votre entreprise. Cette section aide à définir qui vous êtes.",
      'Identité et Vision': "Commençons par les fondations de votre entreprise. Cette section aide à définir qui vous êtes.",
      'The Offering': "Explorons maintenant ce qui rend votre produit ou service unique.",
      "L'Offre": "Explorons maintenant ce qui rend votre produit ou service unique.",
      'Market Analysis': "Comprendre votre marché est crucial. Cartographions votre opportunité.",
      'Analyse de marché': "Comprendre votre marché est crucial. Cartographions votre opportunité.",
      'Operations & People': "Il est temps de réfléchir à la gestion quotidienne.",
      'Opérations et Personnel': "Il est temps de réfléchir à la gestion quotidienne.",
      'Financials & Risks': "Passons aux chiffres - c'est ici que votre plan devient finançable.",
      'Finances et Risques': "Passons aux chiffres - c'est ici que votre plan devient finançable.",
      'Team': "Les grandes équipes bâtissent de grandes entreprises. Parlez-moi de la vôtre.",
      'Équipe': "Les grandes équipes bâtissent de grandes entreprises. Parlez-moi de la vôtre.",
      'Financials': "Dernière ligne droite! Finalisons vos projections financières.",
      'Finances': "Dernière ligne droite! Finalisons vos projections financières.",
      'default': "Travaillons ensemble sur cette section.",
    },
    followUps: [
      "En s'appuyant sur cela, permettez-moi de vous demander...",
      "Bon contexte! Maintenant, considérez ceci...",
      "Cela aide à comprendre. Passons à la suite...",
      "Parfait, cela se connecte bien à...",
    ],
  },
};

// AI Interviewer persona configurations
const AI_PERSONA = {
  name: 'Sqordia',
  avatar: '🤖',
};

export default function AIInterviewer({
  questionText,
  helpText,
  questionNumber,
  // totalQuestions is available for future use (e.g., "Question X of Y" display)
  totalQuestions: _totalQuestions,
  sectionTitle,
  previousAnswer,
  isAnswered,
  persona = 'Entrepreneur',
  expertAdviceFR,
  expertAdviceEN,
  sectionMode = false,
}: AIInterviewerProps) {
  const { theme, language } = useTheme();
  const [isTyping, setIsTyping] = useState(true);
  const [displayedIntro, setDisplayedIntro] = useState('');
  const [showCoachBubble, setShowCoachBubble] = useState(false);
  const introRef = useRef<string>('');

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  const isEnglish = language === 'en';

  // Get contextual intro based on section and language
  const getContextualIntro = (section: string, qNumber: number, isFirst: boolean): string => {
    if (isFirst) {
      return t.intros[section as keyof typeof t.intros] || t.intros.default;
    }
    return t.followUps[qNumber % t.followUps.length];
  };

  const isFirstQuestion = sectionMode || questionNumber === 1;
  const intro = getContextualIntro(sectionTitle, questionNumber, isFirstQuestion);

  // Get full expert advice for the slide-over panel
  const fullExpertAdvice = isEnglish ? expertAdviceEN : expertAdviceFR;
  const hasExpertAdvice = !!(fullExpertAdvice && fullExpertAdvice.trim());

  // Typing animation effect
  useEffect(() => {
    if (introRef.current === intro) return;
    introRef.current = intro;

    setIsTyping(true);
    setDisplayedIntro('');

    let index = 0;
    const timer = setInterval(() => {
      if (index < intro.length) {
        setDisplayedIntro(intro.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [intro]);

  const bgColor = theme === 'dark' ? 'bg-gray-800/50' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="mb-6">
      {/* AI Interviewer Message */}
      <div className={`${bgColor} rounded-2xl border ${borderColor} p-5 mb-4`}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl shadow-lg">
              {AI_PERSONA.avatar}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-semibold ${textColor}`}>{AI_PERSONA.name}</span>
              <span className={`text-xs ${mutedColor}`}>
                <Sparkles size={12} className="inline mr-1" />
                {t.role}
              </span>
              {isAnswered && (
                <span className="ml-auto flex items-center gap-1 text-xs text-green-500">
                  <CheckCircle2 size={14} />
                  {t.answered}
                </span>
              )}
            </div>

            {/* Intro Text with typing effect */}
            <p className={`${mutedColor} text-sm mb-3`}>
              {displayedIntro}
              {isTyping && (
                <span className="inline-block w-2 h-4 bg-orange-500 ml-1 animate-pulse" />
              )}
            </p>

            {/* Question - hidden in section mode */}
            {!sectionMode && questionText && (
              <div className={`${textColor} text-lg font-medium leading-relaxed`}>
                <span className="text-orange-500 font-bold mr-2">Q{questionNumber}.</span>
                {questionText}
              </div>
            )}

            {/* Need Help Button - Shows when expert advice is available, hidden in section mode */}
            {!sectionMode && hasExpertAdvice && !showCoachBubble && (
              <button
                onClick={() => setShowCoachBubble(true)}
                className={`
                  mt-3 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all animate-in fade-in duration-300
                  ${theme === 'dark'
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/30'
                    : 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 hover:from-orange-100 hover:to-amber-100 border border-orange-200'
                  }
                `}
              >
                <HelpCircle size={16} />
                <span>{t.showTips}</span>
                <Sparkles size={14} className="opacity-70" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Coach Bubble - Expert Tips */}
      {!sectionMode && showCoachBubble && hasExpertAdvice && (
        <div className="ml-0 lg:ml-16 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`
            relative rounded-2xl border overflow-hidden
            ${theme === 'dark'
              ? 'bg-gradient-to-br from-orange-950/50 to-amber-950/30 border-orange-500/30'
              : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
            }
          `}>
            {/* Speech bubble pointer */}
            <div className={`
              absolute -top-2 left-8 w-4 h-4 rotate-45
              ${theme === 'dark'
                ? 'bg-orange-950/50 border-l border-t border-orange-500/30'
                : 'bg-orange-50 border-l border-t border-orange-200'
              }
            `} />

            {/* Header */}
            <div className={`
              relative px-4 py-3 flex items-center justify-between border-b
              ${theme === 'dark' ? 'border-orange-500/20' : 'border-orange-200/50'}
            `}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-lg shadow-lg">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                      {t.coachName}
                    </span>
                    <span className={`text-xs ${theme === 'dark' ? 'text-orange-400/70' : 'text-orange-500/70'}`}>
                      <Sparkles size={10} className="inline mr-1" />
                      {t.role}
                    </span>
                  </div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-orange-400/80' : 'text-orange-600/80'}`}>
                    {t.coachIntro}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCoachBubble(false)}
                className={`
                  p-1.5 rounded-lg transition-colors
                  ${theme === 'dark'
                    ? 'hover:bg-orange-500/20 text-orange-400 hover:text-orange-300'
                    : 'hover:bg-orange-100 text-orange-500 hover:text-orange-600'
                  }
                `}
              >
                <X size={16} />
              </button>
            </div>

            {/* Tips Content */}
            <div className="relative px-4 py-4 space-y-4">
              {(() => {
                const text = fullExpertAdvice || '';
                const elements: React.ReactNode[] = [];
                let keyIdx = 0;

                // Smart parsing: split on Astuce/Tip markers first
                const astuceMatch = text.match(/\s*(Astuce\s*:|Pro tip\s*:|Tip\s*:)/i);
                let mainContent = text;
                let astuceContent = '';

                if (astuceMatch && astuceMatch.index !== undefined) {
                  mainContent = text.substring(0, astuceMatch.index).trim();
                  astuceContent = text.substring(astuceMatch.index).trim();
                }

                // Process main content - look for quoted formulas/templates
                const formulaMatch = mainContent.match(/"([^"]+)"/);
                if (formulaMatch && formulaMatch.index !== undefined) {
                  // Text before formula
                  const beforeFormula = mainContent.substring(0, formulaMatch.index).trim();
                  if (beforeFormula) {
                    elements.push(
                      <p key={keyIdx++} className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {beforeFormula}
                      </p>
                    );
                  }

                  // Formula/template - highlighted
                  elements.push(
                    <div key={keyIdx++} className={`
                      p-3 rounded-xl border-l-4
                      ${theme === 'dark'
                        ? 'bg-blue-500/10 border-blue-400 text-blue-200'
                        : 'bg-blue-50 border-blue-400 text-blue-800'
                      }
                    `}>
                      <p className="text-sm font-mono leading-relaxed">
                        "{formulaMatch[1]}"
                      </p>
                    </div>
                  );

                  // Text after formula (before astuce)
                  const afterFormula = mainContent.substring(formulaMatch.index + formulaMatch[0].length).trim();
                  if (afterFormula) {
                    elements.push(
                      <p key={keyIdx++} className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {afterFormula}
                      </p>
                    );
                  }
                } else if (mainContent) {
                  // No formula found - check for bullet points or just show as paragraph
                  if (mainContent.includes('\n')) {
                    mainContent.split('\n').forEach((line) => {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) return;
                      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                        elements.push(
                          <div key={keyIdx++} className="flex items-start gap-2 text-sm">
                            <ChevronRight size={14} className={`flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                              {trimmedLine.replace(/^[•\-\*]\s*/, '')}
                            </span>
                          </div>
                        );
                      } else {
                        elements.push(
                          <p key={keyIdx++} className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {trimmedLine}
                          </p>
                        );
                      }
                    });
                  } else {
                    elements.push(
                      <p key={keyIdx++} className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {mainContent}
                      </p>
                    );
                  }
                }

                // Astuce/Tip section - highlighted box
                if (astuceContent) {
                  elements.push(
                    <div key={keyIdx++} className={`
                      flex items-start gap-3 p-3 rounded-xl
                      ${theme === 'dark' ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-white border border-orange-200'}
                    `}>
                      <Sparkles size={16} className="flex-shrink-0 mt-0.5 text-orange-500" />
                      <div>
                        <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                          {isEnglish ? 'Pro Tip' : 'Astuce'}
                        </span>
                        <p className={`text-sm mt-1 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {astuceContent.replace(/^(Astuce\s*:|Pro tip\s*:|Tip\s*:)\s*/i, '')}
                        </p>
                      </div>
                    </div>
                  );
                }

                return elements;
              })()}
            </div>

            {/* Footer */}
            <div className={`
              px-4 py-3 border-t flex justify-end
              ${theme === 'dark' ? 'border-orange-500/20' : 'border-orange-200/50'}
            `}>
              <button
                onClick={() => setShowCoachBubble(false)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all
                  ${theme === 'dark'
                    ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }
                `}
              >
                <CheckCircle2 size={16} />
                {t.hideTips}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
