/**
 * Centralized error message utility
 * Converts technical HTTP errors to user-friendly messages
 * Supports French and English localization
 */

import { AxiosError } from 'axios';

type Language = 'en' | 'fr';

interface LocalizedMessage {
  en: string;
  fr: string;
}

/**
 * Maps HTTP status codes to user-friendly messages
 */
const HTTP_STATUS_MESSAGES: Record<number, LocalizedMessage> = {
  400: {
    en: 'The information provided is invalid. Please check your input and try again.',
    fr: 'Les informations fournies sont invalides. Veuillez vérifier votre saisie et réessayer.',
  },
  401: {
    en: 'Your session has expired. Please log in again.',
    fr: 'Votre session a expiré. Veuillez vous reconnecter.',
  },
  403: {
    en: "You don't have permission to perform this action.",
    fr: "Vous n'avez pas la permission d'effectuer cette action.",
  },
  404: {
    en: 'The requested item could not be found.',
    fr: "L'élément demandé n'a pas pu être trouvé.",
  },
  408: {
    en: 'The request took too long. Please try again.',
    fr: 'La requête a pris trop de temps. Veuillez réessayer.',
  },
  409: {
    en: 'This action conflicts with existing data. Please refresh and try again.',
    fr: 'Cette action entre en conflit avec des données existantes. Veuillez actualiser et réessayer.',
  },
  413: {
    en: 'The file is too large. Please use a smaller file.',
    fr: 'Le fichier est trop volumineux. Veuillez utiliser un fichier plus petit.',
  },
  415: {
    en: 'This file type is not supported.',
    fr: "Ce type de fichier n'est pas pris en charge.",
  },
  422: {
    en: 'The information provided could not be processed. Please check your input.',
    fr: "Les informations fournies n'ont pas pu être traitées. Veuillez vérifier votre saisie.",
  },
  429: {
    en: 'Too many requests. Please wait a moment before trying again.',
    fr: 'Trop de requêtes. Veuillez patienter un moment avant de réessayer.',
  },
  500: {
    en: 'Something went wrong on our end. Please try again later.',
    fr: "Une erreur s'est produite de notre côté. Veuillez réessayer plus tard.",
  },
  502: {
    en: "We're having trouble connecting to our servers. Please try again.",
    fr: 'Nous avons des difficultés à nous connecter à nos serveurs. Veuillez réessayer.',
  },
  503: {
    en: 'Our service is temporarily unavailable. Please try again in a few minutes.',
    fr: 'Notre service est temporairement indisponible. Veuillez réessayer dans quelques minutes.',
  },
  504: {
    en: 'The request took too long. Please try again.',
    fr: 'La requête a pris trop de temps. Veuillez réessayer.',
  },
};

/**
 * Maps common backend error codes to user-friendly messages
 */
