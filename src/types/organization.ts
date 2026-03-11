export type OrganizationRole = 'Owner' | 'Admin' | 'Member' | 'Viewer';

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  isActive: boolean;
  joinedAt: string;
  leftAt?: string;
  invitedBy?: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface OrganizationDetail {
  id: string;
  name: string;
  description?: string;
  organizationType: string;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  deactivatedAt?: string;
  maxMembers: number;
  allowMemberInvites: boolean;
  requireEmailVerification: boolean;
  memberCount: number;
  created: string;
  createdBy?: string;
  industry?: string;
  sector?: string;
  teamSize?: string;
  fundingStatus?: string;
  targetMarket?: string;
  businessStage?: string;
  goalsJson?: string;
  city?: string;
  province?: string;
  country?: string;
  profileCompletenessScore: number;
  members?: OrganizationMember[];
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  invitedByName: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface AdminOrganizationDetail {
  id: string;
  name: string;
  description: string;
  organizationType: string;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  deactivatedAt?: string;
  maxMembers: number;
  allowMemberInvites: boolean;
  requireEmailVerification: boolean;
  industry?: string;
  sector?: string;
  teamSize?: string;
  city?: string;
  province?: string;
  country?: string;
  profileCompletenessScore: number;
  memberCount: number;
  businessPlanCount: number;
  pendingInvitationCount: number;
  subscriptionPlan?: string;
  members: AdminOrgMember[];
}

export interface AdminOrgMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
}
