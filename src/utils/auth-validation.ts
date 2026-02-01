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
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate password meets requirements
 * @param password - Password to validate
 * @returns Object with isValid boolean and array of error messages
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate signup form
 * @param data - Signup form data
 * @returns Array of validation errors (empty if valid)
 */
export function validateSignupForm(data: SignupFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // First name validation
  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (data.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  } else if (data.firstName.trim().length > 50) {
    errors.push({ field: 'firstName', message: 'First name must be less than 50 characters' });
  }

  // Last name validation
  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (data.lastName.trim().length < 2) {
    errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
  } else if (data.lastName.trim().length > 50) {
    errors.push({ field: 'lastName', message: 'Last name must be less than 50 characters' });
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Password validation
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push({ field: 'password', message: passwordValidation.errors[0] });
    }
  }

  // Confirm password validation
  if (data.confirmPassword !== undefined) {
    if (!data.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
    } else if (data.password !== data.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }
  }

  // Organization name validation (optional)
  if (data.organizationName && data.organizationName.trim().length > 100) {
    errors.push({ field: 'organizationName', message: 'Organization name must be less than 100 characters' });
  }

  // Terms acceptance validation
  if (data.acceptTerms === false) {
    errors.push({ field: 'acceptTerms', message: 'You must accept the terms and conditions' });
  }

  return errors;
}

/**
 * Validate login form
 * @param data - Login form data
 * @returns Array of validation errors (empty if valid)
 */
export function validateLoginForm(data: LoginFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Password validation
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
}

/**
 * Validate forgot password form
 * @param data - Forgot password form data
 * @returns Array of validation errors (empty if valid)
 */
export function validateForgotPasswordForm(data: ForgotPasswordFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  return errors;
}

/**
 * Validate reset password form
 * @param data - Reset password form data
 * @returns Array of validation errors (empty if valid)
 */
export function validateResetPasswordForm(data: ResetPasswordFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Token validation
  if (!data.token) {
    errors.push({ field: 'token', message: 'Reset token is required' });
  }

  // Password validation
  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push({ field: 'password', message: passwordValidation.errors[0] });
    }
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
  } else if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  return errors;
}

/**
 * Get error message for a specific field from validation errors
 * @param errors - Array of validation errors
 * @param field - Field name to get error for
 * @returns Error message or undefined if no error
 */
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  const error = errors.find(e => e.field === field);
  return error?.message;
}

/**
 * Check if a field has an error
 * @param errors - Array of validation errors
 * @param field - Field name to check
 * @returns True if field has an error
 */
export function hasFieldError(errors: ValidationError[], field: string): boolean {
  return errors.some(e => e.field === field);
}
