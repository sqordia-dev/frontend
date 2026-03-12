import { useState } from 'react';
import type { AdminQuestionTemplate, UpdateQuestionTemplateRequest } from '@/types/admin-question-template';
import { QUESTION_TYPES, PERSONA_TYPES, STEP_DEFINITIONS } from '@/types/admin-question-template';
import { BilingualTextarea } from '@/components/cms/shared/BilingualTextarea';
import { AiGenerateButton } from '@/components/cms/shared/AiGenerateButton';
import { useAiContentActions } from '@/hooks/useAiContentActions';
import { cn } from '@/lib/utils';

interface QuestionBasicTabProps {
  question: AdminQuestionTemplate;
  isEditMode: boolean;
  onChange: (updates: UpdateQuestionTemplateRequest) => void;
}

const CHOICE_TYPES = ['SingleChoice', 'MultipleChoice'];

export function QuestionBasicTab({ question, isEditMode, onChange }: QuestionBasicTabProps) {
  const [local, setLocal] = useState<UpdateQuestionTemplateRequest>({});
  const [improvingLoading, setImprovingLoading] = useState(false);
  const [genRulesLoading, setGenRulesLoading] = useState(false);
  const ai = useAiContentActions();

  const get = <K extends keyof AdminQuestionTemplate>(key: K): AdminQuestionTemplate[K] =>
    (local[key as keyof UpdateQuestionTemplateRequest] as AdminQuestionTemplate[K]) ??
    question[key];

  const set = (updates: UpdateQuestionTemplateRequest) => {
    setLocal((prev) => ({ ...prev, ...updates }));
    onChange(updates);
  };

  const hasOptions = CHOICE_TYPES.includes(get('questionType') as string);

  const handleImprove = async () => {
    setImprovingLoading(true);
    try {
      const text = get('questionText') as string;
      const result = await ai.improveQuestion(text);
      if (result) set({ questionText: result });
    } finally {
      setImprovingLoading(false);
    }
  };

  const handleGenRules = async () => {
    setGenRulesLoading(true);
    try {
      const result = await ai.generateValidationRules(
        get('questionType') as string,
        get('questionText') as string,
      );
      if (result) set({ validationRules: result });
    } finally {
      setGenRulesLoading(false);
    }
  };

  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';
  const inputClass = cn(
    'w-full px-3 py-2 text-sm border border-border rounded-lg bg-background',
    'focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] outline-none transition-all',
    !isEditMode && 'opacity-70 cursor-not-allowed',
  );

  return (
    <div className="space-y-5 p-4">
      {/* Question text */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-foreground">Question Text</label>
          {isEditMode && (
            <AiGenerateButton
              onClick={handleImprove}
              isLoading={improvingLoading}
              label="Improve"
            />
          )}
        </div>
        <BilingualTextarea
          valueFR={get('questionText') as string ?? ''}
          valueEN={get('questionTextEN') as string ?? ''}
          onChangeFR={(v) => set({ questionText: v })}
          onChangeEN={(v) => set({ questionTextEN: v })}
          disabled={!isEditMode}
          rows={2}
          placeholderFR="Texte de la question..."
          placeholderEN="Question text..."
        />
      </div>

      {/* Help text */}
      <div>
        <label className="text-xs font-semibold text-foreground block mb-2">Help Text</label>
        <BilingualTextarea
          valueFR={get('helpText') as string ?? ''}
          valueEN={get('helpTextEN') as string ?? ''}
          onChangeFR={(v) => set({ helpText: v })}
          onChangeEN={(v) => set({ helpTextEN: v })}
          disabled={!isEditMode}
          rows={2}
          placeholderFR="Texte d'aide..."
          placeholderEN="Help text..."
        />
      </div>

      {/* Type / Step / Persona / Order */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Question Type</label>
          <select
            value={get('questionType') as string}
            onChange={(e) => set({ questionType: e.target.value })}
            disabled={!isEditMode}
            className={inputClass}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Step</label>
          <select
            value={get('stepNumber') as number}
            onChange={(e) => set({ stepNumber: Number(e.target.value) })}
            disabled={!isEditMode}
            className={inputClass}
          >
            {STEP_DEFINITIONS.map((s) => (
              <option key={s.number} value={s.number}>Step {s.number}: {s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Persona</label>
          <select
            value={get('personaType') as string ?? '__all__'}
            onChange={(e) => set({ personaType: e.target.value === '__all__' ? null : e.target.value })}
            disabled={!isEditMode}
            className={inputClass}
          >
            {PERSONA_TYPES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Order</label>
          <input
            type="number"
            min={1}
            value={get('order') as number}
            onChange={(e) => set({ order: Number(e.target.value) })}
            disabled={!isEditMode}
            className={inputClass}
          />
        </div>
      </div>

      {/* Section */}
      <div>
        <label className={labelClass}>Section (optional)</label>
        <input
          type="text"
          value={get('section') as string ?? ''}
          onChange={(e) => set({ section: e.target.value })}
          disabled={!isEditMode}
          placeholder="e.g. Company Overview"
          className={inputClass}
        />
      </div>

      {/* Required toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Required</label>
        <button
          type="button"
          onClick={() => set({ isRequired: !get('isRequired') })}
          disabled={!isEditMode}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            get('isRequired') ? 'bg-[#FF6B00]' : 'bg-muted',
            !isEditMode && 'opacity-50 cursor-not-allowed',
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
              get('isRequired') ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      {/* Options (for choice types) */}
      {hasOptions && (
        <div>
          <label className="text-xs font-semibold text-foreground block mb-2">Answer Options</label>
          <BilingualTextarea
            valueFR={get('options') as string ?? ''}
            valueEN={get('optionsEN') as string ?? ''}
            onChangeFR={(v) => set({ options: v })}
            onChangeEN={(v) => set({ optionsEN: v })}
            disabled={!isEditMode}
            rows={3}
            placeholderFR="Option 1&#10;Option 2&#10;Option 3"
            placeholderEN="Option 1&#10;Option 2&#10;Option 3"
          />
          <p className="text-[11px] text-muted-foreground mt-1">One option per line.</p>
        </div>
      )}

      {/* Validation rules */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelClass}>Validation Rules (JSON)</label>
          {isEditMode && (
            <AiGenerateButton
              onClick={handleGenRules}
              isLoading={genRulesLoading}
              label="Generate"
            />
          )}
        </div>
        <textarea
          value={get('validationRules') as string ?? ''}
          onChange={(e) => set({ validationRules: e.target.value })}
          disabled={!isEditMode}
          rows={2}
          placeholder='{"minLength": 10, "maxLength": 500}'
          className={cn(inputClass, 'font-mono text-xs')}
        />
      </div>
    </div>
  );
}
