import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Shield, Lock, Key, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';

export default function SecurityPage() {
  const { t, language } = useTheme();
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEO
        title={language === 'fr' 
          ? "Sécurité | Sqordia"
          : "Security | Sqordia"}
        description={language === 'fr'
          ? "Découvrez les mesures de sécurité de niveau bancaire que Sqordia utilise pour protéger vos données et vos informations d'affaires."
          : "Learn about the bank-level security measures Sqordia uses to protect your data and business information."}
        url={getCanonicalUrl('/security')}
      />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}</span>
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8" style={{ color: strategyBlue }}>
          {language === 'fr' ? 'Sécurité' : 'Security'}
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={32} style={{ color: momentumOrange }} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Sécurité de niveau bancaire' : 'Bank-Level Security'}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Vos données sont protégées par un chiffrement AES-256 et une conformité SOC 2. Nous ne partageons jamais vos informations.'
                : 'Your data is protected with AES-256 encryption and SOC 2 compliance. We never share your information.'}
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Lock size={32} style={{ color: momentumOrange }} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Chiffrement des données' : 'Data Encryption'}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Toutes les données sont chiffrées en transit et au repos. Nous utilisons des protocoles TLS 1.3 pour toutes les communications et un chiffrement AES-256 pour le stockage.'
                : 'All data is encrypted in transit and at rest. We use TLS 1.3 protocols for all communications and AES-256 encryption for storage.'}
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Key size={32} style={{ color: momentumOrange }} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Authentification sécurisée' : 'Secure Authentication'}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Nous utilisons des mots de passe hachés avec bcrypt et supportons l\'authentification à deux facteurs (2FA) pour une sécurité supplémentaire.'
                : 'We use bcrypt-hashed passwords and support two-factor authentication (2FA) for additional security.'}
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Eye size={32} style={{ color: momentumOrange }} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Surveillance et conformité' : 'Monitoring & Compliance'}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Nous surveillons en permanence notre infrastructure pour détecter toute activité suspecte. Nous sommes certifiés SOC 2 Type II et respectons les normes GDPR et CCPA.'
                : 'We continuously monitor our infrastructure to detect any suspicious activity. We are SOC 2 Type II certified and comply with GDPR and CCPA standards.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? 'Contact sécurité' : 'Security Contact'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {language === 'fr'
                ? 'Pour signaler une vulnérabilité de sécurité ou pour toute question concernant la sécurité, veuillez nous contacter à :'
                : 'To report a security vulnerability or for any security-related questions, please contact us at:'}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              <a href="mailto:security@sqordia.app" className="font-semibold" style={{ color: momentumOrange }}>
                security@sqordia.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
