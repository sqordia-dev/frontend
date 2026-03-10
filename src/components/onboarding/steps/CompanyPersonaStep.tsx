import { useState, useEffect, useRef } from 'react';
import { Rocket, Briefcase, Heart, ArrowLeft, ArrowRight, Building2, ChevronDown, Check } from 'lucide-react';
import { INDUSTRY_OPTIONS, Industry } from '../../../types/onboarding';
import { useTheme } from '../../../contexts/ThemeContext';
import type { StepProps } from '../OnboardingWizard';

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

const allPersonaOptions = [
  { id: 'entrepreneur' as const, titleKey: 'onboarding.step1.persona.entrepreneur', descKey: 'onboarding.step1.persona.entrepreneur.desc', icon: Rocket, color: '#FF6B00', bgLight: 'bg-orange-50', bgDark: 'dark:bg-orange-900/20' },
  { id: 'consultant' as const, titleKey: 'onboarding.step1.persona.consultant', descKey: 'onboarding.step1.persona.consultant.desc', icon: Briefcase, color: '#1C1D1A', bgLight: 'bg-slate-50', bgDark: 'dark:bg-slate-800/50', comingSoon: true },
  { id: 'obnl' as const, titleKey: 'onboarding.step1.persona.obnl', descKey: 'onboarding.step1.persona.obnl.desc', icon: Heart, color: '#10B981', bgLight: 'bg-emerald-50', bgDark: 'dark:bg-emerald-900/20', comingSoon: true },
];

// Only show enabled personas (hide "Coming Soon" ones)
const personaOptions = allPersonaOptions.filter(p => !p.comingSoon);

export default function CompanyPersonaStep({ data, onNext, onBack, isFirstStep }: StepProps) {
  const { t, language } = useTheme();
  const [companyName, setCompanyName] = useState(data.companyName || '');
  const [industry, setIndustry] = useState(data.industry || '');
  const [sector, setSector] = useState(data.sector || '');
  // Auto-select if only one persona is available
  const [selectedPersona, setSelectedPersona] = useState(data.persona || (personaOptions.length === 1 ? personaOptions[0].id : 'entrepreneur'));
  const [errors, setErrors] = useState<{ companyName?: string }>({});
  const [touched, setTouched] = useState<{ companyName?: boolean }>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleContinue = () => {
    setTouched({ companyName: true });
    if (validate() && selectedPersona) {
      onNext({
        companyName: companyName.trim(),
        industry: industry || undefined,
        sector: industry === 'Other' ? sector.trim() || undefined : undefined,
        persona: selectedPersona,
      });
    }
  };

  const isValid = companyName.trim().length >= 2 && selectedPersona;

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t('onboarding.step1.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
          {t('onboarding.step1.subtitle')}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto w-full">
        {/* Company Name (required) */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {t('onboarding.step1.companyName')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Building2 size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onBlur={() => { setTouched({ companyName: true }); validate(); }}
              placeholder={t('onboarding.step1.companyName.placeholder')}
              className={`w-full rounded-xl border px-4 py-3.5 pl-12 text-base text-gray-900 dark:text-white bg-white dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[52px] ${
                touched.companyName && errors.companyName
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500/20'
              }`}
            />
          </div>
          {touched.companyName && errors.companyName && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.companyName}</p>
          )}
        </div>

        {/* Industry (optional) */}
        <div ref={dropdownRef}>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {t('onboarding.step1.industry')}
            <span className="text-gray-400 text-xs ml-2 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full rounded-xl border px-4 py-3.5 pr-12 text-base text-left bg-white dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[52px] ${
                industry ? 'text-gray-900 dark:text-white' : 'text-gray-400'
              } ${isDropdownOpen ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-200 dark:border-gray-700'}`}
            >
              {industry ? t(industryTranslationKeys[industry as Industry]) : t('onboarding.step1.industry.placeholder')}
            </button>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown size={20} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {isDropdownOpen && (
              <ul className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-auto py-2" role="listbox">
                {INDUSTRY_OPTIONS.map((option) => (
                  <li
                    key={option}
                    role="option"
                    aria-selected={industry === option}
                    tabIndex={0}
                    onClick={() => { setIndustry(option); setIsDropdownOpen(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIndustry(option); setIsDropdownOpen(false); } }}
                    className={`px-4 py-2.5 cursor-pointer flex items-center justify-between ${
                      industry === option ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span>{t(industryTranslationKeys[option])}</span>
                    {industry === option && <Check size={16} className="text-orange-500" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Specify industry when "Other" is selected */}
        {industry === 'Other' && (
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">
              {t('onboarding.specifyIndustry')}
            </label>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder={t('onboarding.industryPlaceholder')}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-momentum-orange focus:border-transparent"
            />
          </div>
        )}

        {/* Persona Selection - only show if multiple personas are available */}
        {personaOptions.length > 1 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              {t('onboarding.step1.persona')} <span className="text-red-500">*</span>
            </label>
            <div className={`grid grid-cols-1 ${personaOptions.length >= 3 ? 'sm:grid-cols-3' : `sm:grid-cols-${personaOptions.length}`} gap-3`}>
              {personaOptions.map((persona) => {
                const Icon = persona.icon;
                const isSelected = selectedPersona === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all group focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isSelected ? `border-transparent ${persona.bgLight} ${persona.bgDark} shadow-md`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    style={{ borderColor: isSelected ? persona.color : undefined }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${persona.color}15` }}>
                      <Icon size={22} style={{ color: persona.color }} />
                    </div>
                    <h3 className="text-base font-semibold mb-0.5 text-gray-900 dark:text-white">{t(persona.titleKey)}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t(persona.descKey)}</p>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: persona.color }}>
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[24px]" />

      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium min-h-[44px] ${
            isFirstStep ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft size={18} /> {t('onboarding.back')}
        </button>
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`inline-flex items-center gap-2 px-7 py-2.5 rounded-xl font-semibold min-h-[44px] ${
            isValid ? 'bg-momentum-orange hover:bg-[#E56000] text-white shadow-md shadow-momentum-orange/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
        >
          {t('onboarding.continue')} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
