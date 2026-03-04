import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  const { language } = useTheme();
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';

  const content = {
    en: {
      title: 'Page Not Found',
      heading: 'Oops! Page not found',
      description: "The page you're looking for doesn't exist or has been moved.",
      goHome: 'Go Home',
      goBack: 'Go Back',
      searchHint: 'Try searching or navigate using the links below.',
    },
    fr: {
      title: 'Page non trouvée',
      heading: 'Oups! Page non trouvée',
      description: "La page que vous recherchez n'existe pas ou a été déplacée.",
      goHome: 'Accueil',
      goBack: 'Retour',
      searchHint: 'Essayez de chercher ou naviguez avec les liens ci-dessous.',
    },
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <SEO
        title={`404 - ${t.title} | Sqordia`}
        description={t.description}
      />

      {/* Simple header */}
      <header className="py-6 px-6 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: momentumOrange }}
          >
            S
          </div>
          <span className="text-xl font-bold" style={{ color: strategyBlue }}>
            Sqordia
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg">
          {/* 404 illustration */}
          <div className="mb-8 relative">
            <span
              className="text-[180px] font-bold leading-none select-none"
              style={{ color: `${momentumOrange}15` }}
            >
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search
                size={64}
                className="text-gray-400 dark:text-gray-600"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Heading */}
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: strategyBlue }}
          >
            {t.heading}
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            {t.description}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: momentumOrange }}
            >
              <Home size={20} />
              {t.goHome}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ borderColor: strategyBlue, color: strategyBlue }}
            >
              <ArrowLeft size={20} />
              {t.goBack}
            </button>
          </div>

          {/* Quick links */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              {t.searchHint}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-400 hover:underline"
              >
                {language === 'fr' ? 'Connexion' : 'Login'}
              </Link>
              <Link
                to="/signup"
                className="text-gray-600 dark:text-gray-400 hover:underline"
              >
                {language === 'fr' ? 'Inscription' : 'Sign Up'}
              </Link>
              <Link
                to="/subscription-plans"
                className="text-gray-600 dark:text-gray-400 hover:underline"
              >
                {language === 'fr' ? 'Tarifs' : 'Pricing'}
              </Link>
              <Link
                to="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:underline"
              >
                {language === 'fr' ? 'Confidentialité' : 'Privacy'}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="py-6 px-6 text-center text-sm text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800">
        &copy; {new Date().getFullYear()} Sqordia. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
      </footer>
    </div>
  );
}
