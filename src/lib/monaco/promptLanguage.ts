/**
 * Monaco Editor language definition for Sqordia prompt templates
 * Provides syntax highlighting for {{variable}} placeholders
 */

import type { languages } from 'monaco-editor';

export const PROMPT_LANGUAGE_ID = 'sqordia-prompt';

// Common variables used in prompts
export const KNOWN_VARIABLES = [
  'businessName',
  'businessDescription',
  'industry',
  'targetMarket',
  'sectionName',
  'planType',
  'language',
  'questionnaireContext',
  'companyName',
  'companyDescription',
  'missionStatement',
  'visionStatement',
  'foundingDate',
  'legalStructure',
  'numberOfEmployees',
  'revenueModel',
  'competitiveAdvantage',
  'targetAudience',
  'marketSize',
  'growthStrategy',
  'fundingNeeds',
  'financialProjections',
  'teamBackground',
  'previousContent',
  'userInstructions',
  'tone',
  'format',
  'maxLength',
];

/**
 * Monaco language definition for prompt templates
 */
export const promptLanguageDefinition: languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.prompt',

  // Variable pattern
  brackets: [
    { open: '{{', close: '}}', token: 'delimiter.variable' },
  ],

  tokenizer: {
    root: [
      // Variable placeholders: {{variableName}}
      [/\{\{/, { token: 'delimiter.variable', next: '@variable' }],

      // Markdown-style headers
      [/^#{1,6}\s.*$/, 'keyword'],

      // Bold text
      [/\*\*[^*]+\*\*/, 'strong'],

      // Italic text
      [/\*[^*]+\*/, 'emphasis'],

      // Code blocks
      [/`[^`]+`/, 'string'],

      // Bullet points
      [/^[\s]*[-*]\s/, 'keyword'],

      // Numbered lists
      [/^[\s]*\d+\.\s/, 'keyword'],

      // Regular text
      [/./, 'text'],
    ],

    variable: [
      [/[a-zA-Z_][a-zA-Z0-9_]*/, 'variable.name'],
      [/\}\}/, { token: 'delimiter.variable', next: '@pop' }],
      [/./, 'variable'],
    ],
  },
};

/**
 * Theme tokens for light mode
 */
export const promptLightTheme: Record<string, string> = {
  'delimiter.variable': '#D97706', // momentum-orange
  'variable.name': '#EA580C', // orange-600
  'variable': '#F97316', // orange-500
  'keyword': '#6366F1', // indigo-500
  'strong': '#1F2937', // gray-800
  'emphasis': '#4B5563', // gray-600
  'string': '#059669', // emerald-600
  'text': '#374151', // gray-700
};

/**
 * Theme tokens for dark mode
 */
export const promptDarkTheme: Record<string, string> = {
  'delimiter.variable': '#F59E0B', // amber-500
  'variable.name': '#FB923C', // orange-400
  'variable': '#FDBA74', // orange-300
  'keyword': '#818CF8', // indigo-400
  'strong': '#F3F4F6', // gray-100
  'emphasis': '#D1D5DB', // gray-300
  'string': '#34D399', // emerald-400
  'text': '#E5E7EB', // gray-200
};

/**
 * Create Monaco theme rules from token colors
 */
export function createThemeRules(tokens: Record<string, string>): Array<{ token: string; foreground: string }> {
  return Object.entries(tokens).map(([token, color]) => ({
    token,
    foreground: color.replace('#', ''),
  }));
}

/**
 * Light theme definition for Monaco
 */
export const promptLightThemeData = {
  base: 'vs' as const,
  inherit: true,
  rules: createThemeRules(promptLightTheme),
  colors: {
    'editor.background': '#FAFAFA', // warm-gray-50
    'editor.foreground': '#374151', // gray-700
    'editor.lineHighlightBackground': '#F5F5F5', // warm-gray-100
    'editorCursor.foreground': '#D97706', // momentum-orange
    'editor.selectionBackground': '#FED7AA', // orange-200
    'editorLineNumber.foreground': '#9CA3AF', // gray-400
  },
};

/**
 * Dark theme definition for Monaco
 */
export const promptDarkThemeData = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: createThemeRules(promptDarkTheme),
  colors: {
    'editor.background': '#1F2937', // warm-gray-800
    'editor.foreground': '#E5E7EB', // gray-200
    'editor.lineHighlightBackground': '#374151', // warm-gray-700
    'editorCursor.foreground': '#F59E0B', // amber-500
    'editor.selectionBackground': '#78350F', // orange-900
    'editorLineNumber.foreground': '#6B7280', // gray-500
  },
};

/**
 * Autocomplete suggestions for variables
 */
export function createVariableCompletions(
  range: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }
): Array<{
  label: string;
  kind: number;
  insertText: string;
  range: typeof range;
  documentation?: string;
}> {
  const variableDescriptions: Record<string, string> = {
    businessName: 'The name of the business',
    businessDescription: 'A brief description of the business',
    industry: 'The industry or sector the business operates in',
    targetMarket: 'The target market or customer segment',
    sectionName: 'The current section being generated',
    planType: 'Type of plan (BusinessPlan, StrategicPlan, LeanCanvas)',
    language: 'Output language (en, fr)',
    questionnaireContext: 'All answers from the questionnaire',
    companyName: 'Legal name of the company',
    missionStatement: 'The company\'s mission statement',
    visionStatement: 'The company\'s vision statement',
    competitiveAdvantage: 'Key competitive advantages',
    previousContent: 'Previously generated content for context',
    userInstructions: 'Custom instructions from the user',
    tone: 'Desired tone of the output',
    format: 'Desired output format',
    maxLength: 'Maximum length constraint',
  };

  return KNOWN_VARIABLES.map((variable) => ({
    label: `{{${variable}}}`,
    kind: 5, // Variable kind
    insertText: `{{${variable}}}`,
    range,
    documentation: variableDescriptions[variable] || `Variable: ${variable}`,
  }));
}
