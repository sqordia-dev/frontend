import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { cmsService } from '../lib/cms-service';
import { CmsVersionDetail, CmsContentBlock, BulkUpdateContentBlocksRequest } from '../lib/cms-types';
import { getUserFriendlyError } from '../utils/error-messages';

interface CmsContextType {
  activeVersion: CmsVersionDetail | null;
  isLoading: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  error: string | null;
  createVersion: (notes?: string) => Promise<CmsVersionDetail>;
  refreshVersion: () => Promise<void>;
  saveBlocks: (versionId: string, request: BulkUpdateContentBlocksRequest) => Promise<CmsContentBlock[]>;
  publishVersion: (versionId: string) => Promise<void>;
  deleteVersion: (versionId: string) => Promise<void>;
  setIsDirty: (dirty: boolean) => void;
  clearError: () => void;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [activeVersion, setActiveVersion] = useState<CmsVersionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshVersion = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const version = await cmsService.getActiveVersion();
      setActiveVersion(version);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshVersion();
  }, [refreshVersion]);

  const createVersion = useCallback(async (notes?: string) => {
    try {
      setError(null);
      const version = await cmsService.createVersion({ notes });
      setActiveVersion(version);
      setIsDirty(false);
      return version;
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
      throw err;
    }
  }, []);

  const saveBlocks = useCallback(async (versionId: string, request: BulkUpdateContentBlocksRequest) => {
    try {
      setError(null);
      const blocks = await cmsService.bulkUpdateBlocks(versionId, request);
      setLastSaved(new Date());
      setIsDirty(false);
      // Refresh to get updated version
      const version = await cmsService.getVersion(versionId);
      setActiveVersion(version);
      return blocks;
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
      throw err;
    }
  }, []);

  const publishVersion = useCallback(async (versionId: string) => {
    try {
      setError(null);
      await cmsService.publishVersion(versionId);
      setActiveVersion(null);
      setIsDirty(false);
      setLastSaved(null);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
      throw err;
    }
  }, []);

  const deleteVersion = useCallback(async (versionId: string) => {
    try {
      setError(null);
      await cmsService.deleteVersion(versionId);
      setActiveVersion(null);
      setIsDirty(false);
      setLastSaved(null);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'delete'));
      throw err;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <CmsContext.Provider
      value={{
        activeVersion,
        isLoading,
        isDirty,
        lastSaved,
        error,
        createVersion,
        refreshVersion,
        saveBlocks,
        publishVersion,
        deleteVersion,
        setIsDirty,
        clearError,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
}
