import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, Rocket, Building2, Users, Wallet, ChevronDown, Check } from 'lucide-react';
import { StepProps, BusinessStage, TeamSize, FundingStatus } from '../../../types/onboarding';
import { useTheme } from '../../../contexts/ThemeContext';

interface StageOption {
  id: BusinessStage;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  bgDark: string;
}

const stageOptions: StageOption[] = [
  {
    id: 'Idea',
    titleKey: 'onboarding.step2.stage.idea',
    descKey: 'onboarding.step2.stage.idea.desc',
    icon: Lightbulb,
    color: '#F59E0B',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-900/20',
  },
  {
    id: 'Startup',
    titleKey: 'onboarding.step2.stage.startup',
    descKey: 'onboarding.step2.stage.startup.desc',
    icon: Rocket,
    color: '#FF6B00',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-900/20',
  },
  {
    id: 'Established',
    titleKey: 'onboarding.step2.stage.established',
    descKey: 'onboarding.step2.stage.established.desc',
    icon: Building2,
    color: '#10B981',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/20',
  },
];

interface TeamSizeOption {
  id: TeamSize;
  labelKey: string;
}

const teamSizeOptions: TeamSizeOption[] = [
  { id: 'Solo', labelKey: 'onboarding.step2.teamSize.solo' },
  { id: '2-5', labelKey: 'onboarding.step2.teamSize.small' },
  { id: '6-20', labelKey: 'onboarding.step2.teamSize.medium' },
  { id: '20+', labelKey: 'onboarding.step2.teamSize.large' },
];

interface FundingOption {
  id: FundingStatus;
  titleKey: string;
  descKey: string;
}

const fundingOptions: FundingOption[] = [
  { id: 'Bootstrapped', titleKey: 'onboarding.step2.funding.bootstrapped', descKey: 'onboarding.step2.funding.bootstrapped.desc' },
  { id: 'Seeking', titleKey: 'onboarding.step2.funding.seeking', descKey: 'onboarding.step2.funding.seeking.desc' },
  { id: 'Funded', titleKey: 'onboarding.step2.funding.funded', descKey: 'onboarding.step2.funding.funded.desc' },
];

/**
 * Step 2: Business Context
 * Collects business stage, team size, and funding status
 */
