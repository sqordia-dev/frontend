import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { X, ArrowRight, ArrowLeft, FileText, BarChart3, Plus, Check, Rocket, Square, CheckSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  titleKey: string;
  descKey: string;
  target: string;
  icon: any;
  optional?: boolean;
}

const STEPS: TourStep[] = [
  {
    id: 'welcome',
    titleKey: 'dashboard.tour.welcome.title',
    descKey: 'dashboard.tour.welcome.description',
    target: '.dashboard-header',
    icon: Rocket,
  },
  {
    id: 'stats',
    titleKey: 'dashboard.tour.stats.title',
    descKey: 'dashboard.tour.stats.description',
    target: '.dashboard-stats',
    icon: BarChart3,
    optional: true,
  },
  {
    id: 'create-plan',
    titleKey: 'dashboard.tour.createPlan.title',
    descKey: 'dashboard.tour.createPlan.description',
    target: '.dashboard-create-card',
    icon: Plus,
  },
  {
    id: 'plans-list',
    titleKey: 'dashboard.tour.plansList.title',
    descKey: 'dashboard.tour.plansList.description',
    target: '.dashboard-plans',
    icon: FileText,
  },
];

const BRAND_ORANGE = '#FF6B00';
const POPUP_WIDTH = 400;
const GAP = 16;
const PAD = 10;

interface DashboardTourProps {
  onStartTour?: () => void;
}

