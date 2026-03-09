import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { AdminQuestionTemplate } from '../types/admin-question-template';
import type { GroupedQuestions } from './useQuestionnaireManager';

type PersonaFilter = 'all' | 'Entrepreneur' | 'Consultant' | 'OBNL';

const DEBOUNCE_MS = 300;

export function useQuestionFilters(
  questions: AdminQuestionTemplate[],
  groupedQuestions: GroupedQuestions[],
) {
  const [persona, setPersona] = useState<PersonaFilter>('all');
  const [stepFilter, setStepFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQueryRaw] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearchQuery = useCallback((value: string) => {
    setSearchQueryRaw(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(value), DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (persona !== 'all' && q.personaType !== null && q.personaType !== persona) return false;
      if (stepFilter !== null && q.stepNumber !== stepFilter) return false;
      if (debouncedSearch) {
        const s = debouncedSearch.toLowerCase();
        const matchFR = q.questionText.toLowerCase().includes(s);
        const matchEN = q.questionTextEN?.toLowerCase().includes(s);
        if (!matchFR && !matchEN) return false;
      }
      return true;
    });
  }, [questions, persona, stepFilter, debouncedSearch]);

  const filteredGrouped = useMemo<GroupedQuestions[]>(() => {
    return groupedQuestions
      .map((g) => ({
        stepNumber: g.stepNumber,
        questions: g.questions.filter((q) => {
          if (persona !== 'all' && q.personaType !== null && q.personaType !== persona) return false;
          if (debouncedSearch) {
            const s = debouncedSearch.toLowerCase();
            const matchFR = q.questionText.toLowerCase().includes(s);
            const matchEN = q.questionTextEN?.toLowerCase().includes(s);
            if (!matchFR && !matchEN) return false;
          }
          return true;
        }),
      }))
      .filter((g) => (stepFilter !== null ? g.stepNumber === stepFilter : true))
      .filter((g) => g.questions.length > 0);
  }, [groupedQuestions, persona, stepFilter, debouncedSearch]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: questions.length };
    for (const q of questions) {
      if (q.personaType) {
        map[q.personaType] = (map[q.personaType] ?? 0) + 1;
      }
    }
    return map;
  }, [questions]);

  return {
    persona,
    setPersona,
    stepFilter,
    setStepFilter,
    searchQuery,
    setSearchQuery,
    filteredQuestions,
    filteredGrouped,
    counts,
  };
}
