import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, Target, FileText, Zap, BarChart3, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: any;
}

interface DashboardTourProps {
  onStartTour?: () => void;
}

export default function DashboardTour({ onStartTour }: DashboardTourProps = {}) {
  const { t, theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, position: 'right' as 'top' | 'bottom' | 'left' | 'right' });

  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const strategyBlue = '#1A2B47';

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

  const startTour = () => {
    console.log('Starting dashboard tour...');
    localStorage.removeItem('dashboardTourCompleted');
    setCurrentStep(0);
    setIsVisible(true);
    setTimeout(() => {
      highlightElement(0);
    }, 100);
  };

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('dashboardTourCompleted');
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
    (window as any).startDashboardTour = startTour;
    return () => {
      delete (window as any).startDashboardTour;
    };
  }, []);

  const highlightElement = (stepIndex: number) => {
    if (stepIndex >= steps.length) return;

    const step = steps[stepIndex];
    const element = document.querySelector(step.target) as HTMLElement;
    
    if (!element) {
      console.warn(`Tour element not found: ${step.target}`);
      // Try to continue to next step if element not found
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
    
    setHighlightedElement(element);
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Calculate popup position relative to element
    setTimeout(() => {
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Determine best position (right side by default, or bottom if not enough space)
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;
      const spaceBottom = window.innerHeight - rect.bottom;
      const spaceTop = rect.top;
      const popupWidth = 500;
      const popupHeight = 300;
      const gap = 20;
      
      let position: 'top' | 'bottom' | 'left' | 'right' = 'right';
      let top = 0;
      let left = 0;
      
      if (spaceRight >= popupWidth + gap) {
        // Position to the right
        position = 'right';
        top = rect.top + scrollY + (rect.height / 2);
        left = rect.right + scrollX + gap;
      } else if (spaceLeft >= popupWidth + gap) {
        // Position to the left
        position = 'left';
        top = rect.top + scrollY + (rect.height / 2);
        left = rect.left + scrollX - popupWidth - gap;
      } else if (spaceBottom >= popupHeight + gap) {
        // Position below
        position = 'bottom';
        top = rect.bottom + scrollY + gap;
        left = rect.left + scrollX + (rect.width / 2);
      } else if (spaceTop >= popupHeight + gap) {
        // Position above
        position = 'top';
        top = rect.top + scrollY - popupHeight - gap;
        left = rect.left + scrollX + (rect.width / 2);
      } else {
        // Fallback: position to the right even if tight
        position = 'right';
        top = Math.max(20, Math.min(rect.top + scrollY + (rect.height / 2), window.innerHeight + scrollY - popupHeight - 20));
        left = rect.right + scrollX + gap;
      }
      
      setPopupPosition({ top, left, position });
    }, 300); // Wait for scroll to complete
    
    // Add highlight class
    element.classList.add('tour-highlight');
  };

  const removeHighlight = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
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
    localStorage.setItem('dashboardTourCompleted', 'true');
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isVisible || currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];
  const Icon = step.icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Ensure popup is visible with minimum position values
  const safeTop = Math.max(20, popupPosition.top);
  const safeLeft = Math.max(20, Math.min(popupPosition.left, window.innerWidth - 520));

  return (
    <>
      {/* Tour Card */}
      <div 
        className="fixed z-[9999] transition-all duration-300"
        style={{
          top: `${safeTop}px`,
          left: `${safeLeft}px`,
          transform: popupPosition.position === 'right' || popupPosition.position === 'left'
            ? 'translateY(-50%)'
            : popupPosition.position === 'top' || popupPosition.position === 'bottom'
            ? 'translateX(-50%)'
            : 'none',
          maxWidth: '500px',
          width: '90%',
          minWidth: '320px',
        }}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 overflow-hidden relative"
          style={{ borderColor: momentumOrange }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow pointer */}
          {popupPosition.position === 'right' && (
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
          {popupPosition.position === 'left' && (
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
          {popupPosition.position === 'bottom' && (
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
          {popupPosition.position === 'top' && (
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
          <div className="p-6 border-b-2" style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: momentumOrange }}
                >
                  <Icon className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white" style={{ color: theme === 'dark' ? undefined : strategyBlue }}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('dashboard.tour.step')} {currentStep + 1} {t('dashboard.tour.of')} {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={skipTour}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="p-6 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={skipTour}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
            >
              {t('dashboard.tour.skip')}
            </button>
            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                >
                  <ArrowLeft size={18} />
                  <span>{t('dashboard.tour.previous')}</span>
                </button>
              )}
              <button
                onClick={isLastStep ? completeTour : nextStep}
                className="flex items-center gap-2 px-6 py-2 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: momentumOrange }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
              >
                <span>{isLastStep ? t('dashboard.tour.finish') : t('dashboard.tour.next')}</span>
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
