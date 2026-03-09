import { useState, useEffect, useCallback } from 'react';
import { organizationService } from '../lib/organization-service';
import type { OrganizationProfile, UpdateOrganizationProfileRequest } from '../types/organization-profile';
import { calculateProfileCompletion } from '../types/organization-profile';

export function useOrganizationProfile() {
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationService.getMyOrganizationProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load organization profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: UpdateOrganizationProfileRequest) => {
    if (!profile?.id) throw new Error('No organization found');
    setError(null);
    try {
      const updated = await organizationService.updateOrganizationProfile(profile.id, data);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update organization profile');
      throw err;
    }
  }, [profile?.id]);

  const completionInfo = calculateProfileCompletion(profile);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
    completionInfo,
  };
}
