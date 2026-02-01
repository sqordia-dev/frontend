/**
 * Password strength calculation utility
 * Returns strength level based on password complexity
 */

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Calculate password strength based on various criteria
 * @param password - The password to evaluate
 * @returns PasswordStrengthResult with strength level, score, and individual checks
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
  };

  // Calculate score (0-5)
  let score = 0;
  if (checks.minLength) score++;
  if (checks.hasUppercase) score++;
  if (checks.hasLowercase) score++;
  if (checks.hasNumber) score++;
  if (checks.hasSpecialChar) score++;

  // Bonus for length
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;

  // Determine strength level
  let strength: PasswordStrength;
  if (score < 2) {
    strength = 'weak';
  } else if (score < 3) {
    strength = 'fair';
  } else if (score < 4.5) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    strength,
    score: Math.min(score, 5),
    checks,
  };
}

/**
 * Get color for password strength level
 * @param strength - The password strength level
 * @returns Tailwind color class
 */
export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'fair':
      return 'bg-yellow-500';
    case 'good':
      return 'bg-blue-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
}

/**
 * Get text color for password strength level
 * @param strength - The password strength level
 * @returns Tailwind text color class
 */
export function getStrengthTextColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'text-red-600';
    case 'fair':
      return 'text-yellow-600';
    case 'good':
      return 'text-blue-600';
    case 'strong':
      return 'text-green-600';
    default:
      return 'text-gray-500';
  }
}

/**
 * Get label for password strength level
 * @param strength - The password strength level
 * @returns Human-readable strength label
 */
export function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'fair':
      return 'Fair';
    case 'good':
      return 'Good';
    case 'strong':
      return 'Strong';
    default:
      return '';
  }
}
