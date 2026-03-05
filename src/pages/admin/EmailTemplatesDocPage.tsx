import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Globe, ChevronDown, ChevronRight,
  Mail, Edit3, Sparkles, Eye, Code, CheckCircle,
  AlertTriangle, Lightbulb, Shield, Bell, CreditCard, Megaphone, Settings,
} from 'lucide-react';

type Language = 'en' | 'fr';

const content = {
  en: {
    title: 'Email Templates Guide',
    subtitle: 'Complete documentation for managing bilingual email templates',
    backLabel: 'Back to Email Templates',
    sections: {
      introduction: {
        title: 'Introduction',
        content: 'The Email Templates page is an administration tool for managing all transactional and marketing emails sent by the Sqordia platform. It supports bilingual content (English & French), template variables, AI-powered generation, and live preview. Every template is versioned, allowing you to track changes over time.',
        access: [
          { label: 'URL', value: '/admin/email-templates' },
          { label: 'Permissions', value: 'Administrator role' },
        ],
      },
      categories: {
        title: 'Template Categories',
        content: 'Templates are organized into five categories. Each category groups emails by purpose, making it easy to filter and manage them.',
        items: [
          { name: 'Auth', icon: 'Shield', description: 'Authentication-related emails such as registration confirmation, password reset, email verification, and two-factor authentication codes.', examples: 'Welcome email, Password reset, Email verification' },
          { name: 'Notification', icon: 'Bell', description: 'System and user notifications including activity alerts, collaboration invites, plan status updates, and deadline reminders.', examples: 'Plan shared, Comment added, Export ready' },
          { name: 'Marketing', icon: 'Megaphone', description: 'Promotional and engagement emails like newsletters, feature announcements, onboarding drip sequences, and re-engagement campaigns.', examples: 'Feature announcement, Onboarding tips, Monthly newsletter' },
          { name: 'Billing', icon: 'CreditCard', description: 'Payment and subscription emails including invoices, payment confirmations, subscription renewals, failed payment alerts, and upgrade offers.', examples: 'Invoice, Payment failed, Subscription renewed' },
          { name: 'System', icon: 'Settings', description: 'Internal system emails for maintenance notices, security alerts, data export completions, and admin notifications.', examples: 'Maintenance scheduled, Security alert, Backup complete' },
        ],
      },
      creating: {
        title: 'Creating a Template',
        steps: [
          { title: 'Click "New Template"', details: 'Use the button in the top-right corner of the page header.' },
          { title: 'Set name and category', details: 'Choose a descriptive, snake_case name (e.g., welcome_email) and select the appropriate category.' },
          { title: 'Write content in English', details: 'Switch to the English tab and fill in the Subject and Body fields. The body supports HTML markup for rich formatting.' },
          { title: 'Write content in French', details: 'Switch to the French tab and provide the translated Subject and Body. Both languages are required for Quebec Law 25 compliance.' },
          { title: 'Define variables', details: 'In the Variables (JSON) field, list the placeholder names your template uses, e.g., ["firstName", "actionUrl"].' },
          { title: 'Save', details: 'Click Create to save. The template will be created as active by default.' },
        ],
      },
      aiGeneration: {
        title: 'AI-Powered Generation',
        content: 'The AI Generate feature uses Claude to automatically create bilingual email templates from a text description. This is the fastest way to scaffold a new template.',
        steps: [
          { title: 'Click "AI Generate"', details: 'The button is in the page header, next to "New Template".' },
          { title: 'Describe the purpose', details: 'Write a clear description of the email\'s purpose, audience, and tone. Be specific for best results. Example: "Welcome email for new entrepreneurs who just created their first business plan. Should be warm, encouraging, and include a CTA to complete their profile."' },
          { title: 'Specify variables', details: 'List the dynamic variables the email should include (comma-separated). Default variables (firstName, lastName, actionUrl) are pre-filled.' },
          { title: 'Generate', details: 'Click Generate and wait for the AI to create both English and French versions. The template is saved automatically.' },
          { title: 'Review and refine', details: 'Open the newly created template, preview both languages, and edit as needed. AI-generated content is a starting point, not a final version.' },
        ],
        tips: [
          'Be specific about tone: "professional but warm" vs "formal and concise"',
          'Mention the target audience: "new users", "enterprise admins", "consultants"',
          'Include context about what action the user just took or should take next',
          'Always review and test AI-generated templates before activating them',
        ],
      },
      variables: {
        title: 'Template Variables',
        content: 'Variables are placeholders in your template body that get replaced with real data at send time. They use double curly brace syntax: {{variableName}}.',
        commonVars: [
          { variable: '{{firstName}}', description: 'User\'s first name' },
          { variable: '{{lastName}}', description: 'User\'s last name' },
          { variable: '{{email}}', description: 'User\'s email address' },
          { variable: '{{actionUrl}}', description: 'Primary call-to-action link' },
          { variable: '{{organizationName}}', description: 'User\'s organization name' },
          { variable: '{{planName}}', description: 'Business plan title' },
          { variable: '{{expiryDate}}', description: 'Expiration date (subscriptions, links)' },
          { variable: '{{amount}}', description: 'Payment or invoice amount' },
        ],
        example: {
          template: 'Hello {{firstName}},\n\nYour business plan "{{planName}}" has been shared.\n\nView it here: {{actionUrl}}',
          rendered: 'Hello Marie,\n\nYour business plan "TechVert Solutions" has been shared.\n\nView it here: https://sqordia.app/plans/abc123',
        },
      },
      preview: {
        title: 'Previewing Templates',
        content: 'The preview feature renders your template with sample data so you can see how it looks before sending.',
        steps: [
          'Click the eye icon on any template card, or use the dropdown menu',
          'The preview opens in a dialog with the rendered HTML',
          'Toggle between English and French using the language buttons at the top',
          'The subject line is displayed above the email body for reference',
          'Variables are replaced with placeholder values to simulate a real email',
        ],
        note: 'Preview renders the same HTML that recipients will see. Test in both languages before activating a template.',
      },
      managing: {
        title: 'Managing Templates',
        content: 'Each template card provides quick access to common actions.',
        actions: [
          { action: 'Toggle active/inactive', description: 'Use the switch to enable or disable a template. Inactive templates are not sent by the system.' },
          { action: 'Edit', description: 'Open the editor to modify subject, body, or variables. Each save increments the version number.' },
          { action: 'Preview (EN/FR)', description: 'View the rendered HTML in either language via the dropdown menu.' },
          { action: 'Copy ID', description: 'Copy the template\'s unique ID to clipboard for use in API calls or backend code.' },
          { action: 'Delete', description: 'Permanently remove the template. A confirmation dialog prevents accidental deletion.' },
        ],
        filteringTips: [
          'Use the search bar to find templates by name or subject line',
          'Filter by category using the pill buttons below the search bar',
          'Each category pill shows a count of matching templates',
          'The "All" filter shows every template regardless of category',
        ],
      },
      bestPractices: {
        title: 'Best Practices',
        writing: [
          'Keep subject lines under 50 characters for optimal mobile display',
          'Use a clear call-to-action button with contrasting colors',
          'Include a plain-text fallback in the HTML body for email clients that strip HTML',
          'Use responsive HTML tables for layout — CSS grid/flexbox has limited email support',
          'Test rendering in major email clients (Gmail, Outlook, Apple Mail) before launch',
        ],
        bilingual: [
          'Always write both English and French versions — required for Quebec Law 25',
          'Don\'t rely on machine translation alone — have a native speaker review French content',
          'Keep the same structure and tone across languages, but adapt culturally when needed',
          'Use the AI Generate feature as a starting point, then refine both versions',
        ],
        variables: [
          'Define all variables in the JSON field even if some are optional at render time',
          'Use descriptive names: {{subscriptionEndDate}} is better than {{date}}',
          'Document which variables each template expects, so backend code sends the right data',
          'Test with missing variables to ensure the template degrades gracefully',
        ],
      },
      troubleshooting: {
        title: 'Troubleshooting',
        issues: [
          { problem: 'Template not sending', solutions: ['Check that the template is set to Active', 'Verify the template name matches what the backend expects', 'Ensure both EN and FR bodies are filled in'] },
          { problem: 'Variables not replaced', solutions: ['Confirm variable names match exactly (case-sensitive)', 'Ensure variables use double curly braces: {{variableName}}', 'Check that the backend sends all required variables'] },
          { problem: 'Preview looks broken', solutions: ['Validate your HTML — unclosed tags break rendering', 'Avoid CSS features unsupported in email (flexbox, grid)', 'Test with inline styles rather than <style> blocks'] },
          { problem: 'AI generation fails', solutions: ['Ensure the purpose description is at least a few sentences', 'Check that the AI service is configured and API keys are valid', 'Try simplifying the variable list if you get an error'] },
        ],
      },
    },
  },
  fr: {
    title: 'Guide des Modèles de Courriels',
    subtitle: 'Documentation complète pour la gestion des modèles de courriels bilingues',
    backLabel: 'Retour aux Modèles de Courriels',
    sections: {
      introduction: {
        title: 'Introduction',
        content: 'La page Modèles de Courriels est un outil d\'administration pour gérer tous les courriels transactionnels et marketing envoyés par la plateforme Sqordia. Elle prend en charge le contenu bilingue (anglais et français), les variables de modèle, la génération assistée par IA et l\'aperçu en direct. Chaque modèle est versionné, vous permettant de suivre les modifications au fil du temps.',
        access: [
          { label: 'URL', value: '/admin/email-templates' },
          { label: 'Permissions', value: 'Rôle administrateur' },
        ],
      },
      categories: {
        title: 'Catégories de Modèles',
        content: 'Les modèles sont organisés en cinq catégories. Chaque catégorie regroupe les courriels par usage, facilitant le filtrage et la gestion.',
        items: [
          { name: 'Auth', icon: 'Shield', description: 'Courriels liés à l\'authentification tels que confirmation d\'inscription, réinitialisation de mot de passe, vérification de courriel et codes d\'authentification à deux facteurs.', examples: 'Courriel de bienvenue, Réinitialisation de mot de passe, Vérification de courriel' },
          { name: 'Notification', icon: 'Bell', description: 'Notifications système et utilisateur incluant les alertes d\'activité, invitations de collaboration, mises à jour de statut de plan et rappels d\'échéance.', examples: 'Plan partagé, Commentaire ajouté, Exportation prête' },
          { name: 'Marketing', icon: 'Megaphone', description: 'Courriels promotionnels et d\'engagement comme les infolettres, annonces de fonctionnalités, séquences d\'intégration et campagnes de réengagement.', examples: 'Annonce de fonctionnalité, Conseils d\'intégration, Infolettre mensuelle' },
          { name: 'Billing', icon: 'CreditCard', description: 'Courriels de paiement et d\'abonnement incluant factures, confirmations de paiement, renouvellements d\'abonnement, alertes d\'échec de paiement et offres de mise à niveau.', examples: 'Facture, Échec de paiement, Abonnement renouvelé' },
          { name: 'System', icon: 'Settings', description: 'Courriels système internes pour les avis de maintenance, alertes de sécurité, complétion d\'exportation de données et notifications d\'administrateur.', examples: 'Maintenance planifiée, Alerte de sécurité, Sauvegarde terminée' },
        ],
      },
      creating: {
        title: 'Créer un Modèle',
        steps: [
          { title: 'Cliquez sur « Nouveau Modèle »', details: 'Utilisez le bouton dans le coin supérieur droit de l\'en-tête de la page.' },
          { title: 'Définir le nom et la catégorie', details: 'Choisissez un nom descriptif en snake_case (ex: courriel_bienvenue) et sélectionnez la catégorie appropriée.' },
          { title: 'Rédiger le contenu en anglais', details: 'Passez à l\'onglet English et remplissez les champs Sujet et Corps. Le corps supporte le balisage HTML pour un formatage riche.' },
          { title: 'Rédiger le contenu en français', details: 'Passez à l\'onglet French et fournissez le Sujet et le Corps traduits. Les deux langues sont requises pour la conformité à la Loi 25 du Québec.' },
          { title: 'Définir les variables', details: 'Dans le champ Variables (JSON), listez les noms de variables utilisés par votre modèle, ex: ["firstName", "actionUrl"].' },
          { title: 'Enregistrer', details: 'Cliquez sur Créer pour sauvegarder. Le modèle sera créé comme actif par défaut.' },
        ],
      },
      aiGeneration: {
        title: 'Génération par IA',
        content: 'La fonctionnalité AI Generate utilise Claude pour créer automatiquement des modèles de courriels bilingues à partir d\'une description textuelle. C\'est le moyen le plus rapide d\'ébaucher un nouveau modèle.',
        steps: [
          { title: 'Cliquez sur « AI Generate »', details: 'Le bouton se trouve dans l\'en-tête de la page, à côté de « Nouveau Modèle ».' },
          { title: 'Décrivez l\'objectif', details: 'Rédigez une description claire de l\'objectif du courriel, du public cible et du ton. Soyez précis pour de meilleurs résultats. Exemple : « Courriel de bienvenue pour les nouveaux entrepreneurs qui viennent de créer leur premier plan d\'affaires. Devrait être chaleureux, encourageant, et inclure un CTA pour compléter leur profil. »' },
          { title: 'Spécifiez les variables', details: 'Listez les variables dynamiques que le courriel devrait inclure (séparées par des virgules). Les variables par défaut (firstName, lastName, actionUrl) sont pré-remplies.' },
          { title: 'Générer', details: 'Cliquez sur Générer et attendez que l\'IA crée les versions anglaise et française. Le modèle est sauvegardé automatiquement.' },
          { title: 'Réviser et peaufiner', details: 'Ouvrez le modèle nouvellement créé, prévisualisez les deux langues et modifiez au besoin. Le contenu généré par l\'IA est un point de départ, pas une version finale.' },
        ],
        tips: [
          'Soyez précis sur le ton : « professionnel mais chaleureux » vs « formel et concis »',
          'Mentionnez le public cible : « nouveaux utilisateurs », « administrateurs entreprise », « consultants »',
          'Incluez le contexte sur l\'action que l\'utilisateur vient de faire ou devrait faire ensuite',
          'Révisez et testez toujours les modèles générés par l\'IA avant de les activer',
        ],
      },
      variables: {
        title: 'Variables de Modèle',
        content: 'Les variables sont des espaces réservés dans le corps de votre modèle qui sont remplacés par des données réelles lors de l\'envoi. Elles utilisent la syntaxe double accolades : {{nomVariable}}.',
        commonVars: [
          { variable: '{{firstName}}', description: 'Prénom de l\'utilisateur' },
          { variable: '{{lastName}}', description: 'Nom de famille de l\'utilisateur' },
          { variable: '{{email}}', description: 'Adresse courriel de l\'utilisateur' },
          { variable: '{{actionUrl}}', description: 'Lien principal d\'appel à l\'action' },
          { variable: '{{organizationName}}', description: 'Nom de l\'organisation' },
          { variable: '{{planName}}', description: 'Titre du plan d\'affaires' },
          { variable: '{{expiryDate}}', description: 'Date d\'expiration (abonnements, liens)' },
          { variable: '{{amount}}', description: 'Montant du paiement ou de la facture' },
        ],
        example: {
          template: 'Bonjour {{firstName}},\n\nVotre plan d\'affaires « {{planName}} » a été partagé.\n\nConsultez-le ici : {{actionUrl}}',
          rendered: 'Bonjour Marie,\n\nVotre plan d\'affaires « TechVert Solutions » a été partagé.\n\nConsultez-le ici : https://sqordia.app/plans/abc123',
        },
      },
      preview: {
        title: 'Aperçu des Modèles',
        content: 'La fonctionnalité d\'aperçu affiche votre modèle avec des données d\'exemple pour voir le résultat avant l\'envoi.',
        steps: [
          'Cliquez sur l\'icône œil sur n\'importe quelle carte de modèle, ou utilisez le menu déroulant',
          'L\'aperçu s\'ouvre dans un dialogue avec le HTML rendu',
          'Basculez entre l\'anglais et le français avec les boutons de langue en haut',
          'La ligne de sujet s\'affiche au-dessus du corps du courriel pour référence',
          'Les variables sont remplacées par des valeurs d\'exemple pour simuler un vrai courriel',
        ],
        note: 'L\'aperçu affiche le même HTML que les destinataires verront. Testez dans les deux langues avant d\'activer un modèle.',
      },
      managing: {
        title: 'Gestion des Modèles',
        content: 'Chaque carte de modèle offre un accès rapide aux actions courantes.',
        actions: [
          { action: 'Activer/désactiver', description: 'Utilisez l\'interrupteur pour activer ou désactiver un modèle. Les modèles inactifs ne sont pas envoyés par le système.' },
          { action: 'Modifier', description: 'Ouvrez l\'éditeur pour modifier le sujet, le corps ou les variables. Chaque sauvegarde incrémente le numéro de version.' },
          { action: 'Aperçu (EN/FR)', description: 'Visualisez le HTML rendu dans l\'une ou l\'autre langue via le menu déroulant.' },
          { action: 'Copier l\'ID', description: 'Copiez l\'identifiant unique du modèle dans le presse-papiers pour utilisation dans les appels API ou le code backend.' },
          { action: 'Supprimer', description: 'Supprimez définitivement le modèle. Un dialogue de confirmation empêche la suppression accidentelle.' },
        ],
        filteringTips: [
          'Utilisez la barre de recherche pour trouver des modèles par nom ou ligne de sujet',
          'Filtrez par catégorie avec les boutons pilules sous la barre de recherche',
          'Chaque pilule de catégorie affiche le nombre de modèles correspondants',
          'Le filtre « Tous » affiche tous les modèles quelle que soit la catégorie',
        ],
      },
      bestPractices: {
        title: 'Bonnes Pratiques',
        writing: [
          'Gardez les lignes de sujet sous 50 caractères pour un affichage mobile optimal',
          'Utilisez un bouton d\'appel à l\'action clair avec des couleurs contrastées',
          'Incluez un repli en texte brut dans le corps HTML pour les clients de messagerie qui suppriment le HTML',
          'Utilisez des tableaux HTML responsifs pour la mise en page — CSS grid/flexbox a un support limité dans les courriels',
          'Testez le rendu dans les principaux clients de messagerie (Gmail, Outlook, Apple Mail) avant le lancement',
        ],
        bilingual: [
          'Rédigez toujours les versions anglaise et française — requis par la Loi 25 du Québec',
          'Ne vous fiez pas uniquement à la traduction automatique — faites réviser le contenu français par un locuteur natif',
          'Gardez la même structure et le même ton dans les deux langues, mais adaptez culturellement si nécessaire',
          'Utilisez la fonctionnalité AI Generate comme point de départ, puis peaufinez les deux versions',
        ],
        variables: [
          'Définissez toutes les variables dans le champ JSON même si certaines sont optionnelles au rendu',
          'Utilisez des noms descriptifs : {{subscriptionEndDate}} est mieux que {{date}}',
          'Documentez les variables attendues par chaque modèle pour que le code backend envoie les bonnes données',
          'Testez avec des variables manquantes pour vous assurer que le modèle se dégrade gracieusement',
        ],
      },
      troubleshooting: {
        title: 'Dépannage',
        issues: [
          { problem: 'Le modèle ne s\'envoie pas', solutions: ['Vérifiez que le modèle est défini comme Actif', 'Vérifiez que le nom du modèle correspond à ce que le backend attend', 'Assurez-vous que les corps EN et FR sont remplis'] },
          { problem: 'Variables non remplacées', solutions: ['Confirmez que les noms de variables correspondent exactement (sensible à la casse)', 'Assurez-vous que les variables utilisent des doubles accolades : {{nomVariable}}', 'Vérifiez que le backend envoie toutes les variables requises'] },
          { problem: 'L\'aperçu semble cassé', solutions: ['Validez votre HTML — les balises non fermées cassent le rendu', 'Évitez les fonctionnalités CSS non supportées dans les courriels (flexbox, grid)', 'Testez avec des styles en ligne plutôt que des blocs <style>'] },
          { problem: 'La génération IA échoue', solutions: ['Assurez-vous que la description contient au moins quelques phrases', 'Vérifiez que le service IA est configuré et les clés API valides', 'Essayez de simplifier la liste de variables si vous obtenez une erreur'] },
        ],
      },
    },
  },
};

