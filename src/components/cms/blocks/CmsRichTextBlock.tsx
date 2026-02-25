import { RichTextEditor } from '../../editor/RichTextEditor';

interface CmsRichTextBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export function CmsRichTextBlock({ value, onChange }: CmsRichTextBlockProps) {
  return (
    <div className="cms-rich-text-block">
      <RichTextEditor
        content={value}
        onChange={onChange}
        placeholder="Enter rich text content..."
        className="min-h-[200px]"
      />
    </div>
  );
}
