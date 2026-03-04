import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Header from '@/components/nextjs/Header';
import Footer from '@/components/nextjs/Footer';
import {
  HeroSection,
  ValuePropsSection,
  FeaturesSection,
  TestimonialsSection,
  FAQSection,
  FinalCTASection,
} from '@/components/nextjs/landing';

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = locale === 'en' ? baseUrl : `${baseUrl}/${locale}`;

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    authors: [{ name: 'Sqordia', url: baseUrl }],
    creator: 'Sqordia',
    publisher: 'Sqordia',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: baseUrl,
        fr: `${baseUrl}/fr`,
        'x-default': baseUrl,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
      alternateLocale: locale === 'fr' ? 'en_CA' : 'fr_CA',
      url: canonicalUrl,
      siteName: 'Sqordia',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: [
        {
          url: `${baseUrl}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Sqordia - AI-Powered Business Planning',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@sqordia',
      creator: '@sqordia',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: [`${baseUrl}/images/og-image.png`],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    category: 'Business',
  };
}

// JSON-LD Structured Data
function generateStructuredData(locale: string) {
  const baseUrl = 'https://sqordia.com';

  // Organization schema
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sqordia',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    sameAs: [
      'https://twitter.com/sqordia',
      'https://linkedin.com/company/sqordia',
      'https://facebook.com/sqordia',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@sqordia.com',
      contactType: 'customer service',
      availableLanguage: ['English', 'French'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CA',
      addressRegion: 'QC',
    },
  };

  // SoftwareApplication schema
  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Sqordia',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CAD',
      description: '14-day free trial',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '2500',
      bestRating: '5',
      worstRating: '1',
    },
    description:
      locale === 'fr'
        ? "Créez des plans d'affaires professionnels en moins de 60 minutes avec l'aide de l'IA."
        : 'Create professional, bank-ready business plans in under 60 minutes with AI-powered guidance.',
  };

  // WebSite schema for search
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sqordia',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // FAQ schema
  const faqItems = [
    {
      question: 'How long does it take to create a business plan?',
      answer:
        'Most users complete their business plan in under 60 minutes. Our AI-guided process streamlines the traditionally lengthy planning process.',
    },
    {
      question: 'Do I need financial expertise?',
      answer:
        'No! Sqordia automatically generates 5-year financial projections, break-even analysis, and all required financial statements based on your inputs.',
    },
    {
      question: 'What export formats are available?',
      answer:
        'You can export your business plan to PDF and Microsoft Word formats. Both are professionally formatted and bank-ready.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes, we take security seriously. All data is encrypted and stored in Canadian data centers, compliant with Quebec Law 25 and PIPEDA.',
    },
  ];

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return { organization, softwareApplication, website, faqPage };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const structuredData = generateStructuredData(locale);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.organization),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.softwareApplication),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.website),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.faqPage),
        }}
      />

      {/* Page Content */}
      <Header />
      <main id="main-content" className="min-h-screen">
        <HeroSection />
        <ValuePropsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}
