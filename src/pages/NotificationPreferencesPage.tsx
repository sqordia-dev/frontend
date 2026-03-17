import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ArrowLeft,
  Settings2,
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
    labelFr: "Plan d'affaires genere",
    labelEn: 'Business Plan Generated',
    descFr: 'Quand la generation de votre plan est terminee',
    descEn: 'When your plan generation is complete',
    icon: FileCheck,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
  },
  {
    type: 'BusinessPlanShared',
    labelFr: "Plan d'affaires partage",
    labelEn: 'Business Plan Shared',
    descFr: "Quand quelqu'un partage un plan avec vous",
    descEn: 'When someone shares a plan with you',
    icon: Share2,
    color: 'text-strategy-blue bg-strategy-blue/10 dark:bg-strategy-blue/20 dark:text-blue-300',
  },
  {
    type: 'OrganizationInvitation',
    labelFr: "Invitation d'organisation",
    labelEn: 'Organization Invitation',
    descFr: 'Invitations a rejoindre une organisation',
    descEn: 'Invitations to join an organization',
    icon: UserPlus,
    color: 'text-momentum-orange bg-momentum-orange/10 dark:bg-momentum-orange/20 dark:text-momentum-orange',
  },
  {
    type: 'SubscriptionExpiring',
    labelFr: "Expiration d'abonnement",
    labelEn: 'Subscription Expiring',
    descFr: "Rappels avant l'expiration de votre abonnement",
    descEn: 'Reminders before your subscription expires',
    icon: AlertTriangle,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  },
  {
    type: 'SystemAnnouncement',
    labelFr: 'Annonce systeme',
    labelEn: 'System Announcement',
    descFr: 'Annonces et mises a jour de la plateforme',
    descEn: 'Platform announcements and updates',
    icon: Megaphone,
    color: 'text-strategy-blue bg-strategy-blue/10 dark:bg-strategy-blue/20 dark:text-blue-300',
  },
  {
    type: 'ExportCompleted',
    labelFr: 'Export termine',
    labelEn: 'Export Completed',
    descFr: "Quand un export de document est pret",
    descEn: 'When a document export is ready',
    icon: Download,
    color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400',
  },
  {
    type: 'AICoachReply',
    labelFr: 'Reponse du coach IA',
    labelEn: 'AI Coach Reply',
    descFr: 'Messages du coach IA',
    descEn: 'Messages from the AI Coach',
    icon: Bot,
    color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400',
  },
  {
    type: 'CommentAdded',
    labelFr: 'Commentaire ajoute',
    labelEn: 'Comment Added',
    descFr: "Quand quelqu'un commente votre plan",
    descEn: 'When someone comments on your plan',
    icon: MessageSquare,
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
  },
];

const FREQUENCY_OPTIONS: { value: NotificationFrequency; labelFr: string; labelEn: string }[] = [
  { value: 'Instant', labelFr: 'Instant', labelEn: 'Instant' },
  { value: 'DailyDigest', labelFr: 'Resume quotidien', labelEn: 'Daily Digest' },
  { value: 'WeeklyDigest', labelFr: 'Resume hebdomadaire', labelEn: 'Weekly Digest' },
  { value: 'Disabled', labelFr: 'Desactive', labelEn: 'Disabled' },
];

interface NotificationPreferencesPageProps {
  embedded?: boolean;
}

