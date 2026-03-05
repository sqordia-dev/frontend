import { useState, useCallback } from 'react';
import { Sparkles, X, Loader2, Check, Globe } from 'lucide-react';
import { useSSEStream } from '../../hooks/useSSEStream';
import { cmsAiService, GenerateCmsContentRequest } from '../../lib/cms-ai-service';

interface CmsAiGeneratorPanelProps {
  blockType: string;
  sectionContext?: string;
  onAccept: (content: string) => void;
  onClose: () => void;
}

export function CmsAiGeneratorPanel({ blockType, sectionContext, onAccept, onClose }: CmsAiGeneratorPanelProps) {
  const [brief, setBrief] = useState('');
  const [language, setLanguage] = useState('en');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [citations, setCitations] = useState<string[]>([]);
  const { startStream, stopStream } = useSSEStream();

  const handleGenerate = useCallback(async () => {
    if (!brief.trim()) return;
    setGeneratedContent('');
    setCitations([]);
    setIsStreaming(true);

    let content = '';

    await startStream<{ type: string; content?: string }>({
      url: cmsAiService.streamUrl,
      body: {
        brief,
        blockType,
        language,
        sectionContext,
        useWebSearch,
      } satisfies GenerateCmsContentRequest,
      onChunk: (event) => {
        if (event.type === 'token' && event.content) {
          content += event.content;
          setGeneratedContent(content);
        }
      },
      onDone: () => setIsStreaming(false),
      onError: () => setIsStreaming(false),
    });
  }, [brief, blockType, language, sectionContext, useWebSearch, startStream]);

  const handleCancel = () => {
    stopStream();
    setIsStreaming(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-[480px] border-l border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Content Generator</h3>
        </div>
        <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Input area */}
      <div className="space-y-4 p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brief</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            placeholder="Describe what content you want to generate..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isStreaming}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={isStreaming}
            >
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useWebSearch}
              onChange={(e) => setUseWebSearch(e.target.checked)}
              className="rounded border-gray-300"
              disabled={isStreaming}
            />
            <Globe className="h-4 w-4" />
            Web search
          </label>
        </div>
        <button
          onClick={isStreaming ? handleCancel : handleGenerate}
          disabled={!brief.trim() && !isStreaming}
          className={`w-full rounded-lg px-4 py-2 text-sm font-medium text-white ${
            isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'
          } disabled:opacity-50`}
        >
          {isStreaming ? (
            <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Stop</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><Sparkles className="h-4 w-4" /> Generate</span>
          )}
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto p-4">
        {generatedContent ? (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="whitespace-pre-wrap">{generatedContent}</div>
              {isStreaming && <span className="animate-pulse text-purple-500">&#9646;</span>}
            </div>
            {citations.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p className="font-medium mb-1">Sources:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {citations.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
            <p className="text-sm">Generated content will appear here</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {generatedContent && !isStreaming && (
        <div className="flex items-center gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            onClick={() => onAccept(generatedContent)}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Check className="h-4 w-4" /> Use this content
          </button>
          <button
            onClick={() => { setGeneratedContent(''); setCitations([]); }}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" /> Discard
          </button>
        </div>
      )}
    </div>
  );
}
