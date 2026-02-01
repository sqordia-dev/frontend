/**
 * Preview Types
 * Types for business plan preview and editing
 */

// Plan section for preview
export interface PlanSection {
  id: string;
  title: string;
  content: string | null;
  order: number;
  name?: string; // Backend sometimes returns name instead of id
  isGenerated?: boolean;
}

// Full business plan preview data
export interface BusinessPlanPreview {
  id: string;
  title: string;
  sections: PlanSection[];
  createdAt: string;
  updatedAt: string;
  description?: string;
  industry?: string;
  status?: string;
  planType?: string;
}

// AI assist action types
export type AIAssistAction = 'improve' | 'expand' | 'shorten' | 'custom';

// Export format options
export type ExportFormat = 'pdf' | 'docx';

// Share result
export interface ShareResult {
  shareUrl: string;
  shareId?: string;
  expiresAt?: string;
}

// Section update request
export interface UpdateSectionRequest {
  content: string;
}

// Section regenerate request
export interface RegenerateSectionRequest {
  planId: string;
  sectionId: string;
}

// AI assist request
export interface AIAssistRequest {
  action: AIAssistAction;
  content: string;
  language?: string;
}

// AI assist response
export interface AIAssistResponse {
  content: string;
  wordCount?: number;
}