const CATEGORY_ICONS: Record<string, typeof Mail> = {
  Shield, Bell, Megaphone, CreditCard, Settings,
};

const SECTION_ICONS: Record<string, { icon: typeof Mail; color: string }> = {
  introduction: { icon: Mail, color: 'text-momentum-orange' },
  categories: { icon: Settings, color: 'text-blue-500' },
  creating: { icon: Edit3, color: 'text-emerald-500' },
  aiGeneration: { icon: Sparkles, color: 'text-purple-500' },
  variables: { icon: Code, color: 'text-cyan-500' },
  preview: { icon: Eye, color: 'text-blue-500' },
  managing: { icon: Mail, color: 'text-momentum-orange' },
  bestPractices: { icon: CheckCircle, color: 'text-emerald-500' },
  troubleshooting: { icon: AlertTriangle, color: 'text-amber-500' },
};

export default function EmailTemplatesDocPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [expandedSections, setExpandedSections] = useState<string[]>(['introduction']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };
  const isExpanded = (section: string) => expandedSections.includes(section);
  const t = content[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/admin/email-templates"
              className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-momentum-orange dark:text-gray-400"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backLabel}
            </Link>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Title */}
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-xl bg-momentum-orange/10 p-3 dark:bg-momentum-orange/20">
            <BookOpen className="h-8 w-8 text-momentum-orange" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
          </div>
        </div>

        {/* ─── Introduction ─────────────────────────────────────────── */}
        <Section id="introduction" title={t.sections.introduction.title} icon={SECTION_ICONS.introduction} expanded={isExpanded('introduction')} onToggle={() => toggleSection('introduction')}>
          <p className="leading-relaxed text-gray-600 dark:text-gray-300">{t.sections.introduction.content}</p>
          <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">{language === 'en' ? 'Access' : 'Accès'}</h3>
            <div className="space-y-2">
              {t.sections.introduction.access.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{item.label}:</span>
                  <code className="rounded bg-gray-200 px-2 py-0.5 text-gray-800 dark:bg-gray-600 dark:text-gray-200">{item.value}</code>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── Categories ───────────────────────────────────────────── */}
        <Section id="categories" title={t.sections.categories.title} icon={SECTION_ICONS.categories} expanded={isExpanded('categories')} onToggle={() => toggleSection('categories')}>
          <p className="mb-4 text-gray-600 dark:text-gray-300">{t.sections.categories.content}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {t.sections.categories.items.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.icon] || Mail;
              return (
                <div key={i} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="h-5 w-5 text-momentum-orange" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{cat.description}</p>
                  <p className="mt-2 text-xs text-gray-400">{language === 'en' ? 'Examples' : 'Exemples'}: {cat.examples}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ─── Creating a Template ──────────────────────────────────── */}
        <Section id="creating" title={t.sections.creating.title} icon={SECTION_ICONS.creating} expanded={isExpanded('creating')} onToggle={() => toggleSection('creating')}>
          <StepList steps={t.sections.creating.steps} color="emerald" />
        </Section>

        {/* ─── AI Generation ────────────────────────────────────────── */}
        <Section id="aiGeneration" title={t.sections.aiGeneration.title} icon={SECTION_ICONS.aiGeneration} expanded={isExpanded('aiGeneration')} onToggle={() => toggleSection('aiGeneration')} gradient="from-purple-500 to-purple-600">
          <p className="mb-4 text-gray-600 dark:text-gray-300">{t.sections.aiGeneration.content}</p>
          <StepList steps={t.sections.aiGeneration.steps} color="purple" />
          <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-purple-800 dark:text-purple-300">
              <Lightbulb className="h-4 w-4" />
              {language === 'en' ? 'Pro Tips' : 'Conseils'}
            </h4>
            <ul className="space-y-1.5">
              {t.sections.aiGeneration.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-purple-700 dark:text-purple-400">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ─── Variables ────────────────────────────────────────────── */}
        <Section id="variables" title={t.sections.variables.title} icon={SECTION_ICONS.variables} expanded={isExpanded('variables')} onToggle={() => toggleSection('variables')} gradient="from-cyan-500 to-cyan-600">
          <p className="mb-4 text-gray-600 dark:text-gray-300">{t.sections.variables.content}</p>

          <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
            {language === 'en' ? 'Common Variables' : 'Variables courantes'}
          </h4>
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">Variable</th>
                  <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">Description</th>
                </tr>
              </thead>
              <tbody>
                {t.sections.variables.commonVars.map((v, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="px-3 py-2 font-mono text-cyan-600 dark:text-cyan-400">{v.variable}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{v.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="mb-3 font-medium text-gray-900 dark:text-white">
            {language === 'en' ? 'Example' : 'Exemple'}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">Template</p>
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">{t.sections.variables.example.template}</pre>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">{language === 'en' ? 'Rendered' : 'Rendu'}</p>
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-emerald-300">{t.sections.variables.example.rendered}</pre>
            </div>
          </div>
        </Section>

        {/* ─── Preview ──────────────────────────────────────────────── */}
        <Section id="preview" title={t.sections.preview.title} icon={SECTION_ICONS.preview} expanded={isExpanded('preview')} onToggle={() => toggleSection('preview')}>
          <p className="mb-4 text-gray-600 dark:text-gray-300">{t.sections.preview.content}</p>
          <ol className="space-y-3">
            {t.sections.preview.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{i + 1}</span>
                <span className="text-gray-600 dark:text-gray-300">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <Lightbulb className="h-5 w-5 shrink-0 text-blue-500" />
            <p className="text-sm text-blue-700 dark:text-blue-300">{t.sections.preview.note}</p>
          </div>
        </Section>

        {/* ─── Managing ─────────────────────────────────────────────── */}
        <Section id="managing" title={t.sections.managing.title} icon={SECTION_ICONS.managing} expanded={isExpanded('managing')} onToggle={() => toggleSection('managing')}>
          <p className="mb-4 text-gray-600 dark:text-gray-300">{t.sections.managing.content}</p>

          <h4 className="mb-3 font-medium text-gray-900 dark:text-white">{language === 'en' ? 'Available Actions' : 'Actions disponibles'}</h4>
          <div className="mb-6 space-y-2">
            {t.sections.managing.actions.map((a, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <p className="font-medium text-gray-900 dark:text-white">{a.action}</p>
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{a.description}</p>
              </div>
            ))}
          </div>

          <h4 className="mb-3 font-medium text-gray-900 dark:text-white">{language === 'en' ? 'Filtering Tips' : 'Conseils de filtrage'}</h4>
          <ul className="space-y-1.5">
            {t.sections.managing.filteringTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {tip}
              </li>
            ))}
          </ul>
        </Section>

        {/* ─── Best Practices ───────────────────────────────────────── */}
        <Section id="bestPractices" title={t.sections.bestPractices.title} icon={SECTION_ICONS.bestPractices} expanded={isExpanded('bestPractices')} onToggle={() => toggleSection('bestPractices')}>
          <div className="grid gap-6 md:grid-cols-3">
            <BestPracticeColumn
              title={language === 'en' ? 'Writing Emails' : 'Rédaction de courriels'}
              items={t.sections.bestPractices.writing}
            />
            <BestPracticeColumn
              title={language === 'en' ? 'Bilingual Content' : 'Contenu bilingue'}
              items={t.sections.bestPractices.bilingual}
            />
            <BestPracticeColumn
              title={language === 'en' ? 'Using Variables' : 'Utilisation des variables'}
              items={t.sections.bestPractices.variables}
            />
          </div>
        </Section>

        {/* ─── Troubleshooting ──────────────────────────────────────── */}
        <Section id="troubleshooting" title={t.sections.troubleshooting.title} icon={SECTION_ICONS.troubleshooting} expanded={isExpanded('troubleshooting')} onToggle={() => toggleSection('troubleshooting')}>
          <div className="space-y-4">
            {t.sections.troubleshooting.issues.map((issue, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-white">{issue.problem}</h4>
                <ul className="space-y-1">
                  {issue.solutions.map((solution, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ─── Reusable sub-components ─────────────────────────────────────────── */

function Section({ id, title, icon, expanded, onToggle, gradient, children }: {
  id: string;
  title: string;
  icon: { icon: typeof Mail; color: string };
  expanded: boolean;
  onToggle: () => void;
  gradient?: string;
  children: React.ReactNode;
}) {
  const Icon = icon.icon;
  const headerClass = gradient
    ? `bg-gradient-to-r ${gradient} text-white`
    : 'border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
  const iconColor = gradient ? 'text-white' : icon.color;
  const titleColor = gradient ? 'text-white' : 'text-gray-900 dark:text-white';
  const chevronColor = gradient ? 'text-white' : 'text-gray-400';

  return (
    <section className="mb-6">
      <div
        onClick={onToggle}
        className={`flex cursor-pointer items-center justify-between rounded-xl p-4 shadow-sm ${headerClass}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <h2 className={`text-lg font-semibold ${titleColor}`}>{title}</h2>
        </div>
        {expanded
          ? <ChevronDown className={`h-5 w-5 ${chevronColor}`} />
          : <ChevronRight className={`h-5 w-5 ${chevronColor}`} />}
      </div>
      {expanded && (
        <div className="mt-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {children}
        </div>
      )}
    </section>
  );
}

function StepList({ steps, color }: { steps: { title: string; details: string }[]; color: string }) {
  const bgMap: Record<string, string> = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-momentum-orange/10 text-momentum-orange',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  };
  const dotClass = bgMap[color] || bgMap.blue;

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold ${dotClass}`}>
            {i + 1}
          </span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{step.title}</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{step.details}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BestPracticeColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