const BACKEND_ERROR_MESSAGES: Record<string, LocalizedMessage> = {
  // Authentication errors
  'Auth.Error.InvalidCredentials': {
    en: 'Invalid email or password. Please try again.',
    fr: 'Email ou mot de passe invalide. Veuillez réessayer.',
  },
  'Auth.Error.EmailAlreadyExists': {
    en: 'An account with this email already exists.',
    fr: 'Un compte avec cet email existe déjà.',
  },
  'Auth.Error.EmailNotVerified': {
    en: 'Please verify your email before logging in.',
    fr: 'Veuillez vérifier votre email avant de vous connecter.',
  },
  'Auth.Error.AccountLocked': {
    en: 'Your account has been temporarily locked. Please try again later.',
    fr: 'Votre compte a été temporairement verrouillé. Veuillez réessayer plus tard.',
  },
  'Auth.Error.InvalidToken': {
    en: 'Your session has expired. Please log in again.',
    fr: 'Votre session a expiré. Veuillez vous reconnecter.',
  },
  'Auth.Error.TokenExpired': {
    en: 'Your session has expired. Please log in again.',
    fr: 'Votre session a expiré. Veuillez vous reconnecter.',
  },

  // Business plan errors
  'BusinessPlan.NotFound': {
    en: 'This business plan could not be found.',
    fr: "Ce plan d'affaires n'a pas pu être trouvé.",
  },
  'BusinessPlan.AccessDenied': {
    en: "You don't have access to this business plan.",
    fr: "Vous n'avez pas accès à ce plan d'affaires.",
  },
  'BusinessPlan.LimitReached': {
    en: "You've reached the maximum number of business plans for your plan.",
    fr: "Vous avez atteint le nombre maximum de plans d'affaires pour votre abonnement.",
  },
  'BusinessPlan.GenerationFailed': {
    en: 'Unable to generate the business plan. Please try again.',
    fr: "Impossible de générer le plan d'affaires. Veuillez réessayer.",
  },

  // Organization errors
  'Organization.NotFound': {
    en: 'This organization could not be found.',
    fr: "Cette organisation n'a pas pu être trouvée.",
  },
  'Organization.AccessDenied': {
    en: "You don't have access to this organization.",
    fr: "Vous n'avez pas accès à cette organisation.",
  },
  'Organization.NameRequired': {
    en: 'Please provide an organization name.',
    fr: "Veuillez fournir un nom d'organisation.",
  },

  // Questionnaire errors
  'Questionnaire.NotFound': {
    en: 'This questionnaire could not be found.',
    fr: "Ce questionnaire n'a pas pu être trouvé.",
  },
  'Questionnaire.InvalidStep': {
    en: 'Invalid questionnaire step.',
    fr: 'Étape de questionnaire invalide.',
  },
  'Questionnaire.AnswersRequired': {
    en: 'Please answer all required questions.',
    fr: 'Veuillez répondre à toutes les questions requises.',
  },

  // Subscription errors
  'Subscription.NotFound': {
    en: 'No active subscription found.',
    fr: 'Aucun abonnement actif trouvé.',
  },
  'Subscription.PaymentFailed': {
    en: 'Payment could not be processed. Please check your payment method.',
    fr: "Le paiement n'a pas pu être traité. Veuillez vérifier votre mode de paiement.",
  },
  'Subscription.PlanNotAvailable': {
    en: 'This plan is not currently available.',
    fr: "Ce plan n'est pas disponible actuellement.",
  },

  // File upload errors
  'File.TooLarge': {
    en: 'The file is too large. Maximum size is 10MB.',
    fr: 'Le fichier est trop volumineux. La taille maximale est de 10 Mo.',
  },
  'File.InvalidType': {
    en: 'This file type is not supported.',
    fr: "Ce type de fichier n'est pas pris en charge.",
  },
  'File.UploadFailed': {
    en: 'Failed to upload the file. Please try again.',
    fr: "Échec du téléchargement du fichier. Veuillez réessayer.",
  },

  // Validation errors
  'Validation.Required': {
    en: 'This field is required.',
    fr: 'Ce champ est requis.',
  },
  'Validation.InvalidEmail': {
    en: 'Please enter a valid email address.',
    fr: 'Veuillez entrer une adresse email valide.',
  },
  'Validation.InvalidFormat': {
    en: 'The format is not valid.',
    fr: "Le format n'est pas valide.",
  },
  'Validation.TooLong': {
    en: 'This value is too long.',
    fr: 'Cette valeur est trop longue.',
  },
  'Validation.TooShort': {
    en: 'This value is too short.',
    fr: 'Cette valeur est trop courte.',
  },

  // General errors
  'Error.RateLimited': {
    en: 'Too many requests. Please wait a moment and try again.',
    fr: 'Trop de requêtes. Veuillez patienter un moment et réessayer.',
  },
  'Error.NetworkError': {
    en: 'Unable to connect. Please check your internet connection.',
    fr: 'Impossible de se connecter. Veuillez vérifier votre connexion internet.',
  },
  'Error.Timeout': {
    en: 'The request took too long. Please try again.',
    fr: 'La requête a pris trop de temps. Veuillez réessayer.',
  },
};

