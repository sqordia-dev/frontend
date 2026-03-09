import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, PersonaType } from '../lib/types';
import { apiClient } from '../lib/api-client';
import { 
  Rocket, 
  Briefcase, 
  Heart, 
  ArrowRight, 
  CheckCircle2,
  Brain,
  Target,
  Users as UsersIcon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';
import { getUserFriendlyError } from '../utils/error-messages';

interface PersonaOption {
  id: PersonaType;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  icon: React.ElementType;
  color: string;
  features: string[];
  featuresFr: string[];
  comingSoon?: boolean;
}

const personaOptions: PersonaOption[] = [
  {
    id: 'Entrepreneur',
    title: 'Entrepreneur / Solopreneur',
    titleFr: 'Entrepreneur / Solopreneur',
    description: 'Building your own business from the ground up',
    descriptionFr: 'Construire votre propre entreprise à partir de zéro',
    icon: Rocket,
    color: '#FF6B00',
    features: [
      'Startup-focused questions',
      'Market validation tools',
      'Investor-ready templates'
    ],
    featuresFr: [
      'Questions axées sur les startups',
      'Outils de validation du marché',
      'Modèles prêts pour investisseurs'
    ]
  },
  {
    id: 'Consultant',
    title: 'Consultant',
    titleFr: 'Consultant',
    description: 'Managing multiple clients and strategic planning',
    descriptionFr: 'Gérer plusieurs clients et planification stratégique',
    icon: Briefcase,
    color: '#1A2B47',
    features: [
      'Driver-based financial modeling',
      'Client portfolio management',
      'Utilization tracking'
    ],
    featuresFr: [
      'Modélisation financière basée sur les moteurs',
      'Gestion de portefeuille clients',
      'Suivi de l\'utilisation'
    ],
    comingSoon: true
  },
  {
    id: 'OBNL',
    title: 'OBNL / NPO',
    titleFr: 'OBNL / OSBL',
    description: 'Strategic planning for non-profit organizations',
    descriptionFr: 'Planification stratégique pour organisations à but non lucratif',
    icon: Heart,
    color: '#10B981',
    features: [
      'Social impact focus',
      'Grant application support',
      'Quebec compliance (Bill 96)'
    ],
    featuresFr: [
      'Focus sur l\'impact social',
      'Support pour demandes de subventions',
      'Conformité Québec (Loi 96)'
    ],
    comingSoon: true
  }
];

export default function PersonaSelectionPage() {
  const navigate = useNavigate();
  const { t, theme, language } = useTheme();
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPersona = async (persona: PersonaType) => {
    setSelectedPersona(persona);
    setError(null);
    setLoading(true);

    try {
      // Update user persona via API
      await apiClient.post('/api/v1/user/persona', { persona });
      
      // Store in localStorage for quick access
      localStorage.setItem('userPersona', persona);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      // 401 or 404 from persona endpoint usually means user not in DB (session invalid or not synced)
      if (status === 401 || status === 404) {
        setError(
          language === 'fr'
            ? 'Votre session a peut-être expiré ou votre profil n\'est pas encore synchronisé. Veuillez vous reconnecter.'
            : 'Your session may have expired or your profile is not yet synced. Please sign in again.'
        );
        // Redirect to login after a short delay so the user sees the message
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      } else {
        setError(getUserFriendlyError(err, 'save'));
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <SEO
        title={language === 'fr'
          ? "Sélectionnez votre profil | Sqordia"
          : "Select Your Profile | Sqordia"}
        description={language === 'fr'
          ? "Choisissez votre type de profil pour personnaliser votre expérience Sqordia."
          : "Choose your profile type to personalize your Sqordia experience."}
        url={getCanonicalUrl('/persona-selection')}
        noindex={true}
        nofollow={true}
      />

      {/* Header */}
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-strategy-blue">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-strategy-blue dark:text-gray-50">
              Sqordia
            </span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl w-full">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 bg-momentum-orange/10 dark:bg-momentum-orange/15 text-momentum-orange">
              <Target size={16} />
              <span>{language === 'fr' ? 'Personnalisation' : 'Personalization'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-strategy-blue dark:text-gray-50">
              {language === 'fr'
                ? 'Choisissez votre profil'
                : 'Choose Your Profile'}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-300">
              {language === 'fr'
                ? 'Sélectionnez le type de profil qui correspond le mieux à vos besoins. Cela personnalisera votre expérience.'
                : 'Select the profile type that best matches your needs. This will personalize your experience.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {personaOptions.map((persona) => {
              const Icon = persona.icon;
              const isSelected = selectedPersona === persona.id;
              const isCurrentlyLoading = loading && isSelected;
              const isDisabled = loading || persona.comingSoon;

              return (
                <button
                  key={persona.id}
                  onClick={() => !isDisabled && handleSelectPersona(persona.id)}
                  disabled={isDisabled}
                  style={{
                    borderColor: isSelected ? persona.color : undefined,
                    boxShadow: isSelected
                      ? `0 0 0 4px ${persona.color}40, 0 10px 25px -5px rgba(0, 0, 0, 0.1)`
                      : undefined,
                  }}
                  className={`
                    relative group rounded-2xl border-2 p-8 text-left transition-all duration-300
                    bg-white dark:bg-gray-800
                    ${isSelected
                      ? 'scale-105'
                      : persona.comingSoon
                        ? ''
                        : 'hover:scale-[1.02] hover:shadow-xl'
                    }
                    ${isSelected ? '' : 'border-gray-200 dark:border-gray-700 shadow-sm'}
                    ${persona.comingSoon ? 'opacity-60 grayscale-[40%]' : ''}
                    ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Coming Soon Badge */}
                  {persona.comingSoon && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {language === 'fr' ? 'Bientôt' : 'Coming Soon'}
                    </div>
                  )}
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-transform ${isSelected ? 'scale-110' : ''}`}
                    style={{ backgroundColor: `${persona.color}15` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: persona.color }} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {language === 'fr' ? persona.titleFr : persona.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm mb-6 text-muted-foreground">
                    {language === 'fr' ? persona.descriptionFr : persona.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {(language === 'fr' ? persona.featuresFr : persona.features).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle2
                          size={16}
                          className="flex-shrink-0 mt-0.5"
                          style={{ color: persona.color }}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Selected Indicator */}
                  {isSelected && !persona.comingSoon && (
                    <div className="absolute top-4 right-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: persona.color }}
                      >
                        {isCurrentlyLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 size={20} className="text-white" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hover Arrow */}
                  {!isSelected && !loading && !persona.comingSoon && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={20} style={{ color: persona.color }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'fr'
                ? 'Vous pourrez modifier ce choix plus tard dans vos paramètres de profil.'
                : 'You can change this selection later in your profile settings.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
