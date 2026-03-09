import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, ArrowRight, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { organizationService } from '../lib/organization-service';
import { calculateProfileCompletion } from '../types/organization-profile';
import type { OrganizationProfile } from '../types/organization-profile';

const T = {
  en: {
    title: 'Complete your organization profile',
    subtitle: 'A complete profile helps our AI generate more relevant and personalized content for your business plan.',
    cta: 'Complete profile',
    percent: 'complete',
    interviewHint: 'Complete your profile for smarter AI suggestions.',
  },
  fr: {
    title: 'Complétez le profil de votre organisation',
    subtitle: "Un profil complet aide notre IA à générer du contenu plus pertinent et personnalisé pour votre plan d'affaires.",
    cta: 'Compléter le profil',
    percent: 'complété',
    interviewHint: 'Complétez votre profil pour des suggestions IA plus intelligentes.',
  },
};

const DISMISS_KEY = 'profileBannerDismissed';

interface ProfileCompletionBannerProps {
  /** 'dashboard' shows a full banner, 'interview' shows a compact inline nudge */
  variant?: 'dashboard' | 'interview';
  /** If provided, checks this org instead of fetching */
  orgProfile?: OrganizationProfile | null;
  /** Threshold below which the banner shows (default: 100) */
  threshold?: number;
}

export default function ProfileCompletionBanner({
  variant = 'dashboard',
  orgProfile: externalProfile,
  threshold = 100,
}: ProfileCompletionBannerProps) {
  const { language } = useTheme();
  const t = T[language as keyof typeof T] ?? T.en;
  const [profile, setProfile] = useState<OrganizationProfile | null>(externalProfile ?? null);
  const [loading, setLoading] = useState(!externalProfile);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (externalProfile !== undefined) {
      setProfile(externalProfile);
      setLoading(false);
      return;
    }
    organizationService.getMyOrganizationProfile()
      .then(p => setProfile(p))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [externalProfile]);

  // Check sessionStorage for dashboard dismiss (resets each session)
  useEffect(() => {
    if (variant === 'dashboard' && sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
    }
  }, [variant]);

  if (loading || dismissed) return null;

  const { score, missing } = calculateProfileCompletion(profile);
  if (score >= threshold || missing.length === 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (variant === 'dashboard') {
      sessionStorage.setItem(DISMISS_KEY, '1');
    }
  };

  // ── Interview variant: compact one-liner ──────────
  if (variant === 'interview') {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-momentum-orange/5 dark:bg-momentum-orange/10 border border-momentum-orange/20 dark:border-momentum-orange/15">
        <div className="w-7 h-7 rounded-full bg-momentum-orange/10 dark:bg-momentum-orange/20 flex items-center justify-center flex-shrink-0">
          <UserCircle size={15} className="text-momentum-orange" />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 flex-1">
          <span className="font-semibold text-momentum-orange">{score}%</span>{' '}
          {t.percent} — {t.interviewHint}
        </p>
        <Link
          to="/profile"
          className="text-xs font-semibold text-momentum-orange hover:underline flex-shrink-0"
        >
          {t.cta}
        </Link>
      </div>
    );
  }

  // ── Dashboard variant: full banner ────────────────
  return (
    <section className="animate-in fade-in slide-in-from-top-2 duration-400">
      <div className="relative rounded-xl border border-momentum-orange/20 dark:border-momentum-orange/15 bg-momentum-orange/5 dark:bg-momentum-orange/10 p-4 sm:p-5 shadow-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-8">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-momentum-orange/10 dark:bg-momentum-orange/20 flex items-center justify-center flex-shrink-0">
              <UserCircle size={20} className="text-momentum-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t.title}
                </p>
                <span className="text-xs font-bold text-momentum-orange bg-momentum-orange/10 dark:bg-momentum-orange/20 px-2 py-0.5 rounded-full">
                  {score}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {t.subtitle}
              </p>
              {/* Mini progress bar */}
              <div className="h-1 w-full max-w-[200px] rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                <div
                  className="h-full bg-momentum-orange rounded-full transition-all duration-700"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-momentum-orange hover:bg-[#E55F00] shadow-md shadow-momentum-orange/25 transition-all flex-shrink-0"
          >
            {t.cta}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
