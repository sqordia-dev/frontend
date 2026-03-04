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
    en: 'Terms of Service | Sqordia',
    fr: "Conditions d'Utilisation | Sqordia",
  };

  const descriptions = {
    en: "Read Sqordia's terms of service to understand the terms and conditions for using our platform.",
    fr: "Consultez les conditions d'utilisation de Sqordia pour comprendre les termes et conditions d'utilisation de notre plateforme.",
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/terms`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/terms`,
        fr: `${baseUrl}/fr/terms`,
        'x-default': `${baseUrl}/terms`,
      },
    },
  };
}

const content = {
  en: {
    backToHome: 'Back to Home',
    title: 'Terms of Service',
    lastUpdated: 'Last updated: January 1, 2025',
    sections: [
      {
        title: '1. Acceptance of Terms',
        content:
          'By accessing or using Sqordia, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.',
      },
      {
        title: '2. Description of Service',
        content:
          'Sqordia provides AI-powered business planning tools that help you create professional business plans, financial projections, and strategic documents.',
      },
      {
        title: '3. User Accounts',
        content:
          'You must create an account to use our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.',
      },
      {
        title: '4. User Content',
        content:
          'You retain all rights to the content you create using Sqordia. You grant us a limited license to process your content solely to provide our services to you.',
      },
      {
        title: '5. Prohibited Uses',
        content:
          'You may not use Sqordia for any unlawful purpose, to violate intellectual property rights, to transmit malware, or to interfere with the service.',
      },
      {
        title: '6. Subscriptions and Payments',
        content:
          'Paid subscriptions are billed in advance on a monthly or annual basis. Refunds are available within 14 days of initial purchase if you have not used the generation features.',
      },
      {
        title: '7. Limitation of Liability',
        content:
          'Sqordia provides tools to assist with business planning, but we are not responsible for business decisions made based on the generated content. Always consult with qualified professionals.',
      },
      {
        title: '8. Changes to Terms',
        content:
          'We may update these terms from time to time. We will notify you of significant changes via email or through the service.',
      },
    ],
  },
  fr: {
    backToHome: "Retour à l'accueil",
    title: "Conditions d'Utilisation",
    lastUpdated: 'Dernière mise à jour : 1er janvier 2025',
    sections: [
      {
        title: "1. Acceptation des conditions",
        content:
          "En accédant ou en utilisant Sqordia, vous acceptez d'être lié par ces Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.",
      },
      {
        title: '2. Description du service',
        content:
          "Sqordia fournit des outils de planification d'affaires propulsés par l'IA qui vous aident à créer des plans d'affaires professionnels, des projections financières et des documents stratégiques.",
      },
      {
        title: '3. Comptes utilisateurs',
        content:
          'Vous devez créer un compte pour utiliser nos services. Vous êtes responsable de maintenir la confidentialité de vos identifiants de compte et de toutes les activités sous votre compte.',
      },
      {
        title: '4. Contenu utilisateur',
        content:
          'Vous conservez tous les droits sur le contenu que vous créez avec Sqordia. Vous nous accordez une licence limitée pour traiter votre contenu uniquement pour vous fournir nos services.',
      },
      {
        title: '5. Utilisations interdites',
        content:
          "Vous ne pouvez pas utiliser Sqordia à des fins illégales, pour violer des droits de propriété intellectuelle, pour transmettre des logiciels malveillants ou pour interférer avec le service.",
      },
      {
        title: '6. Abonnements et paiements',
        content:
          "Les abonnements payants sont facturés à l'avance sur une base mensuelle ou annuelle. Les remboursements sont disponibles dans les 14 jours suivant l'achat initial si vous n'avez pas utilisé les fonctions de génération.",
      },
      {
        title: '7. Limitation de responsabilité',
        content:
          "Sqordia fournit des outils pour aider à la planification d'affaires, mais nous ne sommes pas responsables des décisions commerciales prises sur la base du contenu généré. Consultez toujours des professionnels qualifiés.",
      },
      {
        title: '8. Modifications des conditions',
        content:
          'Nous pouvons mettre à jour ces conditions de temps en temps. Nous vous informerons des changements importants par courriel ou via le service.',
      },
    ],
  },
};

export default async function TermsOfServicePage({
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
