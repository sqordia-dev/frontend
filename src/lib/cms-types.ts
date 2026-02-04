// CMS Version Status
export type CmsVersionStatus = 'Draft' | 'Published' | 'Archived';

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
