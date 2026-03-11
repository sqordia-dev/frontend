import { apiClient } from './api-client';

// ── Types ───────────────────────────────────────────────

export interface QualityDriftAlert {
  sectionType: string;
  metric: string;
  currentValue: number;
  baselineValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
}

export interface QualityDriftReport {
  alerts: QualityDriftAlert[];
  overallHealthy: boolean;
  lastCheckedAt: string;
  monitoredSections: number;
  totalSamples: number;
}

export interface LearnedPreference {
  id: string;
  sectionType: string;
  industry?: string;
  language: string;
  preferenceKey: string;
  preferenceValue: string;
  confidence: number;
  sampleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingResult {
  success: boolean;
  message: string;
  samplesUsed: number;
  metrics: Record<string, number>;
  trainedAt: string;
  modelVersion?: string;
}

export interface QualityPredictionRequest {
  sectionType: string;
  industry?: string;
  planType?: string;
  language: string;
  wordCount: number;
  temperature: number;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  questionnaireCompleteness: number;
  hasBusinessBrief: boolean;
}

export interface QualityPrediction {
  predictedScore: number;
  confidence: number;
  shouldRegenerate: boolean;
  reason: string;
}

// ── Helpers ─────────────────────────────────────────────

function extractValue<T>(data: any): T {
  if (data && typeof data === 'object' && 'isSuccess' in data) {
    if (data.isSuccess && data.value !== undefined) return data.value as T;
    if (!data.isSuccess) throw new Error(data.error?.message || 'Operation failed');
  }
  return data as T;
}

// ── Service ─────────────────────────────────────────────

const BASE = '/api/v1/admin/ml';

export const mlService = {
  /** Check for quality drift across sections and models */
  async getQualityDrift(): Promise<QualityDriftReport> {
    const response = await apiClient.get(`${BASE}/quality-drift`);
    return extractValue<QualityDriftReport>(response.data);
  },

  /** Get learned preferences for a section type */
  async getLearnedPreferences(
    sectionType?: string,
    industry?: string,
    language: string = 'fr'
  ): Promise<LearnedPreference[]> {
    const params = new URLSearchParams();
    if (sectionType) params.set('sectionType', sectionType);
    if (industry) params.set('industry', industry);
    params.set('language', language);
    const response = await apiClient.get(`${BASE}/preferences?${params.toString()}`);
    return extractValue<LearnedPreference[]>(response.data);
  },

  /** Trigger ML model re-training */
  async triggerTraining(): Promise<TrainingResult> {
    const response = await apiClient.post(`${BASE}/train`);
    return extractValue<TrainingResult>(response.data);
  },

  /** Test quality prediction for hypothetical section */
  async predictQuality(request: QualityPredictionRequest): Promise<QualityPrediction> {
    const response = await apiClient.post(`${BASE}/predict-quality`, request);
    return extractValue<QualityPrediction>(response.data);
  },
};