/**
 * Common error message patterns and their friendly replacements
 */
const ERROR_PATTERN_REPLACEMENTS: Array<{ pattern: RegExp; message: LocalizedMessage }> = [
  {
    pattern: /network error/i,
    message: {
      en: 'Unable to connect. Please check your internet connection.',
      fr: 'Impossible de se connecter. Veuillez vérifier votre connexion internet.',
    },
  },
  {
    pattern: /timeout/i,
    message: {
      en: 'The request took too long. Please try again.',
      fr: 'La requête a pris trop de temps. Veuillez réessayer.',
    },
  },
  {
    pattern: /unauthorized/i,
    message: {
      en: 'Your session has expired. Please log in again.',
      fr: 'Votre session a expiré. Veuillez vous reconnecter.',
    },
  },
  {
    pattern: /forbidden/i,
    message: {
      en: "You don't have permission to perform this action.",
      fr: "Vous n'avez pas la permission d'effectuer cette action.",
    },
  },
  {
    pattern: /not found/i,
    message: {
      en: 'The requested item could not be found.',
      fr: "L'élément demandé n'a pas pu être trouvé.",
    },
  },
  {
    pattern: /internal server error/i,
    message: {
      en: 'Something went wrong on our end. Please try again later.',
      fr: "Une erreur s'est produite de notre côté. Veuillez réessayer plus tard.",
    },
  },
  {
    pattern: /bad request/i,
    message: {
      en: 'The information provided is invalid. Please check your input.',
      fr: 'Les informations fournies sont invalides. Veuillez vérifier votre saisie.',
    },
  },
  {
    pattern: /validation failed/i,
    message: {
      en: 'Please check your input and try again.',
      fr: 'Veuillez vérifier votre saisie et réessayer.',
    },
  },
  {
    pattern: /invalid.*token/i,
    message: {
      en: 'Your session has expired. Please log in again.',
      fr: 'Votre session a expiré. Veuillez vous reconnecter.',
    },
  },
  {
    pattern: /expired/i,
    message: {
      en: 'Your session has expired. Please log in again.',
      fr: 'Votre session a expiré. Veuillez vous reconnecter.',
    },
  },
  {
    pattern: /duplicate/i,
    message: {
      en: 'This item already exists.',
      fr: 'Cet élément existe déjà.',
    },
  },
  {
    pattern: /already exists/i,
    message: {
      en: 'This item already exists.',
      fr: 'Cet élément existe déjà.',
    },
  },
  {
    pattern: /rate limit/i,
    message: {
      en: 'Too many requests. Please wait a moment and try again.',
      fr: 'Trop de requêtes. Veuillez patienter un moment et réessayer.',
    },
  },
  {
    pattern: /too many requests/i,
    message: {
      en: 'Too many requests. Please wait a moment and try again.',
      fr: 'Trop de requêtes. Veuillez patienter un moment et réessayer.',
    },
  },
  {
    pattern: /file.*large/i,
    message: {
      en: 'The file is too large. Please use a smaller file.',
      fr: 'Le fichier est trop volumineux. Veuillez utiliser un fichier plus petit.',
    },
  },
  {
    pattern: /unsupported.*type/i,
    message: {
      en: 'This file type is not supported.',
      fr: "Ce type de fichier n'est pas pris en charge.",
    },
  },
  {
    pattern: /cors/i,
    message: {
      en: 'Unable to connect to the server. Please try again.',
      fr: 'Impossible de se connecter au serveur. Veuillez réessayer.',
    },
  },
];

/**
 * Context-specific fallback messages
 */
