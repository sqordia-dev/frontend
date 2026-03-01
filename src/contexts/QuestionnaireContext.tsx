import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * Question info for context building
 */
interface QuestionInfo {
  labelFr: string;
  labelEn: string;
  category: string;
}

/**
 * Business context extracted from questionnaire answers
 */
export interface BusinessContext {
  businessName?: string;
  businessSector?: string;
  previousAnswers: Record<number, string>;
  answeredQuestions: number[];
}

/**
 * Question relationship mappings based on STRUCTURE FINALE
 * Each question knows which other questions provide relevant context
 */
const QUESTION_RELATIONSHIPS: Record<number, number[]> = {
  1: [],
  2: [1],
  3: [1, 5, 6],
  4: [1, 3, 5, 6],
  5: [1, 2],
  6: [1, 3, 5],
  7: [1, 4, 5, 6],
  8: [1, 4, 5, 6, 7],
  9: [1, 4, 5, 6, 7, 8],
  10: [1, 2, 5],
  11: [1, 10],
  12: [1, 4, 5, 8],
  13: [1, 12, 14],
  14: [1, 12, 13, 17],
  15: [1, 12, 14],
  16: [1, 10, 17],
  17: [1, 4, 5, 6, 8, 10, 14],
  18: [1, 2, 3, 4, 5, 6, 8],
  19: [1, 4, 5, 6, 7, 8, 10],
  20: [1, 4, 5, 7, 10, 12],
  21: [1, 5, 6, 7, 17],
  22: [1, 5, 7, 14, 17],
};

/**
 * Question info map for building context summaries
 */
const QUESTION_INFO: Record<number, QuestionInfo> = {
  1: { labelFr: "Nom et résumé de l'activité", labelEn: "Business Name & Activity", category: "identity" },
  2: { labelFr: "Histoire et motivations", labelEn: "Story & Motivations", category: "identity" },
  3: { labelFr: "Problème client identifié", labelEn: "Customer Problem", category: "market" },
  4: { labelFr: "Solution et différenciation", labelEn: "Solution & Differentiation", category: "offering" },
  5: { labelFr: "Secteur d'activité", labelEn: "Industry Sector", category: "market" },
  6: { labelFr: "Profil client cible", labelEn: "Target Customer", category: "market" },
  7: { labelFr: "Concurrence", labelEn: "Competition", category: "market" },
  8: { labelFr: "Produits/Services et prix", labelEn: "Products/Services & Pricing", category: "offering" },
  9: { labelFr: "Stratégie marketing", labelEn: "Marketing Strategy", category: "operations" },
  10: { labelFr: "Équipe et promoteurs", labelEn: "Team & Promoters", category: "team" },
  11: { labelFr: "Forme juridique", labelEn: "Legal Structure", category: "identity" },
  12: { labelFr: "Besoins matériels", labelEn: "Material Needs", category: "operations" },
  13: { labelFr: "Apport personnel", labelEn: "Personal Investment", category: "financials" },
  14: { labelFr: "Besoin de financement", labelEn: "Financing Needs", category: "financials" },
  15: { labelFr: "Date de lancement", labelEn: "Launch Date", category: "operations" },
  16: { labelFr: "Évolution RH", labelEn: "HR Evolution", category: "team" },
  17: { labelFr: "Objectifs an 1", labelEn: "Year 1 Objectives", category: "strategy" },
  18: { labelFr: "Questions complémentaires", labelEn: "Additional Details", category: "general" },
  19: { labelFr: "SWOT - Forces", labelEn: "SWOT - Strengths", category: "strategy" },
  20: { labelFr: "SWOT - Faiblesses", labelEn: "SWOT - Weaknesses", category: "strategy" },
  21: { labelFr: "SWOT - Opportunités", labelEn: "SWOT - Opportunities", category: "strategy" },
  22: { labelFr: "SWOT - Menaces", labelEn: "SWOT - Threats", category: "strategy" },
};

interface QuestionnaireContextType {
  // Answer management
  answers: Record<string, string>; // questionId -> answer
  answersByNumber: Record<number, string>; // questionNumber -> answer
  setAnswer: (questionId: string, questionNumber: number | undefined, answer: string) => void;
  setAnswers: (answers: Record<string, string>, questions: Array<{ id: string; questionNumber?: number }>) => void;

  // Business context
  businessContext: BusinessContext;
  getBusinessName: () => string | undefined;
  getBusinessSector: () => string | undefined;

  // Context helpers
  getRelatedAnswers: (questionNumber: number) => Record<number, string>;
  buildContextSummary: (questionNumber: number, language: string) => string;

