import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { FormSection } from '@/components/form-fields/FormSection';
import { CmsContentBlock } from '@/lib/cms-types';
import { getSectionLabel, getSectionIcon } from '@/lib/cms-page-registry';
import TextBlockEditor from './blocks/TextBlockEditor';
import RichTextBlockEditor from './blocks/RichTextBlockEditor';
import ImageBlockEditor from './blocks/ImageBlockEditor';
import LinkBlockEditor from './blocks/LinkBlockEditor';
import JsonBlockEditor from './blocks/JsonBlockEditor';
import NumberBlockEditor from './blocks/NumberBlockEditor';
import BooleanBlockEditor from './blocks/BooleanBlockEditor';

interface CmsContentEditorProps {
  blocks: CmsContentBlock[];
  language: string;
  onBlockChange: (blockId: string, content: string, metadata?: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  pageSectionKeys?: string[];
  /** When true, render blocks as a flat list without section accordion wrappers */
  flatMode?: boolean;
}

function renderBlockEditor(
  block: CmsContentBlock,
  onBlockChange: (blockId: string, content: string, metadata?: string) => void,
  onImageUpload?: (file: File) => Promise<string>,
  disabled?: boolean
) {
  const commonProps = {
    block,
    onChange: onBlockChange,
    disabled,
  };

  switch (block.blockType) {
    case 'Text':
      return <TextBlockEditor key={block.id} {...commonProps} />;
    case 'RichText':
      return <RichTextBlockEditor key={block.id} {...commonProps} />;
    case 'Image':
      return <ImageBlockEditor key={block.id} {...commonProps} onUpload={onImageUpload} />;
    case 'Link':
      return <LinkBlockEditor key={block.id} {...commonProps} />;
    case 'Json':
      return <JsonBlockEditor key={block.id} {...commonProps} />;
    case 'Number':
      return <NumberBlockEditor key={block.id} {...commonProps} />;
    case 'Boolean':
      return <BooleanBlockEditor key={block.id} {...commonProps} />;
    default:
      return <TextBlockEditor key={block.id} {...commonProps} />;
  }
}

export default function CmsContentEditor({
  blocks,
  language,
  onBlockChange,
  onImageUpload,
  disabled = false,
  sectionRefs,
  pageSectionKeys,
  flatMode = false,
}: CmsContentEditorProps) {
  // Filter blocks by language and page sections, then group by sectionKey
  const sectionGroups = useMemo(() => {
    let filtered = blocks.filter((b) => b.language === language);

    // If pageSectionKeys provided, only show blocks belonging to those sections
    if (pageSectionKeys && pageSectionKeys.length > 0) {
      const sectionKeySet = new Set(pageSectionKeys);
      filtered = filtered.filter((b) => sectionKeySet.has(b.sectionKey));
    }

    const groups: Record<string, CmsContentBlock[]> = {};

    for (const block of filtered) {
      const key = block.sectionKey || 'other';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(block);
    }

    // Sort blocks within each section by sortOrder
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return groups;
  }, [blocks, language, pageSectionKeys]);

  // Order section keys by the pageSectionKeys order if provided
  const sectionKeys = useMemo(() => {
    const keys = Object.keys(sectionGroups);
    if (pageSectionKeys && pageSectionKeys.length > 0) {
      return pageSectionKeys.filter((k) => keys.includes(k));
    }
    return keys;
  }, [sectionGroups, pageSectionKeys]);

  if (sectionKeys.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No content blocks found for this page.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Content blocks will appear here once they are created.
        </p>
      </div>
    );
  }

  // Flat mode: render blocks directly without FormSection accordion wrappers
  if (flatMode) {
    const allBlocks = sectionKeys.flatMap((key) => sectionGroups[key]);
    return (
      <div className="space-y-4">
        {allBlocks.map((block) =>
          renderBlockEditor(block, onBlockChange, onImageUpload, disabled)
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sectionKeys.map((sectionKey, index) => (
        <div
          key={sectionKey}
          ref={(el) => {
            sectionRefs.current[sectionKey] = el;
          }}
        >
          <FormSection
            id={`cms-section-${sectionKey}`}
            title={getSectionLabel(sectionKey)}
            icon={getSectionIcon(sectionKey)}
            defaultOpen={index === 0}
            description={`${sectionGroups[sectionKey].length} block${sectionGroups[sectionKey].length !== 1 ? 's' : ''}`}
          >
            <div className="space-y-4">
              {sectionGroups[sectionKey].map((block) =>
                renderBlockEditor(block, onBlockChange, onImageUpload, disabled)
              )}
            </div>
          </FormSection>
        </div>
      ))}
    </div>
  );
}
