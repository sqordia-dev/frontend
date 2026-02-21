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

  if (!isEditing) {
    return (
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold flex-shrink-0">
          {step.stepNumber}
        </div>
        <div className="text-left flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">{displayTitle}</h3>
            {isEditMode && (
              <button
                onClick={handleStartEdit}
                className="p-1 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Edit step title"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
          {displayDescription && (
            <p className="text-xs text-slate-500 truncate">{displayDescription}</p>
          )}
          <p className="text-sm text-slate-500">{step.questionCount} questions</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 bg-white rounded-lg border border-slate-200 p-4 shadow-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-2 gap-4">
        {/* French Title */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Title (French) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.titleFR}
            onChange={(e) => setFormData({ ...formData, titleFR: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            placeholder="e.g. Vision & Mission"
          />
        </div>

        {/* English Title */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Title (English)
          </label>
          <input
            type="text"
            value={formData.titleEN}
            onChange={(e) => setFormData({ ...formData, titleEN: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            placeholder="e.g. Vision & Mission"
          />
        </div>

        {/* French Description */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Description (French)
          </label>
          <input
            type="text"
            value={formData.descriptionFR}
            onChange={(e) => setFormData({ ...formData, descriptionFR: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            placeholder="Step description..."
          />
        </div>

        {/* English Description */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Description (English)
          </label>
          <input
            type="text"
            value={formData.descriptionEN}
            onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            placeholder="Step description..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-end justify-end gap-2">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <X size={14} />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.titleFR}
            className={cn(
              'px-3 py-2 text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5',
              isSaving || !formData.titleFR
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-[#FF6B00] hover:bg-orange-600'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
