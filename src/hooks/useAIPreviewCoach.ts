import { useCallback, useMemo } from 'react';
import { useAICoach } from './useAICoach';
import { PlanSection } from '../types/preview';

/** Sentinel questionId — gives one conversation per user per plan */
export const PLAN_PREVIEW_QUESTION_ID = 'plan-preview';

export type QuickActionType = 'review' | 'consistency' | 'narrative';

interface UseAIPreviewCoachOptions {
  businessPlanId: string;
  activeSection: PlanSection | null;
  language?: string;
  persona?: string | null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function useAIPreviewCoach(options: UseAIPreviewCoachOptions) {
  const { businessPlanId, activeSection, language = 'en', persona } = options;

  const questionText = useMemo(
    () =>
      activeSection
        ? `Plan Preview - Viewing: ${activeSection.title}`
        : 'Plan Preview',
    [activeSection]
  );

  const currentAnswer = useMemo(
    () => (activeSection?.content ? stripHtml(activeSection.content) : null),
    [activeSection]
  );

  const {
    sendMessage,
    ...coachRest
  } = useAICoach({
    businessPlanId,
    questionId: PLAN_PREVIEW_QUESTION_ID,
    questionText,
    currentAnswer,
    language,
    persona,
  });

  const sendQuickAction = useCallback(
    async (type: QuickActionType) => {
      if (!activeSection) return;

      const title = activeSection.title;
      const content = truncate(stripHtml(activeSection.content || ''), 2000);

      let message: string;

      switch (type) {
        case 'review':
          message = `Please review my '${title}' section:\n\n${content}\n\nProvide feedback on clarity, completeness, and professionalism.`;
          break;
        case 'consistency':
          message = `Check my '${title}' section for consistency with the rest of the plan:\n\n${content}`;
          break;
        case 'narrative':
          message = `Help me improve the narrative flow of '${title}':\n\n${content}`;
          break;
      }

      await sendMessage(message);
    },
    [activeSection, sendMessage]
  );

  return {
    ...coachRest,
    sendMessage,
    sendQuickAction,
    activeSection,
  };
}

export default useAIPreviewCoach;
