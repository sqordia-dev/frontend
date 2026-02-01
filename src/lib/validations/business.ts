import { z } from "zod";

/**
 * Business-related validation schemas using Zod
 * Used with React Hook Form for form validation
 */

// Business Plan basic details
export const businessPlanDetailsSchema = z.object({
  title: z.string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
  businessType: z.string().min(1, "Please select a business type"),
  industry: z.string().min(1, "Please select an industry"),
});

export type BusinessPlanDetails = z.infer<typeof businessPlanDetailsSchema>;

// Business information schema
export const businessInfoSchema = z.object({
  businessName: z.string()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name must be less than 200 characters"),
  legalStructure: z.enum([
    "sole_proprietorship",
    "partnership",
    "corporation",
    "llc",
    "nonprofit",
    "cooperative",
    "other",
  ], {
    required_error: "Please select a legal structure",
  }),
  industry: z.string().min(1, "Please select an industry"),
  subIndustry: z.string().optional(),
  description: z.string()
    .min(50, "Description should be at least 50 characters")
    .max(5000, "Description must be less than 5000 characters"),
  missionStatement: z.string()
    .max(500, "Mission statement must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  visionStatement: z.string()
    .max(500, "Vision statement must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  foundingDate: z.date().optional(),
  location: z.object({
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().default("Canada"),
  }).optional(),
  website: z.string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type BusinessInfo = z.infer<typeof businessInfoSchema>;

// Target market schema
export const targetMarketSchema = z.object({
  targetAudience: z.string()
    .min(20, "Please describe your target audience in more detail")
    .max(2000, "Description must be less than 2000 characters"),
  marketSize: z.enum([
    "local",
    "regional",
    "national",
    "international",
  ], {
    required_error: "Please select your market size",
  }),
  customerSegments: z.array(z.string())
    .min(1, "Please add at least one customer segment"),
  demographics: z.object({
    ageRange: z.string().optional(),
    income: z.string().optional(),
    location: z.string().optional(),
    interests: z.array(z.string()).optional(),
  }).optional(),
});

export type TargetMarket = z.infer<typeof targetMarketSchema>;

// Financial projection schema
export const financialProjectionSchema = z.object({
  year: z.number()
    .min(2024, "Year must be 2024 or later")
    .max(2040, "Year must be 2040 or earlier"),
  revenue: z.number()
    .min(0, "Revenue cannot be negative"),
  costOfGoodsSold: z.number()
    .min(0, "Cost cannot be negative")
    .optional()
    .default(0),
  operatingExpenses: z.number()
    .min(0, "Expenses cannot be negative"),
  netIncome: z.number(),
  cashFlow: z.number().optional(),
});

export type FinancialProjection = z.infer<typeof financialProjectionSchema>;

// Financial projections array
export const financialProjectionsSchema = z.object({
  projections: z.array(financialProjectionSchema)
    .min(1, "At least one year of projections is required")
    .max(5, "Maximum 5 years of projections"),
  assumptions: z.string()
    .max(2000, "Assumptions must be less than 2000 characters")
    .optional(),
  notes: z.string()
    .max(2000, "Notes must be less than 2000 characters")
    .optional(),
});

export type FinancialProjections = z.infer<typeof financialProjectionsSchema>;

// Startup costs schema
export const startupCostSchema = z.object({
  category: z.string().min(1, "Category is required"),
  item: z.string().min(1, "Item description is required"),
  amount: z.number().min(0, "Amount cannot be negative"),
  isOneTime: z.boolean().default(true),
  notes: z.string().optional(),
});

export type StartupCost = z.infer<typeof startupCostSchema>;

export const startupCostsSchema = z.object({
  costs: z.array(startupCostSchema),
  totalOneTime: z.number().min(0),
  totalRecurring: z.number().min(0),
  fundingSources: z.array(z.object({
    source: z.string(),
    amount: z.number().min(0),
    type: z.enum(["equity", "debt", "grant", "personal", "other"]),
  })).optional(),
});

export type StartupCosts = z.infer<typeof startupCostsSchema>;

// Competitive analysis schema
export const competitorSchema = z.object({
  name: z.string().min(1, "Competitor name is required"),
  description: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  marketShare: z.number().min(0).max(100).optional(),
  isDirectCompetitor: z.boolean().default(true),
});

export type Competitor = z.infer<typeof competitorSchema>;

export const competitiveAnalysisSchema = z.object({
  competitors: z.array(competitorSchema)
    .min(1, "Please add at least one competitor"),
  competitiveAdvantage: z.string()
    .min(20, "Please describe your competitive advantage in more detail")
    .max(2000, "Description must be less than 2000 characters"),
  marketPosition: z.string().optional(),
});

export type CompetitiveAnalysis = z.infer<typeof competitiveAnalysisSchema>;

// Contact/Profile schema
export const contactInfoSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  phone: z.string()
    .regex(/^[\d\s\-+()]+$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  title: z.string()
    .max(100, "Title must be less than 100 characters")
    .optional(),
  linkedIn: z.string()
    .url("Please enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;

// Cover page schema
export const coverPageSchema = z.object({
  companyName: z.string()
    .min(1, "Company name is required")
    .max(200, "Company name must be less than 200 characters"),
  planTitle: z.string()
    .min(1, "Plan title is required")
    .max(200, "Plan title must be less than 200 characters"),
  tagline: z.string()
    .max(200, "Tagline must be less than 200 characters")
    .optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  contactInfo: contactInfoSchema.optional(),
  date: z.date().optional(),
  version: z.string().optional(),
  confidential: z.boolean().default(false),
});

export type CoverPage = z.infer<typeof coverPageSchema>;

// Validations index export
export const validationSchemas = {
  businessPlanDetails: businessPlanDetailsSchema,
  businessInfo: businessInfoSchema,
  targetMarket: targetMarketSchema,
  financialProjection: financialProjectionSchema,
  financialProjections: financialProjectionsSchema,
  startupCost: startupCostSchema,
  startupCosts: startupCostsSchema,
  competitor: competitorSchema,
  competitiveAnalysis: competitiveAnalysisSchema,
  contactInfo: contactInfoSchema,
  coverPage: coverPageSchema,
};
