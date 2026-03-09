import { useState } from 'react';
import { Sparkles, Globe, ClipboardCheck, X, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiContentActions } from '@/hooks/useAiContentActions';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { Progress } from '@/components/ui/progress';
import type { CmsContentBlock } from '@/lib/cms-types';

interface ContentAiBatchPanelProps {
  open: boolean;
  onClose: () => void;
  language: 'en' | 'fr';
  sectionKey?: string;
}

interface ReviewResult {
  overallScore: number;
  issues: string[];
  suggestions: string[];
}

export function ContentAiBatchPanel({ open, onClose, language, sectionKey }: ContentAiBatchPanelProps) {
  const { blocks, getBlockContent, updateBlock } = useContentBlocks();
  const { batchFillEmpty, translate, reviewContent, isLoading } = useAiContentActions();

  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

  const scopedBlocks = sectionKey
    ? blocks.filter((b) => b.sectionKey === sectionKey && b.language === language)
    : blocks.filter((b) => b.language === language);

  const emptyBlocks = scopedBlocks.filter((b) => !getBlockContent(b.id).trim());
  const filledBlocks = scopedBlocks.filter((b) => getBlockContent(b.id).trim());

  async function handleFillEmpty() {
    if (emptyBlocks.length === 0) return;
    setProgress({ current: 0, total: emptyBlocks.length });

    const toFill = emptyBlocks.map((b: CmsContentBlock) => ({
      id: b.id,
      blockKey: b.blockKey,
      blockType: b.blockType,
      sectionKey: b.sectionKey,
    }));

    const results = await batchFillEmpty(toFill, language, (filled, total) => {
      setProgress({ current: filled, total });
    });

    results.forEach((content, blockId) => {
      updateBlock(blockId, content);
    });
    setProgress(null);
  }

  async function handleTranslateAll() {
    const fromLang = language === 'en' ? 'fr' : 'en';
    setProgress({ current: 0, total: filledBlocks.length });
    let done = 0;
    for (const block of filledBlocks) {
      const content = getBlockContent(block.id);
      if (!content.trim()) { done++; setProgress({ current: done, total: filledBlocks.length }); continue; }
      const result = await translate({ content, fromLang, toLang: language, blockType: block.blockType });
      if (result) updateBlock(block.id, result);
      done++;
      setProgress({ current: done, total: filledBlocks.length });
    }
    setProgress(null);
  }

  async function handleReview() {
    const blocksJson = JSON.stringify(
      filledBlocks.slice(0, 20).map((b) => ({ key: b.blockKey, content: getBlockContent(b.id) }))
    );
    const result = await reviewContent(blocksJson);
    if (result) setReviewResult(result);
  }

  const isBusy = isLoading('batch-fill') || progress !== null;

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-40 flex flex-col w-80 bg-white dark:bg-gray-900',
        'border-l border-border shadow-2xl',
        'animate-in slide-in-from-right-4 duration-300',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-bold text-foreground">AI Batch Actions</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scope info */}
      <div className="px-4 py-2.5 bg-muted/40 border-b border-border text-xs text-muted-foreground">
        {sectionKey ? `Section: ${sectionKey}` : 'All sections'} &bull; {language.toUpperCase()} &bull;{' '}
        {scopedBlocks.length} blocks
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Progress */}
        {progress && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Processing...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <Progress
              value={(progress.current / progress.total) * 100}
              className="h-2"
              indicatorClassName="bg-[#FF6B00] transition-all"
            />
          </div>
        )}

        {/* Fill empty */}
        <div className="rounded-xl border border-border p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-foreground">Fill Empty Blocks</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate content for {emptyBlocks.length} empty block{emptyBlocks.length !== 1 ? 's' : ''}.
          </p>
          <button
            type="button"
            onClick={handleFillEmpty}
            disabled={isBusy || emptyBlocks.length === 0}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors',
              emptyBlocks.length === 0
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60',
            )}
          >
            <span>Fill {emptyBlocks.length} blocks</span>
            {isBusy && isLoading('batch-fill') ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Translate all */}
        <div className="rounded-xl border border-border p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-foreground">Translate All</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Translate {filledBlocks.length} filled block{filledBlocks.length !== 1 ? 's' : ''}{' '}
            from {language === 'en' ? 'French' : 'English'} to {language === 'en' ? 'English' : 'French'}.
          </p>
          <button
            type="button"
            onClick={handleTranslateAll}
            disabled={isBusy || filledBlocks.length === 0}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors',
              filledBlocks.length === 0
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60',
            )}
          >
            <span>Translate {filledBlocks.length} blocks</span>
            {isBusy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Content review */}
        <div className="rounded-xl border border-border p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-foreground">Content Review</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI review of quality, consistency, and completeness.
          </p>
          <button
            type="button"
            onClick={handleReview}
            disabled={isBusy || isLoading('review') || filledBlocks.length === 0}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-60"
          >
            <span>Run Review</span>
            {isLoading('review') ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Review results */}
          {reviewResult && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Score:</span>
                <span
                  className={cn(
                    'font-bold',
                    reviewResult.overallScore >= 80 ? 'text-emerald-600' :
                    reviewResult.overallScore >= 50 ? 'text-amber-600' : 'text-red-600',
                  )}
                >
                  {reviewResult.overallScore}/100
                </span>
              </div>
              {reviewResult.issues.length > 0 && (
                <div>
                  <p className="font-semibold text-foreground mb-1">Issues:</p>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {reviewResult.issues.slice(0, 5).map((issue, i) => (
                      <li key={i} className="flex gap-1"><span className="text-red-500 flex-shrink-0">•</span>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {reviewResult.suggestions.length > 0 && (
                <div>
                  <p className="font-semibold text-foreground mb-1">Suggestions:</p>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {reviewResult.suggestions.slice(0, 5).map((s, i) => (
                      <li key={i} className="flex gap-1"><span className="text-blue-500 flex-shrink-0">•</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
