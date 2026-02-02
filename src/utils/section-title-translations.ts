/**
 * Section title translations for business plan section headers.
 * Used so section headers display in the selected language (e.g. French).
 */

const SECTION_TITLE_MAP: Record<string, { en: string; fr: string }> = {
  'Executive Summary': { en: 'Executive Summary', fr: 'Résumé Exécutif' },
  'Market Analysis': { en: 'Market Analysis', fr: 'Analyse de Marché' },
  'Competitive Analysis': { en: 'Competitive Analysis', fr: 'Analyse Concurrentielle' },
  'Business Model': { en: 'Business Model', fr: "Modèle d'Affaires" },
  'Marketing Strategy': { en: 'Marketing Strategy', fr: 'Stratégie Marketing' },
  'Operations Plan': { en: 'Operations Plan', fr: "Plan d'Opérations" },
  'Management Team': { en: 'Management Team', fr: 'Équipe de Direction' },
  'Financial Projections': { en: 'Financial Projections', fr: 'Projections Financières' },
  'Financial': { en: 'Financial', fr: 'Financier' },
  'Risk Analysis': { en: 'Risk Analysis', fr: 'Analyse des Risques' },
  'SWOT Analysis': { en: 'SWOT Analysis', fr: 'Analyse SWOT' },
  'Problem Statement': { en: 'Problem Statement', fr: 'Énoncé du Problème' },
  'Solution': { en: 'Solution', fr: 'Solution' },
  'Target Market': { en: 'Target Market', fr: 'Marché Cible' },
  'Competitive Advantage': { en: 'Competitive Advantage', fr: 'Avantage Concurrentiel' },
  'Funding Requirements': { en: 'Funding Requirements', fr: 'Besoins de Financement' },
  'Exit Strategy': { en: 'Exit Strategy', fr: 'Stratégie de Sortie' },
  'Mission Statement': { en: 'Mission Statement', fr: 'Énoncé de Mission' },
  'Social Impact': { en: 'Social Impact', fr: 'Impact Social' },
  'Beneficiary Profile': { en: 'Beneficiary Profile', fr: 'Profil des Bénéficiaires' },
  'Grant Strategy': { en: 'Grant Strategy', fr: 'Stratégie de Subvention' },
  'Sustainability Plan': { en: 'Sustainability Plan', fr: 'Plan de Durabilité' },
  'Branding Strategy': { en: 'Branding Strategy', fr: 'Stratégie de Marque' },
  'Business Concept': { en: 'Business Concept', fr: "Concept d'Affaires" },
};

/**
 * Translate a section title to the given language.
 * Returns the translated title if a mapping exists, otherwise the original title.
 * @param language - e.g. 'en' or 'fr' from ThemeContext; non-'fr' is treated as English.
 */
export function translateSectionTitle(title: string, language: string): string {
  const normalizedTitle = title.trim();
  const translation = SECTION_TITLE_MAP[normalizedTitle];
  if (translation) {
    return language === 'fr' ? translation.fr : translation.en;
  }
  return title;
}
