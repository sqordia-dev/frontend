import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, FileText, BarChart3, Plus, Check, Rocket } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: any;
  accent: string;
}

interface DashboardTourProps {
  onStartTour?: () => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function DashboardTour({ onStartTour }: DashboardTourProps = {}) {
  const { t, theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [stepKey, setStepKey] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, position: 'right' as 'top' | 'bottom' | 'left' | 'right' });
  const prevElementRef = useRef<HTMLElement | null>(null);

  const BRAND_ORANGE = '#FF6B00';
  const BRAND_BLUE = '#1A2B47';

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: t('dashboard.tour.welcome.title'),
      description: t('dashboard.tour.welcome.description'),
      target: '.dashboard-header',
      position: 'bottom',
      icon: Rocket,
      accent: 'orange',
    },
    {
      id: 'stats',
      title: t('dashboard.tour.stats.title'),
      description: t('dashboard.tour.stats.description'),
      target: '.dashboard-stats',
      position: 'bottom',
      icon: BarChart3,
      accent: 'blue',
    },
    {
      id: 'create-plan',
      title: t('dashboard.tour.createPlan.title'),
      description: t('dashboard.tour.createPlan.description'),
      target: '.dashboard-create-card',
      position: 'top',
      icon: Plus,
      accent: 'green',
    },
    {
      id: 'plans-list',
      title: t('dashboard.tour.plansList.title'),
      description: t('dashboard.tour.plansList.description'),
      target: '.dashboard-plans',
      position: 'top',
      icon: FileText,
      accent: 'purple',
    },
  ];

  const cleanupElement = useCallback(() => {
    if (prevElementRef.current) {
      prevElementRef.current.style.removeProperty('position');
      prevElementRef.current.style.removeProperty('z-index');
      prevElementRef.current.classList.remove('tour-spotlight-target');
    }
    if (highlightedElement) {
      highlightedElement.style.removeProperty('position');
      highlightedElement.style.removeProperty('z-index');
      highlightedElement.classList.remove('tour-spotlight-target');
    }
  }, [highlightedElement]);

  const completeTour = useCallback(() => {
    cleanupElement();
    setIsVisible(false);
    setIsAnimatingIn(false);
    setHighlightedElement(null);
    setSpotlightRect(null);
    localStorage.setItem('dashboardTourCompleted', 'true');
  }, [cleanupElement]);

  const updateSpotlight = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const pad = 8;
    setSpotlightRect({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });
  }, []);

  const calculatePosition = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const popupWidth = 420;
    const popupHeight = 260;
    const gap = 16;

    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceBottom = window.innerHeight - rect.bottom;
    const spaceTop = rect.top;

    let position: 'top' | 'bottom' | 'left' | 'right' = 'right';
    let top = 0;
    let left = 0;

    if (spaceBottom >= popupHeight + gap) {
      position = 'bottom';
      top = rect.bottom + scrollY + gap;
      left = rect.left + scrollX + (rect.width / 2);
    } else if (spaceTop >= popupHeight + gap) {
      position = 'top';
      top = rect.top + scrollY - popupHeight - gap;
      left = rect.left + scrollX + (rect.width / 2);
    } else if (spaceRight >= popupWidth + gap) {
      position = 'right';
      top = rect.top + scrollY + (rect.height / 2);
      left = rect.right + scrollX + gap;
    } else if (spaceLeft >= popupWidth + gap) {
      position = 'left';
      top = rect.top + scrollY + (rect.height / 2);
      left = rect.left + scrollX - popupWidth - gap;
    } else {
      position = 'bottom';
      top = rect.bottom + scrollY + gap;
      left = Math.max(popupWidth / 2 + 20, Math.min(rect.left + scrollX + rect.width / 2, window.innerWidth - popupWidth / 2 - 20));
    }

    setPopupPosition({ top, left, position });
  }, []);

  const highlightElement = useCallback((stepIndex: number) => {
    if (stepIndex >= steps.length) return;
    const step = steps[stepIndex];
    const element = document.querySelector(step.target) as HTMLElement;

    if (!element) {
      console.warn(`Tour element not found: ${step.target}`);
      if (stepIndex < steps.length - 1) {
        setTimeout(() => {
          setCurrentStep(stepIndex + 1);
          highlightElement(stepIndex + 1);
        }, 500);
      } else {
        completeTour();
      }
      return;
    }

    // Clean up previous element
    cleanupElement();
    prevElementRef.current = element;

    setHighlightedElement(element);
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      // Elevate the target above the overlay
      const computedPos = window.getComputedStyle(element).position;
      if (computedPos === 'static') {
        element.style.position = 'relative';
      }
      element.style.zIndex = '9998';
      element.classList.add('tour-spotlight-target');

      updateSpotlight(element);
      calculatePosition(element);
      setStepKey(k => k + 1);
    }, 350);
  }, [steps, cleanupElement, completeTour, updateSpotlight, calculatePosition]);

  const startTour = useCallback(() => {
    localStorage.removeItem('dashboardTourCompleted');
    setCurrentStep(0);
    setIsVisible(true);
    setIsAnimatingIn(true);
    setTimeout(() => highlightElement(0), 100);
  }, [highlightElement]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('dashboardTourCompleted');
    if (!hasSeenTour) {
      const checkElements = () => {
        const firstElement = document.querySelector(steps[0].target);
        if (firstElement) {
          setIsVisible(true);
          setIsAnimatingIn(true);
          highlightElement(0);
        } else {
          setTimeout(checkElements, 200);
        }
      };
      setTimeout(checkElements, 1000);
    }
  }, []);

  useEffect(() => {
    (window as any).startDashboardTour = startTour;
    return () => { delete (window as any).startDashboardTour; };
  }, [startTour]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { completeTour(); return; }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (currentStep < steps.length - 1) { nextStep(); } else { completeTour(); }
        return;
      }
      if (e.key === 'ArrowLeft' && currentStep > 0) { e.preventDefault(); prevStep(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentStep]);

  // Recalculate spotlight on scroll/resize
  useEffect(() => {
    if (!highlightedElement || !isVisible) return;
    const update = () => {
      updateSpotlight(highlightedElement);
      calculatePosition(highlightedElement);
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [highlightedElement, isVisible, updateSpotlight, calculatePosition]);

  const nextStep = () => {
    const nextIndex = currentStep + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(nextIndex);
      highlightElement(nextIndex);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    const prevIndex = currentStep - 1;
    if (prevIndex >= 0) {
      setCurrentStep(prevIndex);
      highlightElement(prevIndex);
    }
  };

  if (!isVisible || currentStep >= steps.length) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const popupWidth = 420;
  const safeTop = Math.max(16, popupPosition.top);
  const safeLeft = Math.max(16, Math.min(popupPosition.left, window.innerWidth - popupWidth / 2 - 16));

  const getTransform = () => {
    const p = popupPosition.position;
    if (p === 'right' || p === 'left') return 'translateY(-50%)';
    if (p === 'top' || p === 'bottom') return 'translateX(-50%)';
    return 'none';
  };

  // Arrow rendering with improved styling
  const renderArrow = () => {
    const p = popupPosition.position;
    const arrowSize = 12;
    const cardBg = theme === 'dark' ? 'hsl(var(--card))' : 'hsl(var(--card))';
    const base: React.CSSProperties = { position: 'absolute', width: 0, height: 0, zIndex: 10 };

    if (p === 'bottom') return (
      <div style={{ ...base, top: -arrowSize + 1, left: '50%', transform: 'translateX(-50%)',
        borderLeft: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid ${theme === 'dark' ? '#1c1c1e' : '#ffffff'}`,
        filter: 'drop-shadow(0 -2px 3px rgba(0,0,0,0.05))',
      }} />
    );
    if (p === 'top') return (
      <div style={{ ...base, bottom: -arrowSize + 1, left: '50%', transform: 'translateX(-50%)',
        borderLeft: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid transparent`,
        borderTop: `${arrowSize}px solid ${theme === 'dark' ? '#1c1c1e' : '#ffffff'}`,
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.05))',
      }} />
    );
    if (p === 'right') return (
      <div style={{ ...base, left: -arrowSize + 1, top: '50%', transform: 'translateY(-50%)',
        borderTop: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid ${theme === 'dark' ? '#1c1c1e' : '#ffffff'}`,
        filter: 'drop-shadow(-2px 0 3px rgba(0,0,0,0.05))',
      }} />
    );
    if (p === 'left') return (
      <div style={{ ...base, right: -arrowSize + 1, top: '50%', transform: 'translateY(-50%)',
        borderTop: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid transparent`,
        borderLeft: `${arrowSize}px solid ${theme === 'dark' ? '#1c1c1e' : '#ffffff'}`,
        filter: 'drop-shadow(2px 0 3px rgba(0,0,0,0.05))',
      }} />
    );
    return null;
  };

  return (
    <>
      {/* Spotlight Overlay */}
      <div
        className="fixed inset-0 z-[9997] pointer-events-none"
        style={{
          opacity: isAnimatingIn ? 1 : 0,
          transition: 'opacity 300ms ease-out',
        }}
      >
        {spotlightRect && (
          <div
            className="absolute pointer-events-auto"
            onClick={completeTour}
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
              borderRadius: 12,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
              transition: 'top 400ms ease, left 400ms ease, width 400ms ease, height 400ms ease',
            }}
          />
        )}
        {!spotlightRect && (
          <div
            className="absolute inset-0 pointer-events-auto"
            onClick={completeTour}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
          />
        )}
      </div>

      {/* Tooltip Card */}
      <div
        key={stepKey}
        className="fixed z-[9999]"
        style={{
          top: `${safeTop}px`,
          left: `${safeLeft}px`,
          transform: getTransform(),
          maxWidth: `${popupWidth}px`,
          width: '92%',
          minWidth: '320px',
          animation: 'tourCardEnter 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        <div
          className={cn(
            "rounded-2xl overflow-hidden relative",
            "bg-card border border-border/50",
          )}
          style={{
            boxShadow: theme === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow */}
          {renderArrow()}

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                {/* Icon with gradient background */}
                <div
                  className="relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_ORANGE} 0%, #F59E0B 100%)`,
                  }}
                >
                  <Icon className="text-white" size={22} strokeWidth={2.5} />
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-2xl bg-white/10" />
                </div>
                <div className="pt-0.5">
                  <h3 className="text-lg font-bold text-foreground leading-tight tracking-tight">
                    {step.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-semibold text-momentum-orange">
                      Step {currentStep + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      of {steps.length}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={completeTour}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-xl flex-shrink-0 -mt-1 -mr-1"
                aria-label="Close tour"
              >
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 pl-0.5">
              {step.description}
            </p>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex items-center gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500 flex-1",
                      i < currentStep && "bg-momentum-orange",
                      i === currentStep && "bg-momentum-orange",
                      i > currentStep && "bg-muted"
                    )}
                    style={{
                      opacity: i <= currentStep ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={completeTour}
                className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors px-1 py-1"
              >
                {t('dashboard.tour.skip')}
              </button>
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <button
                    onClick={prevStep}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all",
                      "text-foreground bg-muted hover:bg-muted/80 border border-border/50"
                    )}
                  >
                    <ArrowLeft size={15} />
                    <span>Back</span>
                  </button>
                )}
                <button
                  onClick={isLastStep ? completeTour : nextStep}
                  className={cn(
                    "flex items-center gap-1.5 px-5 py-2 text-sm text-white rounded-xl font-semibold transition-all",
                    "hover:brightness-110 active:scale-[0.97]",
                    "shadow-lg shadow-momentum-orange/25"
                  )}
                  style={{ backgroundColor: BRAND_ORANGE }}
                >
                  {isLastStep ? (
                    <>
                      <Check size={15} strokeWidth={2.5} />
                      <span>Get Started</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes tourCardEnter {
          from {
            opacity: 0;
            transform: ${getTransform()} translateY(12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: ${getTransform()} translateY(0) scale(1);
          }
        }
        @keyframes tourPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(255, 107, 0, 0); }
        }
        .tour-spotlight-target {
          border-radius: 12px;
          animation: tourPulse 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
