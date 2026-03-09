/**
 * Authentication form validation utilities
 * Provides validation schemas and helper functions for auth forms
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  organizationName?: string;
  acceptTerms?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

/**
 * Email validation regex pattern
 * RFC 5322 compliant
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Password requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false, // Optional but adds to strength
};

/**
 * Bilingual validation messages
 */
const VALIDATION_MESSAGES = {
  en: {
    firstNameRequired: 'First name is required',
    firstNameMinLength: 'First name must be at least 2 characters',
    firstNameMaxLength: 'First name must be less than 50 characters',
    lastNameRequired: 'Last name is required',
    lastNameMinLength: 'Last name must be at least 2 characters',
    lastNameMaxLength: 'Last name must be less than 50 characters',
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Password is required',
    passwordMinLength: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`,
    passwordUppercase: 'Password must contain at least one uppercase letter',
    passwordLowercase: 'Password must contain at least one lowercase letter',
    passwordNumber: 'Password must contain at least one number',
    passwordSpecialChar: 'Password must contain at least one special character',
    confirmPasswordRequired: 'Please confirm your password',
    passwordsMismatch: 'Passwords do not match',
    orgNameMaxLength: 'Organization name must be less than 100 characters',
    termsRequired: 'You must accept the terms and conditions',
    tokenRequired: 'Reset token is required',
  },
  fr: {
    firstNameRequired: 'Le prénom est requis',
    firstNameMinLength: 'Le prénom doit contenir au moins 2 caractères',
    firstNameMaxLength: 'Le prénom doit contenir moins de 50 caractères',
    lastNameRequired: 'Le nom est requis',
    lastNameMinLength: 'Le nom doit contenir au moins 2 caractères',
    lastNameMaxLength: 'Le nom doit contenir moins de 50 caractères',
    emailRequired: "L'adresse courriel est requise",
    emailInvalid: 'Veuillez entrer une adresse courriel valide',
    passwordRequired: 'Le mot de passe est requis',
    passwordMinLength: `Le mot de passe doit contenir au moins ${PASSWORD_REQUIREMENTS.minLength} caractères`,
    passwordUppercase: 'Le mot de passe doit contenir au moins une lettre majuscule',
    passwordLowercase: 'Le mot de passe doit contenir au moins une lettre minuscule',
    passwordNumber: 'Le mot de passe doit contenir au moins un chiffre',
    passwordSpecialChar: 'Le mot de passe doit contenir au moins un caractère spécial',
    confirmPasswordRequired: 'Veuillez confirmer votre mot de passe',
    passwordsMismatch: 'Les mots de passe ne correspondent pas',
    orgNameMaxLength: "Le nom de l'organisation doit contenir moins de 100 caractères",
    termsRequired: 'Vous devez accepter les conditions d\'utilisation',
    tokenRequired: 'Le jeton de réinitialisation est requis',
  },
};

type Language = 'en' | 'fr';

function getMessages(language: Language = 'en') {
  return VALIDATION_MESSAGES[language] || VALIDATION_MESSAGES.en;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate password meets requirements
 */
export function validatePassword(password: string, language: Language = 'en'): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const m = getMessages(language);

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(m.passwordMinLength);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push(m.passwordUppercase);
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push(m.passwordLowercase);
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push(m.passwordNumber);
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push(m.passwordSpecialChar);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate signup form
 */
export function validateSignupForm(data: SignupFormData, language: Language = 'en'): ValidationError[] {
  const errors: ValidationError[] = [];
  const m = getMessages(language);

  // First name validation
  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push({ field: 'firstName', message: m.firstNameRequired });
  } else if (data.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: m.firstNameMinLength });
  } else if (data.firstName.trim().length > 50) {
    errors.push({ field: 'firstName', message: m.firstNameMaxLength });
  }

  // Last name validation
  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.push({ field: 'lastName', message: m.lastNameRequired });
  } else if (data.lastName.trim().length < 2) {
    errors.push({ field: 'lastName', message: m.lastNameMinLength });
  } else if (data.lastName.trim().length > 50) {
    errors.push({ field: 'lastName', message: m.lastNameMaxLength });
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: m.emailRequired });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: m.emailInvalid });
  }

  // Password validation
  if (!data.password) {
    errors.push({ field: 'password', message: m.passwordRequired });
  } else {
    const passwordValidation = validatePassword(data.password, language);
    if (!passwordValidation.isValid) {
      errors.push({ field: 'password', message: passwordValidation.errors[0] });
    }
  }

  // Confirm password validation
  if (data.confirmPassword !== undefined) {
    if (!data.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: m.confirmPasswordRequired });
    } else if (data.password !== data.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: m.passwordsMismatch });
    }
  }

  // Organization name validation (optional)
  if (data.organizationName && data.organizationName.trim().length > 100) {
    errors.push({ field: 'organizationName', message: m.orgNameMaxLength });
  }

  // Terms acceptance validation
  if (data.acceptTerms === false) {
    errors.push({ field: 'acceptTerms', message: m.termsRequired });
  }

  return errors;
}

/**
 * Validate login form
 */
export function validateLoginForm(data: LoginFormData, language: Language = 'en'): ValidationError[] {
  const errors: ValidationError[] = [];
  const m = getMessages(language);

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: m.emailRequired });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: m.emailInvalid });
  }

  // Password validation
  if (!data.password) {
    errors.push({ field: 'password', message: m.passwordRequired });
  }

  return errors;
}

/**
 * Validate forgot password form
 */
export function validateForgotPasswordForm(data: ForgotPasswordFormData, language: Language = 'en'): ValidationError[] {
  const errors: ValidationError[] = [];
  const m = getMessages(language);

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: m.emailRequired });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: m.emailInvalid });
  }

  return errors;
}

/**
 * Validate reset password form
 */
export function validateResetPasswordForm(data: ResetPasswordFormData, language: Language = 'en'): ValidationError[] {
  const errors: ValidationError[] = [];
  const m = getMessages(language);

  // Token validation
  if (!data.token) {
    errors.push({ field: 'token', message: m.tokenRequired });
  }

  // Password validation
  if (!data.password) {
    errors.push({ field: 'password', message: m.passwordRequired });
  } else {
    const passwordValidation = validatePassword(data.password, language);
    if (!passwordValidation.isValid) {
      errors.push({ field: 'password', message: passwordValidation.errors[0] });
    }
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: m.confirmPasswordRequired });
  } else if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: m.passwordsMismatch });
  }

  return errors;
}

/**
 * Get error message for a specific field from validation errors
 */
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  const error = errors.find(e => e.field === field);
  return error?.message;
}

/**
 * Check if a field has an error
 */
export function hasFieldError(errors: ValidationError[], field: string): boolean {
  return errors.some(e => e.field === field);
}
