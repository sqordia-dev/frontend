import { useState, useEffect } from 'react';
import { organizationService } from '../lib/organization-service';

/**
 * Lightweight hook that returns the current user's primary organization ID.
 * Caches in sessionStorage to avoid repeated API calls.
 */
export function useCurrentOrganizationId(): string | null {
  const [orgId, setOrgId] = useState<string | null>(() => {
    return sessionStorage.getItem('sqordia_primary_org_id');
  });

  useEffect(() => {
    if (orgId) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let cancelled = false;
    organizationService.getOrganizations().then((orgs) => {
      if (cancelled || orgs.length === 0) return;
      const id = orgs[0].id;
      sessionStorage.setItem('sqordia_primary_org_id', id);
      setOrgId(id);
    }).catch(() => { /* silent */ });

    return () => { cancelled = true; };
  }, [orgId]);

  return orgId;
}
