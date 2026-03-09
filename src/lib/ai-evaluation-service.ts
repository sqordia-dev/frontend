/**
 * AI Evaluation Service — Frontend client for the Python AI microservice
 * endpoints exposed via the .NET backend proxy.
 *
 * Handles completeness evaluation, LLM-as-Judge results, and A/B testing.
 */

import { apiClient } from './api-client';

/** Longer timeout for AI evaluation calls (Ollama on CPU can take 60-120s) */
const AI_TIMEOUT = 150_000;

// ─── Completeness ──────────────────────────────────────────────

export interface AnswerCompletenessResult {
  completenessScore: number;
  missingElements: string[];
  suggestions: string[];
  confidence: number;
}

export interface StepCompletenessResult {
  stepScore: number;
  coherenceScore: number;
  gaps: string[];
  contradictions: string[];
}

export async function evaluateAnswerCompleteness(
  questionNumber: number,
  questionText: string,
  answer: string,
  language: string = 'fr',
  persona: string = 'entrepreneur',
): Promise<AnswerCompletenessResult> {
  const { data } = await apiClient.post<AnswerCompletenessResult>('/api/v1/ai/evaluate/answer-completeness', {
    questionNumber,
    questionText,
    answer,
    language,
    persona,
  }, { timeout: AI_TIMEOUT });
  return data;
}

export async function evaluateStepCompleteness(
  stepNumber: number,
  answers: Array<{ questionNumber: number; questionText: string; answer: string }>,
  language: string = 'fr',
  persona: string = 'entrepreneur',
): Promise<StepCompletenessResult> {
  const { data } = await apiClient.post<StepCompletenessResult>('/api/v1/ai/evaluate/step-completeness', {
    stepNumber,
    answers,
    language,
    persona,
  }, { timeout: AI_TIMEOUT });
  return data;
}

// ─── LLM-as-Judge ──────────────────────────────────────────────

export interface JudgeEvaluationResult {
  overallScore: number;
  dimensionScores: Record<string, number>;
  findings: Array<{
    dimension: string;
    severity: string;
    message: string;
    section?: string;
  }>;
  mlflowRunId: string;
}

export async function runJudgeEvaluation(
  sectionName: string,
  sectionContent: string,
  businessBrief: string,
  language: string = 'fr',
): Promise<JudgeEvaluationResult> {
  const { data } = await apiClient.post<JudgeEvaluationResult>('/api/v1/ai/judge/full-evaluation', {
    sectionName,
    sectionContent,
    businessBrief,
    language,
  }, { timeout: AI_TIMEOUT });
  return data;
}

// ─── Generation Progress ───────────────────────────────────────

export interface GenerationProgress {
  jobId: string;
  status: string;
  progressPercent: number;
  sections: Array<{
    sectionName: string;
    status: string;
    completenessScore?: number;
    faithfulnessScore?: number;
  }>;
}

export async function getGenerationProgress(jobId: string): Promise<GenerationProgress> {
  const { data } = await apiClient.get<GenerationProgress>(`/api/v1/ai/generate/status/${jobId}`);
  return data;
}

// ─── A/B Testing ───────────────────────────────────────────────

export interface ABTestResult {
  langchainResult: {
    variant: string;
    transformedAnswer: string;
    tokensUsed: number;
    latencyMs: number;
    model: string;
  };
  legacyResult: {
    variant: string;
    transformedAnswer: string;
    tokensUsed: number;
    latencyMs: number;
  } | null;
  evaluation: {
    preferredVariant: string;
    langchainScore: number;
    legacyScore: number;
    reasoning: string;
  } | null;
}

export async function runABTest(
  questionNumber: number,
  questionText: string,
  answer: string,
  action: string = 'polish',
  language: string = 'fr',
): Promise<ABTestResult> {
  const { data } = await apiClient.post<ABTestResult>('/api/v1/ai/ab-test/transform', {
    questionNumber,
    questionText,
    answer,
    action,
    language,
  }, { timeout: AI_TIMEOUT });
  return data;
}
