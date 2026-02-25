import { useState, useEffect, useRef } from 'react';
import { Rocket, Briefcase, Heart, ArrowLeft, ArrowRight, Building2, ChevronDown, Check } from 'lucide-react';
import { StepProps, OnboardingPersona, INDUSTRY_OPTIONS, Industry } from '../../../types/onboarding';
import { useTheme } from '../../../contexts/ThemeContext';

// Map industry values to translation keys
const industryTranslationKeys: Record<Industry, string> = {
  'Technology': 'onboarding.industry.technology',
  'Healthcare': 'onboarding.industry.healthcare',
  'Finance': 'onboarding.industry.finance',
  'Retail': 'onboarding.industry.retail',
  'Manufacturing': 'onboarding.industry.manufacturing',
  'Food': 'onboarding.industry.food',
  'Services': 'onboarding.industry.services',
  'Education': 'onboarding.industry.education',
  'Construction': 'onboarding.industry.construction',
  'Entertainment': 'onboarding.industry.entertainment',
  'Other': 'onboarding.industry.other',
};

interface PersonaOption {
  id: OnboardingPersona;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  bgDark: string;
  comingSoon?: boolean;
}

const personaOptions: PersonaOption[] = [
  {
    id: 'entrepreneur',
    titleKey: 'onboarding.step1.persona.entrepreneur',
    descKey: 'onboarding.step1.persona.entrepreneur.desc',
    icon: Rocket,
    color: '#FF6B00',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-900/20',
    comingSoon: false,
  },
  {
    id: 'consultant',
    titleKey: 'onboarding.step1.persona.consultant',
    descKey: 'onboarding.step1.persona.consultant.desc',
    icon: Briefcase,
    color: '#1A2B47',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-800/50',
    comingSoon: true,
  },
  {
    id: 'obnl',
    titleKey: 'onboarding.step1.persona.obnl',
    descKey: 'onboarding.step1.persona.obnl.desc',
    icon: Heart,
    color: '#10B981',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/20',
    comingSoon: true,
  },
];

/**
 * Step 1: Company & Persona
 * Collects company name, industry, and persona selection
 */
