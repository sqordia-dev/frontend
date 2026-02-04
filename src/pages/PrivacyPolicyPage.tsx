import { useTheme } from '../contexts/ThemeContext';
import { useCmsContent } from '../hooks/useCmsContent';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';

export default function PrivacyPolicyPage() {
  const { language } = useTheme();
  const { getContent: cms } = useCmsContent('legal');
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEO
        title={language === 'fr' 
          ? "Politique de Confidentialité | Sqordia"
          : "Privacy Policy | Sqordia"}
        description={language === 'fr'
          ? "Consultez la politique de confidentialité de Sqordia pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles."
          : "Read Sqordia's privacy policy to understand how we collect, use, and protect your personal data."}
        url={getCanonicalUrl('/privacy')}
      />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{cms('legal.back_to_home', '') || (language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home')}</span>
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8" style={{ color: strategyBlue }}>
          {cms('legal.privacy_title', '') || (language === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy')}
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {cms('legal.privacy_last_updated', '') || (
              (language === 'fr'
                ? 'Dernière mise à jour : '
                : 'Last updated: ') +
              new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            )}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '1. Introduction' : '1. Introduction'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Sqordia ("nous", "notre", "nos") s\'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations personnelles lorsque vous utilisez notre service.'
                : 'Sqordia ("we", "our", "us") is committed to protecting your privacy. This privacy policy explains how we collect, use, disclose, and protect your personal information when you use our service.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '2. Informations que nous collectons' : '2. Information We Collect'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Nous collectons les informations que vous nous fournissez directement, telles que votre nom, adresse e-mail, et les informations de votre plan d\'affaires. Nous collectons également des informations techniques automatiquement lorsque vous utilisez notre service.'
                : 'We collect information you provide directly to us, such as your name, email address, and business plan information. We also automatically collect technical information when you use our service.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '3. Comment nous utilisons vos informations' : '3. How We Use Your Information'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Nous utilisons vos informations pour fournir, maintenir et améliorer nos services, traiter vos transactions, vous envoyer des notifications, et personnaliser votre expérience.'
                : 'We use your information to provide, maintain, and improve our services, process your transactions, send you notifications, and personalize your experience.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '4. Partage de vos informations' : '4. Sharing Your Information'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants : avec votre consentement, pour se conformer aux lois, ou pour protéger nos droits.'
                : 'We do not sell your personal information. We may share your information only in the following cases: with your consent, to comply with laws, or to protect our rights.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '5. Sécurité' : '5. Security'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations contre tout accès non autorisé, altération, divulgation ou destruction.'
                : 'We implement appropriate security measures to protect your information against unauthorized access, alteration, disclosure, or destruction.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '6. Vos droits' : '6. Your Rights'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Vous avez le droit d\'accéder, de corriger, de supprimer ou de limiter le traitement de vos informations personnelles. Vous pouvez exercer ces droits en nous contactant.'
                : 'You have the right to access, correct, delete, or limit the processing of your personal information. You can exercise these rights by contacting us.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '7. Contact' : '7. Contact'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {language === 'fr'
                ? 'Pour toute question concernant cette politique de confidentialité, veuillez nous contacter à :'
                : 'For any questions regarding this privacy policy, please contact us at:'}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              <a href="mailto:privacy@sqordia.app" className="font-semibold" style={{ color: momentumOrange }}>
                privacy@sqordia.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
