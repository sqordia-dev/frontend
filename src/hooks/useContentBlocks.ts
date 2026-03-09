import { useState, useCallback, useRef, useEffect } from 'react';
import { useCms } from '../contexts/CmsContext';
import type { CmsContentBlock, BulkUpdateContentBlocksRequest } from '../lib/cms-types';

const AUTO_SAVE_DELAY = 2000;

export function useContentBlocks() {
  const { activeVersion, saveBlocks, setIsDirty } = useCms();
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [dirtyBlockIds, setDirtyBlockIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const blocks = activeVersion?.contentBlocks ?? [];
  const isDirty = dirtyBlockIds.size > 0;

  // Initialize edited content from blocks
  useEffect(() => {
    if (activeVersion) {
      const initial: Record<string, string> = {};
      activeVersion.contentBlocks.forEach((b) => {
        initial[b.id] = b.content;
      });
      setEditedContent(initial);
      setDirtyBlockIds(new Set());
    }
  }, [activeVersion?.id]);

  const updateBlock = useCallback(
    (blockId: string, content: string) => {
      setEditedContent((prev) => ({ ...prev, [blockId]: content }));
      setDirtyBlockIds((prev) => new Set(prev).add(blockId));
      setIsDirty(true);

      // Reset auto-save timer
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveAllDirtyInternal();
      }, AUTO_SAVE_DELAY);
    },
    [setIsDirty],
  );

  const saveAllDirtyInternal = useCallback(async () => {
    if (!activeVersion || dirtyBlockIds.size === 0) return;

    const blocksToSave = Array.from(dirtyBlockIds).map((id) => ({
      id,
      content: editedContent[id] ?? '',
    }));

    setIsSaving(true);
    try {
      const request: BulkUpdateContentBlocksRequest = { blocks: blocksToSave };
      await saveBlocks(activeVersion.id, request);
      setDirtyBlockIds(new Set());
    } catch {
      // Error handled by CmsContext
    } finally {
      setIsSaving(false);
    }
  }, [activeVersion, dirtyBlockIds, editedContent, saveBlocks]);

  const saveAllDirty = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveAllDirtyInternal();
  }, [saveAllDirtyInternal]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const getBlockContent = useCallback(
    (blockId: string): string => {
      return editedContent[blockId] ?? blocks.find((b) => b.id === blockId)?.content ?? '';
    },
    [editedContent, blocks],
  );

  const getBlocksForSection = useCallback(
    (sectionKey: string, language: 'en' | 'fr'): CmsContentBlock[] => {
      return blocks.filter((b) => b.sectionKey === sectionKey && b.language === language);
    },
    [blocks],
  );

  return {
    blocks,
    editedContent,
    dirtyBlockIds,
    isDirty,
    isSaving,
    updateBlock,
    saveAllDirty,
    getBlockContent,
    getBlocksForSection,
  };
}
