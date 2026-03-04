import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Key, Eye } from 'lucide-react';
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
    en: 'Security | Sqordia',
    fr: 'Sécurité | Sqordia',
  };

  const descriptions = {
    en: 'Learn about the bank-level security measures Sqordia uses to protect your data and business information.',
    fr: "Découvrez les mesures de sécurité de niveau bancaire que Sqordia utilise pour protéger vos données et vos informations d'affaires.",
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/security`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/security`,
        fr: `${baseUrl}/fr/security`,
        'x-default': `${baseUrl}/security`,
      },
    },
  };
}

const content = {
  en: {
    backToHome: 'Back to Home',
    title: 'Security',
    sections: [
      {
        icon: 'shield',
        title: 'Bank-Level Security',
        content:
          'Your data is protected with AES-256 encryption and SOC 2 compliance. We never share your information.',
      },
      {
        icon: 'lock',
        title: 'Data Encryption',
        content:
          'All data is encrypted in transit and at rest. We use TLS 1.3 protocols for all communications and AES-256 encryption for storage.',
      },
      {
        icon: 'key',
        title: 'Secure Authentication',
        content:
          'We use bcrypt-hashed passwords and support two-factor authentication (2FA) for additional security.',
      },
      {
        icon: 'eye',
        title: 'Monitoring & Compliance',
        content:
          'We continuously monitor our infrastructure to detect any suspicious activity. We are SOC 2 Type II certified and comply with GDPR and CCPA standards.',
      },
    ],
    contactTitle: 'Security Contact',
    contactText:
      'To report a security vulnerability or for any security-related questions, please contact us at:',
    email: 'security@sqordia.app',
  },
  fr: {
    backToHome: "Retour à l'accueil",
    title: 'Sécurité',
    sections: [
      {
        icon: 'shield',
        title: 'Sécurité de niveau bancaire',
        content:
          'Vos données sont protégées par un chiffrement AES-256 et une conformité SOC 2. Nous ne partageons jamais vos informations.',
      },
      {
        icon: 'lock',
        title: 'Chiffrement des données',
        content:
          'Toutes les données sont chiffrées en transit et au repos. Nous utilisons des protocoles TLS 1.3 pour toutes les communications et un chiffrement AES-256 pour le stockage.',
      },
      {
        icon: 'key',
        title: 'Authentification sécurisée',
        content:
          "Nous utilisons des mots de passe hachés avec bcrypt et supportons l'authentification à deux facteurs (2FA) pour une sécurité supplémentaire.",
      },
      {
        icon: 'eye',
        title: 'Surveillance et conformité',
        content:
          'Nous surveillons en permanence notre infrastructure pour détecter toute activité suspecte. Nous sommes certifiés SOC 2 Type II et respectons les normes GDPR et CCPA.',
      },
    ],
    contactTitle: 'Contact sécurité',
    contactText:
      'Pour signaler une vulnérabilité de sécurité ou pour toute question concernant la sécurité, veuillez nous contacter à :',
    email: 'security@sqordia.app',
  },
};

const iconMap = {
  shield: Shield,
  lock: Lock,
  key: Key,
  eye: Eye,
};

export default async function SecurityPage({
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
