import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Star, FileText, Layers, Sparkles } from 'lucide-react';
import { StepProps, TemplateOption } from '../../../types/onboarding';

// Mock templates - in production, these would come from the API
const getTemplatesForIndustry = (industry?: string): TemplateOption[] => {
  const baseTemplates: TemplateOption[] = [
    {
      id: 'startup-lean',
      name: 'Lean Startup Plan',
      description: 'A streamlined plan focusing on key hypotheses, market validation, and rapid iteration.',
      sectionCount: 8,
      isRecommended: false,
    },
    {
      id: 'traditional-business',
      name: 'Traditional Business Plan',
      description: 'Comprehensive plan suitable for bank loans and investor presentations.',
      sectionCount: 12,
      isRecommended: false,
    },
    {
      id: 'strategic-growth',
      name: 'Strategic Growth Plan',
      description: 'Focus on expansion strategies, market penetration, and scaling operations.',
      sectionCount: 10,
      isRecommended: false,
    },
  ];

  // Set recommended based on industry
  const industryRecommendations: Record<string, string> = {
    'Technology': 'startup-lean',
    'Retail': 'traditional-business',
    'Healthcare': 'traditional-business',
    'Food & Beverage': 'traditional-business',
    'Manufacturing': 'strategic-growth',
    'Professional Services': 'startup-lean',
    'Construction': 'traditional-business',
    'Education': 'strategic-growth',
    'Finance & Insurance': 'traditional-business',
    'Real Estate': 'strategic-growth',
    'Non-Profit': 'strategic-growth',
  };

  const recommendedId = industry ? industryRecommendations[industry] || 'traditional-business' : 'traditional-business';

  return baseTemplates.map(template => ({
    ...template,
    isRecommended: template.id === recommendedId,
    industry,
  }));
};

/**
 * Template selection step
 * User selects a template or chooses to start from scratch
 */
export default function TemplateStep({
  data,
  onNext,
  onBack,
  isFirstStep,
}: StepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(data.templateId || null);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);

  useEffect(() => {
    // In production, this would be an API call
    const industryTemplates = getTemplatesForIndustry(data.industry);
    setTemplates(industryTemplates);

    // Auto-select recommended template if none selected
    if (!selectedTemplate) {
      const recommended = industryTemplates.find(t => t.isRecommended);
      if (recommended) {
        setSelectedTemplate(recommended.id);
      }
    }
  }, [data.industry]);

  const handleSelect = (templateId: string | null) => {
    setSelectedTemplate(templateId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, templateId: string | null) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(templateId);
    }
  };

  const handleContinue = () => {
    onNext({ templateId: selectedTemplate || undefined });
  };

  const hasSelection = selectedTemplate !== null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choose a template
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {data.industry
            ? `Templates recommended for ${data.industry}`
            : 'Select a template to get started quickly'}
        </p>
      </div>

      {/* Template cards */}
      <div className="space-y-4 mb-6">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              onClick={() => handleSelect(template.id)}
              onKeyDown={(e) => handleKeyDown(e, template.id)}
              className={`
                w-full p-5 rounded-xl border-2 text-left transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2
                dark:focus:ring-offset-gray-900
                ${isSelected
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${template.name}${template.isRecommended ? ' (Recommended)' : ''}: ${template.description}`}
            >
              <div className="flex items-start gap-4">
                {/* Radio indicator */}
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${isSelected
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300 dark:border-gray-600'
                      }
                    `}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    {template.isRecommended && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                        <Star size={12} className="fill-current" aria-hidden="true" />
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    <Layers size={14} aria-hidden="true" />
                    <span>{template.sectionCount} sections</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* Start from scratch option */}
        <button
          onClick={() => handleSelect('scratch')}
          onKeyDown={(e) => handleKeyDown(e, 'scratch')}
          className={`
            w-full p-5 rounded-xl border-2 border-dashed text-left transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${selectedTemplate === 'scratch'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
          role="radio"
          aria-checked={selectedTemplate === 'scratch'}
          aria-label="Start from Scratch: Build a custom plan from the ground up"
        >
          <div className="flex items-start gap-4">
            {/* Radio indicator */}
            <div className="flex-shrink-0 mt-0.5">
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedTemplate === 'scratch'
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 dark:border-gray-600'
                  }
                `}
                aria-hidden="true"
              >
                {selectedTemplate === 'scratch' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles
                  size={18}
                  className="text-gray-400"
                  aria-hidden="true"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Start from Scratch
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build a custom plan from the ground up with full flexibility.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-xl
            font-medium transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${isFirstStep
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </button>

        <button
          onClick={handleContinue}
          disabled={!hasSelection}
          className={`
            inline-flex items-center gap-2 px-8 py-3 rounded-xl
            font-semibold transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${hasSelection
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
          style={{ backgroundColor: hasSelection ? '#FF6B00' : undefined }}
        >
          Continue
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
