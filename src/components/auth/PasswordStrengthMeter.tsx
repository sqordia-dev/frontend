import { useMemo } from 'react';
import {
  calculatePasswordStrength,
  getStrengthColor,
  getStrengthTextColor,
  type PasswordStrength,
} from '../../utils/password-strength';
import { useTheme } from '../../contexts/ThemeContext';

interface PasswordStrengthMeterProps {
  password: string;
  showLabel?: boolean;
  showRequirements?: boolean;
  className?: string;
}

/**
 * Password strength meter component
 * Displays a visual bar indicating password strength with optional label and requirements
 * WCAG 2.0 AA compliant with proper color contrast and aria labels
 */
export default function PasswordStrengthMeter({
  password,
  showLabel = true,
  showRequirements = false,
  className = '',
}: PasswordStrengthMeterProps) {
  const { t } = useTheme();
  const strengthResult = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) {
    return null;
  }

  const { strength, checks } = strengthResult;

  // Get the number of bars to fill (1-4)
  const filledBars = strength === 'weak' ? 1 : strength === 'fair' ? 2 : strength === 'good' ? 3 : 4;

  const getStrengthLabelTranslated = (s: PasswordStrength): string => {
    switch (s) {
      case 'weak': return t('auth.common.strengthWeak');
      case 'fair': return t('auth.common.strengthFair');
      case 'good': return t('auth.common.strengthGood');
      case 'strong': return t('auth.common.strengthStrong');
      default: return s;
    }
  };

  const getBarColor = (index: number): string => {
    if (index >= filledBars) {
      return 'bg-gray-200 dark:bg-gray-700';
    }
    return getStrengthColor(strength);
  };

  const strengthLabel = getStrengthLabelTranslated(strength);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength bar */}
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={filledBars}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label={`${t('auth.common.passwordStrength')} ${strengthLabel}`}
      >
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${getBarColor(index)}`}
          />
        ))}
      </div>

      {/* Strength label */}
      {showLabel && (
        <p className={`text-xs font-medium ${getStrengthTextColor(strength)}`}>
          {t('auth.common.passwordStrength')} {strengthLabel}
        </p>
      )}

      {/* Requirements checklist */}
      {showRequirements && (
        <ul className="mt-2 space-y-1 text-xs" aria-label="Password requirements">
          <RequirementItem met={checks.minLength} label={t('auth.common.req.minLength')} />
          <RequirementItem met={checks.hasUppercase} label={t('auth.common.req.uppercase')} />
          <RequirementItem met={checks.hasLowercase} label={t('auth.common.req.lowercase')} />
          <RequirementItem met={checks.hasNumber} label={t('auth.common.req.number')} />
          <RequirementItem met={checks.hasSpecialChar} label={t('auth.common.req.special')} />
        </ul>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  label: string;
}

function RequirementItem({ met, label }: RequirementItemProps) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
          met
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
        }`}
        aria-hidden="true"
      >
        {met ? (
          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <span className="h-1 w-1 rounded-full bg-current" />
        )}
      </span>
      <span className={met ? 'text-gray-700 dark:text-gray-300' : 'text-muted-foreground'}>
        {label}
      </span>
      <span className="sr-only">{met ? '(met)' : '(not met)'}</span>
    </li>
  );
}
