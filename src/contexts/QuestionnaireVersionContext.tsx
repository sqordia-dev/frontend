import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { questionnaireVersionService } from '../lib/questionnaire-version-service';
import type {
  QuestionnaireVersionDetail,
  QuestionnaireStep,
  UpdateQuestionnaireStepRequest,
} from '../types/questionnaire-version';
import type {
  AdminQuestionTemplate,
  CreateQuestionTemplateRequest,
  UpdateQuestionTemplateRequest,
} from '../types/admin-question-template';
import { getUserFriendlyError } from '../utils/error-messages';

interface QuestionnaireVersionContextType {
  // State
  activeVersion: QuestionnaireVersionDetail | null;
  isLoading: boolean;
  isDirty: boolean;
  error: string | null;
  isEditMode: boolean; // true if we have a draft

  // Version management
  loadVersion: () => Promise<void>;
  createDraft: (notes?: string) => Promise<void>;
  publishDraft: () => Promise<void>;
  discardDraft: () => Promise<void>;

  // Question operations (only work in edit mode)
  createQuestion: (data: CreateQuestionTemplateRequest) => Promise<AdminQuestionTemplate | null>;
  updateQuestion: (questionId: string, data: UpdateQuestionTemplateRequest) => Promise<AdminQuestionTemplate | null>;
  deleteQuestion: (questionId: string) => Promise<boolean>;
  reorderQuestions: (items: { questionId: string; order: number }[]) => Promise<boolean>;

  // Step operations (only work in edit mode)
  updateStep: (stepNumber: number, data: UpdateQuestionnaireStepRequest) => Promise<QuestionnaireStep | null>;

  // Utilities
  setIsDirty: (dirty: boolean) => void;
  clearError: () => void;
}

const QuestionnaireVersionContext = createContext<QuestionnaireVersionContextType | undefined>(undefined);