export default function NotificationPreferencesPage({ embedded = false }: NotificationPreferencesPageProps) {
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
          language === 'fr' ? 'Impossible de charger les preferences' : 'Could not load preferences',
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
        language === 'fr' ? 'Preferences sauvegardees' : 'Preferences saved',
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
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-8 w-8 border-2 border-muted border-t-momentum-orange rounded-full animate-spin" />
        <p className="text-label-sm text-muted-foreground mt-4">
          {language === 'fr' ? 'Chargement...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'max-w-4xl mx-auto px-4 sm:px-0'}>
      {/* Back link - standalone only */}
      {!embedded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link
            to="/notifications"
            className="inline-flex items-center gap-1.5 text-label-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {language === 'fr' ? 'Retour aux notifications' : 'Back to notifications'}
          </Link>
        </motion.div>
      )}

      {/* Header - standalone only */}
      {!embedded && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-strategy-blue text-white shadow-lg shadow-strategy-blue/20">
              <Settings2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-display-sm font-heading text-foreground tracking-tight">
                {language === 'fr' ? 'Preferences' : 'Preferences'}
              </h1>
              <p className="text-body-sm text-muted-foreground mt-0.5">
                {language === 'fr'
                  ? 'Personnalisez vos alertes par type de notification'
                  : 'Customize your alerts per notification type'}
              </p>
            </div>
          </div>

          {hasChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 text-label-sm font-medium text-white bg-momentum-orange hover:bg-[#E56000] rounded-xl shadow-lg shadow-momentum-orange/20 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving
                ? (language === 'fr' ? 'Enregistrement...' : 'Saving...')
                : (language === 'fr' ? 'Enregistrer' : 'Save changes')}
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Save button - embedded mode */}
      {embedded && hasChanges && (
        <div className="flex justify-end mb-6">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 text-label-sm font-medium text-white bg-momentum-orange hover:bg-[#E56000] rounded-xl shadow-lg shadow-momentum-orange/20 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving
              ? (language === 'fr' ? 'Enregistrement...' : 'Saving...')
              : (language === 'fr' ? 'Enregistrer' : 'Save changes')}
          </motion.button>
        </div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex items-center gap-6 mb-6 px-4 py-3 bg-muted/50 rounded-xl text-label-sm text-muted-foreground border border-border/50"
      >
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5" />
          {language === 'fr' ? "Dans l'application" : 'In-app'}
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5" />
          {language === 'fr' ? 'Courriel' : 'Email'}
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="h-3.5 w-3.5" />
          {language === 'fr' ? 'Son' : 'Sound'}
        </div>
      </motion.div>

      {/* Preferences grid */}
      <div className="space-y-3">
        {TYPE_CONFIGS.map((config, idx) => {
          const pref = getPreference(config.type);
          if (!pref) return null;

          const Icon = config.icon;

          return (
            <motion.div
              key={config.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 + idx * 0.04 }}
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-card transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0', config.color)}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-heading-sm font-heading text-foreground">
                    {language === 'fr' ? config.labelFr : config.labelEn}
                  </h3>
                  <p className="text-body-xs text-muted-foreground mt-0.5">
                    {language === 'fr' ? config.descFr : config.descEn}
                  </p>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {/* In-App toggle */}
                  <button
                    onClick={() => updatePref(config.type, 'inAppEnabled', !pref.inAppEnabled)}
                    className={cn(
                      'flex items-center justify-center h-9 w-9 rounded-lg transition-all',
                      pref.inAppEnabled
                        ? 'bg-momentum-orange/15 dark:bg-momentum-orange/20 text-momentum-orange shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground',
                    )}
                    title={language === 'fr' ? "Dans l'application" : 'In-app'}
                  >
                    {pref.inAppEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </button>

                  {/* Email toggle */}
                  <button
                    onClick={() => updatePref(config.type, 'emailEnabled', !pref.emailEnabled)}
                    className={cn(
                      'flex items-center justify-center h-9 w-9 rounded-lg transition-all',
                      pref.emailEnabled
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground',
                    )}
                    title={language === 'fr' ? 'Courriel' : 'Email'}
                  >
                    <Mail className="h-4 w-4" />
                  </button>

                  {/* Sound toggle */}
                  <button
                    onClick={() => updatePref(config.type, 'soundEnabled', !pref.soundEnabled)}
                    className={cn(
                      'flex items-center justify-center h-9 w-9 rounded-lg transition-all',
                      pref.soundEnabled
                        ? 'bg-momentum-orange/15 dark:bg-momentum-orange/20 text-momentum-orange shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground',
                    )}
                    title={language === 'fr' ? 'Son' : 'Sound'}
                  >
                    {pref.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>

                  {/* Email frequency (only if email enabled) */}
                  {pref.emailEnabled && (
                    <select
                      value={pref.emailFrequency}
                      onChange={e => updatePref(config.type, 'emailFrequency', e.target.value)}
                      className="text-label-sm bg-card border border-border rounded-lg px-2.5 py-2 text-foreground focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange/40 transition-all"
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
