import { useMemo, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import type { CmsContentBlock } from '@/lib/cms-types';
import { blockKeyToLabel } from './utils';
import { RepeatableItemList, type FieldConfig } from './RepeatableItemList';

interface BlockEditorProps {
  block: CmsContentBlock;
  onChange: (blockId: string, content: string, metadata?: string) => void;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Field configurations per known blockKey
// ---------------------------------------------------------------------------

interface BlockKeyConfig {
  fields: FieldConfig[];
  itemLabel: string;
  maxItems?: number;
}

const BLOCK_KEY_CONFIGS: Record<string, BlockKeyConfig> = {
  'landing.faq.items': {
    fields: [
      {
        key: 'question',
        label: 'Question',
        type: 'text',
        placeholder: 'Enter FAQ question',
        required: true,
      },
      {
        key: 'answer',
        label: 'Answer',
        type: 'textarea',
        placeholder: 'Enter FAQ answer',
        required: true,
      },
    ],
    itemLabel: 'FAQ Item',
  },
  'landing.testimonials.items': {
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        placeholder: 'Person name',
        required: true,
      },
      {
        key: 'role',
        label: 'Role',
        type: 'text',
        placeholder: 'Job title',
      },
      {
        key: 'company',
        label: 'Company',
        type: 'text',
        placeholder: 'Company name',
      },
      {
        key: 'quote',
        label: 'Quote',
        type: 'textarea',
        placeholder: 'Testimonial text',
        required: true,
      },
      {
        key: 'avatar',
        label: 'Avatar URL',
        type: 'url',
        placeholder: 'https://...',
      },
    ],
    itemLabel: 'Testimonial',
  },
  'questionnaire.questions': {
    fields: [
      {
        key: 'questionText',
        label: 'Question Text',
        type: 'text',
        placeholder: 'Enter question',
        required: true,
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Optional description',
      },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: [
          { label: 'Text', value: 'text' },
          { label: 'Number', value: 'number' },
          { label: 'Select', value: 'select' },
          { label: 'Multi-Select', value: 'multiselect' },
          { label: 'Yes/No', value: 'boolean' },
        ],
        required: true,
      },
      {
        key: 'options',
        label: 'Options (comma-separated)',
        type: 'text',
        placeholder: 'Option 1, Option 2, Option 3',
      },
    ],
    itemLabel: 'Question',
  },
};

const DEFAULT_CONFIG: BlockKeyConfig = {
  fields: [
    { key: 'key', label: 'Key', type: 'text' },
    { key: 'value', label: 'Value', type: 'textarea' },
  ],
  itemLabel: 'Item',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * JsonBlockEditor
 *
 * Wraps RepeatableItemList with CMS-specific logic. Parses the block content
 * as a JSON array, determines the appropriate field configuration based on
 * the block key, and serialises changes back to JSON.
 */
export function JsonBlockEditor({ block, onChange, disabled }: BlockEditorProps) {
  const label = blockKeyToLabel(block.blockKey);

  // Parse content safely
  const items = useMemo<Record<string, string>[]>(() => {
    if (!block.content) return [];
    try {
      const parsed = JSON.parse(block.content);
      if (Array.isArray(parsed)) return parsed as Record<string, string>[];
      return [];
    } catch {
      return [];
    }
  }, [block.content]);

  // Determine config for this block key
  const config = BLOCK_KEY_CONFIGS[block.blockKey] ?? DEFAULT_CONFIG;

  const handleItemsChange = useCallback(
    (nextItems: Record<string, string>[]) => {
      onChange(block.id, JSON.stringify(nextItems));
    },
    [block.id, onChange]
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <RepeatableItemList
        items={items}
        fields={config.fields}
        onItemsChange={handleItemsChange}
        itemLabel={config.itemLabel}
        disabled={disabled}
        maxItems={config.maxItems}
      />
    </div>
  );
}

export default JsonBlockEditor;