export default function CompanyPersonaStep({
  data,
  onNext,
  onBack,
  isFirstStep,
}: StepProps) {
  const { t } = useTheme();
  const [companyName, setCompanyName] = useState(data.companyName || data.businessName || '');
  const [industry, setIndustry] = useState(data.industry || '');
  const [selectedPersona, setSelectedPersona] = useState<OnboardingPersona | undefined>(data.persona);
  const [errors, setErrors] = useState<{ companyName?: string }>({});
  const [touched, setTouched] = useState<{ companyName?: boolean }>({});
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
    const newErrors: { companyName?: string } = {};

    if (!companyName.trim()) {
      newErrors.companyName = t('onboarding.step1.companyName.error.required');
    } else if (companyName.trim().length < 2) {
      newErrors.companyName = t('onboarding.step1.companyName.error.minLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'companyName') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };

  const handlePersonaSelect = (persona: OnboardingPersona) => {
    setSelectedPersona(persona);
  };

  const handlePersonaKeyDown = (e: React.KeyboardEvent, persona: OnboardingPersona) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePersonaSelect(persona);
    }
  };

  const handleContinue = () => {
    setTouched({ companyName: true });
    if (validate() && selectedPersona && industry) {
      onNext({
        companyName: companyName.trim(),
        businessName: companyName.trim(),
        industry: industry,
        persona: selectedPersona,
      });
    }
  };

  const handleIndustryKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIndustry(value);
      setIsDropdownOpen(false);
    }
  };

  const isValid = companyName.trim().length >= 2 && selectedPersona && industry;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t('onboarding.step1.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
          {t('onboarding.step1.subtitle')}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 max-w-2xl mx-auto w-full">
        {/* Company Name */}
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
          >
            {t('onboarding.step1.companyName')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Building2 size={20} className="text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onBlur={() => handleBlur('companyName')}
              placeholder={t('onboarding.step1.companyName.placeholder')}
              className={`
                w-full rounded-xl border px-4 py-3.5 pl-12 text-base
                text-gray-900 dark:text-white transition-all duration-200
                placeholder:text-gray-400 dark:placeholder:text-gray-500
                bg-white dark:bg-gray-800/50
                focus:outline-none focus:ring-2 focus:ring-offset-0
                min-h-[52px]
                ${touched.companyName && errors.companyName
                  ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              aria-invalid={touched.companyName && !!errors.companyName}
              aria-describedby={errors.companyName ? 'companyName-error' : undefined}
              required
            />
          </div>
          {touched.companyName && errors.companyName && (
            <p id="companyName-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              {errors.companyName}
            </p>
          )}
        </div>

        {/* Industry */}
        <div ref={dropdownRef}>
          <label
            htmlFor="industry"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
          >
            {t('onboarding.step1.industry')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              id="industry"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsDropdownOpen(false);
              }}
              className={`
                w-full rounded-xl border px-4 py-3.5 pr-12 text-base text-left
                transition-all duration-200
                bg-white dark:bg-gray-800/50
                focus:outline-none focus:ring-2 focus:ring-offset-0
                min-h-[52px]
                ${industry
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500'
                }
                ${isDropdownOpen
                  ? 'border-orange-500 ring-2 ring-orange-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            >
              {industry ? t(industryTranslationKeys[industry as Industry]) : t('onboarding.step1.industry.placeholder')}
            </button>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </div>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <ul
                className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-auto py-2"
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
                      px-4 py-2.5 cursor-pointer transition-colors flex items-center justify-between
                      ${industry === option
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <span>{t(industryTranslationKeys[option])}</span>
                    {industry === option && (
                      <Check size={16} className="text-orange-500" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Persona Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            {t('onboarding.step1.persona')} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {personaOptions.map((persona) => {
              const Icon = persona.icon;
              const isSelected = selectedPersona === persona.id;
              const isDisabled = persona.comingSoon;

              return (
                <button
                  key={persona.id}
                  onClick={() => !isDisabled && handlePersonaSelect(persona.id)}
                  onKeyDown={(e) => !isDisabled && handlePersonaKeyDown(e, persona.id)}
                  disabled={isDisabled}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-200 group
                    focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                    ${isDisabled
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 cursor-not-allowed opacity-60'
                      : isSelected
                        ? `border-transparent ${persona.bgLight} ${persona.bgDark} shadow-md`
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                    }
                  `}
                  style={{
                    borderColor: isSelected && !isDisabled ? persona.color : undefined,
                  }}
                  aria-pressed={isSelected}
                  aria-disabled={isDisabled}
                  aria-label={`${t(persona.titleKey)}: ${t(persona.descKey)}${isDisabled ? ' - Coming Soon' : ''}`}
                >
                  {/* Coming Soon Badge */}
                  {isDisabled && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('onboarding.comingSoon')}
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`
                      w-11 h-11 rounded-xl flex items-center justify-center mb-3
                      transition-transform duration-200 ${!isDisabled ? 'group-hover:scale-105' : ''}
                    `}
                    style={{ backgroundColor: isDisabled ? '#e5e7eb' : `${persona.color}15` }}
                  >
                    <Icon
                      size={22}
                      style={{ color: isDisabled ? '#9ca3af' : persona.color }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Title and description */}
                  <h3 className={`text-base font-semibold mb-0.5 ${isDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {t(persona.titleKey)}
                  </h3>
                  <p className={`text-sm leading-snug ${isDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {t(persona.descKey)}
                  </p>

                  {/* Selected indicator */}
                  {isSelected && !isDisabled && (
                    <div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: persona.color }}
                      aria-hidden="true"
                    >
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-[24px]" />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className={`
            inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
            font-medium transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${isFirstStep
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          {t('onboarding.back')}
        </button>

        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`
            inline-flex items-center gap-2 px-7 py-2.5 rounded-xl
            font-semibold transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${isValid
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {t('onboarding.continue')}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