  // Question info
  getQuestionInfo: (questionNumber: number) => QuestionInfo | undefined;
}

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export function QuestionnaireProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswersState] = useState<Record<string, string>>({});
  const [answersByNumber, setAnswersByNumber] = useState<Record<number, string>>({});
  // Track mapping from question ID to question number (used internally)
  const [_questionIdToNumber, setQuestionIdToNumber] = useState<Record<string, number>>({});

  // Set a single answer
  const setAnswer = useCallback((questionId: string, questionNumber: number | undefined, answer: string) => {
    setAnswersState(prev => ({ ...prev, [questionId]: answer }));

    if (questionNumber) {
      setAnswersByNumber(prev => ({ ...prev, [questionNumber]: answer }));
      setQuestionIdToNumber(prev => ({ ...prev, [questionId]: questionNumber }));
    }
  }, []);

  // Bulk set answers (on initial load)
  const setAnswersBulk = useCallback((
    newAnswers: Record<string, string>,
    questions: Array<{ id: string; questionNumber?: number }>
  ) => {
    setAnswersState(newAnswers);

    const byNumber: Record<number, string> = {};
    const idToNum: Record<string, number> = {};

    questions.forEach(q => {
      if (q.questionNumber && newAnswers[q.id]) {
        byNumber[q.questionNumber] = newAnswers[q.id];
        idToNum[q.id] = q.questionNumber;
      }
    });

    setAnswersByNumber(byNumber);
    setQuestionIdToNumber(idToNum);
  }, []);

  // Get business name from Q1
  const getBusinessName = useCallback(() => {
    const q1Answer = answersByNumber[1];
    if (!q1Answer) return undefined;

    // Extract first line or first 100 chars as business name
    const firstLine = q1Answer.split('\n')[0].trim();
    return firstLine.length <= 100 ? firstLine : firstLine.substring(0, 100);
  }, [answersByNumber]);

  // Get business sector from Q5
  const getBusinessSector = useCallback(() => {
    const q5Answer = answersByNumber[5];
    if (!q5Answer) return undefined;

    return q5Answer.length <= 150 ? q5Answer : q5Answer.substring(0, 150);
  }, [answersByNumber]);

  // Get related answers for a specific question
  const getRelatedAnswers = useCallback((questionNumber: number): Record<number, string> => {
    const relatedQuestions = QUESTION_RELATIONSHIPS[questionNumber] || [];
    const related: Record<number, string> = {};

    // Always include Q1 and Q5 if available (core identity)
    if (answersByNumber[1] && !relatedQuestions.includes(1)) {
      related[1] = answersByNumber[1];
    }
    if (answersByNumber[5] && !relatedQuestions.includes(5)) {
      related[5] = answersByNumber[5];
    }

    relatedQuestions.forEach(qNum => {
      if (answersByNumber[qNum]) {
        related[qNum] = answersByNumber[qNum];
      }
    });

    return related;
  }, [answersByNumber]);

  // Build context summary for AI
  const buildContextSummary = useCallback((questionNumber: number, language: string): string => {
    const isFrench = language === 'fr';
    const relatedAnswers = getRelatedAnswers(questionNumber);

    if (Object.keys(relatedAnswers).length === 0) {
      return '';
    }

    const contextParts: string[] = [];
    const header = isFrench
      ? "CONTEXTE DU PROJET (Réponses précédentes):"
      : "PROJECT CONTEXT (Previous answers):";

    // Add business identity first (Q1)
    if (relatedAnswers[1]) {
      const label = isFrench ? "Entreprise" : "Business";
      const truncated = relatedAnswers[1].length > 200
        ? relatedAnswers[1].substring(0, 197) + "..."
        : relatedAnswers[1];
      contextParts.push(`[${label}] ${truncated}`);
    }

    // Add sector (Q5)
    if (relatedAnswers[5]) {
      const label = isFrench ? "Secteur" : "Sector";
      const truncated = relatedAnswers[5].length > 150
        ? relatedAnswers[5].substring(0, 147) + "..."
        : relatedAnswers[5];
      contextParts.push(`[${label}] ${truncated}`);
    }

    // Add other related answers
    Object.entries(relatedAnswers).forEach(([qNumStr, answer]) => {
      const qNum = parseInt(qNumStr);
      if (qNum === 1 || qNum === 5) return; // Already added

      const info = QUESTION_INFO[qNum];
      if (info && answer) {
        const label = isFrench ? info.labelFr : info.labelEn;
        const truncated = answer.length > 150
          ? answer.substring(0, 147) + "..."
          : answer;
        contextParts.push(`[Q${qNum}: ${label}] ${truncated}`);
      }
    });

    if (contextParts.length === 0) return '';

    return `${header}\n\n${contextParts.join('\n\n')}`;
  }, [getRelatedAnswers]);

  // Get question info
  const getQuestionInfo = useCallback((questionNumber: number) => {
    return QUESTION_INFO[questionNumber];
  }, []);

  // Build business context object
  const businessContext = useMemo<BusinessContext>(() => ({
    businessName: getBusinessName(),
    businessSector: getBusinessSector(),
    previousAnswers: answersByNumber,
    answeredQuestions: Object.keys(answersByNumber).map(Number).filter(n => answersByNumber[n]?.trim().length >= 10),
  }), [answersByNumber, getBusinessName, getBusinessSector]);

  const value: QuestionnaireContextType = {
    answers,
    answersByNumber,
    setAnswer,
    setAnswers: setAnswersBulk,
    businessContext,
    getBusinessName,
    getBusinessSector,
    getRelatedAnswers,
    buildContextSummary,
    getQuestionInfo,
  };

  return (
    <QuestionnaireContext.Provider value={value}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire() {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
  }
  return context;
}

export { QUESTION_RELATIONSHIPS, QUESTION_INFO };
