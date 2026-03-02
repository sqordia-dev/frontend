/**
 * Maintenance mode status returned by the API.
 */
export interface MaintenanceStatus {
  /** Whether maintenance mode is currently enabled */
  isEnabled: boolean;
  /** Reason for the maintenance */
  reason?: string;
  /** When the maintenance started */
  startedAt?: string;
  /** Estimated end time for the maintenance */
  estimatedEnd?: string;
  /** Current deployment progress percentage (0-100) */
  progressPercent: number;
  /** Current step in the deployment process */
  currentStep?: string;
  /** Unique identifier for the deployment */
  deploymentId?: string;
  /** Type of maintenance */
  type: MaintenanceType;
  /** Whether admins can bypass maintenance mode */
  allowAdminAccess: boolean;
  /** When maintenance mode will auto-disable */
  autoDisableAt?: string;
  /** Localized content for the maintenance page */
  content: MaintenanceContent;
}

export type MaintenanceType = 'Deployment' | 'Scheduled' | 'Emergency' | 'DatabaseMigration';

export interface MaintenanceContent {
  en: MaintenanceLocalizedContent;
  fr: MaintenanceLocalizedContent;
}

export interface MaintenanceLocalizedContent {
  title: string;
  subtitle: string;
  description: string;
}

/**
 * Default maintenance content for client-side fallback
 */
export const DEFAULT_MAINTENANCE_CONTENT: MaintenanceContent = {
  en: {
    title: 'Under Maintenance',
    subtitle: "We're improving Sqordia",
    description: 'Our team is working hard to bring you a better experience. Please check back shortly.'
  },
  fr: {
    title: 'En maintenance',
    subtitle: 'Nous ameliorons Sqordia',
    description: 'Notre equipe travaille pour vous offrir une meilleure experience. Veuillez revenir sous peu.'
  }
};
