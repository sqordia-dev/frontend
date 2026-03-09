import { useState } from 'react';
import { Info } from 'lucide-react';
import type { AdminQuestionTemplate, UpdateQuestionTemplateRequest } from '@/types/admin-question-template';
import { BilingualTextarea } from '@/components/cms/shared/BilingualTextarea';
import { useAiContentActions } from '@/hooks/useAiContentActions';

interface QuestionExpertTabProps {
  question: AdminQuestionTemplate;
  isEditMode: boolean;
  onChange: (updates: UpdateQuestionTemplateRequest) => void;
}

export function QuestionExpertTab({ question, isEditMode, onChange }: QuestionExpertTabProps) {
  const [local, setLocal] = useState<{ expertAdviceFR?: string; expertAdviceEN?: string }>({});
  const [genLoadingFR, setGenLoadingFR] = useState(false);
  const [genLoadingEN, setGenLoadingEN] = useState(false);
  const [translateLoadingFRtoEN, setTranslateLoadingFRtoEN] = useState(false);
  const [translateLoadingENtoFR, setTranslateLoadingENtoFR] = useState(false);
  const ai = useAiContentActions();

  const expertFR = local.expertAdviceFR ?? question.expertAdviceFR ?? '';
  const expertEN = local.expertAdviceEN ?? question.expertAdviceEN ?? '';

  const set = (updates: UpdateQuestionTemplateRequest) => {
    setLocal((prev) => ({ ...prev, ...updates }));
    onChange(updates);
  };

  const handleGenerateFR = async () => {
    setGenLoadingFR(true);
    try {
      const result = await ai.generateField({
        blockKey: `expert-advice-${question.id}`,
        blockType: 'Text',
        language: 'fr',
        sectionContext: `Expert advice for question: ${question.questionText}`,
      });
      if (result) set({ expertAdviceFR: result });
    } finally {
      setGenLoadingFR(false);
    }
  };

  const handleGenerateEN = async () => {
    setGenLoadingEN(true);
    try {
      const result = await ai.generateField({
        blockKey: `expert-advice-${question.id}`,
        blockType: 'Text',
        language: 'en',
        sectionContext: `Expert advice for question: ${question.questionText}`,
      });
      if (result) set({ expertAdviceEN: result });
    } finally {
      setGenLoadingEN(false);
    }
  };

  const handleTranslateFRtoEN = async () => {
    setTranslateLoadingFRtoEN(true);
    try {
      const result = await ai.translate({ content: expertFR, fromLang: 'fr', toLang: 'en', blockType: 'Text' });
      if (result) set({ expertAdviceEN: result });
    } finally {
      setTranslateLoadingFRtoEN(false);
    }
  };

  const handleTranslateENtoFR = async () => {
    setTranslateLoadingENtoFR(true);
    try {
      const result = await ai.translate({ content: expertEN, fromLang: 'en', toLang: 'fr', blockType: 'Text' });
      if (result) set({ expertAdviceFR: result });
    } finally {
      setTranslateLoadingENtoFR(false);
    }
  };

  return (
    <div className="space-y-5 p-4">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Expert Tips</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
            Expert advice is shown to users after they answer this question. It provides professional
            insight, industry benchmarks, or best practices to help them improve their business plan.
          </p>
        </div>
      </div>

      <BilingualTextarea
        valueFR={expertFR}
        valueEN={expertEN}
        onChangeFR={(v) => set({ expertAdviceFR: v })}
        onChangeEN={(v) => set({ expertAdviceEN: v })}
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
        labelFR="Conseil d'expert (FR)"
        labelEN="Expert Advice (EN)"
        placeholderFR="Partagez votre expertise sur ce sujet..."
        placeholderEN="Share your expertise on this topic..."
      />
    </div>
  );
}
