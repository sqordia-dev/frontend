import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfServicePage() {
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
          {language === 'fr' ? 'Conditions d\'Utilisation' : 'Terms of Service'}
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {language === 'fr' 
              ? 'Dernière mise à jour : ' 
              : 'Last updated: '}
            {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '1. Acceptation des conditions' : '1. Acceptance of Terms'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'En accédant et en utilisant Sqordia, vous acceptez d\'être lié par ces conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser notre service.'
                : 'By accessing and using Sqordia, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '2. Description du service' : '2. Description of Service'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Sqordia est une plateforme de planification stratégique améliorée par l\'IA qui aide les utilisateurs à créer des plans d\'affaires professionnels. Nous nous réservons le droit de modifier ou d\'interrompre le service à tout moment.'
                : 'Sqordia is an AI-enhanced strategic planning platform that helps users create professional business plans. We reserve the right to modify or discontinue the service at any time.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '3. Compte utilisateur' : '3. User Account'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Vous êtes responsable de maintenir la confidentialité de votre compte et de votre mot de passe. Vous acceptez de nous notifier immédiatement de toute utilisation non autorisée de votre compte.'
                : 'You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '4. Propriété intellectuelle' : '4. Intellectual Property'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Tout le contenu de Sqordia, y compris les textes, graphiques, logos et logiciels, est la propriété de Sqordia ou de ses concédants de licence et est protégé par les lois sur le droit d\'auteur.'
                : 'All content on Sqordia, including text, graphics, logos, and software, is the property of Sqordia or its licensors and is protected by copyright laws.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '5. Limitation de responsabilité' : '5. Limitation of Liability'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Sqordia est fourni "tel quel" sans garantie d\'aucune sorte. Nous ne serons pas responsables des dommages directs, indirects, accessoires ou consécutifs résultant de l\'utilisation de notre service.'
                : 'Sqordia is provided "as is" without warranty of any kind. We shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of our service.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? '6. Contact' : '6. Contact'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {language === 'fr'
                ? 'Pour toute question concernant ces conditions d\'utilisation, veuillez nous contacter à :'
                : 'For any questions regarding these Terms of Service, please contact us at:'}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              <a href="mailto:legal@sqordia.app" className="font-semibold" style={{ color: momentumOrange }}>
                legal@sqordia.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
