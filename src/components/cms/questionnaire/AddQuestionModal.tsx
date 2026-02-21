import { useState } from 'react';
import { X } from 'lucide-react';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function AddQuestionModal({ isOpen, onClose, onSave }: AddQuestionModalProps) {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('text');
  const [charLimit, setCharLimit] = useState('255');
  const [hintText, setHintText] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [personas, setPersonas] = useState({
    entrepreneur: true,
    consultant: false,
    obnl: false,
  });

  if (!isOpen) return null;

  const handlePersonaChange = (persona: keyof typeof personas) => {
    setPersonas((prev) => ({ ...prev, [persona]: !prev[persona] }));
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal Container */}
        <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden border border-orange-100">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-orange-50">
            <h2 className="text-xl font-bold text-slate-800">Add New Question</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-[#FF6B00] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form className="p-8 space-y-6">
            {/* Question Label */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Question Text</label>
              <input
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g., What is your company name?"
                className="w-full px-4 py-3 rounded-lg border border-orange-100 bg-slate-50/50 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Row: Question Type & Character Limit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Question Type</label>
                <div className="relative">
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full appearance-none px-10 py-3 rounded-lg border border-orange-100 bg-slate-50/50 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all cursor-pointer"
                  >
                    <option value="text">Short Text</option>
                    <option value="textarea">Long Text</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="radio">Multiple Choice</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">File Upload</option>
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#FF6B00]/60 text-lg">
                    short_text
                  </span>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Character Limit</label>
                <input
                  type="number"
                  value={charLimit}
                  onChange={(e) => setCharLimit(e.target.value)}
                  placeholder="255"
                  className="w-full px-4 py-3 rounded-lg border border-orange-100 bg-slate-50/50 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all"
                />
              </div>
            </div>

            {/* Persona Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Applicable Personas</label>
              <div className="flex flex-wrap gap-4">
                {Object.entries(personas).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handlePersonaChange(key as keyof typeof personas)}
                        className="peer h-5 w-5 rounded border-orange-200 text-[#FF6B00] focus:ring-orange-200 transition-all cursor-pointer"
                      />
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-[#FF6B00] transition-colors capitalize">
                      {key === 'obnl' ? 'OBNL' : key}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hint Text */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Placeholder / Hint Text
              </label>
              <textarea
                value={hintText}
                onChange={(e) => setHintText(e.target.value)}
                placeholder="Provide additional guidance for the user..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-orange-100 bg-slate-50/50 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] outline-none transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Required Toggle */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div>
                <span className="block text-sm font-semibold text-slate-800">Required field</span>
                <span className="text-xs text-slate-500">User must answer this to proceed</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B00]" />
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-orange-50 flex items-center justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-orange-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-6 py-2.5 rounded-lg bg-[#FF6B00] text-white font-semibold shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all"
            >
              Add Question
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
