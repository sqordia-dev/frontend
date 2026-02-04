import { useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmojiIconPicker from './EmojiIconPicker';
import { adminQuestionTemplateService } from '@/lib/admin-question-template-service';
import { QUESTION_TYPES, PERSONA_TYPES, STEP_DEFINITIONS } from '@/types/admin-question-template';
import type { AdminQuestionTemplate } from '@/types/admin-question-template';

interface QuestionTemplateSheetProps {
  open: boolean;
  onClose: () => void;
  question: AdminQuestionTemplate | null;
  onSaved: () => void;
}

function parseOptionsList(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function stringifyOptionsList(items: string[]): string {
  return JSON.stringify(items.filter((s) => s.trim() !== ''));
}

export default function QuestionTemplateSheet({
  open,
  onClose,
  question,
  onSaved,
}: QuestionTemplateSheetProps) {
  const isEditing = question !== null;

  // Form state
  const [questionText, setQuestionText] = useState('');
  const [questionTextEN, setQuestionTextEN] = useState('');
  const [helpText, setHelpText] = useState('');
  const [helpTextEN, setHelpTextEN] = useState('');
  const [questionType, setQuestionType] = useState('ShortText');
  const [stepNumber, setStepNumber] = useState('1');
  const [personaType, setPersonaType] = useState('__all__');
  const [order, setOrder] = useState('1');
  const [isRequired, setIsRequired] = useState(true);
  const [section, setSection] = useState('');
  const [icon, setIcon] = useState('');
  const [optionsFR, setOptionsFR] = useState<string[]>([]);
  const [optionsEN, setOptionsEN] = useState<string[]>([]);
  const [validationRules, setValidationRules] = useState('');
  const [conditionalLogic, setConditionalLogic] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when question changes
  useEffect(() => {
    if (question) {
      setQuestionText(question.questionText);
      setQuestionTextEN(question.questionTextEN ?? '');
      setHelpText(question.helpText ?? '');
      setHelpTextEN(question.helpTextEN ?? '');
      setQuestionType(question.questionType);
      setStepNumber(String(question.stepNumber));
      setPersonaType(question.personaType || '__all__');
      setOrder(String(question.order));
      setIsRequired(question.isRequired);
      setSection(question.section ?? '');
      setIcon(question.icon ?? '');
      setOptionsFR(parseOptionsList(question.options));
      setOptionsEN(parseOptionsList(question.optionsEN));
      setValidationRules(question.validationRules ?? '');
      setConditionalLogic(question.conditionalLogic ?? '');
      setShowAdvanced(!!(question.validationRules || question.conditionalLogic));
    } else {
      setQuestionText('');
      setQuestionTextEN('');
      setHelpText('');
      setHelpTextEN('');
      setQuestionType('ShortText');
      setStepNumber('1');
      setPersonaType('__all__');
      setOrder('1');
      setIsRequired(true);
      setSection('');
      setIcon('');
      setOptionsFR([]);
      setOptionsEN([]);
      setValidationRules('');
      setConditionalLogic('');
      setShowAdvanced(false);
    }
    setError(null);
  }, [question, open]);

  const isChoiceType = questionType === 'SingleChoice' || questionType === 'MultipleChoice';

  const handleAddOption = (lang: 'fr' | 'en') => {
    if (lang === 'fr') setOptionsFR((prev) => [...prev, '']);
    else setOptionsEN((prev) => [...prev, '']);
  };

  const handleOptionChange = (lang: 'fr' | 'en', index: number, value: string) => {
    if (lang === 'fr') {
      setOptionsFR((prev) => prev.map((v, i) => (i === index ? value : v)));
    } else {
      setOptionsEN((prev) => prev.map((v, i) => (i === index ? value : v)));
    }
  };

  const handleRemoveOption = (lang: 'fr' | 'en', index: number) => {
    if (lang === 'fr') setOptionsFR((prev) => prev.filter((_, i) => i !== index));
    else setOptionsEN((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!questionText.trim()) {
      setError('Question text (French) is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = {
        questionText: questionText.trim(),
        questionTextEN: questionTextEN.trim() || undefined,
        helpText: helpText.trim() || undefined,
        helpTextEN: helpTextEN.trim() || undefined,
        questionType,
        stepNumber: parseInt(stepNumber, 10),
        personaType: personaType === '__all__' ? null : personaType,
        order: parseInt(order, 10),
        isRequired,
        section: section.trim() || undefined,
        icon: icon.trim() || undefined,
        options: isChoiceType && optionsFR.length > 0 ? stringifyOptionsList(optionsFR) : undefined,
        optionsEN: isChoiceType && optionsEN.length > 0 ? stringifyOptionsList(optionsEN) : undefined,
        validationRules: validationRules.trim() || undefined,
        conditionalLogic: conditionalLogic.trim() || undefined,
      };

      if (isEditing) {
        await adminQuestionTemplateService.update(question.id, data);
      } else {
        await adminQuestionTemplateService.create(data);
      }
      onSaved();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save question';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <SheetTitle>{isEditing ? 'Edit Question' : 'New Question'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the question template fields below.'
              : 'Fill in the fields to create a new question template.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-5 space-y-6">
            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Core Configuration */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Configuration
              </legend>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="stepNumber">Step</Label>
                  <Select value={stepNumber} onValueChange={setStepNumber}>
                    <SelectTrigger id="stepNumber">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STEP_DEFINITIONS.map((s) => (
                        <SelectItem key={s.number} value={String(s.number)}>
                          {s.number}. {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="questionType">Type</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger id="questionType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="personaType">Persona</Label>
                  <Select value={personaType} onValueChange={setPersonaType}>
                    <SelectTrigger id="personaType">
                      <SelectValue placeholder="All Personas" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONA_TYPES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min={0}
                    max={100}
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g., Identity & Vision"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Icon</Label>
                  <EmojiIconPicker value={icon} onChange={setIcon} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="isRequired"
                  checked={isRequired}
                  onCheckedChange={setIsRequired}
                />
                <Label htmlFor="isRequired" className="text-sm cursor-pointer">
                  Required question
                </Label>
              </div>
            </fieldset>

            {/* French Content */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                French Content (Primary)
              </legend>

              <div className="space-y-1.5">
                <Label htmlFor="questionText">
                  Question Text <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="questionText"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Quel est le nom l&eacute;gal de votre entreprise?"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="helpText">Help Text</Label>
                <Textarea
                  id="helpText"
                  value={helpText}
                  onChange={(e) => setHelpText(e.target.value)}
                  placeholder="Texte d'aide pour guider l'utilisateur..."
                  rows={2}
                />
              </div>
            </fieldset>

            {/* English Content */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                English Content
              </legend>

              <div className="space-y-1.5">
                <Label htmlFor="questionTextEN">Question Text (EN)</Label>
                <Textarea
                  id="questionTextEN"
                  value={questionTextEN}
                  onChange={(e) => setQuestionTextEN(e.target.value)}
                  placeholder="What is the legal name of your business?"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="helpTextEN">Help Text (EN)</Label>
                <Textarea
                  id="helpTextEN"
                  value={helpTextEN}
                  onChange={(e) => setHelpTextEN(e.target.value)}
                  placeholder="Help text to guide the user..."
                  rows={2}
                />
              </div>
            </fieldset>

            {/* Options (for choice types) */}
            {isChoiceType && (
              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Options
                </legend>

                {/* French options */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">French Options</Label>
                  {optionsFR.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => handleOptionChange('fr', i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption('fr', i)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddOption('fr')}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>

                {/* English options */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">English Options</Label>
                  {optionsEN.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => handleOptionChange('en', i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption('en', i)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddOption('en')}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>
              </fieldset>
            )}

            {/* Advanced (collapsible) */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {showAdvanced ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                Advanced Settings
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="validationRules">Validation Rules (JSON)</Label>
                    <Textarea
                      id="validationRules"
                      value={validationRules}
                      onChange={(e) => setValidationRules(e.target.value)}
                      placeholder='{"minLength": 10, "maxLength": 500}'
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="conditionalLogic">Conditional Logic (JSON)</Label>
                    <Textarea
                      id="conditionalLogic"
                      value={conditionalLogic}
                      onChange={(e) => setConditionalLogic(e.target.value)}
                      placeholder='{"showIf": {"questionId": "...", "value": "..."}}'
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="brand" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              'Update Question'
            ) : (
              'Create Question'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
