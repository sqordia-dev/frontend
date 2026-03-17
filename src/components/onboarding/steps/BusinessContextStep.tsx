import { useState } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, Rocket, Building, Users, DollarSign, Target, SkipForward, MapPin } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import type { StepProps } from '../OnboardingWizard';

const BUSINESS_STAGES = [
  { value: 'Idea', labelKey: 'onboarding.step2.stage.idea', icon: Lightbulb },
  { value: 'Startup', labelKey: 'onboarding.step2.stage.startup', icon: Rocket },
  { value: 'Established', labelKey: 'onboarding.step2.stage.established', icon: Building },
];

const TEAM_SIZES = [
  { value: 'Solo', label: 'Solo' },
  { value: '2-5', label: '2-5' },
  { value: '6-20', label: '6-20' },
  { value: '20+', label: '20+' },
];

const FUNDING_STATUSES = [
  { value: 'Bootstrapped', labelKey: 'onboarding.step2.funding.bootstrapped' },
  { value: 'Seeking', labelKey: 'onboarding.step2.funding.seeking' },
  { value: 'Funded', labelKey: 'onboarding.step2.funding.funded' },
];

const TARGET_MARKETS = [
  { value: 'B2B', label: 'B2B' },
  { value: 'B2C', label: 'B2C' },
  { value: 'B2B2C', label: 'B2B2C' },
  { value: 'B2G', label: 'B2G' },
];

export default function BusinessContextStep({ data, onNext, onBack }: StepProps) {
  const { t } = useTheme();
  const [businessStage, setBusinessStage] = useState(data.businessStage || '');
  const [teamSize, setTeamSize] = useState(data.teamSize || '');
  const [fundingStatus, setFundingStatus] = useState(data.fundingStatus || '');
  const [targetMarket, setTargetMarket] = useState(data.targetMarket || '');
  const [city, setCity] = useState(data.city || '');
  const [province, setProvince] = useState(data.province || '');
  const [country, setCountry] = useState(data.country || '');

  const handleContinue = () => {
    onNext({
      businessStage: businessStage || undefined,
      teamSize: teamSize || undefined,
      fundingStatus: fundingStatus || undefined,
      targetMarket: targetMarket || undefined,
      city: city.trim() || undefined,
      province: province.trim() || undefined,
      country: country.trim() || undefined,
    });
  };

  const handleSkip = () => {
    onNext({});
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t('onboarding.step2.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
          {t('onboarding.step2.subtitle')}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto w-full">
        {/* Business Stage */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            {t('onboarding.step2.stage')}
            <span className="text-gray-400 text-xs ml-2 font-normal">(optional)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {BUSINESS_STAGES.map((stage) => {
              const Icon = stage.icon;
              const isSelected = businessStage === stage.value;
              return (
                <button
                  key={stage.value}
                  onClick={() => setBusinessStage(isSelected ? '' : stage.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <Icon size={24} className={`mx-auto mb-2 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    {t(stage.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Team Size */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            <Users size={16} className="inline mr-2 text-gray-400" />
            {t('onboarding.step2.teamSize')}
            <span className="text-gray-400 text-xs ml-2 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            {TEAM_SIZES.map((size) => {
              const isSelected = teamSize === size.value;
              return (
                <button
                  key={size.value}
                  onClick={() => setTeamSize(isSelected ? '' : size.value)}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Funding & Target Market row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              <DollarSign size={16} className="inline mr-1 text-gray-400" />
              {t('onboarding.step2.funding')}
              <span className="text-gray-400 text-xs ml-1 font-normal">(opt.)</span>
            </label>
            <div className="space-y-2">
              {FUNDING_STATUSES.map((f) => {
                const isSelected = fundingStatus === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFundingStatus(isSelected ? '' : f.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    {t(f.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              <Target size={16} className="inline mr-1 text-gray-400" />
              Target Market
              <span className="text-gray-400 text-xs ml-1 font-normal">(opt.)</span>
            </label>
            <div className="space-y-2">
              {TARGET_MARKETS.map((m) => {
                const isSelected = targetMarket === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setTargetMarket(isSelected ? '' : m.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            <MapPin size={16} className="inline mr-2 text-gray-400" />
            {t('onboarding.step2.location')}
            <span className="text-gray-400 text-xs ml-2 font-normal">(optional)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t('onboarding.step2.location.city')}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder={t('onboarding.step2.location.province')}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder={t('onboarding.step2.location.country')}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[24px]" />

      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <button onClick={onBack} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 min-h-[44px]">
          <ArrowLeft size={18} /> {t('onboarding.back')}
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 min-h-[44px]"
          >
            <SkipForward size={16} /> Skip
          </button>
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl font-semibold bg-momentum-orange hover:bg-[#E56000] text-white shadow-md shadow-momentum-orange/20 min-h-[44px]"
          >
            {t('onboarding.continue')} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
