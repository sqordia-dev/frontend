'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Sparkles,
  FileText,
  Lightbulb,
  Target,
  Zap,
} from 'lucide-react';

const translations = {
  en: {
    back: 'Back to Dashboard',
    aiBadge: 'AI-Powered Planning',
    title: 'Start Your Business Plan',
    subtitle: 'Name your project and let AI guide you through creating a professional business plan.',
    projectName: 'Project Name',
    projectNamePlaceholder: 'e.g., My Coffee Shop Business Plan',
    projectNameHint: 'Choose a descriptive name that reflects your business idea',
    startBuilding: 'Start Building',
    creating: 'Creating...',
    loading: 'Loading...',
    helpText: 'Your progress is automatically saved. You can continue anytime.',
    featureAI: 'AI-guided questionnaire',
    featureBank: 'Bank-ready documents',
    featureMinutes: 'Complete in 60 min',
    errors: {
      nameRequired: 'Project name is required',
      orgNotFound: 'Organization not found. Please refresh the page.',
      createFailed: 'Failed to create project. Please try again.',
    },
  },
  fr: {
    back: 'Retour au tableau de bord',
    aiBadge: 'Planification assistée par IA',
    title: "Démarrez votre plan d'affaires",
    subtitle: "Nommez votre projet et laissez l'IA vous guider dans la création d'un plan d'affaires professionnel.",
    projectName: 'Nom du projet',
    projectNamePlaceholder: 'ex. Mon plan de café',
    projectNameHint: 'Choisissez un nom descriptif qui reflète votre idée de projet',
    startBuilding: 'Commencer',
    creating: 'Création...',
    loading: 'Chargement...',
    helpText: 'Votre progression est automatiquement sauvegardée. Vous pouvez continuer à tout moment.',
    featureAI: 'Questionnaire guidé par IA',
    featureBank: 'Documents prêts pour la banque',
    featureMinutes: 'Complétez en 60 min',
    errors: {
      nameRequired: 'Le nom du projet est requis',
      orgNotFound: 'Organisation introuvable. Veuillez actualiser la page.',
      createFailed: 'Échec de la création du projet. Veuillez réessayer.',
    },
  },
};

export default function CreatePlanContent({ locale }: { locale: string }) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const basePath = locale === 'fr' ? '/fr' : '';

  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);

  useEffect(() => {
    fetchDefaultOrganization();
  }, []);

  const fetchDefaultOrganization = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        const orgs = data.organizations || data || [];
        if (orgs.length > 0) {
          setOrganizationId(orgs[0].id);
        } else {
          // Create a default organization if none exists
          const createResponse = await fetch('/api/organizations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'My Organization',
              organizationType: 'Startup',
            }),
          });
          if (createResponse.ok) {
            const newOrg = await createResponse.json();
            setOrganizationId(newOrg.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      setError(t.errors.orgNotFound);
    } finally {
      setIsLoadingOrg(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setError(t.errors.nameRequired);
      return;
    }

    if (!organizationId) {
      setError(t.errors.orgNotFound);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user's persona from localStorage (set during onboarding)
      const userPersona = localStorage.getItem('userPersona') as
        | 'entrepreneur'
        | 'consultant'
        | 'obnl'
        | null;

      // Map persona to plan type
      const planType = userPersona === 'obnl' ? 'StrategicPlan' : 'BusinessPlan';
      const persona = userPersona
        ? userPersona.charAt(0).toUpperCase() + userPersona.slice(1)
        : 'Entrepreneur';

      const response = await fetch('/api/business-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectName.trim(),
          planType,
          organizationId,
          persona,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create plan');
      }

      const plan = await response.json();
      router.push(`${basePath}/questionnaire/${plan.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(t.errors.createFailed);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Lightbulb className="h-4 w-4" />, text: t.featureAI },
    { icon: <Target className="h-4 w-4" />, text: t.featureBank },
    { icon: <Zap className="h-4 w-4" />, text: t.featureMinutes },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF6B00]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1A2B47]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        {/* Back Button */}
        <Link
          href={`${basePath}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide mb-6 bg-gradient-to-r from-[#FF6B00] to-[#ff8533] text-white shadow-lg shadow-[#FF6B00]/25">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.aiBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
              {t.title}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleCreateProject} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                {/* Project Name Input */}
                <div className="space-y-3">
                  <label htmlFor="projectName" className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {t.projectName} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="projectName"
                      value={projectName}
                      onChange={(e) => {
                        setProjectName(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder={t.projectNamePlaceholder}
                      autoFocus
                      className="w-full h-12 pl-12 pr-4 text-base rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.projectNameHint}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!projectName.trim() || loading || isLoadingOrg}
                  className="w-full h-12 rounded-xl font-semibold text-base bg-[#FF6B00] hover:bg-[#E55F00] text-white shadow-lg shadow-[#FF6B00]/25 hover:shadow-xl hover:shadow-[#FF6B00]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.creating}
                    </>
                  ) : isLoadingOrg ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.loading}
                    </>
                  ) : (
                    <>
                      {t.startBuilding}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Features Footer */}
            <div className="px-6 sm:px-8 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                  >
                    <span className="text-[#FF6B00]">{feature.icon}</span>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 max-w-sm mx-auto">
            {t.helpText}
          </p>
        </div>
      </div>
    </div>
  );
}