export default function DashboardTour({ onStartTour }: DashboardTourProps = {}) {
  const { t, theme } = useTheme();

  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const [arrowPos, setArrowPos] = useState<'top' | 'bottom'>('top');

  const stepIndexRef = useRef(0);
  const [stepIndex, setStepIndex] = useState(0);
  const prevElementRef = useRef<HTMLElement | null>(null);
  const animFrameRef = useRef(0);

  // Filter to only steps whose target elements exist in the DOM
  const activeSteps = useMemo(() => {
    if (!isVisible) return STEPS;
    return STEPS.filter(s => s.optional ? !!document.querySelector(s.target) : true);
  }, [isVisible]);

  const currentStep = activeSteps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === activeSteps.length - 1;

  // --- Helpers ---

  const cleanupPrev = useCallback(() => {
    const el = prevElementRef.current;
    if (el) {
      el.style.removeProperty('position');
      el.style.removeProperty('z-index');
      el.classList.remove('tour-target');
      prevElementRef.current = null;
    }
  }, []);

  const dismiss = useCallback((permanent: boolean) => {
    cleanupPrev();
    setIsVisible(false);
    setSpotlightRect(null);
    cancelAnimationFrame(animFrameRef.current);
    if (permanent) {
      localStorage.setItem('dashboardTourCompleted', 'true');
    } else {
      sessionStorage.setItem('dashboardTourDismissed', 'true');
    }
  }, [cleanupPrev]);

  const positionPopup = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setSpotlightRect(rect);

    const spaceBelow = window.innerHeight - rect.bottom;
    const placeBelow = spaceBelow > 300;

    const top = placeBelow ? rect.bottom + GAP : rect.top - GAP;
    const left = Math.max(GAP, Math.min(
      rect.left + rect.width / 2 - POPUP_WIDTH / 2,
      window.innerWidth - POPUP_WIDTH - GAP,
    ));

    setArrowPos(placeBelow ? 'top' : 'bottom');
    setPopupStyle({
      position: 'fixed',
      top: placeBelow ? `${top}px` : 'auto',
      bottom: placeBelow ? 'auto' : `${window.innerHeight - top}px`,
      left: `${left}px`,
      width: `${POPUP_WIDTH}px`,
      zIndex: 10001,
    });
  }, []);

  const goToStep = useCallback((idx: number) => {
    cleanupPrev();
    setStepIndex(idx);
    stepIndexRef.current = idx;
  }, [cleanupPrev]);

  // --- Highlight current step element ---

  useEffect(() => {
    if (!isVisible || !currentStep) return;

    const el = document.querySelector(currentStep.target) as HTMLElement | null;
    if (!el) {
      // Skip missing optional steps
      if (currentStep.optional && stepIndex < activeSteps.length - 1) {
        goToStep(stepIndex + 1);
      }
      return;
    }

    // Elevate element above overlay
    const computed = window.getComputedStyle(el).position;
    if (computed === 'static') el.style.position = 'relative';
    el.style.zIndex = '10000';
    el.classList.add('tour-target');
    prevElementRef.current = el;

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Position after scroll settles
    const timer = setTimeout(() => positionPopup(el), 150);

    // Re-position on scroll/resize
    const reposition = () => {
      animFrameRef.current = requestAnimationFrame(() => positionPopup(el));
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isVisible, stepIndex, activeSteps, currentStep, positionPopup, goToStep]);

  // --- Auto-start ---

  useEffect(() => {
    if (localStorage.getItem('dashboardTourCompleted') || sessionStorage.getItem('dashboardTourDismissed')) return;
    const timer = setTimeout(() => {
      const firstTarget = document.querySelector(STEPS[0].target);
      if (firstTarget) {
        setStepIndex(0);
        stepIndexRef.current = 0;
        setIsVisible(true);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // --- Expose startTour globally ---

  const startTour = useCallback(() => {
    localStorage.removeItem('dashboardTourCompleted');
    sessionStorage.removeItem('dashboardTourDismissed');
    setStepIndex(0);
    stepIndexRef.current = 0;
    setDontShowAgain(false);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    (window as any).startDashboardTour = startTour;
    return () => { delete (window as any).startDashboardTour; };
  }, [startTour]);

  // --- Keyboard nav ---

  useEffect(() => {
    if (!isVisible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss(dontShowAgain);
        return;
      }
      const idx = stepIndexRef.current;
      const total = activeSteps.length;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (idx < total - 1) goToStep(idx + 1);
        else dismiss(true);
      }
      if (e.key === 'ArrowLeft' && idx > 0) {
        e.preventDefault();
        goToStep(idx - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVisible, activeSteps.length, dismiss, dontShowAgain, goToStep]);

  // --- Render ---

  if (!isVisible || !currentStep) return null;

  const Icon = currentStep.icon;
  const cardBg = theme === 'dark' ? '#1c1c1e' : '#ffffff';

  return (
    <>
      {/* Overlay with spotlight cutout */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9999 }}
        onClick={() => dismiss(dontShowAgain)}
      >
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {spotlightRect && (
                <rect
                  x={spotlightRect.left - PAD}
                  y={spotlightRect.top - PAD}
                  width={spotlightRect.width + PAD * 2}
                  height={spotlightRect.height + PAD * 2}
                  rx={12}
                  fill="black"
                  style={{ transition: 'all 350ms ease' }}
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.55)"
            mask="url(#tour-mask)"
          />
        </svg>
      </div>

      {/* Tooltip Card */}
      <div
        style={popupStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-2xl bg-card border border-border/50 relative animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{
            boxShadow: theme === 'dark'
              ? '0 25px 50px -12px rgba(0,0,0,0.6)'
              : '0 25px 50px -12px rgba(0,0,0,0.15)',
          }}
        >
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              ...(arrowPos === 'top'
                ? { top: -10, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: `10px solid ${cardBg}` }
                : { bottom: -10, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `10px solid ${cardBg}` }),
              width: 0,
              height: 0,
            }}
          />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                  style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #F59E0B)` }}
                >
                  <Icon className="text-white" size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {t(currentStep.titleKey)}
                  </h3>
                  <p className="text-xs mt-0.5">
                    <span className="font-semibold text-momentum-orange">
                      {t('dashboard.tour.step') || 'Step'} {stepIndex + 1}
                    </span>
                    <span className="text-muted-foreground"> / {activeSteps.length}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismiss(dontShowAgain)}
                className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t(currentStep.descKey)}
            </p>

            {/* Progress */}
            <div className="flex gap-1.5 mb-4">
              {activeSteps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 rounded-full flex-1 transition-all duration-300',
                    i <= stepIndex ? 'bg-momentum-orange' : 'bg-muted',
                  )}
                />
              ))}
            </div>

            {/* Don't show again */}
            <button
              onClick={() => setDontShowAgain(!dontShowAgain)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              {dontShowAgain
                ? <CheckSquare size={14} className="text-momentum-orange" />
                : <Square size={14} />
              }
              {t('dashboard.tour.dontShowAgain')}
            </button>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => dismiss(dontShowAgain)}
                className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors py-1"
              >
                {t('dashboard.tour.skip')}
              </button>
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    onClick={() => goToStep(stepIndex - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-foreground bg-muted hover:bg-muted/80 border border-border/50 transition-all"
                  >
                    <ArrowLeft size={13} />
                    {t('dashboard.tour.back') || 'Back'}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isLast) dismiss(true);
                    else goToStep(stepIndex + 1);
                  }}
                  className="flex items-center gap-1 px-4 py-1.5 text-xs text-white font-semibold rounded-lg shadow-md shadow-momentum-orange/25 transition-all hover:brightness-110 active:scale-[0.97]"
                  style={{ backgroundColor: BRAND_ORANGE }}
                >
                  {isLast ? (
                    <><Check size={13} strokeWidth={3} /> {t('dashboard.tour.finish') || 'Get Started'}</>
                  ) : (
                    <>{t('dashboard.tour.next') || 'Next'} <ArrowRight size={13} strokeWidth={2.5} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .tour-target {
          border-radius: 12px;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.3);
          transition: box-shadow 300ms ease;
        }
      `}</style>
    </>
  );
}
