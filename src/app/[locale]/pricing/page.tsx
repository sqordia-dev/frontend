import type { Metadata } from 'next';
import Header from '@/components/nextjs/Header';
import Footer from '@/components/nextjs/Footer';
import PricingContent from './PricingContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Pricing Plans | Sqordia',
    fr: "Plans et Tarifs | Sqordia",
  };

  const descriptions = {
    en: 'Choose the Sqordia subscription plan that fits your business needs. Start free, upgrade as you grow.',
    fr: "Choisissez le plan d'abonnement Sqordia qui correspond à vos besoins. Commencez gratuitement, évoluez selon vos besoins.",
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/pricing`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/pricing`,
        fr: `${baseUrl}/fr/pricing`,
        'x-default': `${baseUrl}/pricing`,
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

// JSON-LD for pricing structured data
function generatePricingStructuredData(locale: string) {
  const baseUrl = 'https://sqordia.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: locale === 'fr' ? 'Plans et Tarifs' : 'Pricing Plans',
    description:
      locale === 'fr'
        ? "Choisissez le plan d'abonnement Sqordia qui correspond à vos besoins."
        : 'Choose the Sqordia subscription plan that fits your business needs.',
    url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/pricing`,
    mainEntity: {
      '@type': 'Product',
      name: 'Sqordia Business Planning Software',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Plan',
          price: '0',
          priceCurrency: 'CAD',
          description: 'Perfect for getting started with business planning',
        },
        {
          '@type': 'Offer',
          name: 'Pro Plan',
          price: '29.99',
          priceCurrency: 'CAD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '29.99',
            priceCurrency: 'CAD',
            unitText: 'MONTH',
          },
          description: 'For growing businesses that need more features',
        },
        {
          '@type': 'Offer',
          name: 'Enterprise Plan',
          price: '99.99',
          priceCurrency: 'CAD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '99.99',
            priceCurrency: 'CAD',
            unitText: 'MONTH',
          },
          description: 'For large organizations with advanced needs',
        },
      ],
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const structuredData = generatePricingStructuredData(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-[#F4F7FA] dark:bg-gray-900 pt-20">
        <PricingContent locale={locale} />
      </main>
      <Footer />
    </>
  );
}
