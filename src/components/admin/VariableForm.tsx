import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface VariableFormProps {
  /** The prompt template containing {{variable}} placeholders */
  systemPrompt: string;
  /** The user prompt template containing {{variable}} placeholders */
  userPromptTemplate: string;
  /** Current values as JSON string (for backward compatibility) */
  value: string;
  /** Callback when values change */
  onChange: (jsonString: string) => void;
  /** Optional: show compact layout */
  compact?: boolean;
}

interface VariableInfo {
  name: string;
  label: string;
  description?: string;
}

// Common variable descriptions for better UX
const VARIABLE_DESCRIPTIONS: Record<string, string> = {
  businessName: 'The name of the business or company',
  companyName: 'The name of the company',
  industry: 'The industry or sector (e.g., Technology, Healthcare)',
  businessDescription: 'A brief description of what the business does',
  targetMarket: 'The target customer segment or market',
  fundingRequest: 'The amount of funding being requested',
  planType: 'Type of business plan (BusinessPlan, StrategicPlan, LeanCanvas)',
  sectionName: 'The section being generated',
  language: 'The language for content generation (en, fr)',
  questionnaireContext: 'Context from the questionnaire responses',
  currentContent: 'The current content of the section',
  userRequest: 'What the user wants to improve or change',
  question: 'The question being asked',
  previousAnswers: 'Previous answers from the questionnaire',
  sectionContent: 'The content of the section',
  competitorInfo: 'Information about competitors',
  marketData: 'Market research data',
  financialData: 'Financial projections or data',
  teamInfo: 'Information about the management team',
  productDescription: 'Description of the product or service',
  uniqueValue: 'The unique value proposition',
  goals: 'Business goals and objectives',
  challenges: 'Key challenges or problems to solve',
};

/**
 * Extract {{variable}} placeholders from template strings
 */
export function extractVariables(systemPrompt: string, userPromptTemplate: string): VariableInfo[] {
  const combined = `${systemPrompt} ${userPromptTemplate}`;
  const regex = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = regex.exec(combined)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables).map(name => ({
    name,
    label: formatLabel(name),
    description: VARIABLE_DESCRIPTIONS[name],
  }));
}

/**
 * Convert camelCase or snake_case to Title Case
 */
function formatLabel(name: string): string {
  return name
    // Insert space before capitals
    .replace(/([A-Z])/g, ' $1')
    // Replace underscores with spaces
    .replace(/_/g, ' ')
    // Capitalize first letter
    .replace(/^./, str => str.toUpperCase())
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse JSON string to object safely
 */
function parseValues(jsonString: string): Record<string, string> {
  try {
    const parsed = JSON.parse(jsonString);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Form component for editing template variables
 */
const VariableForm: React.FC<VariableFormProps> = ({
  systemPrompt,
  userPromptTemplate,
  value,
  onChange,
  compact = false,
}) => {
  const variables = useMemo(
    () => extractVariables(systemPrompt, userPromptTemplate),
    [systemPrompt, userPromptTemplate]
  );

  const [values, setValues] = useState<Record<string, string>>(() => parseValues(value));

  // Update local state when external value changes
  useEffect(() => {
    setValues(parseValues(value));
  }, [value]);

  // Notify parent of changes
  const handleChange = (name: string, newValue: string) => {
    const updated = { ...values, [name]: newValue };
    setValues(updated);
    onChange(JSON.stringify(updated, null, 2));
  };

  if (variables.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">
          No variables found in the template. Add placeholders like <code className="px-1 bg-amber-100 dark:bg-amber-800 rounded">{'{{variableName}}'}</code> to your prompts.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? '3' : '4'}`}>
      {variables.map(variable => (
        <div key={variable.name}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {variable.label}
            {variable.description && (
              <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                {variable.description}
              </span>
            )}
          </label>
          {shouldUseTextarea(variable.name) ? (
            <textarea
              value={values[variable.name] || ''}
              onChange={e => handleChange(variable.name, e.target.value)}
              rows={compact ? 2 : 3}
              placeholder={getPlaceholder(variable.name)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          ) : (
            <input
              type="text"
              value={values[variable.name] || ''}
              onChange={e => handleChange(variable.name, e.target.value)}
              placeholder={getPlaceholder(variable.name)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          )}
        </div>
      ))}

      {!compact && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Fill in the fields above to test how your prompt will work with real data.
            These values will replace the <code className="px-1 bg-blue-100 dark:bg-blue-800 rounded">{'{{placeholders}}'}</code> in your template.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Determine if a variable should use a textarea (for longer content)
 */
function shouldUseTextarea(name: string): boolean {
  const textareaVariables = [
    'businessDescription',
    'questionnaireContext',
    'currentContent',
    'sectionContent',
    'previousAnswers',
    'userRequest',
    'description',
    'content',
    'context',
    'summary',
    'details',
    'notes',
  ];
  return textareaVariables.some(v => name.toLowerCase().includes(v.toLowerCase()));
}

/**
 * Get placeholder text for a variable
 */
function getPlaceholder(name: string): string {
  const placeholders: Record<string, string> = {
    businessName: 'e.g., GreenTech Solutions',
    companyName: 'e.g., Acme Corporation',
    industry: 'e.g., Technology, Healthcare, Retail',
    businessDescription: 'Describe what the business does...',
    targetMarket: 'e.g., Small businesses in North America',
    fundingRequest: 'e.g., $500,000',
    planType: 'e.g., BusinessPlan',
    sectionName: 'e.g., ExecutiveSummary',
    language: 'e.g., en or fr',
    questionnaireContext: 'Paste questionnaire responses here...',
    currentContent: 'Paste current section content here...',
    userRequest: 'What would you like to improve?',
  };
  return placeholders[name] || `Enter ${formatLabel(name).toLowerCase()}...`;
}

export default VariableForm;
