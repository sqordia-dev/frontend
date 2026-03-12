import { useState } from 'react';
import { X, Save, Loader2, FileText, GraduationCap, MessageSquare, Eye } from 'lucide-react';
import type { AdminQuestionTemplate, UpdateQuestionTemplateRequest } from '@/types/admin-question-template';
import { LanguageToggle } from '@/components/cms/shared/LanguageToggle';
import { QuestionBasicTab } from './QuestionBasicTab';
import { QuestionExpertTab } from './QuestionExpertTab';
import { QuestionCoachTab } from './QuestionCoachTab';
import { QuestionPreviewTab } from './QuestionPreviewTab';
import { cn } from '@/lib/utils';

type Tab = 'basic' | 'expert' | 'coach' | 'preview';

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: 'basic', label: 'Properties', icon: FileText },
  { id: 'expert', label: 'Expert', icon: GraduationCap },
  { id: 'coach', label: 'Coach', icon: MessageSquare },
  { id: 'preview', label: 'Preview', icon: Eye },
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
      <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-3 border-b border-border space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                Question Editor
              </span>
              {hasChanges && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  <span className="w-1 h-1 rounded-full bg-amber-500" />
                  Modified
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
              {displayText}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <LanguageToggle value={panelLanguage} onChange={setPanelLanguage} />
            {isEditMode && (
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                  hasChanges && !isSaving
                    ? 'bg-[#FF6B00] text-white hover:bg-orange-600 shadow-sm'
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
              className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 -mb-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-t-lg border-b-2 transition-all',
                  isActive
                    ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/[0.04]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40',
                )}
              >
                <Icon size={13} className={isActive ? 'text-[#FF6B00]' : ''} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
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
        <div className="px-3 sm:px-5 py-2 sm:py-2.5 border-t border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              You have unsaved changes
            </p>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-[11px] font-semibold text-[#FF6B00] hover:underline"
            >
              {isSaving ? 'Saving...' : 'Save now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
