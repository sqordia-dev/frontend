import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { CmsContentBlock } from '@/lib/cms-types';
import { blockKeyToLabel, parseMetadata } from './utils';

interface BlockEditorProps {
  block: CmsContentBlock;
  onChange: (blockId: string, content: string, metadata?: string) => void;
  disabled?: boolean;
}

interface BooleanMetadata {
  description?: string;
}

/**
 * BooleanBlockEditor
 *
 * A toggle switch for boolean content blocks.
 * Content is stored as the string "true" or "false".
 */
export function BooleanBlockEditor({ block, onChange, disabled }: BlockEditorProps) {
  const label = blockKeyToLabel(block.blockKey);
  const meta = parseMetadata<BooleanMetadata>(block.metadata);
  const isChecked = block.content === 'true';

  const handleChange = (checked: boolean) => {
    onChange(block.id, checked ? 'true' : 'false');
  };

  return (
    <div className="flex items-start gap-3 py-1">
      <Switch
        id={`block-${block.id}`}
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
      />
      <div className="space-y-0.5">
        <Label htmlFor={`block-${block.id}`} className="cursor-pointer">
          {label}
        </Label>
        {meta.description && (
          <p className="text-xs text-muted-foreground">{meta.description}</p>
        )}
      </div>
    </div>
  );
}

export default BooleanBlockEditor;
