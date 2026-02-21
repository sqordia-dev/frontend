// CMS Version Status
export type CmsVersionStatus = 'Draft' | 'Published' | 'Archived';

// CMS Approval Status
export type CmsApprovalStatus = 'None' | 'Pending' | 'Approved' | 'Rejected';

// CMS Version Action (for history)
export type CmsVersionAction =
  | 'Created'
  | 'Modified'
  | 'SubmittedForApproval'
  | 'Approved'
  | 'Rejected'
  | 'Scheduled'
  | 'ScheduleCancelled'
  | 'Published'
  | 'Archived';

// CMS Block Type
export type CmsBlockType = 'Text' | 'RichText' | 'Image' | 'Link' | 'Json' | 'Number' | 'Boolean';

// CMS Version (summary)
export interface CmsVersion {
  id: string;
  versionNumber: number;
  status: CmsVersionStatus;
  notes: string | null;
  createdByUserId: string;
  createdByUserName: string | null;
  publishedAt: string | null;
  publishedByUserName: string | null;
  contentBlockCount: number;
  createdAt: string;
  updatedAt: string | null;
  // Scheduling
  scheduledPublishAt: string | null;
  // Approval workflow
  approvalStatus: CmsApprovalStatus;
  approvedAt: string | null;
  approvedByUserId: string | null;
  rejectedAt: string | null;
  rejectedByUserId: string | null;
  rejectionReason: string | null;
}

// CMS Version Detail (with content blocks)
export interface CmsVersionDetail extends CmsVersion {
  contentBlocks: CmsContentBlock[];
}

// CMS Content Block
export interface CmsContentBlock {
  id: string;
  blockKey: string;
  blockType: string;
  content: string;
  language: string;
  sortOrder: number;
  sectionKey: string;
  metadata: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// CMS Asset
export interface CmsAsset {
  id: string;
  fileName: string;
  contentType: string;
  url: string;
  fileSize: number;
  category: string;
  createdAt: string;
}

// Published Content Response
export interface PublishedContent {
  sections: Record<string, CmsContentBlock[]>;
}

// Request Types
export interface CreateCmsVersionRequest {
  notes?: string;
}

export interface UpdateCmsVersionRequest {
  notes?: string;
}

export interface CreateContentBlockRequest {
  blockKey: string;
  blockType: string;
  content: string;
  language?: string;
  sortOrder?: number;
  sectionKey: string;
  metadata?: string;
}

export interface UpdateContentBlockRequest {
  content: string;
  sortOrder?: number;
  metadata?: string;
}

export interface BulkUpdateContentBlocksRequest {
  blocks: {
    id: string;
    content: string;
    sortOrder?: number;
    metadata?: string;
  }[];
}

export interface ReorderContentBlocksRequest {
  items: {
    blockId: string;
    newSortOrder: number;
  }[];
}

// Approval Workflow Types
export interface SubmitForApprovalRequest {
  notes?: string;
}

export interface ApproveVersionRequest {
  notes?: string;
}

export interface RejectVersionRequest {
  reason?: string;
}

export interface ScheduleVersionRequest {
  publishAt: string;
  notes?: string;
}

export interface CancelScheduleRequest {
  notes?: string;
}

// Version History
export interface CmsVersionHistoryEntry {
  id: string;
  cmsVersionId: string;
  action: CmsVersionAction;
  performedByUserId: string;
  performedByUserName: string | null;
  performedAt: string;
  notes: string | null;
  oldStatus: CmsVersionStatus | null;
  newStatus: CmsVersionStatus | null;
  oldApprovalStatus: CmsApprovalStatus | null;
  newApprovalStatus: CmsApprovalStatus | null;
  changeSummary: string | null;
  scheduledPublishAt: string | null;
}

// Content Template Types
export interface CmsContentTemplate {
  id: string;
  name: string;
  description: string | null;
  pageKey: string | null;
  sectionKey: string | null;
  templateData: string;
  previewImageUrl: string | null;
  isPublic: boolean;
  createdByUserId: string;
  createdByUserName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CmsContentTemplateSummary {
  id: string;
  name: string;
  description: string | null;
  pageKey: string | null;
  sectionKey: string | null;
  previewImageUrl: string | null;
  isPublic: boolean;
  createdByUserId: string;
  createdByUserName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCmsTemplateRequest {
  name: string;
  description?: string;
  pageKey?: string;
  sectionKey?: string;
  templateData: string;
  previewImageUrl?: string;
  isPublic?: boolean;
}

export interface UpdateCmsTemplateRequest {
  name: string;
  description?: string;
  pageKey?: string;
  sectionKey?: string;
  templateData?: string;
  previewImageUrl?: string;
  isPublic?: boolean;
}

export interface CreateTemplateFromSectionRequest {
  versionId: string;
  sectionKey: string;
  language: string;
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface ApplyTemplateRequest {
  versionId: string;
  sectionKey: string;
  language: string;
  replaceExisting?: boolean;
}
