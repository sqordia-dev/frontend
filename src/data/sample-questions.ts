import { Question, QuestionTemplate } from '../types/questionnaire';

/**
 * Sample questions for testing the questionnaire flow
 * Covers different question types with tips and examples
 */
export const sampleQuestions: Question[] = [
  // Section 1: Business Overview
  {
    id: 'q1',
    text: 'What is your business name?',
    description: 'Enter the official name of your business as it will appear on legal documents.',
    type: 'text',
    required: true,
    placeholder: 'e.g., Acme Technologies Inc.',
    maxLength: 100,
    section: 'Business Overview',
    order: 1,
  },
  {
    id: 'q2',
    text: 'Describe your business in one sentence',
    description: 'A clear, concise summary of what your business does.',
    type: 'textarea',
    required: true,
    placeholder: 'We provide...',
    maxLength: 250,
    tip: 'Try to capture your unique value proposition in this sentence. Think about what makes you different from competitors.',
    example: 'We provide cloud-based inventory management solutions for small retail businesses, helping them reduce stockouts by 40%.',
    section: 'Business Overview',
    order: 2,
  },
  {
    id: 'q3',
    text: 'What industry does your business operate in?',
    description: 'Select the primary industry for your business.',
    type: 'select',
    required: true,
    options: [
      { value: 'technology', label: 'Technology', description: 'Software, hardware, IT services' },
      { value: 'healthcare', label: 'Healthcare', description: 'Medical services, pharmaceuticals' },
      { value: 'retail', label: 'Retail', description: 'Consumer goods, e-commerce' },
      { value: 'finance', label: 'Finance', description: 'Banking, insurance, fintech' },
      { value: 'manufacturing', label: 'Manufacturing', description: 'Industrial production' },
      { value: 'education', label: 'Education', description: 'Learning, training, edtech' },
      { value: 'food', label: 'Food & Beverage', description: 'Restaurants, food production' },
      { value: 'professional', label: 'Professional Services', description: 'Consulting, legal, accounting' },
      { value: 'other', label: 'Other', description: 'Other industries' },
    ],
    section: 'Business Overview',
    order: 3,
  },
  {
    id: 'q4',
    text: 'What is your business type?',
    description: 'Select the legal structure of your business.',
    type: 'select',
    required: true,
    options: [
      { value: 'sole', label: 'Sole Proprietorship' },
      { value: 'partnership', label: 'Partnership' },
      { value: 'llc', label: 'Limited Liability Company (LLC)' },
      { value: 'corporation', label: 'Corporation (Inc.)' },
      { value: 'nonprofit', label: 'Non-Profit Organization' },
      { value: 'cooperative', label: 'Cooperative' },
    ],
    section: 'Business Overview',
    order: 4,
  },

  // Section 2: Products & Services
  {
    id: 'q5',
    text: 'What products or services do you offer?',
    description: 'Describe your main products or services in detail.',
    type: 'textarea',
    required: true,
    maxLength: 2000,
    tip: 'Be specific about features, benefits, and what makes your offerings unique. Include pricing models if relevant.',
    example: 'Our main product is a SaaS platform that provides real-time inventory tracking, automated reorder alerts, and predictive analytics. We offer three pricing tiers: Starter ($29/mo), Professional ($79/mo), and Enterprise (custom pricing).',
    section: 'Products & Services',
    order: 5,
  },
  {
    id: 'q6',
    text: 'What problem does your product/service solve?',
    description: 'Explain the pain point you are addressing for your customers.',
    type: 'textarea',
    required: true,
    maxLength: 1500,
    tip: 'Focus on the customer pain point and how your solution alleviates it. Use specific examples or statistics if available.',
    section: 'Products & Services',
    order: 6,
  },
  {
    id: 'q7',
    text: 'What is your unique value proposition?',
    description: 'What makes your business different from competitors?',
    type: 'textarea',
    required: true,
    maxLength: 1000,
    tip: 'Think about your competitive advantages: price, quality, convenience, innovation, customer service, etc.',
    example: 'Unlike traditional inventory systems, our AI-powered solution learns from your sales patterns and automatically suggests optimal stock levels, reducing overstock costs by 25%.',
    section: 'Products & Services',
    order: 7,
  },

  // Section 3: Target Market
  {
    id: 'q8',
    text: 'Who is your ideal customer?',
    description: 'Describe your target customer profile (demographics, psychographics).',
    type: 'textarea',
    required: true,
    maxLength: 1500,
    tip: 'Be specific: age range, income level, location, job title, interests, pain points, buying behavior.',
    example: 'Small to medium retail store owners (5-50 employees) in urban areas, aged 30-55, tech-savvy but not IT experts, frustrated with manual inventory counting, looking for affordable automation solutions.',
    section: 'Target Market',
    order: 8,
  },
  {
    id: 'q9',
    text: 'What is your target market size?',
    description: 'Estimate the total addressable market for your business.',
    type: 'select',
    required: true,
    options: [
      { value: 'under1m', label: 'Less than $1 million' },
      { value: '1m-10m', label: '$1 - $10 million' },
      { value: '10m-50m', label: '$10 - $50 million' },
      { value: '50m-100m', label: '$50 - $100 million' },
      { value: '100m-500m', label: '$100 - $500 million' },
      { value: '500m-1b', label: '$500 million - $1 billion' },
      { value: 'over1b', label: 'Over $1 billion' },
    ],
    section: 'Target Market',
    order: 9,
  },
  {
    id: 'q10',
    text: 'Which geographic markets do you serve?',
    description: 'Select all regions where you operate or plan to operate.',
    type: 'multiselect',
    required: false,
    options: [
      { value: 'local', label: 'Local (single city/region)' },
      { value: 'regional', label: 'Regional (multiple cities/states)' },
      { value: 'national', label: 'National (entire country)' },
      { value: 'north-america', label: 'North America' },
      { value: 'europe', label: 'Europe' },
      { value: 'asia-pacific', label: 'Asia Pacific' },
      { value: 'global', label: 'Global (worldwide)' },
    ],
    section: 'Target Market',
    order: 10,
  },

  // Section 4: Financial
  {
    id: 'q11',
    text: 'What is your expected annual revenue in the first year?',
    description: 'Provide your projected revenue for Year 1.',
    type: 'number',
    required: true,
    min: 0,
    max: 1000000000,
    prefix: '$',
    placeholder: '0',
    tip: 'Be realistic with your projections. Consider your pricing, sales cycles, and market penetration.',
    section: 'Financial',
    order: 11,
  },
  {
    id: 'q12',
    text: 'What is your expected monthly operating cost?',
    description: 'Estimate your average monthly expenses.',
    type: 'number',
    required: true,
    min: 0,
    max: 10000000,
    prefix: '$',
    placeholder: '0',
    tip: 'Include rent, salaries, utilities, marketing, software, insurance, and other recurring costs.',
    section: 'Financial',
    order: 12,
  },
  {
    id: 'q13',
    text: 'What is your funding status?',
    description: 'Select your current funding situation.',
    type: 'select',
    required: true,
    options: [
      { value: 'bootstrapped', label: 'Bootstrapped (self-funded)' },
      { value: 'pre-seed', label: 'Pre-seed funding' },
      { value: 'seed', label: 'Seed round' },
      { value: 'series-a', label: 'Series A' },
      { value: 'series-b', label: 'Series B or later' },
      { value: 'profitable', label: 'Profitable (no external funding needed)' },
      { value: 'seeking', label: 'Currently seeking funding' },
    ],
    section: 'Financial',
    order: 13,
  },

  // Section 5: Launch & Timeline
  {
    id: 'q14',
    text: 'When did you (or will you) launch your business?',
    description: 'Select your business launch date or planned launch date.',
    type: 'date',
    required: false,
    section: 'Launch & Timeline',
    order: 14,
  },
  {
    id: 'q15',
    text: 'What are your key milestones for the next 12 months?',
    description: 'List the major goals you want to achieve.',
    type: 'textarea',
    required: false,
    maxLength: 2000,
    tip: 'Think about product development, team growth, revenue targets, market expansion, and key partnerships.',
    example: 'Q1: Launch beta version with 50 pilot customers\nQ2: Achieve $10K MRR, hire 2 sales reps\nQ3: Launch v2.0 with AI features\nQ4: Expand to Canadian market, reach $50K MRR',
    section: 'Launch & Timeline',
    order: 15,
  },
];

/**
 * Sample question template
 */
export const sampleQuestionTemplate: QuestionTemplate = {
  id: 'sample-template-1',
  name: 'Business Plan Questionnaire',
  description: 'Complete this questionnaire to generate your comprehensive business plan.',
  questions: sampleQuestions,
  estimatedMinutes: 20,
};

/**
 * Get sample questions grouped by section
 */
export function getSampleQuestionsBySection(): Map<string, Question[]> {
  const grouped = new Map<string, Question[]>();

  sampleQuestions.forEach((question) => {
    const section = question.section || 'General';
    const existing = grouped.get(section) || [];
    grouped.set(section, [...existing, question]);
  });

  return grouped;
}

/**
 * Get sample questions by type for testing
 */
export function getSampleQuestionsByType(type: Question['type']): Question[] {
  return sampleQuestions.filter((q) => q.type === type);
}

export default sampleQuestionTemplate;
