import { useState, useCallback, useMemo } from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Brain, Shield, MapPin, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';
import { subscribeToNewsletter } from '@/lib/newsletter-service';

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
  const { getBlockContent } = usePublishedContent();
  const homePath = language === 'fr' ? '/fr' : '/';
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const isDark = theme === 'dark';

  const resolvedSocialLinks = useMemo(() => {
    const twitterUrl = getBlockContent('global.social.twitter');
    const linkedinUrl = getBlockContent('global.social.linkedin');
    const facebookUrl = getBlockContent('global.social.facebook');
    const instagramUrl = getBlockContent('global.social.instagram');
    const emailUrl = getBlockContent('global.social.email');

    if (twitterUrl || linkedinUrl || facebookUrl || instagramUrl || emailUrl) {
      return [
        { icon: Twitter, href: twitterUrl || 'https://twitter.com/sqordia', label: 'Twitter' },
        { icon: Linkedin, href: linkedinUrl || 'https://linkedin.com/company/sqordia', label: 'LinkedIn' },
        { icon: Facebook, href: facebookUrl || 'https://facebook.com/sqordia', label: 'Facebook' },
        { icon: Instagram, href: instagramUrl || 'https://instagram.com/sqordia', label: 'Instagram' },
        { icon: Mail, href: emailUrl || 'mailto:hello@sqordia.com', label: 'Email' },
      ];
    }
    return socialLinks;
  }, [getBlockContent]);

  const footerTagline = getBlockContent('global.footer.tagline', t('footer.tagline'));
  const footerCopyright = getBlockContent('global.footer.copyright', t('footer.copyright'));
  const cmsLogoUrl = getBlockContent('global.branding.logo_url');

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

  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'invalid'>('idle');

  const handleNewsletterSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setNewsletterStatus('invalid');
      return;
    }

    setNewsletterStatus('loading');

    const result = await subscribeToNewsletter(trimmed, language);

    if (result.success) {
      setNewsletterStatus('success');
      setEmail('');
    } else if (result.alreadySubscribed) {
      setNewsletterStatus('already');
    } else {
      setNewsletterStatus('invalid');
    }
  }, [email, language]);

  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: isDark ? '#0B0C0A' : '#161714' }}
      role="contentinfo"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full filter blur-[150px] opacity-[0.06]"
          style={{ backgroundColor: '#FF6B00' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full filter blur-[150px] opacity-[0.06]"
          style={{ backgroundColor: '#FF6B00' }}
        />
      </div>

      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-20 relative z-10">
        {/* Newsletter signup */}
        <div className="mb-8 sm:mb-14 pb-8 sm:pb-12 border-b border-white/[0.06]">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-bold font-heading text-white mb-2">
              {t('footer.newsletter.title')}
            </h3>
            <p className="text-sm text-white/50 mb-5">
              {t('footer.newsletter.subtitle')}
            </p>
            {newsletterStatus === 'success' ? (
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium max-w-md mx-auto">
                <Check size={16} className="shrink-0" />
                {t('footer.newsletter.success')}
              </div>
            ) : (
              <>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (newsletterStatus !== 'idle' && newsletterStatus !== 'loading') {
                        setNewsletterStatus('idle');
                      }
                    }}
                    placeholder={t('footer.newsletter.placeholder')}
                    required
                    disabled={newsletterStatus === 'loading'}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-xl bg-white/[0.06] border text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-momentum-orange/50 focus:border-momentum-orange/40 backdrop-blur-sm transition-all duration-200 disabled:opacity-50',
                      newsletterStatus === 'invalid' || newsletterStatus === 'already'
                        ? 'border-red-500/50'
                        : 'border-white/[0.08]',
                    )}
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'loading'}
                    className="px-6 py-3 rounded-xl bg-momentum-orange hover:bg-[#E55F00] text-white font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-momentum-orange/50 shadow-[0_2px_8px_rgba(255,107,0,0.2)] hover:shadow-[0_4px_16px_rgba(255,107,0,0.3)] whitespace-nowrap disabled:opacity-70 flex items-center justify-center gap-2 sm:min-w-[120px]"
                  >
                    {newsletterStatus === 'loading' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      t('footer.newsletter.cta')
                    )}
                  </button>
                </form>
                {(newsletterStatus === 'invalid' || newsletterStatus === 'already') && (
                  <p className="text-red-400 text-xs mt-2 text-center">
                    {t(`footer.newsletter.${newsletterStatus}`)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Top section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-14">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to={homePath} className="flex items-center gap-3 mb-6 group" aria-label="Sqordia - Home">
              {cmsLogoUrl ? (
                <img
                  src={cmsLogoUrl}
                  alt="Sqordia"
                  className="w-10 h-10 rounded-xl object-contain transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-momentum-orange flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                  <Brain className="text-white" size={20} aria-hidden="true" />
                </div>
              )}
              <span className="text-xl font-bold font-heading text-white">Sqordia</span>
            </Link>
            <p className="mb-6 leading-relaxed text-white/50 max-w-sm text-sm">
              {footerTagline}
            </p>

            {/* Compliance badges */}
            <div className="flex flex-col gap-2.5 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/70 text-xs font-medium w-fit">
                <MapPin size={14} className="text-green-400 shrink-0" aria-hidden="true" />
                {t('footer.compliance.dataCanada')}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/70 text-xs font-medium w-fit">
                <Shield size={14} className="text-blue-400 shrink-0" aria-hidden="true" />
                {t('footer.compliance.law25')}
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-2">
              {resolvedSocialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 text-white/40 hover:text-white hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/30"
                    aria-label={social.label}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-heading text-xs font-bold text-white/80 uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-white/80 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-white/40 hover:text-white/80 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
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
        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            &copy; {currentYear} Sqordia. {footerCopyright}
          </p>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs">
            <Link to="/privacy" className="text-white/30 hover:text-white/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 rounded">
              {t('footer.privacyShort')}
            </Link>
            <Link to="/terms" className="text-white/30 hover:text-white/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 rounded">
              {t('footer.termsShort')}
            </Link>
            <Link to="/security" className="text-white/30 hover:text-white/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 rounded">
              {t('footer.security')}
            </Link>
            <Link to="/compliance" className="text-white/30 hover:text-white/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 rounded">
              {t('footer.compliance')}
            </Link>
          </div>

          <p className="text-xs text-white/30">
            {t('footer.builtIn')}
          </p>
        </div>
      </div>
    </footer>
  );
}
