import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, FileText, Download, Share2, BookOpen, Eye, Pencil } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: any;
}

interface PlanViewTourProps {
  onStartTour?: () => void;
}

export default function PlanViewTour({ onStartTour }: PlanViewTourProps = {}) {
  const { t, theme, language } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, position: 'right' as 'top' | 'bottom' | 'left' | 'right' | 'center' });

  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const strategyBlue = '#1A2B47';

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: language === 'fr' ? 'Bienvenue dans votre plan d\'affaires' : 'Welcome to your Business Plan',
      description: language === 'fr' 
        ? 'Cette page vous permet de visualiser, modifier et exporter votre plan d\'affaires. Commençons par explorer les fonctionnalités principales.'
        : 'This page allows you to view, edit, and export your business plan. Let\'s explore the main features.',
      target: '.plan-view-header',
      position: 'bottom',
      icon: Sparkles,
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

  const startTour = () => {
    console.log('Starting plan view tour...');
    localStorage.removeItem('planViewTourCompleted');
    setCurrentStep(0);
    setIsVisible(true);
    setTimeout(() => {
      highlightElement(0);
    }, 100);
  };

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('planViewTourCompleted');
    if (!hasSeenTour) {
      // Wait for page to load and elements to be available
      const checkElements = () => {
        const firstElement = document.querySelector(steps[0].target);
        if (firstElement) {
          setIsVisible(true);
          highlightElement(0);
        } else {
          // Retry after a short delay if elements aren't ready
          setTimeout(checkElements, 200);
        }
      };
      
      setTimeout(checkElements, 1000);
    }
  }, []);

  // Expose startTour function globally for easy access
  useEffect(() => {
    (window as any).startPlanViewTour = startTour;
    return () => {
      delete (window as any).startPlanViewTour;
    };
  }, []);

  const highlightElement = (stepIndex: number) => {
    if (stepIndex >= steps.length) {
      completeTour();
      return;
    }

    const step = steps[stepIndex];
    let element: HTMLElement | null = null;
    
    // For sections, find the first visible one
    if (step.target === '.plan-content-section') {
      const sections = document.querySelectorAll(step.target) as NodeListOf<HTMLElement>;
      // Find the first visible section
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          element = sections[i];
          break;
        }
      }
      // If no visible section found, use the first one anyway
      if (!element && sections.length > 0) {
        element = sections[0];
      }
    } else {
      element = document.querySelector(step.target) as HTMLElement;
    }
    
    if (!element) {
      console.warn(`Tour element not found: ${step.target}`);
      // If element not found, still show the tour popup but don't highlight
      // This ensures the next button is always available
      setHighlightedElement(null);
      // Position popup in center of screen
      setPopupPosition({ 
        top: window.innerHeight / 2, 
        left: window.innerWidth / 2, 
        position: 'center' 
      });
      return;
    }
    
    setHighlightedElement(element);
    // On mobile, use 'nearest' to avoid excessive scrolling
    const isMobile = window.innerWidth < 640;
    element.scrollIntoView({ behavior: 'smooth', block: isMobile ? 'nearest' : 'center' });
    
    // Calculate popup position relative to element
    setTimeout(() => {
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Determine best position
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;
      const spaceBottom = window.innerHeight - rect.bottom;
      const spaceTop = rect.top;
      const popupWidth = isMobile ? Math.min(340, window.innerWidth - 20) : 500;
      const popupHeight = isMobile ? 250 : 300;
      const gap = isMobile ? 10 : 20;
      
      let position: 'top' | 'bottom' | 'left' | 'right' = 'right';
      let top = 0;
      let left = 0;
      
      if (spaceRight >= popupWidth + gap) {
        position = 'right';
        top = rect.top + scrollY + (rect.height / 2);
        left = rect.right + scrollX + gap;
      } else if (spaceLeft >= popupWidth + gap) {
        position = 'left';
        top = rect.top + scrollY + (rect.height / 2);
        left = rect.left + scrollX - popupWidth - gap;
      } else if (spaceBottom >= popupHeight + gap) {
        position = 'bottom';
        top = rect.bottom + scrollY + gap;
        left = rect.left + scrollX + (rect.width / 2);
      } else if (spaceTop >= popupHeight + gap) {
        position = 'top';
        top = rect.top + scrollY - popupHeight - gap;
        left = rect.left + scrollX + (rect.width / 2);
      } else {
        // On mobile, prefer center position to avoid overflow
        if (isMobile) {
          position = 'center';
          top = window.innerHeight / 2;
          left = window.innerWidth / 2;
        } else {
          position = 'right';
          top = Math.max(20, Math.min(rect.top + scrollY + (rect.height / 2), window.innerHeight + scrollY - popupHeight - 20));
          left = rect.right + scrollX + gap;
        }
      }
      
      setPopupPosition({ top, left, position });
    }, 300);
    
    // Add highlight class
    element.classList.add('tour-highlight');
  };

  const removeHighlight = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
      setHighlightedElement(null);
    }
  };

  const nextStep = () => {
    removeHighlight();
    const nextIndex = currentStep + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(nextIndex);
      highlightElement(nextIndex);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    removeHighlight();
    const prevIndex = currentStep - 1;
    if (prevIndex >= 0) {
      setCurrentStep(prevIndex);
      highlightElement(prevIndex);
    }
  };

  const completeTour = () => {
    removeHighlight();
    setIsVisible(false);
    localStorage.setItem('planViewTourCompleted', 'true');
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isVisible) {
    return null;
  }

  // Ensure we don't go beyond steps
  if (currentStep >= steps.length) {
    completeTour();
    return null;
  }

  const step = steps[currentStep];
  const Icon = step.icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Ensure popup is visible with minimum position values - mobile-first approach
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640; // sm breakpoint
  const maxPopupWidth = isMobile 
    ? Math.min(340, window.innerWidth - 20) // Smaller on mobile with minimal padding
    : Math.min(500, window.innerWidth - 40); // Account for padding on desktop
  const safeTop = popupPosition.position === 'center' 
    ? window.innerHeight / 2 
    : Math.max(10, Math.min(popupPosition.top, window.innerHeight - 200)); // Ensure it fits on screen
  const safeLeft = popupPosition.position === 'center'
    ? window.innerWidth / 2
    : isMobile
    ? Math.max(10, Math.min(popupPosition.left, window.innerWidth - maxPopupWidth - 10)) // Mobile: minimal padding
    : Math.max(20, Math.min(popupPosition.left, window.innerWidth - maxPopupWidth - 20)); // Desktop: more padding

  const getTransform = () => {
    if (popupPosition.position === 'center') {
      return 'translate(-50%, -50%)';
    }
    if (popupPosition.position === 'right' || popupPosition.position === 'left') {
      return 'translateY(-50%)';
    }
    if (popupPosition.position === 'top' || popupPosition.position === 'bottom') {
      return 'translateX(-50%)';
    }
    return 'none';
  };

  return (
    <>
      {/* Tour Card */}
      <div 
        className="fixed z-[9999] transition-all duration-300"
        style={{
          top: isMobile && popupPosition.position !== 'center' ? '10px' : `${safeTop}px`,
          left: isMobile && popupPosition.position !== 'center' ? '10px' : `${safeLeft}px`,
          right: isMobile && popupPosition.position !== 'center' ? '10px' : 'auto',
          transform: isMobile && popupPosition.position !== 'center' ? 'none' : getTransform(),
          maxWidth: `${maxPopupWidth}px`,
          width: isMobile ? 'calc(100vw - 20px)' : 'calc(100vw - 40px)',
          minWidth: isMobile ? '280px' : '320px',
          maxHeight: isMobile ? 'calc(100vh - 20px)' : 'auto',
          overflowY: 'auto',
        }}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 overflow-hidden relative"
          style={{ borderColor: momentumOrange }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow pointer - only show if not centered */}
          {popupPosition.position === 'right' && highlightedElement && (
            <div 
              className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2"
              style={{
                width: 0,
                height: 0,
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderRight: `12px solid ${momentumOrange}`,
              }}
            />
          )}
          {popupPosition.position === 'left' && highlightedElement && (
            <div 
              className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2"
              style={{
                width: 0,
                height: 0,
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderLeft: `12px solid ${momentumOrange}`,
              }}
            />
          )}
          {popupPosition.position === 'bottom' && highlightedElement && (
            <div 
              className="absolute top-0 left-1/2 transform -translate-y-full -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderBottom: `12px solid ${momentumOrange}`,
              }}
            />
          )}
          {popupPosition.position === 'top' && highlightedElement && (
            <div 
              className="absolute bottom-0 left-1/2 transform translate-y-full -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: `12px solid ${momentumOrange}`,
              }}
            />
          )}
          {/* Header */}
          <div className="p-4 sm:p-6 border-b-2" style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
            <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: momentumOrange }}
                >
                  <Icon className="text-white" size={isMobile ? 20 : 24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold dark:text-white break-words" style={{ color: theme === 'dark' ? undefined : strategyBlue }}>
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'fr' ? 'Étape' : 'Step'} {currentStep + 1} {language === 'fr' ? 'sur' : 'of'} {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={skipTour}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex-shrink-0"
              >
                <X size={isMobile ? 18 : 20} />
              </button>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed break-words">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="p-6 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={skipTour}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
            >
              {language === 'fr' ? 'Passer' : 'Skip'}
            </button>
            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                >
                  <ArrowLeft size={18} />
                  <span>{language === 'fr' ? 'Précédent' : 'Previous'}</span>
                </button>
              )}
              <button
                onClick={isLastStep ? completeTour : nextStep}
                className="flex items-center gap-2 px-6 py-2 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: momentumOrange }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
              >
                <span>{isLastStep ? (language === 'fr' ? 'Terminer' : 'Finish') : (language === 'fr' ? 'Suivant' : 'Next')}</span>
                {!isLastStep && <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for highlighting */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 45 !important;
          outline: 3px solid ${momentumOrange} !important;
          outline-offset: 4px !important;
          border-radius: 8px !important;
          box-shadow: 0 0 20px ${momentumOrange} !important;
          animation: pulse-highlight 2s ease-in-out infinite;
        }
        
        @keyframes pulse-highlight {
          0%, 100% {
            outline-width: 3px;
            box-shadow: 0 0 20px ${momentumOrange};
          }
          50% {
            outline-width: 4px;
            box-shadow: 0 0 30px ${momentumOrange};
          }
        }
      `}</style>
    </>
  );
}
