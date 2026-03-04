import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Header from '@/components/nextjs/Header';
import Footer from '@/components/nextjs/Footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Privacy Policy | Sqordia',
    fr: 'Politique de Confidentialité | Sqordia',
  };

  const descriptions = {
    en: "Read Sqordia's privacy policy to understand how we collect, use, and protect your personal data.",
    fr: 'Consultez la politique de confidentialité de Sqordia pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles.',
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/privacy`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/privacy`,
        fr: `${baseUrl}/fr/privacy`,
        'x-default': `${baseUrl}/privacy`,
      },
    },
  };
}

const content = {
  en: {
    backToHome: 'Back to Home',
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: January 1, 2025',
    sections: [
      {
        title: '1. Introduction',
        content:
          'Sqordia ("we", "our", "us") is committed to protecting your privacy. This privacy policy explains how we collect, use, disclose, and protect your personal information when you use our service.',
      },
      {
        title: '2. Information We Collect',
        content:
          'We collect information you provide directly to us, such as your name, email address, and business plan information. We also automatically collect technical information when you use our service.',
      },
      {
        title: '3. How We Use Your Information',
        content:
          'We use your information to provide, maintain, and improve our services, process your transactions, send you notifications, and personalize your experience.',
      },
      {
        title: '4. Sharing Your Information',
        content:
          'We do not sell your personal information. We may share your information only in the following cases: with your consent, to comply with laws, or to protect our rights.',
      },
      {
        title: '5. Security',
        content:
          'We use industry-standard security measures to protect your personal information. All data is encrypted in transit and at rest using AES-256 encryption.',
      },
      {
        title: '6. Data Storage in Canada',
        content:
          'All your data is stored in Canadian data centers to ensure compliance with Quebec Law 25 (Bill 64) and PIPEDA. We do not transfer your data outside of Canada without your explicit consent.',
      },
      {
        title: '7. Your Rights',
        content:
          'You have the right to access, correct, delete, or port your personal information. You can also withdraw your consent at any time. Contact us to exercise these rights.',
      },
      {
        title: '8. Contact Us',
        content:
          'If you have questions about this privacy policy, please contact us at privacy@sqordia.com or through our support channels.',
      },
    ],
  },
  fr: {
    backToHome: "Retour à l'accueil",
    title: 'Politique de Confidentialité',
    lastUpdated: 'Dernière mise à jour : 1er janvier 2025',
    sections: [
      {
        title: '1. Introduction',
        content:
          "Sqordia (« nous », « notre », « nos ») s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations personnelles lorsque vous utilisez notre service.",
      },
      {
        title: '2. Informations que nous collectons',
        content:
          "Nous collectons les informations que vous nous fournissez directement, telles que votre nom, adresse courriel et les informations de votre plan d'affaires. Nous collectons également des informations techniques automatiquement lorsque vous utilisez notre service.",
      },
      {
        title: '3. Comment nous utilisons vos informations',
        content:
          'Nous utilisons vos informations pour fournir, maintenir et améliorer nos services, traiter vos transactions, vous envoyer des notifications et personnaliser votre expérience.',
      },
      {
        title: '4. Partage de vos informations',
        content:
          'Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants : avec votre consentement, pour se conformer aux lois, ou pour protéger nos droits.',
      },
      {
        title: '5. Sécurité',
        content:
          "Nous utilisons des mesures de sécurité conformes aux normes de l'industrie pour protéger vos informations personnelles. Toutes les données sont chiffrées en transit et au repos avec un chiffrement AES-256.",
      },
      {
        title: '6. Stockage des données au Canada',
        content:
          'Toutes vos données sont stockées dans des centres de données canadiens pour assurer la conformité avec la Loi 25 du Québec (Projet de loi 64) et la LPRPDE. Nous ne transférons pas vos données en dehors du Canada sans votre consentement explicite.',
      },
      {
        title: '7. Vos droits',
        content:
          "Vous avez le droit d'accéder, de corriger, de supprimer ou de transférer vos informations personnelles. Vous pouvez également retirer votre consentement à tout moment. Contactez-nous pour exercer ces droits.",
      },
      {
        title: '8. Nous contacter',
        content:
          'Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à privacy@sqordia.com ou via nos canaux de support.',
      },
    ],
  },
};

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const pageContent = content[locale as keyof typeof content] || content.en;

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Link
            href={locale === 'fr' ? '/fr' : '/'}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{pageContent.backToHome}</span>
          </Link>

          <h1 className="text-4xl font-bold text-[#1A2B47] dark:text-white mb-4">
            {pageContent.title}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {pageContent.lastUpdated}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {pageContent.sections.map((section, index) => (
              <section key={index} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
