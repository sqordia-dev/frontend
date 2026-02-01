import { z } from "zod";

/**
 * Questionnaire validation schemas using Zod
 * Used with React Hook Form for form validation
 */

// Base answer value types
export const answerValueSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.number(),
  z.boolean(),
  z.date(),
]);

// Single question response
export const questionResponseSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  value: answerValueSchema,
  skipReason: z.string().optional(),
  timestamp: z.date().optional(),
});

export type QuestionResponse = z.infer<typeof questionResponseSchema>;

// Text-based question validations
export const textQuestionSchema = z.object({
  value: z.string().min(1, "This field is required"),
});

export const longTextQuestionSchema = z.object({
  value: z.string()
    .min(10, "Please provide a more detailed answer (at least 10 characters)")
    .max(5000, "Response is too long (maximum 5000 characters)"),
});

export const optionalTextSchema = z.object({
  value: z.string().optional(),
});

// Number-based question validations
export const numberQuestionSchema = z.object({
  value: z.number({
    required_error: "Please enter a number",
    invalid_type_error: "Must be a valid number",
  }),
});

export const currencyQuestionSchema = z.object({
  value: z.number()
    .min(0, "Amount cannot be negative")
    .max(999999999, "Amount is too large"),
});

export const percentageQuestionSchema = z.object({
  value: z.number()
    .min(0, "Percentage cannot be negative")
    .max(100, "Percentage cannot exceed 100"),
});

// Selection-based question validations
export const singleSelectSchema = z.object({
  value: z.string().min(1, "Please select an option"),
});

export const multiSelectSchema = z.object({
  value: z.array(z.string()).min(1, "Please select at least one option"),
});

export const multiSelectWithLimitSchema = (max: number) =>
  z.object({
    value: z.array(z.string())
      .min(1, "Please select at least one option")
      .max(max, `You can select up to ${max} options`),
  });

// Date-based question validations
export const dateQuestionSchema = z.object({
  value: z.date({
    required_error: "Please select a date",
    invalid_type_error: "Invalid date format",
  }),
});

export const futureDateSchema = z.object({
  value: z.date()
    .refine((date) => date > new Date(), {
      message: "Date must be in the future",
    }),
});

export const pastDateSchema = z.object({
  value: z.date()
    .refine((date) => date < new Date(), {
      message: "Date must be in the past",
    }),
});

// Questionnaire section schema
export const questionnaireSectionSchema = z.object({
  sectionId: z.string(),
  answers: z.array(questionResponseSchema),
  isComplete: z.boolean().default(false),
  lastSaved: z.date().optional(),
});

export type QuestionnaireSection = z.infer<typeof questionnaireSectionSchema>;

// Full questionnaire submission schema
export const questionnaireSubmissionSchema = z.object({
  businessPlanId: z.string().uuid("Invalid business plan ID"),
  sections: z.array(questionnaireSectionSchema),
  isDraft: z.boolean().default(true),
  completedAt: z.date().optional(),
});

export type QuestionnaireSubmission = z.infer<typeof questionnaireSubmissionSchema>;

// Helper function to create a dynamic schema based on question type
export function createQuestionSchema(
  type: string,
  options?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }
) {
  const { required = true, minLength, maxLength, min, max } = options || {};

  switch (type) {
    case "text":
    case "short_text": {
      let textSchema = z.string();
      if (required) textSchema = textSchema.min(1, "This field is required");
      if (minLength) textSchema = textSchema.min(minLength, `Minimum ${minLength} characters required`);
      if (maxLength) textSchema = textSchema.max(maxLength, `Maximum ${maxLength} characters allowed`);
      return z.object({ value: required ? textSchema : textSchema.optional() });
    }

    case "long_text":
    case "textarea": {
      let longTextSchema = z.string();
      if (required) longTextSchema = longTextSchema.min(10, "Please provide a more detailed answer");
      if (maxLength) longTextSchema = longTextSchema.max(maxLength, `Maximum ${maxLength} characters allowed`);
      return z.object({ value: required ? longTextSchema : longTextSchema.optional() });
    }

    case "number":
    case "currency": {
      let numSchema = z.number();
      if (min !== undefined) numSchema = numSchema.min(min, `Minimum value is ${min}`);
      if (max !== undefined) numSchema = numSchema.max(max, `Maximum value is ${max}`);
      return z.object({
        value: required
          ? numSchema
          : numSchema.optional(),
      });
    }

    case "percentage":
      return percentageQuestionSchema;

    case "select":
    case "dropdown":
      return required ? singleSelectSchema : optionalTextSchema;

    case "multiselect":
    case "checkbox":
      return required ? multiSelectSchema : z.object({ value: z.array(z.string()).optional() });

    case "date":
      return required ? dateQuestionSchema : z.object({ value: z.date().optional() });

    case "boolean":
    case "yes_no":
      return z.object({
        value: required
          ? z.boolean({ required_error: "Please select an option" })
          : z.boolean().optional(),
      });

    default:
      return z.object({ value: z.unknown() });
  }
}
