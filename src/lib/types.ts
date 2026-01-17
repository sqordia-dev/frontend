export interface ApiResponse<T> {
  isSuccess: boolean;
  value: T | null;
  errorMessage: string | null;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  createdAt: string;
  profilePictureUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface GoogleAuthRequest {
  idToken: string;
  accessToken: string;
}

export interface LinkGoogleAccountRequest {
  idToken: string;
  accessToken: string;
}

export interface BusinessPlan {
  id: string;
  title: string;
  description?: string;
  industry?: string;
  businessType?: string;
  status: string;
  createdAt: string;
  coverSettings?: {
    backgroundColor?: string;
    accentColor?: string;
    coverImageUrl?: string;
  };
}

export interface CreateBusinessPlanRequest {
  title: string;
  description?: string;
  industry?: string;
  businessType?: string;
  organizationId?: string;
  templateId?: string;
}

export interface OBNLPlan {
  id: string;
  organizationId: string;
  mission: string;
  vision: string;
  obnlType: string;
  targetAudience?: string;
  goals: string[];
  activities: string[];
  fundingSources: string[];
  complianceRequirements: string[];
  complianceStatus?: string;
  createdAt: string;
}

export interface CreateOBNLPlanRequest {
  organizationId: string;
  mission: string;
  vision: string;
  obnlType: string;
  targetAudience?: string;
  goals?: string[];
  activities?: string[];
  fundingSources?: string[];
  complianceRequirements?: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content?: string;
  category: string;
  type?: string;
  industry?: string;
  targetAudience?: string;
  audience?: string; // Alias for targetAudience
  language?: string;
  country?: string;
  isPublic: boolean;
  isDefault?: boolean;
  usageCount: number;
  rating: number;
  ratingCount?: number;
  tags?: string | string[];
  previewImage?: string;
  author?: string;
  version?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  lastUsed?: string;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  content?: string;
  category: string; // TemplateCategory enum as string
  type: string; // TemplateType enum as string
  industry?: string;
  targetAudience?: string;
  language?: string;
  country?: string;
  isPublic?: boolean;
  tags?: string;
  previewImage?: string;
  author?: string;
  authorEmail?: string;
  version?: string;
  changelog?: string;
}

export interface FinancialProjection {
  id: string;
  businessPlanId: string;
  name: string;
  description?: string;
  projectionType: string;
  scenario?: string;
  year: number;
  month?: number;
  amount: number;
  currencyCode?: string;
  category?: string;
  subCategory?: string;
  isRecurring: boolean;
  frequency?: string;
  growthRate?: number;
  createdAt: string;
}

export interface CreateFinancialProjectionRequest {
  businessPlanId: string;
  name: string;
  description?: string;
  projectionType: string;
  scenario?: string;
  year: number;
  month?: number;
  amount: number;
  currencyCode?: string;
  category?: string;
  subCategory?: string;
  isRecurring?: boolean;
  frequency?: string;
  growthRate?: number;
  assumptions?: string;
  notes?: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  organizationType: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
}
