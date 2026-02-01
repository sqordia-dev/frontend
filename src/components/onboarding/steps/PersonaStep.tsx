import { useState } from 'react';
import { Rocket, Briefcase, Heart, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { StepProps, OnboardingPersona } from '../../../types/onboarding';

interface PersonaOption {
  id: OnboardingPersona;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  benefits: string[];
}

const personaOptions: PersonaOption[] = [
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    description: 'Building my own business',
    icon: Rocket,
    color: '#FF6B00',
    benefits: [
      'Startup-focused templates and questions',
      'Investor-ready financial projections',
      'Market validation frameworks',
      'Pitch deck integration',
    ],
  },
  {
    id: 'consultant',
    title: 'Consultant',
    description: 'Helping clients with their plans',
    icon: Briefcase,
    color: '#1A2B47',
    benefits: [
      'Multi-client portfolio management',
      'White-label export options',
      'Driver-based financial modeling',
      'Client collaboration tools',
    ],
  },
  {
    id: 'obnl',
    title: 'OBNL',
    description: 'Non-profit organization',
    icon: Heart,
    color: '#10B981',
    benefits: [
      'Social impact measurement tools',
      'Grant application templates',
      'Quebec compliance (Bill 96) support',
      'Donor reporting features',
    ],
  },
];

/**
 * Persona selection step
 * User selects their profile type to personalize their experience
 */
export default function PersonaStep({
  data,
  onNext,
  onBack,
  isFirstStep,
}: StepProps) {
  const [selectedPersona, setSelectedPersona] = useState<OnboardingPersona | undefined>(
    data.persona
  );

  const handleSelect = (persona: OnboardingPersona) => {
    setSelectedPersona(persona);
  };

  const handleKeyDown = (e: React.KeyboardEvent, persona: OnboardingPersona) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(persona);
    }
  };

  const handleContinue = () => {
    if (selectedPersona) {
      onNext({ persona: selectedPersona });
    }
  };

  const selectedOption = personaOptions.find(p => p.id === selectedPersona);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          How will you use Sqordia?
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This helps us personalize your experience with the right templates and features.
        </p>
      </div>

      {/* Persona cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {personaOptions.map((persona) => {
          const Icon = persona.icon;
          const isSelected = selectedPersona === persona.id;

          return (
            <button
              key={persona.id}
              onClick={() => handleSelect(persona.id)}
              onKeyDown={(e) => handleKeyDown(e, persona.id)}
              className={`
                relative p-6 rounded-xl border-2 text-left transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                ${isSelected
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-500/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              style={{
                borderColor: isSelected ? persona.color : undefined,
                backgroundColor: isSelected ? `${persona.color}10` : undefined,
              }}
              aria-pressed={isSelected}
              aria-label={`${persona.title}: ${persona.description}`}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${persona.color}20` }}
              >
                <Icon
                  size={24}
                  style={{ color: persona.color }}
                  aria-hidden="true"
                />
              </div>

              {/* Title and description */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {persona.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {persona.description}
              </p>

              {/* Selected indicator */}
              {isSelected && (
                <div
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: persona.color }}
                  aria-hidden="true"
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info box when persona is selected */}
      {selectedOption && (
        <div
          className="mb-6 p-4 rounded-xl border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          role="region"
          aria-label={`Benefits for ${selectedOption.title}`}
        >
          <div className="flex items-start gap-3">
            <Info
              size={20}
              className="flex-shrink-0 text-blue-500 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Perfect for {selectedOption.title}s
              </h4>
              <ul className="space-y-1">
                {selectedOption.benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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
          disabled={!selectedPersona}
          className={`
            inline-flex items-center gap-2 px-8 py-3 rounded-xl
            font-semibold transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${selectedPersona
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
          style={{ backgroundColor: selectedPersona ? '#FF6B00' : undefined }}
        >
          Continue
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
