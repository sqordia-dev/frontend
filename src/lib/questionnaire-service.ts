import { apiClient } from './api-client';
import { QuestionTemplate, Answer, Question } from '../types/questionnaire';

/**
 * Questionnaire Service
 * API functions for questionnaire operations
 */
export const questionnaireService = {
  /**
   * Get questionnaire for a business plan
   * @param planId Business plan ID
   * @returns Question template with questions
   */
  async getQuestionnaire(planId: string): Promise<QuestionTemplate> {
    try {
      const response = await apiClient.get<any>(`/api/v1/business-plans/${planId}/questionnaire`);

      // Handle various response formats from backend
      const data = response.data?.value || response.data;

      // If the response contains questions directly
      if (Array.isArray(data)) {
        return {
          id: planId,
          name: 'Business Plan Questionnaire',
          questions: mapQuestionsFromBackend(data),
        };
      }

      // If the response contains a template structure
      if (data?.questions && Array.isArray(data.questions)) {
        return {
          id: data.id || planId,
          name: data.name || 'Business Plan Questionnaire',
          description: data.description,
          questions: mapQuestionsFromBackend(data.questions),
          estimatedMinutes: data.estimatedMinutes,
        };
      }

      // If the response contains steps (wizard format)
      if (data?.steps && Array.isArray(data.steps)) {
        const allQuestions: Question[] = [];
        data.steps.forEach((step: any) => {
          if (step.questions && Array.isArray(step.questions)) {
            const stepQuestions = mapQuestionsFromBackend(step.questions);
            stepQuestions.forEach((q, idx) => {
              allQuestions.push({
                ...q,
                section: step.title || step.name || `Step ${step.stepNumber}`,
                order: (step.stepNumber - 1) * 100 + idx,
              });
            });
          }
        });

        return {
          id: data.id || planId,
          name: data.name || 'Business Plan Questionnaire',
          questions: allQuestions,
        };
      }

      throw new Error('Invalid questionnaire response format');
    } catch (error: any) {
      console.error('Failed to fetch questionnaire:', error);
      throw new Error(error.message || 'Failed to load questionnaire');
    }
  },

  /**
   * Get existing answers for a business plan
   * @param planId Business plan ID
   * @returns Record of question ID to answer
   */
  async getAnswers(planId: string): Promise<Record<string, Answer>> {
    try {
      const response = await apiClient.get<any>(`/api/v1/business-plans/${planId}/questionnaire`);

      const data = response.data?.value || response.data;
      const answers: Record<string, Answer> = {};

      // Extract answers from various response formats
      const extractAnswers = (questions: any[]) => {
        questions.forEach((q: any) => {
          const questionId = q.id || q.questionId || q.Id || q.QuestionId;
          const answer = q.responseText || q.ResponseText || q.userResponse || q.UserResponse || q.response;

          if (questionId && answer) {
            answers[questionId] = answer;
          }
        });
      };

      if (Array.isArray(data)) {
        extractAnswers(data);
      } else if (data?.questions && Array.isArray(data.questions)) {
        extractAnswers(data.questions);
      } else if (data?.steps && Array.isArray(data.steps)) {
        data.steps.forEach((step: any) => {
          if (step.questions && Array.isArray(step.questions)) {
            extractAnswers(step.questions);
          }
        });
      }

      return answers;
    } catch (error: any) {
      console.error('Failed to fetch answers:', error);
      // Return empty answers on error (might be a new questionnaire)
      return {};
    }
  },

  /**
   * Save answers for a business plan
   * @param planId Business plan ID
   * @param answers Record of question ID to answer
   */
  async saveAnswers(planId: string, answers: Record<string, Answer>): Promise<void> {
    try {
      // Save each answer individually (backend expects this format)
      const savePromises = Object.entries(answers).map(async ([questionId, answer]) => {
        // Skip null or undefined answers
        if (answer === null || answer === undefined) return;

        // Convert answer to string for backend
        const responseText = Array.isArray(answer)
          ? answer.join(', ')
          : answer instanceof Date
          ? answer.toISOString()
          : String(answer);

        await apiClient.post(`/api/v1/business-plans/${planId}/questionnaire/responses`, {
          questionTemplateId: questionId,
          responseText: responseText,
        });
      });

      await Promise.all(savePromises);
    } catch (error: any) {
      console.error('Failed to save answers:', error);
      throw new Error(error.message || 'Failed to save answers');
    }
  },

  /**
   * Save a single answer
   * @param planId Business plan ID
   * @param questionId Question ID
   * @param answer Answer value
   */
  async saveAnswer(planId: string, questionId: string, answer: Answer): Promise<void> {
    try {
      // Convert answer to string for backend
      const responseText = Array.isArray(answer)
        ? answer.join(', ')
        : answer instanceof Date
        ? answer.toISOString()
        : answer !== null
        ? String(answer)
        : '';

      await apiClient.post(`/api/v1/business-plans/${planId}/questionnaire/responses`, {
        questionTemplateId: questionId,
        responseText: responseText,
      });
    } catch (error: any) {
      console.error('Failed to save answer:', error);
      throw new Error(error.message || 'Failed to save answer');
    }
  },

  /**
   * Submit questionnaire and trigger generation
   * @param planId Business plan ID
   */
  async submitQuestionnaire(planId: string): Promise<void> {
    try {
      // Trigger business plan generation
      await apiClient.post(`/api/v1/business-plans/${planId}/generate`, undefined, {
        timeout: 600000, // 10 minutes timeout for generation
      });
    } catch (error: any) {
      console.error('Failed to submit questionnaire:', error);
      throw new Error(error.message || 'Failed to submit questionnaire');
    }
  },

  /**
   * Get questionnaire progress
   * @param planId Business plan ID
   */
  async getProgress(planId: string): Promise<{
    completedQuestions: number;
    totalQuestions: number;
    completionPercentage: number;
    isComplete: boolean;
  }> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/business-plans/${planId}/questionnaire/progress`
      );

      const data = response.data?.value || response.data;

      return {
        completedQuestions: data.completedQuestions || 0,
        totalQuestions: data.totalQuestions || 0,
        completionPercentage: data.completionPercentage || 0,
        isComplete: data.isComplete || false,
      };
    } catch (error: any) {
      console.error('Failed to fetch progress:', error);
      return {
        completedQuestions: 0,
        totalQuestions: 0,
        completionPercentage: 0,
        isComplete: false,
      };
    }
  },

  /**
   * Get AI suggestion for a question
   * @param planId Business plan ID
   * @param questionId Question ID
   * @param questionText Question text
   * @param planType Type of business plan
   * @param existingResponse Existing answer if any
   * @param language Language code
   */
  async getSuggestion(
    planId: string,
    questionId: string,
    questionText: string,
    planType: string = 'BusinessPlan',
    existingResponse?: string,
    language: string = 'en'
  ): Promise<string> {
    try {
      const response = await apiClient.post<any>(
        `/api/v1/business-plans/${planId}/questionnaire/questions/${questionId}/suggest-answer`,
        {
          questionText,
          planType,
          existingResponse: existingResponse || null,
          suggestionCount: 1,
          language,
        }
      );

      // Extract suggestion from response
      if (response.data?.suggestions && response.data.suggestions.length > 0) {
        return response.data.suggestions[0].answer;
      }

      if (typeof response.data === 'string') {
        return response.data;
      }

      throw new Error('No suggestion returned');
    } catch (error: any) {
      console.error('Failed to get suggestion:', error);
      throw new Error(error.message || 'Failed to get AI suggestion');
    }
  },
};

/**
 * Map questions from backend format to frontend format
 */
function mapQuestionsFromBackend(questions: any[]): Question[] {
  return questions.map((q: any) => {
    // Handle both camelCase and PascalCase property names
    const questionText = q.questionText || q.QuestionText || q.text || '';
    const helpText = q.helpText || q.HelpText || q.description || '';
    const questionType = q.questionType || q.QuestionType || 'LongText';

    // Map backend question type to frontend type
    const typeMap: Record<string, string> = {
      'ShortText': 'text',
      'LongText': 'textarea',
      'Text': 'text',
      'MultilineText': 'textarea',
      'SingleChoice': 'select',
      'MultipleChoice': 'multiselect',
      'Number': 'number',
      'Currency': 'number',
      'Date': 'date',
      'DateRange': 'date',
    };

    const mappedType = typeMap[questionType] || 'textarea';

    // Parse options if available
    let options;
    if (q.options || q.Options) {
      const rawOptions = q.options || q.Options;
      if (Array.isArray(rawOptions)) {
        options = rawOptions.map((opt: any) => ({
          value: opt.value || opt.Value || opt.id || opt.Id || String(opt),
          label: opt.label || opt.Label || opt.text || opt.Text || String(opt),
          description: opt.description || opt.Description,
        }));
      }
    }

    return {
      id: q.id || q.Id || q.questionId || q.QuestionId,
      text: questionText,
      description: helpText,
      type: mappedType as any,
      required: q.isRequired !== false && q.IsRequired !== false,
      options,
      placeholder: q.placeholder || q.Placeholder,
      maxLength: q.maxLength || q.MaxLength,
      minLength: q.minLength || q.MinLength,
      min: q.min || q.Min,
      max: q.max || q.Max,
      step: q.step || q.Step,
      prefix: q.prefix || q.Prefix,
      suffix: q.suffix || q.Suffix,
      tip: q.tip || q.Tip,
      example: q.example || q.Example,
      order: q.order || q.Order || 0,
      section: q.section || q.Section,
    };
  });
}

export default questionnaireService;
