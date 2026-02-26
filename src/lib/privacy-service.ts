import { apiClient } from './api-client';

// Types for Quebec Bill 25 compliance
export interface ConsentItem {
  type: string;
  version: string;
  isAccepted: boolean;
  acceptedAt: string | null;
  requiresUpdate: boolean;
  latestVersion: string;
}

export interface ConsentStatusResponse {
  consents: ConsentItem[];
}

export interface ExportMetadata {
  exportedAt: string;
  exportVersion: string;
  requestedBy: string;
}

export interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  persona: string | null;
  createdAt: string;
  lastModifiedAt: string | null;
}

export interface ConsentRecord {
  type: string;
  version: string;
  isAccepted: boolean;
  acceptedAt: string;
}

export interface UserDataExportResponse {
  metadata: ExportMetadata;
  profile: ProfileData;
  consents: ConsentRecord[];
}

export interface AccountDeletionResponse {
  success: boolean;
  deletionType: string;
  message: string;
  reactivationDeadline: string | null;
}

export type DeletionType = 'Deactivate' | 'Permanent';

export const privacyService = {
  /**
   * Get current consent status for Terms of Service and Privacy Policy
   */
  async getConsents(): Promise<ConsentStatusResponse> {
    try {
      const response = await apiClient.get('/api/v1/privacy/consents');
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        'Failed to load consent status';
      throw new Error(errorMessage);
    }
  },

  /**
   * Update consent (accept Terms of Service or Privacy Policy)
   */
  async updateConsent(
    consentType: string,
    version: string,
    accepted: boolean = true
  ): Promise<ConsentStatusResponse> {
    try {
      const response = await apiClient.put('/api/v1/privacy/consents', {
        consentType,
        version,
        accepted
      });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        'Failed to update consent';
      throw new Error(errorMessage);
    }
  },

  /**
   * Export user's personal data (Bill 25 - data portability)
   */
  async exportData(): Promise<UserDataExportResponse> {
    try {
      const response = await apiClient.get('/api/v1/privacy/export');
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        'Failed to export data';
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete user account (deactivate or permanent)
   */
  async deleteAccount(
    deletionType: DeletionType,
    password: string,
    reason?: string
  ): Promise<AccountDeletionResponse> {
    try {
      const response = await apiClient.post('/api/v1/privacy/delete-account', {
        deletionType,
        password,
        reason
      });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        'Failed to delete account';
      throw new Error(errorMessage);
    }
  }
};
