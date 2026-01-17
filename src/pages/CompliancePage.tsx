import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, CheckCircle, FileCheck, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompliancePage() {
  const { t, language } = useTheme();
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}</span>
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8" style={{ color: strategyBlue }}>
          {language === 'fr' ? 'Conformité' : 'Compliance'}
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle size={32} style={{ color: momentumOrange }} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Certifications et normes' : 'Certifications & Standards'}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Sqordia est certifié SOC 2 Type II et respecte les normes internationales de sécurité et de protection des données.'
                : 'Sqordia is SOC 2 Type II certified and complies with international security and data protection standards.'}
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileCheck size={32} style={{ color: momentumOrange }} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'GDPR' : 'GDPR'}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Nous sommes conformes au Règlement Général sur la Protection des Données (GDPR) de l\'Union Européenne. Vous avez le droit d\'accéder, de rectifier, de supprimer et de porter vos données personnelles.'
                : 'We comply with the European Union\'s General Data Protection Regulation (GDPR). You have the right to access, rectify, delete, and port your personal data.'}
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={32} style={{ color: momentumOrange }} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'CCPA' : 'CCPA'}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Nous respectons la California Consumer Privacy Act (CCPA) et offrons aux résidents de Californie des droits supplémentaires concernant leurs informations personnelles.'
                : 'We comply with the California Consumer Privacy Act (CCPA) and provide California residents with additional rights regarding their personal information.'}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? 'Audits et rapports' : 'Audits & Reports'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Nous effectuons des audits de sécurité réguliers et maintenons une documentation complète de nos pratiques de conformité. Des rapports de conformité sont disponibles sur demande pour les clients entreprise.'
                : 'We conduct regular security audits and maintain comprehensive documentation of our compliance practices. Compliance reports are available upon request for enterprise clients.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? 'Contact conformité' : 'Compliance Contact'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {language === 'fr'
                ? 'Pour toute question concernant la conformité, veuillez nous contacter à :'
                : 'For any questions regarding compliance, please contact us at:'}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              <a href="mailto:compliance@sqordia.app" className="font-semibold" style={{ color: momentumOrange }}>
                compliance@sqordia.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
