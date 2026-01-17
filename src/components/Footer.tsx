import { Facebook, Twitter, Linkedin, Mail, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Footer() {
  const { t } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-white" style={{ backgroundColor: '#0F172A' }}>
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Branding */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FF6B00' }}>
                <Brain className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold font-heading">Sqordia</span>
            </div>
            <p className="mb-6 leading-relaxed max-w-md" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="#"
                className="w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF6B00'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF6B00'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF6B00'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF6B00'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">{t('footer.product')}</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/#features" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.features')}
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/example-plans" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.caseStudies')}
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.demo')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.careers')}
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.blog')}
                </a>
              </li>
              <li>
                <Link to="/#contact" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.documentation')}
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.help')}
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.templates')}
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {t('footer.api')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t pt-8" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              © {currentYear} Sqordia. {t('footer.copyright')}
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
              <Link to="/privacy" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {t('footer.terms')}
              </Link>
              <Link to="/security" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {t('footer.security')}
              </Link>
              <Link to="/compliance" className="block py-2 hover:text-white transition-colors min-h-[44px] flex items-center" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {t('footer.compliance')}
              </Link>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {t('footer.slogan')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
