'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Brain } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

const THEME_ORANGE = '#FF6B00';

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/sqordia', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/sqordia', label: 'LinkedIn' },
  { icon: Facebook, href: 'https://facebook.com/sqordia', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/sqordia', label: 'Instagram' },
  { icon: Mail, href: 'mailto:hello@sqordia.com', label: 'Email' },
];

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const homePath = locale === 'fr' ? '/fr' : '/';
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: t('product'),
      links: [
        { label: t('features'), href: `${homePath}#features` },
        { label: t('pricing'), href: `${homePath}#pricing` },
        { label: t('templates'), href: `/${locale}/templates` },
        { label: t('examples'), href: `/${locale}/example-plans` },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('about'), href: `/${locale}/about` },
        { label: t('blog'), href: `/${locale}/blog` },
        { label: t('careers'), href: `/${locale}/careers` },
        { label: t('contact'), href: `${homePath}#contact` },
      ],
    },
    {
      title: t('resources'),
      links: [
        { label: t('documentation'), href: `/${locale}/docs` },
        { label: t('help'), href: `/${locale}/help` },
        { label: t('community'), href: `/${locale}/community` },
        { label: t('webinars'), href: `/${locale}/webinars` },
      ],
    },
    {
      title: t('legal'),
      links: [
        { label: t('privacy'), href: `/${locale}/privacy` },
        { label: t('terms'), href: `/${locale}/terms` },
        { label: t('security'), href: `/${locale}/security` },
        { label: t('compliance'), href: `/${locale}/compliance` },
      ],
    },
  ];

  return (
    <footer
      className="relative overflow-hidden bg-[#0F172A] dark:bg-[#0F172A]"
      role="contentinfo"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full filter blur-[150px] opacity-10"
          style={{ backgroundColor: THEME_ORANGE }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full filter blur-[150px] opacity-10"
          style={{ backgroundColor: THEME_ORANGE }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 md:gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href={homePath} className="flex items-center gap-3 mb-6" aria-label="Sqordia - Home">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: THEME_ORANGE }}
              >
                <Brain className="text-white" size={24} aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold font-heading text-white">Sqordia</span>
            </Link>
            <p className="mb-6 leading-relaxed text-white/70 max-w-sm">
              {t('tagline')}
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
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-white/60">
            &copy; {currentYear} Sqordia. {t('copyright')}
          </p>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            <Link
              href={`/${locale}/privacy`}
              className="text-white/60 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              {t('privacyShort')}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="text-white/60 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              {t('termsShort')}
            </Link>
            <Link
              href={`/${locale}/security`}
              className="text-white/60 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              {t('security')}
            </Link>
            <Link
              href={`/${locale}/compliance`}
              className="text-white/60 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              {t('compliance')}
            </Link>
          </div>

          <p className="text-sm text-white/60">
            {t('builtIn')}
          </p>
        </div>
      </div>
    </footer>
  );
}
