interface CmsRichTextBlockProps {
  value: string;
  onChange: (value: string) => void;
}

export function CmsRichTextBlock({ value, onChange }: CmsRichTextBlockProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-[#FF6B00] transition-all">
      {/* Toolbar */}
      <div className="bg-gray-50 p-2 flex gap-1 border-b border-gray-200">
        <button
          type="button"
          className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-600"
          title="Bold"
        >
          <span className="material-symbols-outlined text-lg">format_bold</span>
        </button>
        <button
          type="button"
          className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-600"
          title="Italic"
        >
          <span className="material-symbols-outlined text-lg">format_italic</span>
        </button>
        <button
          type="button"
          className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-600"
          title="Bullet List"
        >
          <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
        </button>
        <div className="w-px h-4 bg-gray-300 self-center mx-1" />
        <button
          type="button"
          className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-600"
          title="Link"
        >
          <span className="material-symbols-outlined text-lg">link</span>
        </button>
      </div>

      {/* Content area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full bg-white border-none focus:ring-0 text-sm p-4 leading-relaxed text-slate-600 min-h-[120px] outline-none resize-none"
      />
    </div>
  );
}
