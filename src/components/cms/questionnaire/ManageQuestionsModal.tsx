import { X, Search, Plus, GripVertical, Edit, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: string;
  isRequired: boolean;
  status: 'live' | 'draft';
}

interface QuestionnaireStep {
  id: string;
  stepNumber: number;
  title: string;
  persona: string;
  questionCount: number;
  questions: Question[];
}

interface ManageQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: QuestionnaireStep | null;
  onAddQuestion: () => void;
}

export function ManageQuestionsModal({
  isOpen,
  onClose,
  step,
  onAddQuestion,
}: ManageQuestionsModalProps) {
  if (!isOpen || !step) return null;

  const getQuestionTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      text: 'short_text',
      textarea: 'notes',
      dropdown: 'arrow_drop_down_circle',
      radio: 'radio_button_checked',
      checkbox: 'check_box',
    };
    return icons[type] || 'help';
  };

  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      text: 'Short Text',
      textarea: 'Long Text',
      dropdown: 'Dropdown',
      radio: 'Radio Button',
      checkbox: 'Checkbox',
    };
    return labels[type] || type;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">
        {/* Modal Container */}
        <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-[#FF6B00]">
                <span className="material-symbols-outlined text-xl">assignment</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Manage Questions: {step.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-[#FF6B00] outline-none text-sm transition-all"
              />
            </div>
            <button
              onClick={onAddQuestion}
              className="bg-[#FF6B00] hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Question List */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Question List ({step.questions.length})
                </span>
              </div>

              <div className="space-y-3">
                {step.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`group flex items-center gap-4 p-4 bg-white border-2 rounded-lg shadow-sm transition-all hover:shadow-md ${
                      index === 0 ? 'border-[#FF6B00]' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="cursor-grab text-slate-300 group-hover:text-slate-500">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {index === 0 && (
                          <span className="text-xs font-medium text-[#FF6B00] bg-orange-100 px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                        <h4 className="font-semibold text-slate-900 truncate">{question.text}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">
                            {getQuestionTypeIcon(question.type)}
                          </span>
                          {getQuestionTypeLabel(question.type)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-orange-500">
                            emergency
                          </span>
                          Required: {question.isRequired ? 'Yes' : 'No'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              question.status === 'live' ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          Status: {question.status === 'live' ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drag and Drop Placeholder */}
              <div className="mt-8 p-6 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-3xl mb-2">move_up</span>
                <p className="text-sm">Drag and drop rows to reorder questions</p>
              </div>
            </div>

            {/* Configuration Sidebar */}
            <aside className="w-full lg:w-96 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 overflow-y-auto p-8 custom-scrollbar">
              <div className="flex items-center gap-2 mb-6 text-slate-900">
                <span className="material-symbols-outlined text-[#FF6B00]">settings</span>
                <h3 className="font-bold">Question Configuration</h3>
              </div>

              <div className="space-y-6">
                {/* Validation Rules */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Validation Rules
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Required Field</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <div className="w-11 h-6 bg-[#FF6B00] rounded-full">
                          <div className="absolute left-6 top-1 bg-white w-4 h-4 rounded-full transition-all" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1.5">Minimum Characters</label>
                      <input
                        type="number"
                        defaultValue={2}
                        className="w-full py-2 px-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1.5">Maximum Characters</label>
                      <input
                        type="number"
                        defaultValue={100}
                        className="w-full py-2 px-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* Conditional Logic */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Conditional Logic
                  </label>
                  <div className="p-4 bg-white border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-500 mb-3">
                      This question will always be visible unless logic rules are applied.
                    </p>
                    <button className="w-full py-2 px-4 text-sm font-medium border border-[#FF6B00] text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-lg">alt_route</span>
                      Add Logic Rule
                    </button>
                  </div>
                </div>

                {/* Data Variable */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Data Variable
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-600">
                    <span className="material-symbols-outlined text-sm">code</span>
                    <span className="text-sm font-mono">business_name_v1</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>All changes are saved to draft automatically</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button className="bg-[#FF6B00] hover:bg-orange-600 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-orange-200 transition-all active:scale-95">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
