import { useState, useCallback } from 'react';
import { cmsAiService, type GenerateCmsContentRequest } from '../lib/cms-ai-service';

interface AiActionState {
  isLoading: boolean;
  error: string | null;
}

export function useAiContentActions() {
  const [states, setStates] = useState<Record<string, AiActionState>>({});

  const setActionState = useCallback((key: string, state: Partial<AiActionState>) => {
    setStates((prev) => ({
      ...prev,
      [key]: { ...{ isLoading: false, error: null }, ...prev[key], ...state },
    }));
  }, []);

  const isLoading = useCallback(
    (key: string) => states[key]?.isLoading ?? false,
    [states],
  );

  const generateField = useCallback(
    async (opts: {
      blockKey: string;
      blockType: string;
      language: string;
      sectionContext?: string;
    }): Promise<string | null> => {
      const key = `generate-${opts.blockKey}-${opts.language}`;
      setActionState(key, { isLoading: true, error: null });
      try {
        const result = await cmsAiService.generate({
          brief: `Generate ${opts.sectionContext || 'CMS'} content for ${opts.blockKey}`,
          blockType: opts.blockType,
          language: opts.language,
          sectionContext: opts.sectionContext,
        });
        setActionState(key, { isLoading: false });
        return result.content;
      } catch (err: any) {
        setActionState(key, { isLoading: false, error: err?.message || 'Generation failed' });
        return null;
      }
    },
    [setActionState],
  );

  const translate = useCallback(
    async (opts: {
      content: string;
      fromLang: string;
      toLang: string;
      blockType?: string;
    }): Promise<string | null> => {
      const key = `translate-${opts.fromLang}-${opts.toLang}`;
      setActionState(key, { isLoading: true, error: null });
      try {
        const result = await cmsAiService.generate({
          brief: `Translate the following ${opts.fromLang} text to ${opts.toLang}, maintaining tone and formatting: ${opts.content}`,
          blockType: opts.blockType || 'Text',
          language: opts.toLang,
        });
        setActionState(key, { isLoading: false });
        return result.content;
      } catch (err: any) {
        setActionState(key, { isLoading: false, error: err?.message || 'Translation failed' });
        return null;
      }
    },
    [setActionState],
  );

  const batchFillEmpty = useCallback(
    async (
      emptyBlocks: { id: string; blockKey: string; blockType: string; sectionKey: string }[],
      language: string,
      onProgress?: (filled: number, total: number) => void,
    ): Promise<Map<string, string>> => {
      const results = new Map<string, string>();
      setActionState('batch-fill', { isLoading: true, error: null });

      for (let i = 0; i < emptyBlocks.length; i++) {
        const block = emptyBlocks[i];
        try {
          const result = await cmsAiService.generate({
            brief: `Generate ${block.sectionKey} content for ${block.blockKey}`,
            blockType: block.blockType,
            language,
            sectionContext: block.sectionKey,
          });
          results.set(block.id, result.content);
        } catch {
          // Skip failed blocks
        }
        onProgress?.(i + 1, emptyBlocks.length);
      }

      setActionState('batch-fill', { isLoading: false });
      return results;
    },
    [setActionState],
  );

  const reviewContent = useCallback(
    async (blocksJson: string): Promise<{
      overallScore: number;
      issues: string[];
      suggestions: string[];
    } | null> => {
      setActionState('review', { isLoading: true, error: null });
      try {
        const result = await cmsAiService.generate({
          brief: `Review these CMS content blocks for quality, consistency, completeness. Return JSON with overallScore (0-100), issues[], suggestions[]: ${blocksJson}`,
          blockType: 'Text',
          language: 'en',
        });
        setActionState('review', { isLoading: false });
        return JSON.parse(result.content);
      } catch (err: any) {
        setActionState('review', { isLoading: false, error: err?.message || 'Review failed' });
        return null;
      }
    },
    [setActionState],
  );

  const suggestQuestions = useCallback(
    async (stepContext: string, existingQuestions: string[], persona: string): Promise<string | null> => {
      const key = 'suggest-questions';
      setActionState(key, { isLoading: true, error: null });
      try {
        const result = await cmsAiService.generate({
          brief: `Given step context: ${stepContext}, existing questions: ${existingQuestions.join('; ')}, suggest 3-5 new questions for ${persona}`,
          blockType: 'Text',
          language: 'en',
        });
        setActionState(key, { isLoading: false });
        return result.content;
      } catch (err: any) {
        setActionState(key, { isLoading: false, error: err?.message || 'Suggestion failed' });
        return null;
      }
    },
    [setActionState],
  );

  const improveQuestion = useCallback(
    async (questionText: string): Promise<string | null> => {
      const key = 'improve-question';
      setActionState(key, { isLoading: true, error: null });
      try {
        const result = await cmsAiService.generate({
          brief: `Improve this questionnaire question. Suggest 2-3 clearer alternatives: '${questionText}'`,
          blockType: 'Text',
          language: 'en',
        });
        setActionState(key, { isLoading: false });
        return result.content;
      } catch (err: any) {
        setActionState(key, { isLoading: false, error: err?.message || 'Improvement failed' });
        return null;
      }
    },
    [setActionState],
  );

  const generateValidationRules = useCallback(
    async (questionType: string, questionText: string): Promise<string | null> => {
      const key = 'gen-rules';
      setActionState(key, { isLoading: true, error: null });
      try {
        const result = await cmsAiService.generate({
          brief: `Generate JSON validation rules for a ${questionType} question. Context: ${questionText}`,
          blockType: 'Json',
          language: 'en',
        });
        setActionState(key, { isLoading: false });
        return result.content;
      } catch (err: any) {
        setActionState(key, { isLoading: false, error: err?.message || 'Generation failed' });
        return null;
      }
    },
    [setActionState],
  );

  const adaptForPersona = useCallback(
    async (questionText: string, sourcePersona: string, targetPersona: string): Promise<string | null> => {
      const key = `adapt-${targetPersona}`;
      setActionState(key, { isLoading: true, error: null });
      try {
        const result = await cmsAiService.generate({
          brief: `Adapt this question from ${sourcePersona} to ${targetPersona} persona: '${questionText}'`,
          blockType: 'Text',
          language: 'en',
        });
        setActionState(key, { isLoading: false });
        return result.content;
      } catch (err: any) {
        setActionState(key, { isLoading: false, error: err?.message || 'Adaptation failed' });
        return null;
      }
    },
    [setActionState],
  );

  return {
    states,
    isLoading,
    generateField,
    translate,
    batchFillEmpty,
    reviewContent,
    suggestQuestions,
    improveQuestion,
    generateValidationRules,
    adaptForPersona,
  };
}
