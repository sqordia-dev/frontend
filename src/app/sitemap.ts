import { MetadataRoute } from 'next';
import { getAllExamplePlanIds } from './[locale]/example-plans/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sqordia.com';
  const locales = ['en', 'fr'];
  const lastModified = new Date();

  // Static pages
  const staticPages = [
    '',           // Home
    '/privacy',
    '/terms',
    '/security',
    '/compliance',
    '/pricing',
    '/example-plans',
  ];

  // Generate entries for all static pages in both locales
  const staticEntries = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}${page}`,
      lastModified,
      changeFrequency: (page === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: page === '' ? 1.0 : page === '/pricing' ? 0.9 : 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}${page}`,
          fr: `${baseUrl}/fr${page}`,
        },
      },
    }))
  );

  // Example plan detail pages
  const examplePlanIds = getAllExamplePlanIds();
  const examplePlanEntries = examplePlanIds.flatMap((id) =>
    locales.map((locale) => ({
      url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/example-plans/${id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}/example-plans/${id}`,
          fr: `${baseUrl}/fr/example-plans/${id}`,
        },
      },
    }))
  );

  // Auth pages (lower priority, but still indexed)
  const authPages = ['/login', '/signup', '/forgot-password'];
  const authEntries = authPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}${page}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: {
        languages: {
          en: `${baseUrl}${page}`,
          fr: `${baseUrl}/fr${page}`,
        },
      },
    }))
  );

  return [...staticEntries, ...examplePlanEntries, ...authEntries];
}
