interface CmsTextBlockProps {
  value: string;
  onChange: (value: string) => void;
  isTitle?: boolean;
}

export function CmsTextBlock({ value, onChange, isTitle }: CmsTextBlockProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-slate-800 focus:ring-2 focus:ring-orange-100 focus:border-[#FF6B00] outline-none transition-all ${
        isTitle ? 'text-lg font-bold' : 'text-sm'
      }`}
    />
  );
}
