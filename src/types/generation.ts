/**
 * Generation Types
 * Types for the AI business plan generation flow
 */

// Section status during generation
export type SectionStatus = 'pending' | 'generating' | 'completed' | 'failed';

// Overall generation status
export type GenerationStatus = 'pending' | 'generating' | 'completed' | 'failed';

// Individual section status DTO
export interface SectionStatusDto {
  id: string;
  name: string;
  status: SectionStatus;
}

// Full generation status response DTO
export interface GenerationStatusDto {
  status: GenerationStatus;
  totalSections: number;
  completedSections: string[];
  currentSection: string | null;
  sections: SectionStatusDto[];
  errorMessage: string | null;
}

// Generation request/response types
export interface StartGenerationRequest {
  planId: string;
}

export interface GenerationProgressInfo {
  percentage: number;
  currentSectionName: string | null;
  completedCount: number;
  totalCount: number;
}
