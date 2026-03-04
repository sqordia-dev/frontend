import Link from 'next/link';
import { ArrowLeft, CheckCircle, FileCheck, Shield, MapPin } from 'lucide-react';
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
    en: 'Compliance | Sqordia',
    fr: 'Conformité | Sqordia',
  };

  const descriptions = {
    en: 'Learn about the certifications and compliance standards that Sqordia adheres to ensure security and compliance of our services.',
    fr: 'Découvrez les certifications et normes de conformité que Sqordia respecte pour garantir la sécurité et la conformité de nos services.',
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/compliance`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/compliance`,
        fr: `${baseUrl}/fr/compliance`,
        'x-default': `${baseUrl}/compliance`,
      },
    },
  };
}

const content = {
  en: {
    backToHome: 'Back to Home',
    title: 'Compliance',
    sections: [
      {
        icon: 'check',
        title: 'Certifications & Standards',
        content:
          'Sqordia is SOC 2 Type II certified and complies with international security and data protection standards.',
      },
      {
        icon: 'file',
        title: 'GDPR',
        content:
          "We comply with the European Union's General Data Protection Regulation (GDPR). You have the right to access, rectify, delete, and port your personal data.",
      },
      {
        icon: 'shield',
        title: 'CCPA',
        content:
          'We comply with the California Consumer Privacy Act (CCPA) and provide California residents with additional rights regarding their personal information.',
      },
      {
        icon: 'map',
        title: 'Quebec Law 25 (Bill 64)',
        content:
          'We are fully compliant with Quebec Law 25 (Bill 64) and PIPEDA. All your data is stored in Canadian data centers to ensure compliance with Canadian privacy regulations.',
      },
    ],
    auditsTitle: 'Audits & Reports',
    auditsText:
      'We conduct regular security audits and maintain comprehensive documentation of our compliance practices. Compliance reports are available upon request for enterprise clients.',
    contactTitle: 'Compliance Contact',
    contactText: 'For any questions regarding compliance, please contact us at:',
    email: 'compliance@sqordia.app',
  },
  fr: {
    backToHome: "Retour à l'accueil",
    title: 'Conformité',
    sections: [
      {
        icon: 'check',
        title: 'Certifications et normes',
        content:
          'Sqordia est certifié SOC 2 Type II et respecte les normes internationales de sécurité et de protection des données.',
      },
      {
        icon: 'file',
        title: 'RGPD',
        content:
          "Nous sommes conformes au Règlement Général sur la Protection des Données (RGPD) de l'Union Européenne. Vous avez le droit d'accéder, de rectifier, de supprimer et de porter vos données personnelles.",
      },
      {
        icon: 'shield',
        title: 'CCPA',
        content:
          'Nous respectons la California Consumer Privacy Act (CCPA) et offrons aux résidents de Californie des droits supplémentaires concernant leurs informations personnelles.',
      },
      {
        icon: 'map',
        title: 'Loi 25 du Québec (Projet de loi 64)',
        content:
          'Nous sommes entièrement conformes à la Loi 25 du Québec (Projet de loi 64) et à la LPRPDE. Toutes vos données sont stockées dans des centres de données canadiens pour assurer la conformité avec les réglementations canadiennes en matière de protection de la vie privée.',
      },
    ],
    auditsTitle: 'Audits et rapports',
    auditsText:
      'Nous effectuons des audits de sécurité réguliers et maintenons une documentation complète de nos pratiques de conformité. Des rapports de conformité sont disponibles sur demande pour les clients entreprise.',
    contactTitle: 'Contact conformité',
    contactText: 'Pour toute question concernant la conformité, veuillez nous contacter à :',
    email: 'compliance@sqordia.app',
  },
};

const iconMap = {
  check: CheckCircle,
  file: FileCheck,
  shield: Shield,
  map: MapPin,
};

export default async function CompliancePage({
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

          <h1 className="text-4xl font-bold text-[#1A2B47] dark:text-white mb-8">
            {pageContent.title}
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {pageContent.sections.map((section, index) => {
              const IconComponent = iconMap[section.icon as keyof typeof iconMap];
              return (
                <section key={index} className="mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <IconComponent size={32} className="text-[#FF6B00]" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                </section>
              );
            })}

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {pageContent.auditsTitle}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {pageContent.auditsText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {pageContent.contactTitle}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {pageContent.contactText}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <a
                  href={`mailto:${pageContent.email}`}
                  className="font-semibold text-[#FF6B00] hover:underline"
                >
                  {pageContent.email}
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
