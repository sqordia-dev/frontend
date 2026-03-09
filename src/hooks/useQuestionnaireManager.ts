import { useMemo, useCallback } from 'react';
import { useQuestionnaireVersion } from '../contexts/QuestionnaireVersionContext';
import type { AdminQuestionTemplate, CreateQuestionTemplateRequest, UpdateQuestionTemplateRequest } from '../types/admin-question-template';

export interface GroupedQuestions {
  stepNumber: number;
  questions: AdminQuestionTemplate[];
}

export function useQuestionnaireManager() {
  const ctx = useQuestionnaireVersion();

  const groupedQuestions = useMemo<GroupedQuestions[]>(() => {
    if (!ctx.activeVersion) return [];
    const map = new Map<number, AdminQuestionTemplate[]>();

    for (const q of ctx.activeVersion.questions) {
      const existing = map.get(q.stepNumber) ?? [];
      existing.push(q);
      map.set(q.stepNumber, existing);
    }

    // Sort by step, then by order within step
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([stepNumber, questions]) => ({
        stepNumber,
        questions: [...questions].sort((a, b) => a.order - b.order),
      }));
  }, [ctx.activeVersion?.questions]);

  const duplicateQuestion = useCallback(
    async (question: AdminQuestionTemplate) => {
      if (!ctx.activeVersion) return null;
      const stepQuestions = ctx.activeVersion.questions.filter(
        (q) => q.stepNumber === question.stepNumber,
      );
      const maxOrder = Math.max(...stepQuestions.map((q) => q.order), 0);

      const data: CreateQuestionTemplateRequest = {
        questionText: `${question.questionText} (copy)`,
        questionTextEN: question.questionTextEN || undefined,
        helpText: question.helpText || undefined,
        helpTextEN: question.helpTextEN || undefined,
        questionType: question.questionType,
        stepNumber: question.stepNumber,
        personaType: question.personaType,
        order: maxOrder + 1,
        isRequired: question.isRequired,
        section: question.section || undefined,
        options: question.options || undefined,
        optionsEN: question.optionsEN || undefined,
        expertAdviceFR: question.expertAdviceFR || undefined,
        expertAdviceEN: question.expertAdviceEN || undefined,
        coachPromptFR: question.coachPromptFR || undefined,
        coachPromptEN: question.coachPromptEN || undefined,
      };

      return ctx.createQuestion(data);
    },
    [ctx.activeVersion, ctx.createQuestion],
  );

  const toggleQuestionStatus = useCallback(
    async (questionId: string, currentActive: boolean) => {
      return ctx.updateQuestion(questionId, { isActive: !currentActive });
    },
    [ctx.updateQuestion],
  );

  return {
    ...ctx,
    groupedQuestions,
    duplicateQuestion,
    toggleQuestionStatus,
  };
}
