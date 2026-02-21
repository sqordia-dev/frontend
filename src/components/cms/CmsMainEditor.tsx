import { CmsPageDefinition, CmsSectionDefinition } from '../../lib/cms-page-registry';
import { CmsContentBlock } from '../../lib/cms-types';
import { CmsBlockCard } from './blocks/CmsBlockCard';

interface CmsMainEditorProps {
  selectedPage?: CmsPageDefinition;
  selectedSection?: CmsSectionDefinition;
  blocks: CmsContentBlock[];
  editedContent: Record<string, string>;
  onContentChange: (blockId: string, content: string) => void;
  onSave: () => Promise<void>;
  isDirty: boolean;
}

export function CmsMainEditor({
  selectedPage,
  selectedSection,
  blocks,
  editedContent,
  onContentChange,
  onSave,
  isDirty,
}: CmsMainEditorProps) {
  // Group blocks by type for rendering
  const sortedBlocks = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  // Get block type icon
  const getBlockTypeIcon = (blockType: string): string => {
    const iconMap: Record<string, string> = {
      Text: 'format_size',
      RichText: 'subject',
      Image: 'image',
      Link: 'link',
      Json: 'data_object',
      Number: 'tag',
      Boolean: 'toggle_on',
    };
    return iconMap[blockType] || 'article';
  };

  // Get block type color
  const getBlockTypeColor = (blockType: string): string => {
    const colorMap: Record<string, string> = {
      Text: 'bg-blue-50 text-blue-600',
      RichText: 'bg-purple-50 text-purple-600',
      Image: 'bg-emerald-50 text-emerald-600',
      Link: 'bg-orange-50 text-orange-600',
      Json: 'bg-cyan-50 text-cyan-600',
      Number: 'bg-pink-50 text-pink-600',
      Boolean: 'bg-amber-50 text-amber-600',
    };
    return colorMap[blockType] || 'bg-gray-50 text-gray-600';
  };

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar relative">
      {/* Sticky breadcrumb header */}
      <div className="sticky top-0 z-10 bg-[#F9FAFB]/80 backdrop-blur-sm border-b border-gray-200 px-4 md:px-8 py-4">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{selectedPage?.label || 'Page'}</span>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-slate-800">{selectedSection?.label || 'Section'}</span>
        </div>
      </div>

      {/* Content blocks */}
      <div className="max-w-3xl mx-auto py-8 md:py-12 px-4 md:px-8 space-y-6 md:space-y-8">
        {sortedBlocks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-gray-400">inbox</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No content configured</h3>
            <p className="text-slate-500 mb-6">This section has no editable content blocks yet.</p>
          </div>
        ) : (
          sortedBlocks.map((block) => (
            <CmsBlockCard
              key={block.id}
              block={block}
              content={editedContent[block.id] ?? block.content}
              onContentChange={(content) => onContentChange(block.id, content)}
              icon={getBlockTypeIcon(block.blockType)}
              iconColorClass={getBlockTypeColor(block.blockType)}
            />
          ))
        )}
      </div>

      {/* Save indicator */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(260px+50%)] z-20">
          <button
            onClick={onSave}
            className="bg-slate-900 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Save Changes
          </button>
        </div>
      )}
    </main>
  );
}
