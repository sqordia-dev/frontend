import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  Briefcase,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { adminQuestionTemplateService } from '@/lib/admin-question-template-service';
import type { AdminQuestionTemplate } from '@/types/admin-question-template';

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

const STEP_INFO = [
  { number: 1, title: 'Identity & Vision', titleFr: 'Identité et Vision', icon: Target },
  { number: 2, title: 'The Offering', titleFr: "L'Offre", icon: Briefcase },
  { number: 3, title: 'Market Analysis', titleFr: 'Analyse du Marché', icon: TrendingUp },
  { number: 4, title: 'Operations & People', titleFr: 'Opérations et Équipe', icon: Users },
  { number: 5, title: 'Financials & Risks', titleFr: 'Finances et Risques', icon: DollarSign },
];

const deviceWidths: Record<DeviceSize, string> = {
  desktop: 'max-w-4xl',
  tablet: 'max-w-[768px]',
  mobile: 'max-w-[375px]',
};

const deviceButtons: { size: DeviceSize; icon: typeof Monitor; label: string }[] = [
  { size: 'desktop', icon: Monitor, label: 'Desktop' },
  { size: 'tablet', icon: Tablet, label: 'Tablet' },
  { size: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export default function AdminQuestionnairePreviewPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<AdminQuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const data = await adminQuestionTemplateService.getAll();
        setQuestions(data.filter((q) => q.isActive));
      } catch {
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const groupedByStep = useMemo(() => {
    const groups: Record<number, AdminQuestionTemplate[]> = {};
    for (const q of questions) {
      if (!groups[q.stepNumber]) groups[q.stepNumber] = [];
      groups[q.stepNumber].push(q);
    }
    for (const key of Object.keys(groups)) {
      groups[Number(key)].sort((a, b) => a.order - b.order);
    }
    return groups;
  }, [questions]);

  const currentStepQuestions = groupedByStep[activeStep] || [];
  const stepInfo = STEP_INFO.find((s) => s.number === activeStep);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading questionnaire...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Back + Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/cms')}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to CMS</span>
            </Button>
            <Badge variant="secondary">Questionnaire Preview</Badge>
          </div>

          {/* Center: Device toggles */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {deviceButtons.map(({ size, icon: Icon, label }) => (
              <button
                key={size}
                type="button"
                onClick={() => setDeviceSize(size)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  deviceSize === size
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
                title={label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Right: Language toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                language === 'en'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                language === 'fr'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              FR
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className={cn(
            'mx-auto transition-all duration-300 ease-in-out',
            deviceWidths[deviceSize],
            deviceSize !== 'desktop' &&
              'rounded-2xl border border-gray-300 dark:border-gray-700 shadow-xl overflow-hidden'
          )}
        >
          {/* Device chrome */}
          {deviceSize !== 'desktop' && (
            <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
              <div className="w-16 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
            </div>
          )}

          {/* Questionnaire content */}
          <div className="bg-white dark:bg-gray-900 min-h-[600px]">
            {/* Step tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                {STEP_INFO.map((step) => {
                  const Icon = step.icon;
                  const isActive = activeStep === step.number;
                  const questionCount = groupedByStep[step.number]?.length || 0;
                  return (
                    <button
                      key={step.number}
                      type="button"
                      onClick={() => setActiveStep(step.number)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                        isActive
                          ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{language === 'fr' ? step.titleFr : step.title}</span>
                      <span className="text-xs text-gray-400">({questionCount})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step header */}
            <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                {stepInfo && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
                      <stepInfo.icon className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {language === 'fr' ? stepInfo.titleFr : stepInfo.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {currentStepQuestions.length} question
                        {currentStepQuestions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="p-6 space-y-6">
              {currentStepQuestions.map((question, idx) => (
                <div
                  key={question.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {question.icon && <span className="text-base">{question.icon}</span>}
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {language === 'fr'
                            ? question.questionText
                            : question.questionTextEN || question.questionText}
                          {question.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </p>
                      </div>
                      {(language === 'fr' ? question.helpText : question.helpTextEN) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {language === 'fr'
                            ? question.helpText
                            : question.helpTextEN || question.helpText}
                        </p>
                      )}
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs">
                          {question.questionType}
                        </Badge>
                        {question.personaType && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            {question.personaType}
                          </Badge>
                        )}
                      </div>
                      {/* Placeholder input */}
                      <div className="mt-3">
                        {question.questionType === 'LongText' ? (
                          <div className="w-full h-20 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                        ) : question.questionType === 'SingleChoice' ||
                          question.questionType === 'MultipleChoice' ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-sm text-gray-400"
                              >
                                <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />
                                <span>Option {i}</span>
                              </div>
                            ))}
                          </div>
                        ) : question.questionType === 'YesNo' ? (
                          <div className="flex gap-2">
                            <div className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-400">
                              {language === 'fr' ? 'Oui' : 'Yes'}
                            </div>
                            <div className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-400">
                              {language === 'fr' ? 'Non' : 'No'}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {currentStepQuestions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">No questions in this step.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar for mobile */}
          {deviceSize === 'mobile' && (
            <div className="bg-gray-200 dark:bg-gray-800 px-4 py-3 flex items-center justify-center">
              <div className="w-24 h-1 rounded-full bg-gray-400 dark:bg-gray-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
