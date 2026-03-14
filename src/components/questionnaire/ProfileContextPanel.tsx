import { useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  MapPin,
  Users,
  Target,
  Briefcase,
  DollarSign,
  Globe,
  Layers,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import type { OrganizationProfile, SkippedQuestionDto } from '../../types/organization-profile';

interface ProfileContextPanelProps {
  orgProfile: OrganizationProfile | null;
  skippedQuestions: SkippedQuestionDto[];
  profileCompletenessScore: number;
  onClose?: () => void;
}

interface ProfileField {
  labelEn: string;
  labelFr: string;
  value: string | undefined;
  icon: typeof Building2;
}

export default function ProfileContextPanel({
  orgProfile,
  skippedQuestions,
  profileCompletenessScore,
  onClose,
}: ProfileContextPanelProps) {
  const { language } = useTheme();
  const [showSkipped, setShowSkipped] = useState(false);
  const isFr = language === 'fr';

  if (!orgProfile) return null;

  const fields: ProfileField[] = [
    { labelEn: 'Company', labelFr: 'Entreprise', value: orgProfile.name, icon: Building2 },
    { labelEn: 'Industry', labelFr: 'Industrie', value: orgProfile.industry, icon: Briefcase },
    { labelEn: 'Sector', labelFr: 'Secteur', value: orgProfile.sector, icon: Layers },
    { labelEn: 'Stage', labelFr: 'Stade', value: orgProfile.businessStage, icon: Target },
    { labelEn: 'Team Size', labelFr: "Taille de l'equipe", value: orgProfile.teamSize, icon: Users },
    { labelEn: 'Funding', labelFr: 'Financement', value: orgProfile.fundingStatus, icon: DollarSign },
    { labelEn: 'Target Market', labelFr: 'Marche cible', value: orgProfile.targetMarket, icon: Globe },
    {
      labelEn: 'Location',
      labelFr: 'Localisation',
      value: [orgProfile.city, orgProfile.province, orgProfile.country].filter(Boolean).join(', ') || undefined,
      icon: MapPin,
    },
  ];

  const filledFields = fields.filter(f => f.value && f.value.trim() !== '');

  return (
    <div className="mb-6 bg-momentum-orange/[0.04] dark:bg-momentum-orange/[0.06] border border-momentum-orange/20 dark:border-momentum-orange/15 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-momentum-orange/10 dark:border-momentum-orange/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-momentum-orange/15 dark:bg-momentum-orange/20 flex items-center justify-center">
            <Building2 size={16} className="text-momentum-orange" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isFr ? 'Contexte entreprise' : 'Company Context'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isFr ? 'Profil complété à' : 'Profile'} {profileCompletenessScore}%
              {isFr ? '' : ' complete'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Profile fields grid */}
      <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {filledFields.map(field => {
          const Icon = field.icon;
          return (
            <div key={field.labelEn} className="flex items-start gap-2">
              <Icon size={14} className="text-momentum-orange/70 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground leading-none mb-0.5">
                  {isFr ? field.labelFr : field.labelEn}
                </p>
                <p className="text-sm text-foreground font-medium truncate">
                  {field.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filledFields.length === 0 && (
        <div className="px-4 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            {isFr ? 'Aucune information de profil renseignée.' : 'No profile information filled in yet.'}
          </p>
        </div>
      )}

      {/* Skipped questions (expandable) */}
      {skippedQuestions.length > 0 && (
        <div className="border-t border-momentum-orange/10 dark:border-momentum-orange/10">
          <button
            onClick={() => setShowSkipped(!showSkipped)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-momentum-orange/[0.04] transition-colors"
          >
            <p className="text-xs text-muted-foreground">
              {skippedQuestions.length} {isFr ? 'question(s) pré-remplie(s) depuis le profil' : 'question(s) pre-filled from profile'}
            </p>
            {showSkipped ? (
              <ChevronUp size={14} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={14} className="text-muted-foreground" />
            )}
          </button>

          {showSkipped && (
            <div className="px-4 pb-3 space-y-1.5">
              {skippedQuestions.map(q => (
                <div key={q.id} className="flex items-start gap-2 text-xs">
                  <CheckCircle size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-foreground/80 font-medium">Q{q.questionNumber}:</span>{' '}
                    <span className="text-muted-foreground">{q.questionText}</span>
                    <span className="ml-1.5 text-momentum-orange italic">"{q.profileFieldValue}"</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
