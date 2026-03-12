import { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Mail,
  Volume2,
  VolumeX,
  Save,
  FileCheck,
  Share2,
  UserPlus,
  AlertTriangle,
  Megaphone,
  Download,
  Bot,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { notificationService } from '../lib/notification-service';
import type { NotificationPreference, NotificationType, NotificationFrequency } from '../lib/notification-types';

interface TypeConfig {
  type: NotificationType;
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
  icon: LucideIcon;
  color: string;
}

const TYPE_CONFIGS: TypeConfig[] = [
  {
    type: 'BusinessPlanGenerated',
    labelFr: "Plan d'affaires généré",
    labelEn: 'Business Plan Generated',
    descFr: 'Quand la génération de votre plan est terminée',
    descEn: 'When your plan generation is complete',
    icon: FileCheck,
    color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  },
  {
    type: 'BusinessPlanShared',
    labelFr: "Plan d'affaires partagé",
    labelEn: 'Business Plan Shared',
    descFr: 'Quand quelqu\'un partage un plan avec vous',
    descEn: 'When someone shares a plan with you',
    icon: Share2,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    type: 'OrganizationInvitation',
    labelFr: "Invitation d'organisation",
    labelEn: 'Organization Invitation',
    descFr: 'Invitations à rejoindre une organisation',
    descEn: 'Invitations to join an organization',
    icon: UserPlus,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  },
  {
    type: 'SubscriptionExpiring',
    labelFr: 'Expiration d\'abonnement',
    labelEn: 'Subscription Expiring',
    descFr: 'Rappels avant l\'expiration de votre abonnement',
    descEn: 'Reminders before your subscription expires',
    icon: AlertTriangle,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  },
  {
    type: 'SystemAnnouncement',
    labelFr: 'Annonce système',
    labelEn: 'System Announcement',
    descFr: 'Annonces et mises à jour de la plateforme',
    descEn: 'Platform announcements and updates',
    icon: Megaphone,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    type: 'ExportCompleted',
    labelFr: 'Export terminé',
    labelEn: 'Export Completed',
    descFr: 'Quand un export de document est prêt',
    descEn: 'When a document export is ready',
    icon: Download,
    color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
  },
  {
    type: 'AICoachReply',
    labelFr: 'Réponse du coach IA',
    labelEn: 'AI Coach Reply',
    descFr: 'Messages du coach IA',
    descEn: 'Messages from the AI Coach',
    icon: Bot,
    color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
    type: 'CommentAdded',
    labelFr: 'Commentaire ajouté',
    labelEn: 'Comment Added',
    descFr: 'Quand quelqu\'un commente votre plan',
    descEn: 'When someone comments on your plan',
    icon: MessageSquare,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  },
];

const FREQUENCY_OPTIONS: { value: NotificationFrequency; labelFr: string; labelEn: string }[] = [
  { value: 'Instant', labelFr: 'Instant', labelEn: 'Instant' },
  { value: 'DailyDigest', labelFr: 'Résumé quotidien', labelEn: 'Daily Digest' },
  { value: 'WeeklyDigest', labelFr: 'Résumé hebdomadaire', labelEn: 'Weekly Digest' },
  { value: 'Disabled', labelFr: 'Désactivé', labelEn: 'Disabled' },
];

export default function NotificationPreferencesPage() {
  const { language } = useTheme();
  const toast = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const prefs = await notificationService.getPreferences();
        setPreferences(prefs);
      } catch {
        toast.error(
          language === 'fr' ? 'Erreur de chargement' : 'Failed to load',
          language === 'fr' ? 'Impossible de charger les préférences' : 'Could not load preferences',
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPreference = (type: NotificationType): NotificationPreference | undefined => {
    return preferences.find(p => p.notificationType === type);
  };

  const updatePref = (type: NotificationType, field: string, value: boolean | string) => {
    setPreferences(prev =>
      prev.map(p => {
        if (p.notificationType !== type) return p;
        return { ...p, [field]: value };
      }),
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await notificationService.updatePreferences(
        preferences.map(p => ({
          notificationType: p.notificationType,
          inAppEnabled: p.inAppEnabled,
          emailEnabled: p.emailEnabled,
          emailFrequency: p.emailFrequency,
          soundEnabled: p.soundEnabled,
        })),
      );
      setHasChanges(false);
      toast.success(
        language === 'fr' ? 'Préférences sauvegardées' : 'Preferences saved',
      );
    } catch {
      toast.error(
        language === 'fr' ? 'Erreur' : 'Error',
        language === 'fr' ? 'Impossible de sauvegarder' : 'Could not save preferences',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'fr' ? 'Préférences de notification' : 'Notification Preferences'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {language === 'fr'
                ? 'Personnalisez vos alertes par type de notification'
                : 'Customize your alerts per notification type'}
            </p>
          </div>
        </div>

        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving
              ? (language === 'fr' ? 'Enregistrement...' : 'Saving...')
              : (language === 'fr' ? 'Enregistrer' : 'Save')}
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5" />
          {language === 'fr' ? 'Dans l\'application' : 'In-app'}
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5" />
          {language === 'fr' ? 'Courriel' : 'Email'}
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="h-3.5 w-3.5" />
          {language === 'fr' ? 'Son' : 'Sound'}
        </div>
      </div>

      {/* Preferences grid */}
      <div className="space-y-3">
        {TYPE_CONFIGS.map(config => {
          const pref = getPreference(config.type);
          if (!pref) return null;

          const Icon = config.icon;

          return (
            <div
              key={config.type}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0', config.color)}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {language === 'fr' ? config.labelFr : config.labelEn}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {language === 'fr' ? config.descFr : config.descEn}
                  </p>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-4 shrink-0">
                  {/* In-App toggle */}
                  <button
                    onClick={() => updatePref(config.type, 'inAppEnabled', !pref.inAppEnabled)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      pref.inAppEnabled
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400',
                    )}
                    title={language === 'fr' ? 'Dans l\'application' : 'In-app'}
                  >
                    {pref.inAppEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                  </button>

                  {/* Email toggle */}
                  <button
                    onClick={() => updatePref(config.type, 'emailEnabled', !pref.emailEnabled)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      pref.emailEnabled
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400',
                    )}
                    title={language === 'fr' ? 'Courriel' : 'Email'}
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </button>

                  {/* Sound toggle */}
                  <button
                    onClick={() => updatePref(config.type, 'soundEnabled', !pref.soundEnabled)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      pref.soundEnabled
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400',
                    )}
                    title={language === 'fr' ? 'Son' : 'Sound'}
                  >
                    {pref.soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  </button>

                  {/* Email frequency (only if email enabled) */}
                  {pref.emailEnabled && (
                    <select
                      value={pref.emailFrequency}
                      onChange={e => updatePref(config.type, 'emailFrequency', e.target.value)}
                      className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300"
                    >
                      {FREQUENCY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {language === 'fr' ? opt.labelFr : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
