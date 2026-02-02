import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, FileText, BarChart3, Plus, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: any;
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

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: t('dashboard.tour.welcome.title'),
      description: t('dashboard.tour.welcome.description'),
      target: '.dashboard-header',
      position: 'bottom',
      icon: Sparkles,
    },
    {
      id: 'stats',
      title: t('dashboard.tour.stats.title'),
      description: t('dashboard.tour.stats.description'),
      target: '.dashboard-stats',
      position: 'bottom',
      icon: BarChart3,
    },
    {
      id: 'create-plan',
      title: t('dashboard.tour.createPlan.title'),
      description: t('dashboard.tour.createPlan.description'),
      target: '.dashboard-create-card',
      position: 'top',
      icon: Plus,
    },
    {
      id: 'plans-list',
      title: t('dashboard.tour.plansList.title'),
      description: t('dashboard.tour.plansList.description'),
      target: '.dashboard-plans',
      position: 'top',
      icon: FileText,
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

  // Arrow rendering
  const renderArrow = () => {
    const p = popupPosition.position;
    const arrowSize = 10;
    const cardBg = theme === 'dark' ? '#1f2937' : '#ffffff';
    const base: React.CSSProperties = { position: 'absolute', width: 0, height: 0 };

    if (p === 'bottom') return (
      <div style={{ ...base, top: -arrowSize, left: '50%', transform: 'translateX(-50%)',
        borderLeft: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid ${cardBg}`,
      }} />
    );
    if (p === 'top') return (
      <div style={{ ...base, bottom: -arrowSize, left: '50%', transform: 'translateX(-50%)',
        borderLeft: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid transparent`,
        borderTop: `${arrowSize}px solid ${cardBg}`,
      }} />
    );
    if (p === 'right') return (
      <div style={{ ...base, left: -arrowSize, top: '50%', transform: 'translateY(-50%)',
        borderTop: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid ${cardBg}`,
      }} />
    );
    if (p === 'left') return (
      <div style={{ ...base, right: -arrowSize, top: '50%', transform: 'translateY(-50%)',
        borderTop: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid transparent`,
        borderLeft: `${arrowSize}px solid ${cardBg}`,
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
          minWidth: '300px',
          animation: 'tourCardEnter 250ms ease-out both',
        }}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden relative"
          style={{
            boxShadow: theme === 'dark'
              ? '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)'
              : '0 25px 60px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.04)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow */}
          {renderArrow()}

          {/* Gradient accent bar */}
          <div
            className="h-[3px] w-full"
            style={{ background: `linear-gradient(90deg, ${BRAND_ORANGE}, #F59E0B)` }}
          />

          {/* Content */}
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-50 dark:bg-orange-900/30">
                  <Icon className="text-[#FF6B00]" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {t('dashboard.tour.step')} {currentStep + 1} {t('dashboard.tour.of')} {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={completeTour}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
                aria-label="Close tour"
              >
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === currentStep ? 10 : 8,
                    height: i === currentStep ? 10 : 8,
                    backgroundColor: i <= currentStep ? BRAND_ORANGE : 'transparent',
                    border: i <= currentStep ? 'none' : `1.5px solid ${theme === 'dark' ? '#4B5563' : '#D1D5DB'}`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 flex items-center justify-between bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700/50">
            <button
              onClick={completeTour}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
            >
              {t('dashboard.tour.skip')}
            </button>
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                >
                  <ArrowLeft size={15} />
                  <span>{t('dashboard.tour.previous')}</span>
                </button>
              )}
              <button
                onClick={isLastStep ? completeTour : nextStep}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm text-white rounded-lg font-semibold transition-all hover:brightness-110 active:scale-[0.97]"
                style={{ backgroundColor: BRAND_ORANGE }}
              >
                {isLastStep ? (
                  <>
                    <Check size={15} />
                    <span>{t('dashboard.tour.finish')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('dashboard.tour.next')}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes tourCardEnter {
          from {
            opacity: 0;
            transform: ${getTransform()} translateY(8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: ${getTransform()} translateY(0) scale(1);
          }
        }
        .tour-spotlight-target {
          border-radius: 8px;
        }
      `}</style>
    </>
  );
}
