import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/nextjs/Header';
import Footer from '@/components/nextjs/Footer';
import ExamplePlanDetailContent from './ExamplePlanDetailContent';
import { getExamplePlanById, getAllExamplePlanIds } from '../data';

// Generate static paths for all example plans
export async function generateStaticParams() {
  const ids = getAllExamplePlanIds();
  const locales = ['en', 'fr'];

  return locales.flatMap((locale) =>
    ids.map((id) => ({
      locale,
      id,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const plan = getExamplePlanById(id);

  if (!plan) {
    return {
      title: 'Not Found',
    };
  }

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/example-plans/${id}`;

  return {
    title: `${plan.title} | ${locale === 'fr' ? 'Exemples de Plans' : 'Example Plans'} | Sqordia`,
    description: plan.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/example-plans/${id}`,
        fr: `${baseUrl}/fr/example-plans/${id}`,
        'x-default': `${baseUrl}/example-plans/${id}`,
      },
    },
    openGraph: {
      title: plan.title,
      description: plan.description,
      type: 'article',
      url: canonicalUrl,
      images: [
        {
          url: plan.image,
          width: 800,
          height: 400,
          alt: plan.title,
        },
      ],
    },
  };
}

function generateStructuredData(locale: string, id: string) {
  const plan = getExamplePlanById(id);
  if (!plan) return null;

  const baseUrl = 'https://sqordia.com';

  // Service structured data
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: plan.title,
    description: plan.description,
    image: plan.image,
    provider: {
      '@type': 'Organization',
      name: 'Sqordia',
      url: baseUrl,
    },
    serviceType: plan.category,
    areaServed: 'Worldwide',
  };

  // Breadcrumb structured data
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'fr' ? 'Accueil' : 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'fr' ? 'Exemples de Plans' : 'Example Plans',
        item: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/example-plans`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: plan.title,
        item: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/example-plans/${id}`,
      },
    ],
  };

  return { service, breadcrumb };
}

export default async function ExamplePlanDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const plan = getExamplePlanById(id);

  if (!plan) {
    notFound();
  }

  const structuredData = generateStructuredData(locale, id);

  return (
    <>
      {structuredData && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData.service),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData.breadcrumb),
            }}
          />
        </>
      )}
      <Header />
      <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900 pt-20">
        <ExamplePlanDetailContent plan={plan} locale={locale} />
      </main>
      <Footer />
    </>
  );
}
