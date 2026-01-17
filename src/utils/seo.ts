const BASE_URL = 'https://sqordia.com';

export const getCanonicalUrl = (path: string = ''): string => {
  // Remove trailing slash except for root
  const cleanPath = path === '/' ? '' : path.replace(/\/$/, '');
  return `${BASE_URL}${cleanPath}`;
};

export const getAlternateUrls = (path: string = ''): { en: string; fr: string } => {
  const cleanPath = path === '/' ? '' : path.replace(/\/$/, '');
  return {
    en: `${BASE_URL}${cleanPath}`,
    fr: `${BASE_URL}/fr${cleanPath}`
  };
};

export const getDefaultTitle = (lang: 'en' | 'fr' = 'en'): string => {
  return lang === 'fr' 
    ? 'Sqordia - Planification d\'affaires alimentée par l\'IA en moins de 60 minutes'
    : 'Sqordia - AI-Powered Business Planning in Under 60 Minutes';
};

export const getDefaultDescription = (lang: 'en' | 'fr' = 'en'): string => {
  return lang === 'fr'
    ? 'Créez des plans d\'affaires professionnels et prêts pour les banques en moins de 60 minutes avec la plateforme Sqordia alimentée par l\'IA. Répondez à 20 questions simples et obtenez des projections financières automatisées, une analyse de marché et une documentation prête pour les investisseurs.'
    : 'Create professional, bank-ready business plans in under 60 minutes with Sqordia\'s AI-powered platform. Answer 20 simple questions and get automated financial projections, market analysis, and investor-ready documentation. Perfect for startups, nonprofits, and growing businesses.';
};

export const getDefaultImage = (): string => {
  return `${BASE_URL}/og-image.jpg`;
};

export const truncateDescription = (description: string, maxLength: number = 160): string => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3) + '...';
};
