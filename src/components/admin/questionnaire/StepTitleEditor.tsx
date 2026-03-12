import { useState } from 'react';
import { Edit2, Save, X, Loader2 } from 'lucide-react';
import type { QuestionnaireStep, UpdateQuestionnaireStepRequest } from '../../../types/questionnaire-version';
import { cn } from '@/lib/utils';

interface StepTitleEditorProps {
  step: QuestionnaireStep;
  language: 'en' | 'fr';
  isEditMode: boolean;
  onSave: (stepNumber: number, data: UpdateQuestionnaireStepRequest) => Promise<QuestionnaireStep | null>;
}

export function StepTitleEditor({ step, language, isEditMode, onSave }: StepTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    titleFR: step.titleFR,
    titleEN: step.titleEN || '',
    descriptionFR: step.descriptionFR || '',
    descriptionEN: step.descriptionEN || '',
  });

  const displayTitle = language === 'fr' ? step.titleFR : (step.titleEN || step.titleFR);
  const displayDescription = language === 'fr'
    ? step.descriptionFR
    : (step.descriptionEN || step.descriptionFR);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditMode) return;
    setFormData({
      titleFR: step.titleFR,
      titleEN: step.titleEN || '',
      descriptionFR: step.descriptionFR || '',
      descriptionEN: step.descriptionEN || '',
    });
    setIsEditing(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      const result = await onSave(step.stepNumber, {
        titleFR: formData.titleFR || undefined,
        titleEN: formData.titleEN || undefined,
        descriptionFR: formData.descriptionFR || undefined,
        descriptionEN: formData.descriptionEN || undefined,
      });
      if (result) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = cn(
    'w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground',
    'focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]/40 outline-none transition-all',
    'placeholder:text-muted-foreground/50',
  );

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="text-left flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{displayTitle}</h3>
            {isEditMode && (
              <button
                onClick={handleStartEdit}
                className="p-1 text-muted-foreground/40 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Edit step title"
              >
                <Edit2 size={12} />
              </button>
            )}
          </div>
          {displayDescription && (
            <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{displayDescription}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 bg-card rounded-xl border border-border p-4 shadow-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
            Title (French) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.titleFR}
            onChange={(e) => setFormData({ ...formData, titleFR: e.target.value })}
            className={inputClass}
            placeholder="e.g. Vision & Mission"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
            Title (English)
          </label>
          <input
            type="text"
            value={formData.titleEN}
            onChange={(e) => setFormData({ ...formData, titleEN: e.target.value })}
            className={inputClass}
            placeholder="e.g. Vision & Mission"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
            Description (French)
          </label>
          <input
            type="text"
            value={formData.descriptionFR}
            onChange={(e) => setFormData({ ...formData, descriptionFR: e.target.value })}
            className={inputClass}
            placeholder="Step description..."
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
            Description (English)
          </label>
          <input
            type="text"
            value={formData.descriptionEN}
            onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
            className={inputClass}
            placeholder="Step description..."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border/50">
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-1.5"
        >
          <X size={12} />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !formData.titleFR}
          className={cn(
            'px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5',
            isSaving || !formData.titleFR
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-[#FF6B00] hover:bg-orange-600 shadow-sm'
          )}
        >
          {isSaving ? (
            <><Loader2 size={12} className="animate-spin" /> Saving...</>
          ) : (
            <><Save size={12} /> Save</>
          )}
        </button>
      </div>
    </div>
  );
}
