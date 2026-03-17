import { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Bell, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import SEO from '../components/SEO';

const PreferencesSection = lazy(() => import('../components/settings/PreferencesSection'));
const NotificationPreferencesPage = lazy(() => import('./NotificationPreferencesPage'));

const T = {
  en: {
    pageTitle: 'Settings',
    pageDesc: 'Manage your preferences and notification settings',
    back: 'Back to Dashboard',
    preferences: 'Preferences',
    preferencesDesc: 'Appearance, language and display',
    notifications: 'Notifications',
    notificationsDesc: 'Alerts, emails and sounds',
    profile: 'Profile',
    profileDesc: 'Personal info and security',
  },
  fr: {
    pageTitle: 'Parametres',
    pageDesc: 'Gerez vos preferences et parametres de notification',
    back: 'Retour au tableau de bord',
    preferences: 'Preferences',
    preferencesDesc: 'Apparence, langue et affichage',
    notifications: 'Notifications',
    notificationsDesc: 'Alertes, courriels et sons',
    profile: 'Profil',
    profileDesc: 'Infos personnelles et securite',
  },
};

type Section = 'preferences' | 'notifications';

const SECTIONS: { id: Section; icon: typeof SlidersHorizontal; tKey: 'preferences' | 'notifications' }[] = [
  { id: 'preferences', icon: SlidersHorizontal, tKey: 'preferences' },
  { id: 'notifications', icon: Bell, tKey: 'notifications' },
];

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-3 border-gray-200 dark:border-gray-700 border-t-momentum-orange rounded-full animate-spin" />
    </div>
  );
}

export default function SettingsPage() {
  const { language } = useTheme();
  const t = T[language as keyof typeof T] ?? T.en;
  const [activeSection, setActiveSection] = useState<Section>('preferences');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <SEO
        title={`${t.pageTitle} | Sqordia`}
        description={t.pageDesc}
        noindex
        nofollow
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {t.back}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-momentum-orange/10 dark:bg-momentum-orange/15 flex items-center justify-center">
            <SlidersHorizontal className="w-6 h-6 text-momentum-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.pageTitle}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.pageDesc}</p>
          </div>
        </div>

        {/* Layout: sidebar + content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-2 shadow-sm lg:sticky lg:top-8">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                      isActive
                        ? 'bg-momentum-orange/10 dark:bg-momentum-orange/15 text-momentum-orange font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white',
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t[section.tKey]}</p>
                      <p className={cn('text-xs mt-0.5', isActive ? 'text-momentum-orange/70' : 'text-gray-400 dark:text-gray-500')}>
                        {t[`${section.tKey}Desc` as keyof typeof t]}
                      </p>
                    </div>
                  </button>
                );
              })}

              {/* Link to Profile page */}
              <hr className="my-2 border-gray-200 dark:border-gray-700/50" />
              <Link
                to="/profile"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
              >
                <User className="w-5 h-5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t.profile}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t.profileDesc}</p>
                </div>
              </Link>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 p-6 sm:p-8 shadow-sm">
              <Suspense fallback={<LoadingSpinner />}>
                {activeSection === 'preferences' && <PreferencesSection />}
                {activeSection === 'notifications' && <NotificationPreferencesPage embedded />}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