const CONTEXT_FALLBACK_MESSAGES: Record<string, LocalizedMessage> = {
  login: {
    en: 'Unable to log in. Please check your credentials and try again.',
    fr: 'Impossible de se connecter. Veuillez vérifier vos identifiants et réessayer.',
  },
  signup: {
    en: 'Unable to create account. Please try again.',
    fr: 'Impossible de créer un compte. Veuillez réessayer.',
  },
  password: {
    en: 'Unable to process password request. Please try again.',
    fr: 'Impossible de traiter la demande de mot de passe. Veuillez réessayer.',
  },
  profile: {
    en: 'Unable to update profile. Please try again.',
    fr: 'Impossible de mettre à jour le profil. Veuillez réessayer.',
  },
  upload: {
    en: 'Unable to upload file. Please try again.',
    fr: 'Impossible de télécharger le fichier. Veuillez réessayer.',
  },
  save: {
    en: 'Unable to save changes. Please try again.',
    fr: 'Impossible de sauvegarder les modifications. Veuillez réessayer.',
  },
  delete: {
    en: 'Unable to delete item. Please try again.',
    fr: "Impossible de supprimer l'élément. Veuillez réessayer.",
  },
  load: {
    en: 'Unable to load data. Please refresh and try again.',
    fr: 'Impossible de charger les données. Veuillez actualiser et réessayer.',
  },
  export: {
    en: 'Unable to export. Please try again.',
    fr: "Impossible d'exporter. Veuillez réessayer.",
  },
  share: {
    en: 'Unable to share. Please try again.',
    fr: 'Impossible de partager. Veuillez réessayer.',
  },
  generate: {
    en: 'Unable to generate content. Please try again.',
    fr: 'Impossible de générer le contenu. Veuillez réessayer.',
  },
  subscription: {
    en: 'Unable to process subscription. Please try again.',
    fr: "Impossible de traiter l'abonnement. Veuillez réessayer.",
  },
  payment: {
    en: 'Unable to process payment. Please check your payment method.',
    fr: 'Impossible de traiter le paiement. Veuillez vérifier votre mode de paiement.',
  },
  default: {
    en: 'Something went wrong. Please try again.',
    fr: "Une erreur s'est produite. Veuillez réessayer.",
  },
};

interface ApiErrorResponse {
  message?: string;
  errorMessage?: string;
  error?: {
    message?: string;
    code?: string;
  };
  errors?: Record<string, string[]>;
  title?: string;
  detail?: string;
  code?: string;
  status?: number;
}

/**
 * Get current language from localStorage or default to 'en'
 */
function getCurrentLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language');
    if (stored === 'fr' || stored === 'en') {
      return stored;
    }
  }
  return 'en';
}

/**
 * Extract error message from various API response formats
 */
function extractApiErrorMessage(data: ApiErrorResponse, lang: Language): string | null {
  // Check for backend error code first
  const errorCode = data.code || data.error?.code;
  if (errorCode && BACKEND_ERROR_MESSAGES[errorCode]) {
    return BACKEND_ERROR_MESSAGES[errorCode][lang];
  }

  // Check various message locations
  const rawMessage =
    data.message ||
    data.errorMessage ||
    data.error?.message ||
    data.detail ||
    data.title;

  if (rawMessage) {
    // Check if it's already a user-friendly message (no HTTP codes or technical terms)
    if (isUserFriendlyMessage(rawMessage)) {
      return rawMessage;
    }

    // Try to match known patterns
    for (const { pattern, message } of ERROR_PATTERN_REPLACEMENTS) {
      if (pattern.test(rawMessage)) {
        return message[lang];
      }
    }

    // Return the raw message if it seems reasonable
    if (rawMessage.length < 200 && !containsTechnicalTerms(rawMessage)) {
      return rawMessage;
    }
  }

  // Handle validation errors object
  if (data.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    }
  }

  return null;
}

/**
 * Check if a message appears to be user-friendly
 */
function isUserFriendlyMessage(message: string): boolean {
  // Short, readable messages without technical jargon
  return (
    message.length < 200 &&
    !containsTechnicalTerms(message) &&
    !message.includes('Exception') &&
    !message.includes('Error:') &&
    !/\d{3}\s*error/i.test(message) && // No "400 error" patterns
    !/^[A-Z][a-z]+\.[A-Z]/.test(message) // No error codes like "Auth.Error"
  );
}

/**
 * Check if a message contains technical terms
 */
