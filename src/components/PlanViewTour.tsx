import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, Download, BookOpen, Pencil, Check, Rocket } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: any;
}

interface PlanViewTourProps {
  onStartTour?: () => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function PlanViewTour({ onStartTour }: PlanViewTourProps = {}) {
  const { t, theme, language } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [stepKey, setStepKey] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, position: 'right' as 'top' | 'bottom' | 'left' | 'right' | 'center' });
  const prevElementRef = useRef<HTMLElement | null>(null);

  const BRAND_ORANGE = '#FF6B00';

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: language === 'fr' ? 'Bienvenue dans votre plan d\'affaires' : 'Welcome to your Business Plan',
      description: language === 'fr'
        ? 'Cette page vous permet de visualiser, modifier et exporter votre plan d\'affaires. Commençons par explorer les fonctionnalités principales.'
        : 'This page allows you to view, edit, and export your business plan. Let\'s explore the main features.',
      target: '.plan-view-header',
      position: 'bottom',
      icon: Rocket,
    },
    {
      id: 'export',
      title: language === 'fr' ? 'Exporter votre plan' : 'Export Your Plan',
      description: language === 'fr'
        ? 'Utilisez les boutons PDF et Word pour télécharger votre plan d\'affaires dans différents formats. Le bouton Partager vous permet de partager votre plan avec d\'autres personnes.'
        : 'Use the PDF and Word buttons to download your business plan in different formats. The Share button allows you to share your plan with others.',
      target: '.plan-export-buttons',
      position: 'bottom',
      icon: Download,
    },
    {
      id: 'sidebar',
      title: language === 'fr' ? 'Navigation dans le document' : 'Document Navigation',
      description: language === 'fr'
        ? 'La barre latérale vous permet de naviguer rapidement entre les différentes sections de votre plan d\'affaires. Cliquez sur une section pour y accéder directement.'
        : 'The sidebar allows you to quickly navigate between different sections of your business plan. Click on a section to jump directly to it.',
      target: '.plan-sidebar',
      position: 'right',
      icon: BookOpen,
    },
    {
      id: 'sections',
      title: language === 'fr' ? 'Sections du document' : 'Document Sections',
      description: language === 'fr'
        ? 'Chaque section de votre plan d\'affaires peut être modifiée. Cliquez sur l\'icône de modification pour éditer le contenu d\'une section.'
        : 'Each section of your business plan can be edited. Click the edit icon to modify the content of a section.',
      target: '.plan-content-section',
      position: 'left',
      icon: Pencil,
    },
    {
      id: 'ai-features',
      title: language === 'fr' ? 'Fonctionnalités IA' : 'AI Features',
      description: language === 'fr'
        ? 'Utilisez les boutons "Améliorer", "Développer" et "Simplifier" pour améliorer votre contenu avec l\'intelligence artificielle. Ces outils peuvent vous aider à enrichir vos sections.'
        : 'Use the "Improve", "Expand", and "Simplify" buttons to enhance your content with artificial intelligence. These tools can help enrich your sections.',
      target: '.plan-ai-buttons',
      position: 'top',
      icon: Sparkles,
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
    localStorage.setItem('planViewTourCompleted', 'true');
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
    const isMobile = window.innerWidth < 640;
    const popupWidth = isMobile ? Math.min(340, window.innerWidth - 24) : 420;
    const popupHeight = isMobile ? 240 : 260;
    const gap = isMobile ? 12 : 16;

    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceBottom = window.innerHeight - rect.bottom;
    const spaceTop = rect.top;

    let position: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'right';
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
    } else if (!isMobile && spaceRight >= popupWidth + gap) {
      position = 'right';
      top = rect.top + scrollY + (rect.height / 2);
      left = rect.right + scrollX + gap;
    } else if (!isMobile && spaceLeft >= popupWidth + gap) {
      position = 'left';
      top = rect.top + scrollY + (rect.height / 2);
      left = rect.left + scrollX - popupWidth - gap;
    } else if (isMobile) {
      // Mobile fallback: center at top of viewport
      position = 'center';
      top = window.scrollY + 12;
      left = window.innerWidth / 2;
    } else {
      position = 'bottom';
      top = rect.bottom + scrollY + gap;
      left = Math.max(popupWidth / 2 + 20, Math.min(rect.left + scrollX + rect.width / 2, window.innerWidth - popupWidth / 2 - 20));
    }

    setPopupPosition({ top, left, position });
  }, []);

  const highlightElement = useCallback((stepIndex: number) => {
    if (stepIndex >= steps.length) {
      completeTour();
      return;
    }

    const step = steps[stepIndex];
    let element: HTMLElement | null = null;

    // For sections, find the first visible one
    if (step.target === '.plan-content-section') {
      const sections = document.querySelectorAll(step.target) as NodeListOf<HTMLElement>;
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          element = sections[i];
          break;
        }
      }
      if (!element && sections.length > 0) {
        element = sections[0];
      }
    } else {
      element = document.querySelector(step.target) as HTMLElement;
    }

    if (!element) {
      console.warn(`Tour element not found: ${step.target}`);
      setHighlightedElement(null);
      setSpotlightRect(null);
      setPopupPosition({
        top: window.scrollY + window.innerHeight / 2,
        left: window.innerWidth / 2,
        position: 'center',
      });
      setStepKey(k => k + 1);
      return;
    }

    cleanupElement();
    prevElementRef.current = element;

    setHighlightedElement(element);
    const isMobile = window.innerWidth < 640;
    element.scrollIntoView({ behavior: 'smooth', block: isMobile ? 'nearest' : 'center' });

    setTimeout(() => {
      const computedPos = window.getComputedStyle(element!).position;
      if (computedPos === 'static') {
        element!.style.position = 'relative';
      }
      element!.style.zIndex = '9998';
      element!.classList.add('tour-spotlight-target');

      updateSpotlight(element!);
      calculatePosition(element!);
      setStepKey(k => k + 1);
    }, 350);
  }, [steps, cleanupElement, completeTour, updateSpotlight, calculatePosition]);

  const startTour = useCallback(() => {
    localStorage.removeItem('planViewTourCompleted');
    setCurrentStep(0);
    setIsVisible(true);
    setIsAnimatingIn(true);
    setTimeout(() => highlightElement(0), 100);
  }, [highlightElement]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('planViewTourCompleted');
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
    (window as any).startPlanViewTour = startTour;
    return () => { delete (window as any).startPlanViewTour; };
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

  if (!isVisible) return null;
  if (currentStep >= steps.length) {
    completeTour();
    return null;
  }

  const step = steps[currentStep];
  const Icon = step.icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const maxPopupWidth = isMobile ? Math.min(340, window.innerWidth - 24) : 420;

  const safeTop = popupPosition.position === 'center'
    ? popupPosition.top
    : Math.max(12, Math.min(popupPosition.top, window.innerHeight + window.scrollY - 200));
  const safeLeft = popupPosition.position === 'center'
    ? popupPosition.left
    : isMobile
      ? Math.max(12, Math.min(popupPosition.left, window.innerWidth - maxPopupWidth / 2 - 12))
      : Math.max(16, Math.min(popupPosition.left, window.innerWidth - maxPopupWidth / 2 - 16));

  const getTransform = () => {
    if (popupPosition.position === 'center') return 'translateX(-50%)';
    if (popupPosition.position === 'right' || popupPosition.position === 'left') return 'translateY(-50%)';
    if (popupPosition.position === 'top' || popupPosition.position === 'bottom') return 'translateX(-50%)';
    return 'none';
  };

  // Arrow rendering — only for non-center, non-mobile
  const renderArrow = () => {
    if (popupPosition.position === 'center' || !highlightedElement) return null;
    const p = popupPosition.position;
    const arrowSize = isMobile ? 10 : 12;
    const cardBg = theme === 'dark' ? '#1c1c1e' : '#ffffff';
    const base: React.CSSProperties = { position: 'absolute', width: 0, height: 0, zIndex: 10 };

    if (p === 'bottom') return (
      <div style={{ ...base, top: -arrowSize + 1, left: '50%', transform: 'translateX(-50%)',
        borderLeft: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid ${cardBg}`,
        filter: 'drop-shadow(0 -2px 3px rgba(0,0,0,0.05))',
      }} />
    );
    if (p === 'top') return (
      <div style={{ ...base, bottom: -arrowSize + 1, left: '50%', transform: 'translateX(-50%)',
        borderLeft: `${arrowSize}px solid transparent`, borderRight: `${arrowSize}px solid transparent`,
        borderTop: `${arrowSize}px solid ${cardBg}`,
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.05))',
      }} />
    );
    if (p === 'right') return (
      <div style={{ ...base, left: -arrowSize + 1, top: '50%', transform: 'translateY(-50%)',
        borderTop: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid ${cardBg}`,
        filter: 'drop-shadow(-2px 0 3px rgba(0,0,0,0.05))',
      }} />
    );
    if (p === 'left') return (
      <div style={{ ...base, right: -arrowSize + 1, top: '50%', transform: 'translateY(-50%)',
        borderTop: `${arrowSize}px solid transparent`, borderBottom: `${arrowSize}px solid transparent`,
        borderLeft: `${arrowSize}px solid ${cardBg}`,
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
          top: isMobile && popupPosition.position === 'center' ? `${safeTop}px` : `${safeTop}px`,
          left: isMobile && popupPosition.position !== 'center' ? '12px' : `${safeLeft}px`,
          right: isMobile && popupPosition.position !== 'center' ? '12px' : 'auto',
          transform: isMobile && popupPosition.position !== 'center' ? 'none' : getTransform(),
          maxWidth: `${maxPopupWidth}px`,
          width: isMobile ? 'calc(100vw - 24px)' : '92%',
          minWidth: isMobile ? '280px' : '320px',
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
          <div className={isMobile ? 'p-5' : 'p-6'}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                {/* Icon with gradient background */}
                <div
                  className={cn(
                    "relative rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg",
                    isMobile ? "w-10 h-10" : "w-12 h-12"
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_ORANGE} 0%, #F59E0B 100%)`,
                  }}
                >
                  <Icon className="text-white" size={isMobile ? 18 : 22} strokeWidth={2.5} />
                  <div className="absolute inset-0 rounded-2xl bg-white/10" />
                </div>
                <div className="pt-0.5">
                  <h3 className={cn(
                    "font-bold text-foreground leading-tight tracking-tight",
                    isMobile ? "text-base" : "text-lg"
                  )}>
                    {step.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-semibold text-momentum-orange">
                      {language === 'fr' ? 'Étape' : 'Step'} {currentStep + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {language === 'fr' ? 'sur' : 'of'} {steps.length}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={completeTour}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-xl flex-shrink-0 -mt-1 -mr-1"
                aria-label="Close tour"
              >
                <X size={isMobile ? 16 : 18} />
              </button>
            </div>

            {/* Description */}
            <p className={cn(
              "text-muted-foreground leading-relaxed mb-5 pl-0.5",
              isMobile ? "text-xs" : "text-sm"
            )}>
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
                      i <= currentStep ? "bg-momentum-orange" : "bg-muted"
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
                {language === 'fr' ? 'Passer' : 'Skip Tour'}
              </button>
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <button
                    onClick={prevStep}
                    className={cn(
                      "flex items-center gap-1.5 font-medium rounded-xl transition-all",
                      "text-foreground bg-muted hover:bg-muted/80 border border-border/50",
                      isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
                    )}
                  >
                    <ArrowLeft size={isMobile ? 13 : 15} />
                    <span>{language === 'fr' ? 'Retour' : 'Back'}</span>
                  </button>
                )}
                <button
                  onClick={isLastStep ? completeTour : nextStep}
                  className={cn(
                    "flex items-center gap-1.5 text-white rounded-xl font-semibold transition-all",
                    "hover:brightness-110 active:scale-[0.97]",
                    "shadow-lg shadow-momentum-orange/25",
                    isMobile ? "px-4 py-2 text-xs" : "px-5 py-2 text-sm"
                  )}
                  style={{ backgroundColor: BRAND_ORANGE }}
                >
                  {isLastStep ? (
                    <>
                      <Check size={isMobile ? 13 : 15} strokeWidth={2.5} />
                      <span>{language === 'fr' ? 'Commencer' : 'Get Started'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'fr' ? 'Suivant' : 'Next'}</span>
                      <ArrowRight size={isMobile ? 13 : 15} strokeWidth={2.5} />
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
