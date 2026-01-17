import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Heart,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { organizationService } from '../lib/organization-service';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';
// Template selection disabled - import removed
// import { templateService } from '../lib/template-service';

export default function CreatePlanPage() {
  const navigate = useNavigate();
  const { t, theme, language } = useTheme();
  
  // Landing page color theme
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const lightAIGrey = '#F4F7FA';
  const [step, setStep] = useState<'type' | 'organization' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<'business' | 'obnl' | null>(null);
  // Template selection disabled - all template-related state removed
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Template step disabled - removed template fetching logic

  const fetchOrganizations = async () => {
    try {
      const orgs = await organizationService.getOrganizations();
      setOrganizations(orgs);
      if (orgs.length > 0) {
        setOrganizationId(orgs[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    }
  };

  // Template fetching disabled

  const handleCreateOrganization = async () => {
    if (!orgName.trim() || !selectedType) return;

    setLoading(true);
    setError(null);
    try {
      const newOrg = await organizationService.createOrganization({
        name: orgName,
        organizationType: selectedType === 'business' ? 'Startup' : 'OBNL',
        description: orgDescription || undefined
      });
      setOrganizationId(newOrg.id);
      setOrganizations([...organizations, newOrg]);
      setOrgName('');
      setOrgDescription('');
      setStep('details');
    } catch (error: any) {
      console.error('Failed to create organization:', error);
      setError(error.message || t('createPlan.errorCreatingOrg'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = (type: 'business' | 'obnl') => {
    setSelectedType(type);
    // Skip template step - go directly to organization or details
    if (organizations.length === 0) {
      setStep('organization');
    } else {
      setStep('details');
    }
  };

  // Template selection handlers disabled

  const handleCreatePlan = async () => {
    if (!planTitle || !selectedType) return;

    if (!organizationId) {
      setError(t('createPlan.selectOrgFirst'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const requestData: any = {
        title: planTitle,
        description: planDescription || undefined,
        planType: selectedType === 'business' ? 'BusinessPlan' : 'StrategicPlan',
        organizationId: organizationId,
        templateId: undefined // Template selection disabled - always start from scratch
      };

      const plan = await businessPlanService.createBusinessPlan(requestData);
      navigate(`/questionnaire/${plan.id}`);
    } catch (error: any) {
      console.error('Failed to create plan:', error);
      setError(error.message || 'Failed to create business plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step indicator component
  const StepIndicator = ({ currentStep }: { currentStep: string }) => {
    const steps = [
      { id: 'type', label: t('createPlan.planType') },
      { id: 'organization', label: t('createPlan.createOrganization') },
      { id: 'details', label: t('createPlan.details') }
    ];
    // Map organization step to details for display purposes (organization is conditional)
    const displayStep = currentStep === 'organization' ? 'details' : currentStep;
    const currentIndex = steps.findIndex(s => s.id === displayStep);

    return (
      <div className="flex items-center justify-center gap-2 mb-16">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                index < currentIndex
                  ? 'text-white'
                  : index === currentIndex
                  ? 'text-white ring-4 ring-opacity-30'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
              style={index < currentIndex ? {
                backgroundColor: momentumOrange
              } : index === currentIndex ? {
                backgroundColor: momentumOrange,
                ringColor: momentumOrange
              } : {}}
              >
                {index < currentIndex ? <CheckCircle size={14} /> : index + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block whitespace-nowrap" style={{ 
                color: index <= currentIndex 
                  ? (theme === 'dark' ? '#F9FAFB' : strategyBlue)
                  : (theme === 'dark' ? '#6B7280' : '#9CA3AF')
              }}>{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-20 h-0.5 mx-3 transition-all ${index < currentIndex ? '' : 'bg-gray-200 dark:bg-gray-700'}`} style={index < currentIndex ? { backgroundColor: momentumOrange } : {}} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO
        title={language === 'fr' 
          ? "Créer un Plan | Sqordia"
          : "Create Plan | Sqordia"}
        description={language === 'fr'
          ? "Créez un nouveau plan d'affaires ou plan stratégique avec Sqordia."
          : "Create a new business plan or strategic plan with Sqordia."}
        url={getCanonicalUrl('/create-plan')}
        noindex={true}
        nofollow={true}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-10 hover:opacity-70 transition-opacity text-sm font-medium"
            style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
          >
            <ArrowLeft size={18} />
            <span>{t('createPlan.back')}</span>
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold tracking-wide mb-6 shadow-lg relative overflow-hidden group" style={{ backgroundColor: momentumOrange, color: '#FFFFFF' }}>
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-full opacity-50 blur-xl group-hover:opacity-75 transition-opacity"
                style={{ backgroundColor: momentumOrange }}
              />
              {/* Shine effect */}
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity shimmer-shine"
                style={{ 
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                }}
              />
              <Sparkles 
                size={18} 
                className="relative z-10 animate-pulse"
                style={{ color: '#FFFFFF' }}
              />
              <span className="relative z-10">{t('createPlan.aiBadge')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
              {t('createPlan.title')}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              {t('createPlan.subtitle')}
            </p>
          </div>

          <StepIndicator currentStep={step} />
        </div>

        {/* Step 1: Plan Type Selection */}
        {step === 'type' && (
          <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <button
              onClick={() => handleSelectType('business')}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-10 text-left transition-all duration-300 hover:scale-[1.02]"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:group-hover:opacity-20 rounded-bl-full" style={{ backgroundColor: strategyBlue }}></div>
              
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6" style={{ backgroundColor: strategyBlue }}>
                  <Building2 size={36} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                  {t('createPlan.businessPlan')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-base leading-relaxed">
                  {t('createPlan.businessPlanDesc')}
                </p>
                <ul className="space-y-4 mb-8">
                  {[t('createPlan.businessFeatures1'), t('createPlan.businessFeatures2'), t('createPlan.businessFeatures3')].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: momentumOrange }}>
                        <CheckCircle size={14} className="text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-base">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 font-bold text-base group-hover:gap-3 transition-all" style={{ color: momentumOrange }}>
                  <span>{t('createPlan.getStarted')}</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectType('obnl')}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-10 text-left transition-all duration-300 hover:scale-[1.02]"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-10 dark:group-hover:opacity-20 rounded-bl-full" style={{ backgroundColor: momentumOrange }}></div>
              
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6" style={{ backgroundColor: momentumOrange }}>
                  <Heart size={36} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                  {t('createPlan.obnlPlan')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-base leading-relaxed">
                  {t('createPlan.obnlPlanDesc')}
                </p>
                <ul className="space-y-4 mb-8">
                  {[t('createPlan.obnlFeatures1'), t('createPlan.obnlFeatures2'), t('createPlan.obnlFeatures3')].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: momentumOrange }}>
                        <CheckCircle size={14} className="text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-base">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 font-bold text-base group-hover:gap-3 transition-all" style={{ color: momentumOrange }}>
                  <span>{t('createPlan.getStarted')}</span>
                  <ArrowRight size={20} />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Organization */}
        {step === 'organization' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-10 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-3" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                  {t('createPlan.createOrganization')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {t('createPlan.createOrganizationDesc')}
                </p>
              </div>

              <div className="p-10 space-y-8">
                {error && (
                  <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-4">
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={22} />
                    <div className="flex-1">
                      <p className="text-base font-semibold text-red-900 dark:text-red-200 mb-1">{t('createPlan.error')}</p>
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-base font-bold mb-4" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                    {t('createPlan.organizationName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={t('createPlan.orgNamePlaceholder')}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base transition-all"
                    style={{ 
                      '--tw-ring-color': momentumOrange
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = momentumOrange;
                      e.currentTarget.style.ringColor = momentumOrange;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '';
                    }}
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-4" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                    {t('createPlan.organizationDesc')} <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">{t('createPlan.optional')}</span>
                  </label>
                  <textarea
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    placeholder={t('createPlan.orgDescPlaceholder')}
                    rows={5}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none text-base transition-all"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = momentumOrange;
                      e.currentTarget.style.ringColor = momentumOrange;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '';
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep('type')}
                    className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    {t('createPlan.back')}
                  </button>
                  <button
                    onClick={handleCreateOrganization}
                    disabled={!orgName.trim() || loading}
                    className="flex-1 px-4 py-2.5 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    style={{ backgroundColor: momentumOrange }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = momentumOrange)}
                  >
                    {loading ? t('createPlan.creating') : t('createPlan.createOrgButton')}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Plan Details */}
        {step === 'details' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-10 border-b border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setStep('type')}
                  className="flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity text-sm font-medium"
                  style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
                >
                  <ArrowLeft size={16} />
                  <span>{t('createPlan.changePlanType')}</span>
                </button>

                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    selectedType === 'business'
                      ? ''
                      : 'dark:bg-gray-700'
                  }`}
                  style={selectedType === 'business' ? {
                    backgroundColor: strategyBlue
                  } : {
                    backgroundColor: momentumOrange
                  }}
                  >
                    {selectedType === 'business' ? (
                      <Building2 size={32} className="text-white" />
                    ) : (
                      <Heart size={32} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                      {selectedType === 'business' ? t('createPlan.businessPlan') : t('createPlan.obnlPlan')}
                    </h2>
                    <p className="text-base text-gray-500 dark:text-gray-400">
                      {t('createPlan.tellUsAboutPlan')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-8">
                {error && (
                  <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-4">
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={22} />
                    <div className="flex-1">
                      <p className="text-base font-semibold text-red-900 dark:text-red-200 mb-1">{t('createPlan.errorCreatingPlan')}</p>
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-base font-bold mb-4" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                    {t('createPlan.planTitle')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    placeholder={t('createPlan.planTitlePlaceholder')}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base transition-all"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = momentumOrange;
                      e.currentTarget.style.ringColor = momentumOrange;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '';
                    }}
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-4" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                    {t('createPlan.planDescription')} <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">{t('createPlan.optional')}</span>
                  </label>
                  <textarea
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    placeholder={t('createPlan.planDescPlaceholder')}
                    rows={5}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none text-base transition-all"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = momentumOrange;
                      e.currentTarget.style.ringColor = momentumOrange;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '';
                    }}
                  />
                </div>

                <button
                  onClick={handleCreatePlan}
                  disabled={!planTitle || loading}
                  className="w-full py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: momentumOrange }}
                  onMouseEnter={(e) => !loading && !planTitle && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                  onMouseLeave={(e) => !loading && !planTitle && (e.currentTarget.style.backgroundColor = momentumOrange)}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t('createPlan.creating')}
                    </>
                  ) : (
                    <>
                      {t('createPlan.startQuestionnaire')}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  {t('createPlan.questionnaireDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Template Customization Modal - Disabled */}
      </div>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer-shine {
          animation: shimmer 3s infinite;
        }
        .group:hover .shimmer-shine {
          opacity: 0.3 !important;
        }
      `}</style>
    </div>
  );
}
