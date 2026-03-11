import { ReactNode } from 'react';
import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface FeatureGateProps {
  organizationId: string | null | undefined;
  featureKey: string;
  children: ReactNode;
  /** What to show when locked. Defaults to a lock overlay. */
  fallback?: ReactNode;
  /** If true, renders children but disables interaction */
  disableOnly?: boolean;
}

/**
 * Wraps content that requires a specific plan feature.
 * If the feature is not enabled, shows a lock overlay or custom fallback.
 */
export default function FeatureGate({
  organizationId,
  featureKey,
  children,
  fallback,
  disableOnly = false,
}: FeatureGateProps) {
  const { isEnabled, isLoading } = usePlanFeatures(organizationId);
  const navigate = useNavigate();
  const { language } = useTheme();

  // While loading, show children (avoid flash of locked state)
  if (isLoading || !organizationId) return <>{children}</>;

  const enabled = isEnabled(featureKey);

  if (enabled) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  if (disableOnly) {
    return (
      <div className="relative opacity-50 pointer-events-none select-none">
        {children}
      </div>
    );
  }

  // Default lock overlay
  return (
    <div className="relative group">
      <div className="opacity-40 pointer-events-none select-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] rounded-xl">
        <button
          onClick={() => navigate('/subscription-plans')}
          className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:border-momentum-orange dark:hover:border-momentum-orange transition-colors group-hover:scale-105 transition-transform"
        >
          <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {language === 'fr' ? 'Passez au niveau supérieur' : 'Upgrade to unlock'}
          </span>
        </button>
      </div>
    </div>
  );
}
