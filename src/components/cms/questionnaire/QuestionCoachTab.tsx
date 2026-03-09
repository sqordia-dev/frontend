import { useState } from 'react';
import { Bot } from 'lucide-react';
import type { AdminQuestionTemplate, UpdateQuestionTemplateRequest } from '@/types/admin-question-template';
import { BilingualTextarea } from '@/components/cms/shared/BilingualTextarea';
import { useAiContentActions } from '@/hooks/useAiContentActions';
import { CoachPromptTester } from './CoachPromptTester';

interface QuestionCoachTabProps {
  question: AdminQuestionTemplate;
  isEditMode: boolean;
  onChange: (updates: UpdateQuestionTemplateRequest) => void;
}

export function QuestionCoachTab({ question, isEditMode, onChange }: QuestionCoachTabProps) {
  const [local, setLocal] = useState<{ coachPromptFR?: string; coachPromptEN?: string }>({});
  const [genLoadingFR, setGenLoadingFR] = useState(false);
  const [genLoadingEN, setGenLoadingEN] = useState(false);
  const [translateLoadingFRtoEN, setTranslateLoadingFRtoEN] = useState(false);
  const [translateLoadingENtoFR, setTranslateLoadingENtoFR] = useState(false);
  const ai = useAiContentActions();

  const coachFR = local.coachPromptFR ?? question.coachPromptFR ?? '';
  const coachEN = local.coachPromptEN ?? question.coachPromptEN ?? '';

  const set = (updates: UpdateQuestionTemplateRequest) => {
    setLocal((prev) => ({ ...prev, ...updates }));
    onChange(updates);
  };

  const handleGenerateFR = async () => {
    setGenLoadingFR(true);
    try {
      const result = await ai.generateField({
        blockKey: `coach-prompt-${question.id}`,
        blockType: 'Text',
        language: 'fr',
        sectionContext: `AI coach system prompt for question: ${question.questionText}. The prompt should guide the AI to provide helpful coaching feedback on the user's answer.`,
      });
      if (result) set({ coachPromptFR: result });
    } finally {
      setGenLoadingFR(false);
    }
  };

  const handleGenerateEN = async () => {
    setGenLoadingEN(true);
    try {
      const result = await ai.generateField({
        blockKey: `coach-prompt-${question.id}`,
        blockType: 'Text',
        language: 'en',
        sectionContext: `AI coach system prompt for question: ${question.questionTextEN || question.questionText}. The prompt should guide the AI to provide helpful coaching feedback on the user's answer.`,
      });
      if (result) set({ coachPromptEN: result });
    } finally {
      setGenLoadingEN(false);
    }
  };

  const handleTranslateFRtoEN = async () => {
    setTranslateLoadingFRtoEN(true);
    try {
      const result = await ai.translate({ content: coachFR, fromLang: 'fr', toLang: 'en', blockType: 'Text' });
      if (result) set({ coachPromptEN: result });
    } finally {
      setTranslateLoadingFRtoEN(false);
    }
  };

  const handleTranslateENtoFR = async () => {
    setTranslateLoadingENtoFR(true);
    try {
      const result = await ai.translate({ content: coachEN, fromLang: 'en', toLang: 'fr', blockType: 'Text' });
      if (result) set({ coachPromptFR: result });
    } finally {
      setTranslateLoadingENtoFR(false);
    }
  };

  return (
    <div className="space-y-5 p-4">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
        <Bot size={16} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">AI Coach Prompts</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
            These system prompts guide the AI coach when analyzing user responses to this question.
            Well-written prompts result in more relevant, actionable coaching feedback.
          </p>
        </div>
      </div>

      <BilingualTextarea
        valueFR={coachFR}
        valueEN={coachEN}
        onChangeFR={(v) => set({ coachPromptFR: v })}
        onChangeEN={(v) => set({ coachPromptEN: v })}
        onAiGenerate={(lang) => lang === 'fr' ? handleGenerateFR() : handleGenerateEN()}
        onAiTranslate={(dir) => dir === 'fr-to-en' ? handleTranslateFRtoEN() : handleTranslateENtoFR()}
        isGenerating={{
          fr: genLoadingFR,
          en: genLoadingEN,
        }}
        isTranslating={{
          'fr-to-en': translateLoadingFRtoEN,
          'en-to-fr': translateLoadingENtoFR,
        }}
        disabled={!isEditMode}
        rows={5}
        labelFR="Prompt coach (FR)"
        labelEN="Coach Prompt (EN)"
        placeholderFR="Vous êtes un coach expert en planification d'affaires..."
        placeholderEN="You are an expert business plan coach..."
      />

      <CoachPromptTester questionId={question.id} />
    </div>
  );
}
