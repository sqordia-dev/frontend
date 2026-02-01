import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Building2, Briefcase, FileText, ChevronDown } from 'lucide-react';
import { StepProps, INDUSTRY_OPTIONS } from '../../../types/onboarding';

/**
 * Business details step
 * Collects business name, industry, and optional description
 */
export default function BusinessDetailsStep({
  data,
  onNext,
  onBack,
  isFirstStep,
}: StepProps) {
  const [businessName, setBusinessName] = useState(data.businessName || '');
  const [industry, setIndustry] = useState(data.industry || '');
  const [description, setDescription] = useState(data.description || '');
  const [errors, setErrors] = useState<{ businessName?: string }>({});
  const [touched, setTouched] = useState<{ businessName?: boolean }>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validate = (): boolean => {
    const newErrors: { businessName?: string } = {};

    if (!businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (businessName.trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'businessName') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };

  const handleContinue = () => {
    setTouched({ businessName: true });
    if (validate()) {
      onNext({
        businessName: businessName.trim(),
        industry: industry || undefined,
        description: description.trim() || undefined,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleContinue();
    }
  };

  const handleIndustryKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIndustry(value);
      setIsDropdownOpen(false);
    }
  };

  const isValid = businessName.trim().length >= 2;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Tell us about your business
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This information helps us create a more relevant business plan for you.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 max-w-md mx-auto w-full">
        {/* Business Name */}
        <div>
          <label
            htmlFor="businessName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Business Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Building2 size={18} className="text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              onBlur={() => handleBlur('businessName')}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Acme Corporation"
              className={`
                w-full rounded-xl border px-4 py-3.5 pl-12 text-sm
                text-gray-900 dark:text-white transition-all duration-200
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                bg-white dark:bg-gray-800
                focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                min-h-[44px]
                ${touched.businessName && errors.businessName
                  ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500/20'
                }
              `}
              aria-invalid={touched.businessName && !!errors.businessName}
              aria-describedby={errors.businessName ? 'businessName-error' : 'businessName-help'}
              required
            />
          </div>
          {touched.businessName && errors.businessName ? (
            <p id="businessName-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.businessName}
            </p>
          ) : (
            <p id="businessName-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The name of your company or project
            </p>
          )}
        </div>

        {/* Industry */}
        <div ref={dropdownRef}>
          <label
            htmlFor="industry"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Industry
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Briefcase size={18} className="text-gray-400" aria-hidden="true" />
            </div>
            <button
              type="button"
              id="industry"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsDropdownOpen(false);
              }}
              className={`
                w-full rounded-xl border px-4 py-3.5 pl-12 pr-10 text-sm text-left
                text-gray-900 dark:text-white transition-all duration-200
                bg-white dark:bg-gray-800
                border-gray-200 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                focus:ring-offset-2 dark:focus:ring-offset-gray-900
                min-h-[44px]
              `}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            >
              {industry || <span className="text-gray-500 dark:text-gray-400">Select an industry</span>}
            </button>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </div>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <ul
                className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto py-1"
                role="listbox"
                aria-label="Industry options"
              >
                {INDUSTRY_OPTIONS.map((option) => (
                  <li
                    key={option}
                    role="option"
                    aria-selected={industry === option}
                    tabIndex={0}
                    onClick={() => {
                      setIndustry(option);
                      setIsDropdownOpen(false);
                    }}
                    onKeyDown={(e) => handleIndustryKeyDown(e, option)}
                    className={`
                      px-4 py-2.5 cursor-pointer transition-colors
                      ${industry === option
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We'll recommend templates based on your industry
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Brief Description <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute top-3.5 left-4 pointer-events-none">
              <FileText size={18} className="text-gray-400" aria-hidden="true" />
            </div>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your business do?"
              rows={3}
              className="
                w-full rounded-xl border border-gray-200 dark:border-gray-700
                px-4 py-3.5 pl-12 text-sm
                text-gray-900 dark:text-white bg-white dark:bg-gray-800
                transition-all duration-200
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                focus:ring-offset-2 dark:focus:ring-offset-gray-900
                resize-none
              "
              aria-describedby="description-help"
            />
          </div>
          <p id="description-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            A short description to help personalize your business plan
          </p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-xl
            font-medium transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${isFirstStep
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </button>

        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`
            inline-flex items-center gap-2 px-8 py-3 rounded-xl
            font-semibold transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${isValid
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
          style={{ backgroundColor: isValid ? '#FF6B00' : undefined }}
        >
          Continue
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