export default function BusinessContextStep({
  data,
  onNext,
  onBack,
  isFirstStep,
}: StepProps) {
  const { t } = useTheme();
  const [businessStage, setBusinessStage] = useState<BusinessStage | undefined>(data.businessStage);
  const [teamSize, setTeamSize] = useState<TeamSize | undefined>(data.teamSize);
  const [fundingStatus, setFundingStatus] = useState<FundingStatus | undefined>(data.fundingStatus);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isFundingDropdownOpen, setIsFundingDropdownOpen] = useState(false);
  const teamDropdownRef = useRef<HTMLDivElement>(null);
  const fundingDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target as Node)) {
        setIsTeamDropdownOpen(false);
      }
      if (fundingDropdownRef.current && !fundingDropdownRef.current.contains(event.target as Node)) {
        setIsFundingDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStageSelect = (stage: BusinessStage) => {
    setBusinessStage(stage);
  };

  const handleStageKeyDown = (e: React.KeyboardEvent, stage: BusinessStage) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStageSelect(stage);
    }
  };

  const handleContinue = () => {
    if (businessStage && teamSize && fundingStatus) {
      onNext({
        businessStage,
        teamSize,
        fundingStatus,
      });
    }
  };

  const isValid = businessStage && teamSize && fundingStatus;

  const getSelectedTeamLabel = () => {
    const option = teamSizeOptions.find(o => o.id === teamSize);
    return option ? t(option.labelKey) : null;
  };

  const getSelectedFundingTitle = () => {
    const option = fundingOptions.find(o => o.id === fundingStatus);
    return option ? t(option.titleKey) : null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t('onboarding.step2.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
          {t('onboarding.step2.subtitle')}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 max-w-2xl mx-auto w-full">
        {/* Business Stage - Radio Cards */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            {t('onboarding.step2.stage')} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stageOptions.map((stage) => {
              const Icon = stage.icon;
              const isSelected = businessStage === stage.id;

              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageSelect(stage.id)}
                  onKeyDown={(e) => handleStageKeyDown(e, stage.id)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-200 group
                    focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                    ${isSelected
                      ? `border-transparent ${stage.bgLight} ${stage.bgDark} shadow-md`
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                    }
                  `}
                  style={{
                    borderColor: isSelected ? stage.color : undefined,
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${t(stage.titleKey)}: ${t(stage.descKey)}`}
                >
                  {/* Icon */}
                  <div
                    className={`
                      w-11 h-11 rounded-xl flex items-center justify-center mb-3
                      transition-transform duration-200 group-hover:scale-105
                    `}
                    style={{ backgroundColor: `${stage.color}15` }}
                  >
                    <Icon
                      size={22}
                      style={{ color: stage.color }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Title and description */}
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                    {t(stage.titleKey)}
                  </h3>
                  <p className="text-sm leading-snug text-gray-500 dark:text-gray-400">
                    {t(stage.descKey)}
                  </p>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: stage.color }}
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

        {/* Team Size - Select */}
        <div ref={teamDropdownRef}>
          <label
            htmlFor="teamSize"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
          >
            {t('onboarding.step2.teamSize')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Users size={20} className="text-gray-400" aria-hidden="true" />
            </div>
            <button
              type="button"
              id="teamSize"
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsTeamDropdownOpen(false);
              }}
              className={`
                w-full rounded-xl border px-4 py-3.5 pl-12 pr-12 text-base text-left
                transition-all duration-200
                bg-white dark:bg-gray-800/50
                focus:outline-none focus:ring-2 focus:ring-offset-0
                min-h-[52px]
                ${teamSize
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500'
                }
                ${isTeamDropdownOpen
                  ? 'border-orange-500 ring-2 ring-orange-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              aria-haspopup="listbox"
              aria-expanded={isTeamDropdownOpen}
            >
              {getSelectedTeamLabel() || t('onboarding.step2.teamSize.placeholder')}
            </button>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-200 ${isTeamDropdownOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </div>

            {/* Dropdown menu */}
            {isTeamDropdownOpen && (
              <ul
                className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-auto py-2"
                role="listbox"
                aria-label={t('onboarding.step2.teamSize')}
              >
                {teamSizeOptions.map((option) => (
                  <li
                    key={option.id}
                    role="option"
                    aria-selected={teamSize === option.id}
                    tabIndex={0}
                    onClick={() => {
                      setTeamSize(option.id);
                      setIsTeamDropdownOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setTeamSize(option.id);
                        setIsTeamDropdownOpen(false);
                      }
                    }}
                    className={`
                      px-4 py-2.5 cursor-pointer transition-colors flex items-center justify-between
                      ${teamSize === option.id
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <span>{t(option.labelKey)}</span>
                    {teamSize === option.id && (
                      <Check size={16} className="text-orange-500" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Funding Status - Select */}
        <div ref={fundingDropdownRef}>
          <label
            htmlFor="fundingStatus"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
          >
            {t('onboarding.step2.funding')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Wallet size={20} className="text-gray-400" aria-hidden="true" />
            </div>
            <button
              type="button"
              id="fundingStatus"
              onClick={() => setIsFundingDropdownOpen(!isFundingDropdownOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsFundingDropdownOpen(false);
              }}
              className={`
                w-full rounded-xl border px-4 py-3.5 pl-12 pr-12 text-base text-left
                transition-all duration-200
                bg-white dark:bg-gray-800/50
                focus:outline-none focus:ring-2 focus:ring-offset-0
                min-h-[52px]
                ${fundingStatus
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500'
                }
                ${isFundingDropdownOpen
                  ? 'border-orange-500 ring-2 ring-orange-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              aria-haspopup="listbox"
              aria-expanded={isFundingDropdownOpen}
            >
              {getSelectedFundingTitle() || t('onboarding.step2.funding.placeholder')}
            </button>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-200 ${isFundingDropdownOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </div>

            {/* Dropdown menu */}
            {isFundingDropdownOpen && (
              <ul
                className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-auto py-2"
                role="listbox"
                aria-label={t('onboarding.step2.funding')}
              >
                {fundingOptions.map((option) => (
                  <li
                    key={option.id}
                    role="option"
                    aria-selected={fundingStatus === option.id}
                    tabIndex={0}
                    onClick={() => {
                      setFundingStatus(option.id);
                      setIsFundingDropdownOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFundingStatus(option.id);
                        setIsFundingDropdownOpen(false);
                      }
                    }}
                    className={`
                      px-4 py-2.5 cursor-pointer transition-colors
                      ${fundingStatus === option.id
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t(option.titleKey)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t(option.descKey)}</div>
                      </div>
                      {fundingStatus === option.id && (
                        <Check size={16} className="text-orange-500 ml-2" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
