import { useState } from 'react';

interface QuestionnaireStep {
  id: string;
  stepNumber: number;
  title: string;
  persona: string;
  questionCount: number;
}

interface QuestionnaireFlowPreviewProps {
  step?: QuestionnaireStep;
  persona: string;
}

export function QuestionnaireFlowPreview({ step, persona: _persona }: QuestionnaireFlowPreviewProps) {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <aside className="w-[420px] border-l border-gray-200 bg-white p-8 shrink-0 overflow-y-auto hidden xl:flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Flow Preview</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Mobile-first user perspective</p>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-md border border-slate-200">
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded transition-all ${
              device === 'mobile' ? 'bg-white shadow-sm text-[#FF6B00]' : 'text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">smartphone</span>
          </button>
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded transition-all ${
              device === 'desktop' ? 'bg-white shadow-sm text-[#FF6B00]' : 'text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
          </button>
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="mx-auto w-[290px] h-[580px] border-[10px] border-slate-900 rounded-[3rem] shadow-2xl relative bg-white overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-b-xl z-20" />

        <div className="flex flex-col h-full">
          {/* Progress bar */}
          <div className="px-6 pt-10 pb-4">
            <div className="w-full bg-slate-100 h-1.5 rounded-full">
              <div
                className="h-full bg-[#FF6B00] rounded-full transition-all"
                style={{ width: `${((step?.stepNumber || 1) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 space-y-6 overflow-y-auto custom-scrollbar">
            <div>
              <h4 className="text-xl font-bold text-slate-900">
                {step?.title || 'Business Overview'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Please provide the core details about your upcoming venture.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Business Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Innovations"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 placeholder-slate-400 focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Industry
                </label>
                <div className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 text-slate-400 flex items-center justify-between cursor-pointer">
                  Select Category
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-50">
            <button className="w-full py-3 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold shadow-md hover:bg-orange-600 transition-colors">
              Next Step
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-tighter">
              Draft automatically saved
            </p>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-200 rounded-full" />
      </div>

      {/* Info box */}
      <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-[#FF6B00] text-[20px]">info</span>
          <p className="text-[11px] leading-relaxed text-slate-600">
            Changes made to steps are published immediately. Ensure you test your logic before saving
            global changes.
          </p>
        </div>
      </div>
    </aside>
  );
}
