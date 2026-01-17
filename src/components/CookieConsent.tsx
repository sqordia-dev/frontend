import { useState, useEffect } from 'react';
import { X, Cookie, Settings, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieConsent() {
  const { language } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Load saved preferences
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...preferences, ...parsed });
      } catch (e) {
        console.error('Error parsing cookie preferences:', e);
      }
    }

    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Small delay for smooth entrance animation
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    // Accept all cookies
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleDecline = () => {
    // Decline all except essential
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    localStorage.setItem('cookiePreferences', JSON.stringify(onlyEssential));
    setPreferences(onlyEssential);
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleSettingsOpen = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', 'custom');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setShowSettings(false);
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible && !showSettings) return null;

  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';

  return (
    <>
    {isVisible && (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-500 ease-out safe-bottom ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      style={{ pointerEvents: 'auto', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-xl">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Cookie Icon */}
              <div className="flex-shrink-0">
                <div 
                  className="p-3.5 rounded-xl shadow-sm"
                  style={{ backgroundColor: '#FFF4E6' }}
                >
                  <Cookie size={26} style={{ color: momentumOrange }} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {language === 'fr' ? 'Nous utilisons des cookies' : 'We use cookies'}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      {language === 'fr' 
                        ? 'Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic du site et personnaliser le contenu. En continuant, vous acceptez notre utilisation des cookies.'
                        : 'We use cookies to enhance your experience, analyze site traffic, and personalize content. By continuing, you accept our use of cookies.'}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    aria-label={language === 'fr' ? 'Fermer' : 'Close'}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5">
                  <button
                    onClick={handleAccept}
                    className="flex-1 sm:flex-none px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
                    style={{ backgroundColor: momentumOrange }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
                    aria-label={language === 'fr' ? 'Accepter tous les cookies' : 'Accept all cookies'}
                  >
                    {language === 'fr' ? 'Accepter tout' : 'Accept All'}
                  </button>
                  <button
                    onClick={handleDecline}
                    className="flex-1 sm:flex-none px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-600 min-h-[44px]"
                    aria-label={language === 'fr' ? 'Refuser les cookies' : 'Decline cookies'}
                  >
                    {language === 'fr' ? 'Refuser' : 'Decline'}
                  </button>
                  <button
                    onClick={handleSettingsOpen}
                    className="flex-1 sm:flex-none px-6 py-3 bg-transparent text-gray-600 dark:text-gray-400 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    aria-label={language === 'fr' ? 'Paramètres de cookies' : 'Cookie settings'}
                  >
                    <Settings size={16} />
                    <span>{language === 'fr' ? 'Paramètres' : 'Settings'}</span>
                  </button>
                </div>

                {/* Learn More Link */}
                <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href="/privacy"
                    className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-1.5 font-medium"
                    style={{ color: momentumOrange }}
                    onMouseEnter={(e) => e.currentTarget.style.color = momentumOrangeHover}
                    onMouseLeave={(e) => e.currentTarget.style.color = momentumOrange}
                  >
                    {language === 'fr' ? 'En savoir plus sur notre utilisation des cookies' : 'Learn more about our cookie policy'}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )}

    {/* Cookie Settings Modal */}
    {showSettings && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: '#FFF4E6' }}
              >
                <Settings size={24} style={{ color: momentumOrange }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === 'fr' ? 'Paramètres de cookies' : 'Cookie Settings'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {language === 'fr' 
                    ? 'Gérez vos préférences de cookies'
                    : 'Manage your cookie preferences'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSettingsClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {language === 'fr'
                ? 'Nous utilisons différents types de cookies pour améliorer votre expérience. Vous pouvez choisir quels types de cookies accepter.'
                : 'We use different types of cookies to enhance your experience. You can choose which types of cookies to accept.'}
            </p>

            {/* Essential Cookies */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {language === 'fr' ? 'Cookies essentiels' : 'Essential Cookies'}
                    </h4>
                    <Info size={16} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {language === 'fr'
                      ? 'Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.'
                      : 'These cookies are necessary for the website to function and cannot be disabled.'}
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.essential}
                    disabled
                    className="w-5 h-5 cursor-not-allowed opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {language === 'fr' ? 'Cookies analytiques' : 'Analytics Cookies'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {language === 'fr'
                      ? 'Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web.'
                      : 'These cookies help us understand how visitors interact with our website.'}
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {language === 'fr' ? 'Cookies marketing' : 'Marketing Cookies'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {language === 'fr'
                      ? 'Ces cookies sont utilisés pour vous montrer des publicités pertinentes et mesurer l\'efficacité des campagnes.'
                      : 'These cookies are used to show you relevant advertisements and measure campaign effectiveness.'}
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {language === 'fr' ? 'Cookies fonctionnels' : 'Functional Cookies'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {language === 'fr'
                      ? 'Ces cookies permettent au site de se souvenir de vos choix et de personnaliser votre expérience.'
                      : 'These cookies allow the website to remember your choices and personalize your experience.'}
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={() => handlePreferenceChange('functional')}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t-2 border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleSettingsClose}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex-1 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg"
              style={{ backgroundColor: momentumOrange }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
            >
              {language === 'fr' ? 'Enregistrer les préférences' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
