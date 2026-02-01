import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  showIcon?: boolean;
  containerClassName?: string;
}

/**
 * Password input component with show/hide toggle
 * WCAG 2.0 AA compliant with proper focus states and aria labels
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      showIcon = true,
      containerClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useTheme();

    const inputId = id || `password-input-${Math.random().toString(36).substr(2, 9)}`;

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const baseInputClasses = `
      w-full rounded-lg border bg-background px-4 py-3.5 text-sm text-foreground
      transition-all duration-200
      placeholder:text-muted-foreground
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:cursor-not-allowed disabled:opacity-50
    `;

    const inputClasses = error
      ? `${baseInputClasses} border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500`
      : `${baseInputClasses} border-input focus:border-momentum-orange focus:ring-momentum-orange/20`;

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {showIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock
                className={`h-5 w-5 ${error ? 'text-red-400' : 'text-muted-foreground'}`}
                aria-hidden="true"
              />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={`${inputClasses} ${showIcon ? 'pl-12' : 'pl-4'} pr-12 ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-momentum-orange focus:ring-offset-2"
            aria-label={showPassword ? t('auth.common.hidePassword') : t('auth.common.showPassword')}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
