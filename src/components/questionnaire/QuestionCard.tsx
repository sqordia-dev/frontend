// frontend/src/components/questionnaire/QuestionCard.tsx
import { CheckCircle2, Sparkles, Lightbulb, ChevronRight, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import NotionStyleEditor, { AIActionType } from './NotionStyleEditor';

interface QuestionCardProps {
  question: {
    id: string;
    questionText: string;
    helpText?: string;
    isRequired: boolean;
    expertAdviceFR?: string;
    expertAdviceEN?: string;
  };
  index: number;
  state: 'active' | 'answered' | 'upcoming';
  answer: string;
  isSaving: boolean;
  isAIProcessing: boolean;
  language: 'en' | 'fr';
  onAnswerChange: (value: string) => void;
  onContinue: () => void;
  onSkip: () => void;
  onEdit: () => void;
  onAIAction: (action: AIActionType) => void;
  onHint: () => void;
}

const T = {
  en: {
    continue: 'Continue',
    skip: 'Skip',
    draft: 'Draft for me',
    hint: 'Hint',
    required: 'Required',
    optional: 'Optional',
    placeholder: 'Start typing your answer...',
    pressEnter: 'or press Enter',
    edit: 'Edit',
  },
  fr: {
    continue: 'Continuer',
    skip: 'Passer',
    draft: 'Rédiger pour moi',
    hint: 'Indice',
    required: 'Requis',
    optional: 'Optionnel',
    placeholder: 'Commencez à taper votre réponse...',
    pressEnter: 'ou appuyez sur Entrée',
    edit: 'Modifier',
  },
};

export default function QuestionCard({
  question,
  index,
  state,
  answer,
  isSaving,
  isAIProcessing,
  language,
  onAnswerChange,
  onContinue,
  onSkip,
  onEdit,
  onAIAction,
  onHint,
}: QuestionCardProps) {
  const { theme } = useTheme();
  const t = T[language] ?? T.en;
  const qNum = index + 1;
  const canContinue = answer.trim().length >= 10;
  const hasExpertAdvice = !!(language === 'fr' ? question.expertAdviceFR : question.expertAdviceEN);

  const cardBg = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const borderActive = 'border-orange-500/40 shadow-md shadow-orange-500/5';
  const borderDefault = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const mutedColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  // ── UPCOMING ──────────────────────────────────────────────
  if (state === 'upcoming') {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl opacity-50 ${question.isRequired ? 'cursor-default' : 'cursor-pointer hover:opacity-70'}`}
        onClick={!question.isRequired ? onEdit : undefined}
      >
        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
        <span className={`text-sm font-medium ${mutedColor}`}>
          Q{qNum} · {question.questionText}
        </span>
        {!question.isRequired && (
          <span className={`ml-auto text-xs ${mutedColor}`}>{t.optional}</span>
        )}
      </div>
    );
  }

  // ── ANSWERED ──────────────────────────────────────────────
  if (state === 'answered') {
    const preview = answer.length > 60 ? answer.slice(0, 60) + '…' : answer;
    return (
      <motion.div
        layout
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
        onClick={onEdit}
      >
        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
        <span className={`text-sm font-medium ${mutedColor} truncate flex-1`}>
          Q{qNum} · {question.questionText}
        </span>
        <span className={`text-sm ${mutedColor} truncate max-w-[200px] hidden sm:block`}>
          "{preview}"
        </span>
        <Edit2
          size={14}
          className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${mutedColor}`}
        />
      </motion.div>
    );
  }

  // ── ACTIVE ────────────────────────────────────────────────
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${cardBg} rounded-2xl border ${borderActive} p-5 md:p-6`}
    >
      {/* Question header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-orange-500 font-bold text-sm">Q{qNum}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              question.isRequired
                ? theme === 'dark'
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'bg-orange-50 text-orange-600'
                : theme === 'dark'
                  ? 'bg-slate-700 text-slate-400'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            {question.isRequired ? t.required : t.optional}
          </span>
        </div>
        <p className={`font-semibold text-base leading-relaxed ${textColor}`}>
          {question.questionText}
        </p>
        {question.helpText && (
          <p className={`text-sm mt-1.5 leading-relaxed ${mutedColor}`}>{question.helpText}</p>
        )}
      </div>

      {/* Editor */}
      <NotionStyleEditor
        key={question.id}
        value={answer}
        onChange={onAnswerChange}
        onSave={onContinue}
        isSaving={isSaving}
        isRequired={question.isRequired}
        minLength={10}
        onAIAction={onAIAction}
        isAIProcessing={isAIProcessing}
        questionId={question.id}
        placeholder={t.placeholder}
        onFocus={() => {}}
      />

      {/* Action bar */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <button
          onClick={() => onAIAction('generate')}
          disabled={isAIProcessing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            theme === 'dark'
              ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles size={13} className={isAIProcessing ? 'animate-spin' : ''} />
          {t.draft}
        </button>

        {hasExpertAdvice && (
          <button
            onClick={onHint}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              theme === 'dark'
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lightbulb size={13} />
            {t.hint}
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {!question.isRequired && (
            <button
              onClick={onSkip}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${mutedColor} ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            >
              {t.skip}
            </button>
          )}
          <button
            onClick={onContinue}
            disabled={!canContinue}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              canContinue
                ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30'
                : theme === 'dark'
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {t.continue}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <p className={`text-xs mt-2 text-right ${mutedColor}`}>{t.pressEnter}</p>
    </motion.div>
  );
}
