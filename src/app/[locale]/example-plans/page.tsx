import type { Metadata } from 'next';
import Header from '@/components/nextjs/Header';
import Footer from '@/components/nextjs/Footer';
import ExamplePlansContent from './ExamplePlansContent';
import { examplePlans } from './data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Business Plan Examples | Sqordia',
    fr: "Exemples de Plans d'Affaires | Sqordia",
  };

  const descriptions = {
    en: 'Explore our professional business plan examples for different industries. Get inspiration to create your own business plan with Sqordia.',
    fr: "Explorez nos exemples de plans d'affaires professionnels pour différentes industries. Obtenez de l'inspiration pour créer votre propre plan d'affaires avec Sqordia.",
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/example-plans`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    keywords:
      locale === 'fr'
        ? "exemples de plans d'affaires, modèles de plans d'affaires, plans d'affaires par industrie, exemples de plans stratégiques"
        : 'business plan examples, business plan templates, business plans by industry, strategic plan examples',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/example-plans`,
        fr: `${baseUrl}/fr/example-plans`,
        'x-default': `${baseUrl}/example-plans`,
      },
    },
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.en,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
      type: 'website',
      url: canonicalUrl,
    },
  };
}

function generateStructuredData(locale: string) {
  const baseUrl = 'https://sqordia.com';

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
    ],
  };

  // ItemList for the plans
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'fr' ? "Exemples de Plans d'Affaires" : 'Business Plan Examples',
    numberOfItems: examplePlans.length,
    itemListElement: examplePlans.map((plan, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: plan.title,
        description: plan.description,
        image: plan.image,
        url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/example-plans/${plan.id}`,
      },
    })),
  };

  return { breadcrumb, itemList };
}

export default async function ExamplePlansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const structuredData = generateStructuredData(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumb),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.itemList),
        }}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900 pt-20">
        <ExamplePlansContent locale={locale} />
      </main>
      <Footer />
    </>
  );
}