function containsTechnicalTerms(message: string): boolean {
  const technicalTerms = [
    'exception',
    'stacktrace',
    'stack trace',
    'null reference',
    'undefined',
    'NaN',
    'syntax error',
    'type error',
    'reference error',
    'cors',
    'http status',
    'status code',
    'axios',
    'fetch',
    'xhr',
    'request failed',
    '500',
    '400',
    '401',
    '403',
    '404',
    '502',
    '503',
    'internal server',
    'bad gateway',
    'service unavailable',
  ];

  const lowerMessage = message.toLowerCase();
  return technicalTerms.some((term) => lowerMessage.includes(term));
}

/**
 * Get user-friendly error message from any error type
 *
 * @param error - The error object (can be AxiosError, Error, or unknown)
 * @param context - Optional context for better fallback messages (e.g., 'login', 'save', 'upload')
 * @param language - Optional language override ('en' or 'fr'). If not provided, uses localStorage setting.
 * @returns A user-friendly error message in the appropriate language
 */
export function getUserFriendlyError(
  error: unknown,
  context?: keyof typeof CONTEXT_FALLBACK_MESSAGES | string,
  language?: Language
): string {
  const lang = language || getCurrentLanguage();

  // Handle Axios errors
  if (isAxiosError(error)) {
    // Check for custom user message (set by api-client interceptor)
    if (error.userMessage) {
      return error.userMessage;
    }

    // Check response data for error messages
    if (error.response?.data) {
      const apiMessage = extractApiErrorMessage(error.response.data as ApiErrorResponse, lang);
      if (apiMessage) {
        return apiMessage;
      }
    }

    // Fall back to HTTP status message
    const status = error.response?.status;
    if (status && HTTP_STATUS_MESSAGES[status]) {
      return HTTP_STATUS_MESSAGES[status][lang];
    }

    // Network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return lang === 'fr'
        ? 'Impossible de se connecter. Veuillez vérifier votre connexion internet.'
        : 'Unable to connect. Please check your internet connection.';
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return lang === 'fr'
        ? 'La requête a pris trop de temps. Veuillez réessayer.'
        : 'The request took too long. Please try again.';
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const message = error.message;

    // Check for pattern matches
    for (const { pattern, message: friendlyMessage } of ERROR_PATTERN_REPLACEMENTS) {
      if (pattern.test(message)) {
        return friendlyMessage[lang];
      }
    }

    // If it looks user-friendly, use it
    if (isUserFriendlyMessage(message)) {
      return message;
    }
  }

  // Return context-specific fallback or default message
  const fallbackKey =
    context && context in CONTEXT_FALLBACK_MESSAGES
      ? (context as keyof typeof CONTEXT_FALLBACK_MESSAGES)
      : 'default';

  return CONTEXT_FALLBACK_MESSAGES[fallbackKey][lang];
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError & { userMessage?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Get error message with fallback - simpler version for basic use cases
 */
export function getErrorMessage(
  error: unknown,
  fallback?: string,
  language?: Language
): string {
  const lang = language || getCurrentLanguage();
  const defaultFallback =
    lang === 'fr' ? "Une erreur s'est produite. Veuillez réessayer." : 'Something went wrong. Please try again.';

  const message = getUserFriendlyError(error, undefined, lang);
  return message || fallback || defaultFallback;
}

/**
 * Format validation errors from API response
 */
export function formatValidationErrors(errors: Record<string, string[]>, language?: Language): string {
  const lang = language || getCurrentLanguage();
  const messages = Object.entries(errors).map(([field, fieldErrors]) => {
    const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    return fieldErrors.map((err) => `${fieldName}: ${err}`).join(', ');
  });

  return messages.join('. ');
}

/**
 * Check if error is a network connectivity issue
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response;
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 400 || error.response?.status === 422;
  }
  return false;
}

export default {
  getUserFriendlyError,
  getErrorMessage,
  formatValidationErrors,
  isNetworkError,
  isAuthError,
  isValidationError,
};
