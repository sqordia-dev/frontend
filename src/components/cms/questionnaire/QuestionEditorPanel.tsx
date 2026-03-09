import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { AdminQuestionTemplate, UpdateQuestionTemplateRequest } from '@/types/admin-question-template';
import { LanguageToggle } from '@/components/cms/shared/LanguageToggle';
import { QuestionBasicTab } from './QuestionBasicTab';
import { QuestionExpertTab } from './QuestionExpertTab';
import { QuestionCoachTab } from './QuestionCoachTab';
import { QuestionPreviewTab } from './QuestionPreviewTab';
import { cn } from '@/lib/utils';

type Tab = 'basic' | 'expert' | 'coach' | 'preview';

const TABS: { id: Tab; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'expert', label: 'Expert' },
  { id: 'coach', label: 'Coach' },
  { id: 'preview', label: 'Preview' },
];

interface QuestionEditorPanelProps {
  question: AdminQuestionTemplate;
  isEditMode: boolean;
  language: 'en' | 'fr';
  onClose: () => void;
  onUpdate: (questionId: string, data: UpdateQuestionTemplateRequest) => Promise<AdminQuestionTemplate | null>;
}

export function QuestionEditorPanel({
  question,
  isEditMode,
  language,
  onClose,
  onUpdate,
}: QuestionEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [pendingChanges, setPendingChanges] = useState<UpdateQuestionTemplateRequest>({});
  const [isSaving, setIsSaving] = useState(false);
  const [panelLanguage, setPanelLanguage] = useState<'en' | 'fr'>(language);

  const hasChanges = Object.keys(pendingChanges).length > 0;

  const handleChange = (updates: UpdateQuestionTemplateRequest) => {
    setPendingChanges((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      await onUpdate(question.id, pendingChanges);
      setPendingChanges({});
    } finally {
      setIsSaving(false);
    }
  };

  const displayText =
    panelLanguage === 'en' && question.questionTextEN
      ? question.questionTextEN
      : question.questionText;

  return (
    <div className="flex flex-col bg-card border-l border-border h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3 border-b border-border">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Editing Question
          </p>
          <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
            {displayText}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle value={panelLanguage} onChange={setPanelLanguage} />
          {isEditMode && (
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                hasChanges && !isSaving
                  ? 'bg-[#FF6B00] text-white hover:bg-orange-600'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              {isSaving ? (
                <><Loader2 size={12} className="animate-spin" /> Saving...</>
              ) : (
                <><Save size={12} /> Save</>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-3 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-[#FF6B00] text-[#FF6B00]'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'basic' && (
          <QuestionBasicTab
            question={question}
            isEditMode={isEditMode}
            onChange={handleChange}
          />
        )}
        {activeTab === 'expert' && (
          <QuestionExpertTab
            question={question}
            isEditMode={isEditMode}
            onChange={handleChange}
          />
        )}
        {activeTab === 'coach' && (
          <QuestionCoachTab
            question={question}
            isEditMode={isEditMode}
            onChange={handleChange}
          />
        )}
        {activeTab === 'preview' && (
          <QuestionPreviewTab question={question} language={panelLanguage} />
        )}
      </div>

      {/* Unsaved indicator */}
      {hasChanges && (
        <div className="px-4 py-2 border-t border-border bg-amber-50 dark:bg-amber-900/20">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            You have unsaved changes.
          </p>
        </div>
      )}
    </div>
  );
}
