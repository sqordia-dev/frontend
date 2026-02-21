import { CmsContentBlock } from '../../../lib/cms-types';
import { CmsTextBlock } from './CmsTextBlock';
import { CmsRichTextBlock } from './CmsRichTextBlock';
import { CmsImageBlock } from './CmsImageBlock';

interface CmsBlockCardProps {
  block: CmsContentBlock;
  content: string;
  onContentChange: (content: string) => void;
  icon: string;
  iconColorClass: string;
}

export function CmsBlockCard({
  block,
  content,
  onContentChange,
  icon,
  iconColorClass,
}: CmsBlockCardProps) {
  // Format block key for display
  const formatBlockLabel = (blockKey: string): string => {
    const parts = blockKey.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Render content editor based on block type
  const renderEditor = () => {
    switch (block.blockType) {
      case 'Text':
        return (
          <CmsTextBlock
            value={content}
            onChange={onContentChange}
            isTitle={block.blockKey.toLowerCase().includes('title')}
          />
        );
      case 'RichText':
        return (
          <CmsRichTextBlock
            value={content}
            onChange={onContentChange}
          />
        );
      case 'Image':
        return (
          <CmsImageBlock
            value={content}
            onChange={onContentChange}
            blockKey={block.blockKey}
          />
        );
      case 'Link':
        return (
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                Button Text
              </label>
              <input
                type="text"
                value={(() => {
                  try {
                    const parsed = JSON.parse(content);
                    return parsed.text || '';
                  } catch {
                    return content;
                  }
                })()}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(content);
                    onContentChange(JSON.stringify({ ...parsed, text: e.target.value }));
                  } catch {
                    onContentChange(JSON.stringify({ text: e.target.value, url: '' }));
                  }
                }}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-orange-100 focus:border-[#FF6B00] outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                Link URL
              </label>
              <input
                type="text"
                value={(() => {
                  try {
                    const parsed = JSON.parse(content);
                    return parsed.url || '';
                  } catch {
                    return '';
                  }
                })()}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(content);
                    onContentChange(JSON.stringify({ ...parsed, url: e.target.value }));
                  } catch {
                    onContentChange(JSON.stringify({ text: '', url: e.target.value }));
                  }
                }}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-orange-100 focus:border-[#FF6B00] outline-none transition-all"
              />
            </div>
          </div>
        );
      case 'Number':
        return (
          <input
            type="number"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-orange-100 focus:border-[#FF6B00] outline-none transition-all"
          />
        );
      case 'Boolean':
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onContentChange(content === 'true' ? 'false' : 'true')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                content === 'true' ? 'bg-[#FF6B00]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  content === 'true' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-slate-600">
              {content === 'true' ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );
      case 'Json':
        return (
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={6}
            className="w-full bg-slate-900 text-green-400 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-orange-100 focus:border-[#FF6B00] outline-none transition-all"
          />
        );
      default:
        return (
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={4}
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-orange-100 focus:border-[#FF6B00] outline-none transition-all"
          />
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColorClass}`}>
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {formatBlockLabel(block.blockKey)}
          </span>
        </div>
        <span className="material-symbols-outlined text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          drag_indicator
        </span>
      </div>

      {/* Content editor */}
      {renderEditor()}
    </div>
  );
}
