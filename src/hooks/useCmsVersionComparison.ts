import { useState, useEffect, useCallback } from 'react';
import { cmsService } from '@/lib/cms-service';
import { CmsContentBlock, CmsVersionDetail } from '@/lib/cms-types';

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface BlockDiff {
  blockKey: string;
  sectionKey: string;
  diffType: DiffType;
  blockA: CmsContentBlock | null; // Old version block
  blockB: CmsContentBlock | null; // New version block
  contentChanged: boolean;
  metadataChanged: boolean;
}

export interface SectionDiff {
  sectionKey: string;
  blocks: BlockDiff[];
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  unchangedCount: number;
}

export interface VersionComparisonResult {
  versionA: CmsVersionDetail | null;
  versionB: CmsVersionDetail | null;
  sections: SectionDiff[];
  totalAdded: number;
  totalRemoved: number;
  totalModified: number;
  totalUnchanged: number;
}

interface UseCmsVersionComparisonOptions {
  versionIdA: string | null;
  versionIdB: string | null;
  language?: string;
}

interface UseCmsVersionComparisonReturn {
  comparison: VersionComparisonResult | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook to compare two CMS versions and compute their differences.
 * Version A is considered the "old" version, Version B is the "new" version.
 */
export function useCmsVersionComparison({
  versionIdA,
  versionIdB,
  language = 'en',
}: UseCmsVersionComparisonOptions): UseCmsVersionComparisonReturn {
  const [comparison, setComparison] = useState<VersionComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!versionIdA || !versionIdB) {
      setComparison(null);
      return;
    }

    let cancelled = false;

    const fetchAndCompare = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both versions in parallel
        const [versionA, versionB] = await Promise.all([
          cmsService.getVersion(versionIdA),
          cmsService.getVersion(versionIdB),
        ]);

        if (cancelled) return;

        // Filter blocks by language
        const blocksA = versionA.contentBlocks.filter((b) => b.language === language);
        const blocksB = versionB.contentBlocks.filter((b) => b.language === language);

        // Create maps by blockKey for easy lookup
        const mapA = new Map<string, CmsContentBlock>();
        const mapB = new Map<string, CmsContentBlock>();

        blocksA.forEach((b) => mapA.set(b.blockKey, b));
        blocksB.forEach((b) => mapB.set(b.blockKey, b));

        // Get all unique block keys and section keys
        const allBlockKeys = new Set([...mapA.keys(), ...mapB.keys()]);
        const sectionMap = new Map<string, BlockDiff[]>();

        let totalAdded = 0;
        let totalRemoved = 0;
        let totalModified = 0;
        let totalUnchanged = 0;

        // Compare blocks
        allBlockKeys.forEach((blockKey) => {
          const blockA = mapA.get(blockKey) ?? null;
          const blockB = mapB.get(blockKey) ?? null;

          let diffType: DiffType;
          let contentChanged = false;
          let metadataChanged = false;

          if (!blockA && blockB) {
            // Block was added in version B
            diffType = 'added';
            totalAdded++;
          } else if (blockA && !blockB) {
            // Block was removed in version B
            diffType = 'removed';
            totalRemoved++;
          } else if (blockA && blockB) {
            // Block exists in both - check if modified
            contentChanged = blockA.content !== blockB.content;
            metadataChanged = blockA.metadata !== blockB.metadata;

            if (contentChanged || metadataChanged) {
              diffType = 'modified';
              totalModified++;
            } else {
              diffType = 'unchanged';
              totalUnchanged++;
            }
          } else {
            // Should not happen
            return;
          }

          const sectionKey = blockB?.sectionKey ?? blockA?.sectionKey ?? 'unknown';
          const diff: BlockDiff = {
            blockKey,
            sectionKey,
            diffType,
            blockA,
            blockB,
            contentChanged,
            metadataChanged,
          };

          if (!sectionMap.has(sectionKey)) {
            sectionMap.set(sectionKey, []);
          }
          sectionMap.get(sectionKey)!.push(diff);
        });

        // Build section diffs
        const sections: SectionDiff[] = [];
        sectionMap.forEach((blocks, sectionKey) => {
          // Sort blocks by sortOrder (prefer version B, fallback to A)
          blocks.sort((a, b) => {
            const orderA = a.blockB?.sortOrder ?? a.blockA?.sortOrder ?? 0;
            const orderB = b.blockB?.sortOrder ?? b.blockA?.sortOrder ?? 0;
            return orderA - orderB;
          });

          sections.push({
            sectionKey,
            blocks,
            addedCount: blocks.filter((b) => b.diffType === 'added').length,
            removedCount: blocks.filter((b) => b.diffType === 'removed').length,
            modifiedCount: blocks.filter((b) => b.diffType === 'modified').length,
            unchangedCount: blocks.filter((b) => b.diffType === 'unchanged').length,
          });
        });

        // Sort sections alphabetically by key
        sections.sort((a, b) => a.sectionKey.localeCompare(b.sectionKey));

        setComparison({
          versionA,
          versionB,
          sections,
          totalAdded,
          totalRemoved,
          totalModified,
          totalUnchanged,
        });
      } catch (err: unknown) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to compare versions';
          setError(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAndCompare();

    return () => {
      cancelled = true;
    };
  }, [versionIdA, versionIdB, language, refreshKey]);

  return { comparison, isLoading, error, refresh };
}
