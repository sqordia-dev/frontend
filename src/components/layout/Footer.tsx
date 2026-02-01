import { Facebook, Twitter, Linkedin, Instagram, Mail, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/sqordia', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/sqordia', label: 'LinkedIn' },
  { icon: Facebook, href: 'https://facebook.com/sqordia', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/sqordia', label: 'Instagram' },
  { icon: Mail, href: 'mailto:hello@sqordia.com', label: 'Email' },
];

export default function Footer() {
  const { theme, t, language } = useTheme();
  const homePath = language === 'fr' ? '/fr' : '/';
  const currentYear = new Date().getFullYear();

  const isDark = theme === 'dark';

  const footerSections: FooterSection[] = [
    {
      title: t('footer.product'),
      links: [
        { label: t('footer.features'), href: `${homePath}#features` },
        { label: t('footer.pricing'), href: `${homePath}#pricing` },
        { label: t('footer.templates'), href: '/templates' },
        { label: t('footer.examples'), href: '/example-plans' },
        { label: t('footer.api'), href: '/api', isExternal: true },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), href: '/about' },
        { label: t('footer.blog'), href: '/blog' },
        { label: t('footer.careers'), href: '/careers' },
        { label: t('footer.contact'), href: `${homePath}#contact` },
        { label: t('footer.partners'), href: '/partners' },
      ],
    },
    {
      title: t('footer.resources'),
      links: [
        { label: t('footer.documentation'), href: '/docs' },
        { label: t('footer.help'), href: '/help' },
        { label: t('footer.community'), href: '/community' },
        { label: t('footer.webinars'), href: '/webinars' },
        { label: t('footer.status'), href: '/status', isExternal: true },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), href: '/privacy' },
        { label: t('footer.terms'), href: '/terms' },
        { label: t('footer.security'), href: '/security' },
        { label: t('footer.compliance'), href: '/compliance' },
        { label: t('footer.cookies'), href: '/cookies' },
      ],
    },
  ];

  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: isDark ? '#0F172A' : '#1A2B47' }}
      role="contentinfo"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full filter blur-[150px] opacity-10"
          style={{ backgroundColor: '#FF6B00' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full filter blur-[150px] opacity-10"
          style={{ backgroundColor: '#FF6B00' }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 md:gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to={homePath} className="flex items-center gap-3 mb-6" aria-label="Sqordia - Home">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#FF6B00' }}
              >
                <Brain className="text-white" size={24} aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold font-heading text-white">Sqordia</span>
            </Link>
            <p className="mb-6 leading-relaxed text-white/70 max-w-sm">
              {t('footer.tagline')}
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 text-white/70 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={social.label}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-white transition-colors duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-white/70 hover:text-white transition-colors duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div
          className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <p className="text-sm text-white/60">
            &copy; {currentYear} Sqordia. {t('footer.copyright')}
          </p>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            <Link
              to="/privacy"
              className="text-white/60 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              {t('footer.privacyShort')}
            </Link>
            <Link
              to="/terms"
              className="text-white/60 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              {t('footer.termsShort')}
            </Link>
            <Link
              to="/security"
              className="text-white/60 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              {t('footer.security')}
            </Link>
            <Link
              to="/compliance"
              className="text-white/60 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              {t('footer.compliance')}
            </Link>
          </div>

          <p className="text-sm text-white/60">
            {t('footer.builtIn')}
          </p>
        </div>
      </div>
    </footer>
  );
}