export function QuestionnaireVersionProvider({ children }: { children: ReactNode }) {
  const [activeVersion, setActiveVersion] = useState<QuestionnaireVersionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = activeVersion?.status === 'Draft';

  // Load the active version (draft if exists, otherwise published)
  const loadVersion = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First try to get active draft
      const draft = await questionnaireVersionService.getActiveDraft();
      if (draft) {
        setActiveVersion(draft);
        return;
      }

      // No draft, get published version
      const published = await questionnaireVersionService.getPublishedVersion();
      setActiveVersion(published);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVersion();
  }, [loadVersion]);

  // Create a new draft from published version
  const createDraft = useCallback(async (notes?: string) => {
    try {
      setError(null);
      const draft = await questionnaireVersionService.createDraft(notes);
      setActiveVersion(draft);
      setIsDirty(false);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
      throw err;
    }
  }, []);

  // Publish the current draft
  const publishDraft = useCallback(async () => {
    if (!activeVersion || activeVersion.status !== 'Draft') {
      throw new Error('No draft to publish');
    }

    try {
      setError(null);
      await questionnaireVersionService.publishDraft(activeVersion.id);
      // Reload to get the newly published version
      await loadVersion();
      setIsDirty(false);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
      throw err;
    }
  }, [activeVersion, loadVersion]);

  // Discard the current draft
  const discardDraft = useCallback(async () => {
    if (!activeVersion || activeVersion.status !== 'Draft') {
      throw new Error('No draft to discard');
    }

    try {
      setError(null);
      await questionnaireVersionService.discardDraft(activeVersion.id);
      // Reload to get the published version
      await loadVersion();
      setIsDirty(false);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'delete'));
      throw err;
    }
  }, [activeVersion, loadVersion]);

  // Create a question in the draft
  const createQuestion = useCallback(async (data: CreateQuestionTemplateRequest): Promise<AdminQuestionTemplate | null> => {
    if (!activeVersion || activeVersion.status !== 'Draft') {
      setError('Cannot create question: no active draft');
      return null;
    }

    try {
      setError(null);
      const question = await questionnaireVersionService.createQuestion(activeVersion.id, data);

      // Update local state
      setActiveVersion(prev => {
        if (!prev) return null;
        return {
          ...prev,
          questions: [...prev.questions, question],
          questionCount: prev.questionCount + 1,
        };
      });

      setIsDirty(true);
      return question;
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
      return null;
    }
  }, [activeVersion]);

  // Update a question in the draft
  const updateQuestion = useCallback(async (
    questionId: string,
    data: UpdateQuestionTemplateRequest
  ): Promise<AdminQuestionTemplate | null> => {
    if (!activeVersion || activeVersion.status !== 'Draft') {
      setError('Cannot update question: no active draft');
      return null;
    }

    try {
      setError(null);
      const updatedQuestion = await questionnaireVersionService.updateQuestion(
        activeVersion.id,
        questionId,
        data
      );

      // Update local state
      setActiveVersion(prev => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev.questions.map(q =>
            q.id === questionId ? updatedQuestion : q
          ),
        };
      });

      setIsDirty(true);
      return updatedQuestion;
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
      return null;
    }
  }, [activeVersion]);

  // Delete a question from the draft
  const deleteQuestion = useCallback(async (questionId: string): Promise<boolean> => {
    if (!activeVersion || activeVersion.status !== 'Draft') {
      setError('Cannot delete question: no active draft');
      return false;
    }

    try {
      setError(null);
      await questionnaireVersionService.deleteQuestion(activeVersion.id, questionId);

      // Update local state
      setActiveVersion(prev => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev.questions.filter(q => q.id !== questionId),
          questionCount: prev.questionCount - 1,
        };
      });

      setIsDirty(true);
      return true;
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'delete'));
      return false;
    }
  }, [activeVersion]);

  // Reorder questions in the draft
  const reorderQuestions = useCallback(async (
    items: { questionId: string; order: number }[]
  ): Promise<boolean> => {
    if (!activeVersion || activeVersion.status !== 'Draft') {
      setError('Cannot reorder questions: no active draft');
      return false;
    }

    try {
      setError(null);
      await questionnaireVersionService.reorderQuestions(activeVersion.id, items);

      // Update local state
      setActiveVersion(prev => {
        if (!prev) return null;
        const orderMap = new Map(items.map(i => [i.questionId, i.order]));
        return {
          ...prev,
          questions: prev.questions.map(q => ({
            ...q,
            order: orderMap.get(q.id) ?? q.order,
          })),
        };
      });

      setIsDirty(true);
      return true;
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
      return false;
    }
  }, [activeVersion]);

  // Update a step in the draft
  const updateStep = useCallback(async (
    stepNumber: number,
    data: UpdateQuestionnaireStepRequest
  ): Promise<QuestionnaireStep | null> => {
    if (!activeVersion || activeVersion.status !== 'Draft') {
      setError('Cannot update step: no active draft');
      return null;
    }

    try {
      setError(null);
      const updatedStep = await questionnaireVersionService.updateStep(
        activeVersion.id,
        stepNumber,
        data
      );

      // Update local state
      setActiveVersion(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map(s =>
            s.stepNumber === stepNumber ? updatedStep : s
          ),
        };
      });

      setIsDirty(true);
      return updatedStep;
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
      return null;
    }
  }, [activeVersion]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <QuestionnaireVersionContext.Provider
      value={{
        activeVersion,
        isLoading,
        isDirty,
        error,
        isEditMode,
        loadVersion,
        createDraft,
        publishDraft,
        discardDraft,
        createQuestion,
        updateQuestion,
        deleteQuestion,
        reorderQuestions,
        updateStep,
        setIsDirty,
        clearError,
      }}
    >
      {children}
    </QuestionnaireVersionContext.Provider>
  );
}

export function useQuestionnaireVersion() {
  const context = useContext(QuestionnaireVersionContext);
  if (context === undefined) {
    throw new Error('useQuestionnaireVersion must be used within a QuestionnaireVersionProvider');
  }
  return context;
}
