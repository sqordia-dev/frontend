import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Globe,
  ChevronDown,
  ChevronRight,
  Database,
  Edit3,
  Play,
  History,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Code,
} from 'lucide-react';

type Language = 'en' | 'fr';

const PromptRegistryDocPage: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [expandedSections, setExpandedSections] = useState<string[]>(['introduction', 'example']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  const content = {
    en: {
      title: 'AI Prompt Registry Guide',
      subtitle: 'Complete documentation for managing AI prompts',
      backToRegistry: 'Back to Registry',
      sections: {
        introduction: {
          title: 'Introduction',
          content: `The AI Prompt Registry is an administration tool for managing prompts used by the business plan generation system. It provides complete control over AI-generated content, with versioning, testing, and modification history.`,
        },
        access: {
          title: 'Access & Permissions',
          items: [
            { label: 'URL', value: '/admin/prompt-registry' },
            { label: 'Required permissions', value: 'Administrator role' },
          ],
        },
        filters: {
          title: 'Filters',
          items: [
            { filter: 'Category', description: 'Prompt type', options: 'ContentGeneration, SystemPrompt, QuestionSuggestions, SectionImprovement' },
            { filter: 'Plan Type', description: 'Target business plan', options: 'BusinessPlan, StrategicPlan, LeanCanvas' },
            { filter: 'Language', description: 'Content language', options: 'English (en), French (fr)' },
          ],
        },
        editing: {
          title: 'Editing a Prompt',
          steps: [
            'Click on a prompt in the grid',
            'The edit panel opens on the right',
            'Modify the desired fields: System Prompt, User Template, Variables, Notes',
            'Click Save',
          ],
          note: 'Each save automatically creates an entry in the version history.',
        },
        testing: {
          title: 'Testing a Prompt',
          steps: [
            'Modify the prompt in the editor',
            'Click Test Draft',
            'Fill in the test variables using the simple form fields',
            'View the AI-generated result',
            'If satisfied, click Save',
          ],
          parameters: [
            { param: 'Variable Fields', description: 'Auto-generated form fields based on your template placeholders', default: 'Auto-detected' },
            { param: 'Max Tokens', description: 'Response length limit', default: '2000' },
            { param: 'Temperature', description: 'Creativity (0-1)', default: '0.7' },
          ],
        },
        versioning: {
          title: 'Version History',
          content: 'Every time you save a prompt, the previous version is automatically saved to the version history. You can view all previous versions and rollback to any of them if needed.',
          rollbackSteps: [
            'Click the History button on a prompt',
            'Locate the version you want to restore',
            'Click Restore this version',
            'Add an optional note explaining the rollback',
            'Confirm the restoration',
          ],
          rollbackNote: 'Restoration creates a new version with the content from the selected version. The complete history is preserved.',
        },
        variables: {
          title: 'How Variables Work',
          content: 'Template variables are placeholders that get replaced with real data when generating content. When a user creates a business plan, the system automatically injects their actual business information.',
          specialVariable: {
            name: '{questionnaireContext}',
            description: 'This special variable contains ALL the information collected from questionnaire responses, including: business name, industry, description, target market, products/services, financial goals, competitive advantages, and more.',
          },
          exampleTable: [
            { template: '{{businessName}}', runtime: 'TechVert Solutions' },
            { template: '{{industry}}', runtime: 'Green Technology' },
            { template: '{{questionnaireContext}}', runtime: 'All questionnaire responses formatted as text' },
          ],
          availableVars: [
            { variable: '{{businessName}}', description: 'Name of the business' },
            { variable: '{{industry}}', description: 'Business industry/sector' },
            { variable: '{{businessDescription}}', description: 'Short description' },
            { variable: '{{sectionName}}', description: 'Section being generated' },
            { variable: '{{planType}}', description: 'BusinessPlan, StrategicPlan, or LeanCanvas' },
            { variable: '{{questionnaireContext}}', description: 'All questionnaire responses (comprehensive)' },
            { variable: '{{language}}', description: 'Target language (en/fr)' },
          ],
        },
        example: {
          title: 'Step-by-Step Example',
          scenario: 'Improving the Executive Summary Prompt',
          description: 'You want to modify the Executive Summary generation prompt to get more structured and professional content.',
          steps: [
            {
              title: 'Access the Prompt Registry',
              details: 'Log in with an administrator account and navigate to Administration > Prompt Registry',
            },
            {
              title: 'Locate the prompt to modify',
              details: 'Use filters: Category = ContentGeneration, Plan Type = BusinessPlan, Language = English. Find "ExecutiveSummary - BusinessPlan - EN"',
            },
            {
              title: 'Modify the System Prompt',
              details: 'Add more precise instructions about structure, tone, and content requirements',
            },
            {
              title: 'Test the draft',
              details: 'Fill in the form fields (Business Name, Industry, etc.) that appear automatically based on your template. Run the test and review the output',
            },
            {
              title: 'Iterate if necessary',
              details: 'Adjust the prompt based on test results until satisfied',
            },
            {
              title: 'Save the changes',
              details: 'Click Save. A new version is automatically created',
            },
            {
              title: 'Verify in production',
              details: 'Create a test business plan and generate the section to confirm the changes work',
            },
          ],
          sampleSystemPrompt: `You are an expert business plan writer with 20 years of experience.
You must write a compelling and professional executive summary.

Required structure:
1. Hook (2-3 captivating sentences)
2. Company description
3. Problem solved and proposed solution
4. Target market and opportunity
5. Competitive advantage
6. Key financial projections
7. Funding request (if applicable)

Writing rules:
- Use a professional but accessible tone
- Be concise: maximum 500 words
- Include concrete numbers when available
- End with a call to action`,
          sampleVariables: `Business Name:        GreenTech Solutions
Industry:             Green technologies
Business Description: Development of next-generation solar panels
Target Market:        Industrial SMEs in North America
Funding Request:      $500,000`,
        },
        bestPractices: {
          title: 'Best Practices',
          writing: [
            'Be specific: Clearly define the role and expectations',
            'Structure: Use lists and sections in your prompts',
            'Test: Validate with multiple scenarios before activating',
            'Document: Add notes for important modifications',
          ],
          versioning: [
            'Always test before saving to production',
            'Add explanatory notes when making changes',
            'Keep prompts active before making major changes',
            'Restore quickly if problems occur with the new version',
          ],
        },
        troubleshooting: {
          title: 'Troubleshooting',
          issues: [
            {
              problem: 'Prompt not appearing in generation',
              solutions: ['Verify the prompt is Active', 'Confirm language and plan type match', 'Ensure section name is correct'],
            },
            {
              problem: 'Error during testing',
              solutions: ['Fill in all the variable fields', 'Ensure all required fields have values', 'Reduce max tokens if test times out'],
            },
          ],
        },
      },
    },
    fr: {
      title: 'Guide du Registre de Prompts IA',
      subtitle: 'Documentation complète pour la gestion des prompts IA',
      backToRegistry: 'Retour au Registre',
      sections: {
        introduction: {
          title: 'Introduction',
          content: `Le Registre de Prompts IA est un outil d'administration permettant de gérer les prompts utilisés par le système de génération de plans d'affaires. Il offre un contrôle complet sur le contenu généré par l'IA, avec versionnement, tests et historique des modifications.`,
        },
        access: {
          title: 'Accès et Permissions',
          items: [
            { label: 'URL', value: '/admin/prompt-registry' },
            { label: 'Permissions requises', value: 'Rôle administrateur' },
          ],
        },
        filters: {
          title: 'Filtres',
          items: [
            { filter: 'Catégorie', description: 'Type de prompt', options: 'ContentGeneration, SystemPrompt, QuestionSuggestions, SectionImprovement' },
            { filter: 'Type de plan', description: 'Plan d\'affaires ciblé', options: 'BusinessPlan, StrategicPlan, LeanCanvas' },
            { filter: 'Langue', description: 'Langue du contenu', options: 'Anglais (en), Français (fr)' },
          ],
        },
        editing: {
          title: 'Modifier un Prompt',
          steps: [
            'Cliquez sur un prompt dans la grille',
            'Le panneau d\'édition s\'ouvre sur la droite',
            'Modifiez les champs souhaités: Prompt système, Template utilisateur, Variables, Notes',
            'Cliquez sur Enregistrer',
          ],
          note: 'Chaque sauvegarde crée automatiquement une entrée dans l\'historique des versions.',
        },
        testing: {
          title: 'Tester un Prompt',
          steps: [
            'Modifiez le prompt dans l\'éditeur',
            'Cliquez sur Tester le brouillon',
            'Remplissez les champs du formulaire de variables',
            'Visualisez le résultat généré par l\'IA',
            'Si satisfait, cliquez sur Enregistrer',
          ],
          parameters: [
            { param: 'Champs de variables', description: 'Champs générés automatiquement selon votre template', default: 'Auto-détecté' },
            { param: 'Tokens max', description: 'Limite de longueur de réponse', default: '2000' },
            { param: 'Température', description: 'Créativité (0-1)', default: '0.7' },
          ],
        },
        versioning: {
          title: 'Historique des Versions',
          content: 'Chaque fois que vous sauvegardez un prompt, la version précédente est automatiquement enregistrée dans l\'historique. Vous pouvez visualiser toutes les versions précédentes et restaurer n\'importe laquelle si nécessaire.',
          rollbackSteps: [
            'Cliquez sur le bouton Historique d\'un prompt',
            'Localisez la version que vous souhaitez restaurer',
            'Cliquez sur Restaurer cette version',
            'Ajoutez une note explicative (optionnel)',
            'Confirmez la restauration',
          ],
          rollbackNote: 'La restauration crée une nouvelle version avec le contenu de la version sélectionnée. L\'historique complet est préservé.',
        },
        variables: {
          title: 'Comment fonctionnent les Variables',
          content: 'Les variables du template sont des espaces réservés qui sont remplacés par des données réelles lors de la génération de contenu. Lorsqu\'un utilisateur crée un plan d\'affaires, le système injecte automatiquement ses informations commerciales.',
          specialVariable: {
            name: '{questionnaireContext}',
            description: 'Cette variable spéciale contient TOUTES les informations collectées des réponses au questionnaire, incluant: nom de l\'entreprise, secteur, description, marché cible, produits/services, objectifs financiers, avantages concurrentiels, et plus.',
          },
          exampleTable: [
            { template: '{{businessName}}', runtime: 'TechVert Solutions' },
            { template: '{{industry}}', runtime: 'Technologies vertes' },
            { template: '{{questionnaireContext}}', runtime: 'Toutes les réponses du questionnaire formatées en texte' },
          ],
          availableVars: [
            { variable: '{{businessName}}', description: 'Nom de l\'entreprise' },
            { variable: '{{industry}}', description: 'Secteur d\'activité' },
            { variable: '{{businessDescription}}', description: 'Description courte' },
            { variable: '{{sectionName}}', description: 'Section à générer' },
            { variable: '{{planType}}', description: 'BusinessPlan, StrategicPlan ou LeanCanvas' },
            { variable: '{{questionnaireContext}}', description: 'Toutes les réponses du questionnaire (complet)' },
            { variable: '{{language}}', description: 'Langue cible (en/fr)' },
          ],
        },
        example: {
          title: 'Exemple Pas-à-Pas',
          scenario: 'Améliorer le prompt du Sommaire Exécutif',
          description: 'Vous souhaitez modifier le prompt de génération du Sommaire Exécutif pour obtenir un contenu plus structuré et professionnel.',
          steps: [
            {
              title: 'Accéder au Registre de Prompts',
              details: 'Connectez-vous avec un compte administrateur et naviguez vers Administration > Registre de Prompts',
            },
            {
              title: 'Localiser le prompt à modifier',
              details: 'Utilisez les filtres: Catégorie = ContentGeneration, Type de plan = BusinessPlan, Langue = Français. Trouvez "ExecutiveSummary - BusinessPlan - FR"',
            },
            {
              title: 'Modifier le Prompt Système',
              details: 'Ajoutez des instructions plus précises sur la structure, le ton et les exigences de contenu',
            },
            {
              title: 'Tester le brouillon',
              details: 'Remplissez les champs du formulaire (Nom de l\'entreprise, Industrie, etc.) qui apparaissent automatiquement. Exécutez le test et examinez le résultat',
            },
            {
              title: 'Itérer si nécessaire',
              details: 'Ajustez le prompt en fonction des résultats de test jusqu\'à satisfaction',
            },
            {
              title: 'Sauvegarder les modifications',
              details: 'Cliquez sur Enregistrer. Une nouvelle version est automatiquement créée',
            },
            {
              title: 'Valider en production',
              details: 'Créez un plan d\'affaires de test et générez la section pour confirmer que les modifications fonctionnent',
            },
          ],
          sampleSystemPrompt: `Tu es un expert en rédaction de plans d'affaires avec 20 ans d'expérience.
Tu dois rédiger un sommaire exécutif percutant et professionnel.

Structure obligatoire:
1. Accroche (2-3 phrases captivantes)
2. Description de l'entreprise
3. Problème résolu et solution proposée
4. Marché cible et opportunité
5. Avantage concurrentiel
6. Projections financières clés
7. Demande de financement (si applicable)

Règles de rédaction:
- Utilise un ton professionnel mais accessible
- Sois concis: maximum 500 mots
- Inclus des chiffres concrets quand disponibles
- Termine par un appel à l'action`,
          sampleVariables: `Nom de l'entreprise:     TechVert Solutions
Industrie:               Technologies vertes
Description:             Développement de panneaux solaires nouvelle génération
Marché cible:            PME industrielles au Québec
Demande de financement:  500 000 $`,
        },
        bestPractices: {
          title: 'Bonnes Pratiques',
          writing: [
            'Soyez spécifique: Définissez clairement le rôle et les attentes',
            'Structurez: Utilisez des listes et des sections dans vos prompts',
            'Testez: Validez avec plusieurs scénarios avant d\'activer',
            'Documentez: Ajoutez des notes pour les modifications importantes',
          ],
          versioning: [
            'Toujours tester avant de sauvegarder en production',
            'Ajouter des notes explicatives lors des modifications',
            'Conserver les prompts actifs avant de faire des changements majeurs',
            'Restaurer rapidement en cas de problème avec la nouvelle version',
          ],
        },
        troubleshooting: {
          title: 'Dépannage',
          issues: [
            {
              problem: 'Le prompt ne s\'affiche pas dans la génération',
              solutions: ['Vérifiez que le prompt est Actif', 'Confirmez que la langue et le type de plan correspondent', 'Assurez-vous que le nom de section est correct'],
            },
            {
              problem: 'Erreur lors du test',
              solutions: ['Remplissez tous les champs de variables', 'Assurez-vous que tous les champs requis ont des valeurs', 'Réduisez les tokens max si le test expire'],
            },
          ],
        },
      },
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/prompt-registry"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">{t.backToRegistry}</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
          </div>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <div
            onClick={() => toggleSection('introduction')}
            className="flex items-center justify-between cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.sections.introduction.title}</h2>
            </div>
            {isExpanded('introduction') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
          {isExpanded('introduction') && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t.sections.introduction.content}</p>

              {/* Access info */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.sections.access.title}</h3>
                <div className="space-y-2">
                  {t.sections.access.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">{item.label}:</span>
                      <code className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-800 dark:text-gray-200">{item.value}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t.sections.filters.title}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">Filter</th>
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">Description</th>
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.sections.filters.items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">{item.filter}</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{item.description}</td>
                          <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">{item.options}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Editing */}
        <section className="mb-8">
          <div
            onClick={() => toggleSection('editing')}
            className="flex items-center justify-between cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.sections.editing.title}</h2>
            </div>
            {isExpanded('editing') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
          {isExpanded('editing') && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <ol className="space-y-3">
                {t.sections.editing.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">{t.sections.editing.note}</p>
              </div>
            </div>
          )}
        </section>

        {/* Testing */}
        <section className="mb-8">
          <div
            onClick={() => toggleSection('testing')}
            className="flex items-center justify-between cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.sections.testing.title}</h2>
            </div>
            {isExpanded('testing') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
          {isExpanded('testing') && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <ol className="space-y-3 mb-6">
                {t.sections.testing.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>

              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Parameters</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">Parameter</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">Description</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-medium">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.sections.testing.parameters.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">{item.param}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{item.description}</td>
                        <td className="py-2 px-3">
                          <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">{item.default}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Version History */}
        <section className="mb-8">
          <div
            onClick={() => toggleSection('versioning')}
            className="flex items-center justify-between cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.sections.versioning.title}</h2>
            </div>
            {isExpanded('versioning') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
          {isExpanded('versioning') && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t.sections.versioning.content}</p>

              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Rollback Steps
              </h4>
              <ol className="space-y-3 mb-4">
                {t.sections.versioning.rollbackSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">{t.sections.versioning.rollbackNote}</p>
              </div>
            </div>
          )}
        </section>

        {/* How Variables Work */}
        <section className="mb-8">
          <div
            onClick={() => toggleSection('variables')}
            className="flex items-center justify-between cursor-pointer bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">{t.sections.variables.title}</h2>
            </div>
            {isExpanded('variables') ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
          </div>
          {isExpanded('variables') && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t.sections.variables.content}</p>

              {/* Special Variable Highlight */}
              <div className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {t.sections.variables.specialVariable.name}
                </h4>
                <p className="text-cyan-700 dark:text-cyan-400 text-sm">
                  {t.sections.variables.specialVariable.description}
                </p>
              </div>

              {/* Substitution Example Table */}
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Runtime Substitution Example</h4>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Template</th>
                      <th className="text-center py-2 px-3 text-gray-400">→</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Runtime Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.sections.variables.exampleTable.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2 px-3 font-mono text-cyan-600 dark:text-cyan-400 bg-gray-50 dark:bg-gray-900/50">{row.template}</td>
                        <td className="py-2 px-3 text-center text-gray-400">→</td>
                        <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{row.runtime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Available Variables Table */}
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Available Variables</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Variable</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.sections.variables.availableVars.map((v, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2 px-3 font-mono text-cyan-600 dark:text-cyan-400">{v.variable}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{v.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Step-by-Step Example */}
        <section className="mb-8">
          <div
            onClick={() => toggleSection('example')}
            className="flex items-center justify-between cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">{t.sections.example.title}</h2>
            </div>
            {isExpanded('example') ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
          </div>
          {isExpanded('example') && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.sections.example.scenario}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t.sections.example.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {t.sections.example.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{step.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{step.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sample System Prompt</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {t.sections.example.sampleSystemPrompt}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sample Variables</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {t.sections.example.sampleVariables}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Best Practices */}
        <section className="mb-8">
          <div
            onClick={() => toggleSection('bestPractices')}
            className="flex items-center justify-between cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.sections.bestPractices.title}</h2>
            </div>
            {isExpanded('bestPractices') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
          {isExpanded('bestPractices') && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Writing Prompts</h4>
                  <ul className="space-y-2">
                    {t.sections.bestPractices.writing.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Version Management</h4>
                  <ul className="space-y-2">
                    {t.sections.bestPractices.versioning.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Troubleshooting */}
        <section className="mb-8">
          <div
            onClick={() => toggleSection('troubleshooting')}
            className="flex items-center justify-between cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.sections.troubleshooting.title}</h2>
            </div>
            {isExpanded('troubleshooting') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
          {isExpanded('troubleshooting') && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                {t.sections.troubleshooting.issues.map((issue, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{issue.problem}</h4>
                    <ul className="space-y-1">
                      {issue.solutions.map((solution, j) => (
                        <li key={j} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                          {solution}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PromptRegistryDocPage;
