'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Users, Heart, ArrowRight, Sparkles } from 'lucide-react';

const translations = {
  en: {
    badge: 'Personalized Experience',
    title: 'Who are you?',
    subtitle: "Select your profile to get a tailored business planning experience.",
    personas: {
      entrepreneur: {
        title: 'Entrepreneur',
        description: 'Starting or growing my own business',
        features: ['Business plan creation', 'Financial projections', 'Market analysis'],
      },
      consultant: {
        title: 'Consultant',
        description: 'Helping clients build their businesses',
        features: ['Multi-client management', 'White-label options', 'Bulk exports'],
      },
      obnl: {
        title: 'Non-profit',
        description: 'Managing a non-profit organization',
        features: ['Strategic planning', 'Grant applications', 'Impact reporting'],
      },
    },
    continueButton: 'Continue',
  },
  fr: {
    badge: 'Expérience personnalisée',
    title: 'Qui êtes-vous?',
    subtitle: "Sélectionnez votre profil pour obtenir une expérience de planification adaptée.",
    personas: {
      entrepreneur: {
        title: 'Entrepreneur',
        description: 'Je démarre ou développe ma propre entreprise',
        features: ["Création de plan d'affaires", 'Projections financières', 'Analyse de marché'],
      },
      consultant: {
        title: 'Consultant',
        description: "J'aide mes clients à bâtir leurs entreprises",
        features: ['Gestion multi-clients', 'Options marque blanche', 'Exports en lot'],
      },
      obnl: {
        title: 'OBNL',
        description: 'Je gère un organisme à but non lucratif',
        features: ['Planification stratégique', 'Demandes de subventions', "Rapport d'impact"],
      },
    },
    continueButton: 'Continuer',
  },
};

type PersonaType = 'entrepreneur' | 'consultant' | 'obnl';

const personaIcons: Record<PersonaType, React.ComponentType<{ className?: string }>> = {
  entrepreneur: Briefcase,
  consultant: Users,
  obnl: Heart,
};

const personaColors: Record<PersonaType, string> = {
  entrepreneur: 'from-[#FF6B00] to-[#ff8533]',
  consultant: 'from-blue-500 to-blue-600',
  obnl: 'from-purple-500 to-purple-600',
};

export default function PersonaSelectionContent({ locale }: { locale: string }) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const basePath = locale === 'fr' ? '/fr' : '';

  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedPersona) return;

    setLoading(true);
    try {
      // Save persona to localStorage
      localStorage.setItem('userPersona', selectedPersona);

      // Update user profile with persona
      await fetch('/api/user/persona', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: selectedPersona }),
      });

      router.push(`${basePath}/dashboard`);
    } catch (error) {
      console.error('Failed to save persona:', error);
      // Still navigate even if API fails, localStorage is saved
      router.push(`${basePath}/dashboard`);
    } finally {
      setLoading(false);
    }
  };

  const personas: PersonaType[] = ['entrepreneur', 'consultant', 'obnl'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide mb-6 bg-gradient-to-r from-[#FF6B00] to-[#ff8533] text-white shadow-lg shadow-[#FF6B00]/25">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
            {t.title}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {personas.map((persona) => {
            const Icon = personaIcons[persona];
            const personaData = t.personas[persona];
            const isSelected = selectedPersona === persona;

            return (
              <button
                key={persona}
                onClick={() => setSelectedPersona(persona)}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-[#FF6B00] bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-[#FF6B00] flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${personaColors[persona]} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {personaData.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {personaData.description}
                </p>

                {/* Features */}
                <ul className="space-y-1.5">
                  {personaData.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <svg className="h-3.5 w-3.5 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedPersona || loading}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF6B00]/25"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.continueButton}
              </>
            ) : (
              <>
                {t.continueButton}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
