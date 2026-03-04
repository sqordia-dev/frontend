import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import {
  Hero,
  LogoCloud,
  ValueProps,
  Features,
  Testimonials,
  FinalCTA,
  FAQ,
} from '../components/landing';
import ScrollButton from '../components/ScrollButton';
import CookieConsent from '../components/CookieConsent';
import SEO from '../components/SEO';
import { useTheme } from '../contexts/ThemeContext';

const FAQ_COUNT = 8;

export default function LandingPageNew() {
  const { language, setLanguage, t } = useTheme();
  const location = useLocation();

  // Sync language with URL locale: /fr shows French, / shows English
  useEffect(() => {
    if (location.pathname === '/fr') {
      setLanguage('fr');
    } else if (location.pathname === '/') {
      setLanguage('en');
    }
  }, [location.pathname, setLanguage]);

  useEffect(() => {
    // Check if we need to scroll to a specific section after navigation
    const scrollToSection = sessionStorage.getItem('scrollToSection');
    if (scrollToSection) {
      sessionStorage.removeItem('scrollToSection');

      setTimeout(() => {
        const element = document.getElementById(scrollToSection);
        if (element) {
          const headerHeight = 80;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerHeight - 20;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }, []);

  // Structured data for SEO
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Sqordia',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1250',
      },
      description:
        language === 'fr'
          ? "Plateforme de planification d'affaires alimentee par l'IA qui cree des plans d'affaires professionnels et prets pour les banques en moins de 60 minutes."
          : 'AI-powered business planning platform that creates professional, bank-ready business plans in under 60 minutes.',
      url: 'https://sqordia.com',
      logo: 'https://sqordia.com/favicon.svg',
      screenshot: 'https://sqordia.com/screenshot.jpg',
      featureList: [
        language === 'fr'
          ? "Generation de plan d'affaires alimentee par l'IA"
          : 'AI-powered business plan generation',
        language === 'fr'
          ? 'Projections financieres automatisees'
          : 'Automated financial projections',
        language === 'fr'
          ? 'Analyse de marche et recherche concurrentielle'
          : 'Market analysis and competitor research',
        language === 'fr'
          ? 'Documentation prete pour les investisseurs'
          : 'Investor-ready documentation',
        language === 'fr'
          ? 'Planification strategique pour les OBNL'
          : 'Nonprofit strategic planning',
        language === 'fr'
          ? 'Export multi-format (PDF, Word, Excel)'
          : 'Multi-format export (PDF, Word, Excel)',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Sqordia',
      url: 'https://sqordia.com',
      logo: 'https://sqordia.com/favicon.svg',
      description:
        language === 'fr'
          ? "Plateforme de planification d'affaires alimentee par l'IA pour les startups, les organismes sans but lucratif et les entreprises en croissance."
          : 'AI-powered business planning platform for startups, nonprofits, and growing businesses.',
      sameAs: [
        'https://twitter.com/sqordia',
        'https://linkedin.com/company/sqordia',
        'https://facebook.com/sqordia',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@sqordia.com',
      },
    },
    // FAQPage schema for Google rich snippets
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: Array.from({ length: FAQ_COUNT }, (_, i) => ({
        '@type': 'Question',
        name: t(`landing.faq.q${i + 1}.question`),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t(`landing.faq.q${i + 1}.answer`),
        },
      })),
    },
  ];

  return (
    <>
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-to-main">
        {language === 'fr' ? 'Aller au contenu principal' : 'Skip to main content'}
      </a>

      <SEO
        title={
          language === 'fr'
            ? "Sqordia - Planification d'affaires alimentee par l'IA en moins de 60 minutes"
            : 'Sqordia - AI-Powered Business Planning in Under 60 Minutes'
        }
        description={
          language === 'fr'
            ? "Creez des plans d'affaires professionnels et prets pour les banques en moins de 60 minutes avec la plateforme Sqordia alimentee par l'IA. Repondez a 20 questions simples et obtenez des projections financieres automatisees, une analyse de marche et une documentation prete pour les investisseurs."
            : "Create professional, bank-ready business plans in under 60 minutes with Sqordia's AI-powered platform. Answer 20 simple questions and get automated financial projections, market analysis, and investor-ready documentation. Perfect for startups, nonprofits, and growing businesses."
        }
        keywords={
          language === 'fr'
            ? "plan d'affaires, plan strategique, planification d'affaires IA, projections financieres, planification startup, planification OBNL, generateur de plan d'affaires, plan d'affaires automatise, plan d'affaires pret pour investisseurs, demande de subvention, plan strategique OBNL"
            : 'business plan, strategic plan, AI business planning, financial projections, startup planning, nonprofit planning, business plan generator, automated business plan, investor-ready business plan, grant application, OBNL strategic plan'
        }
        type="website"
        structuredData={structuredData}
      />

      {/* Header */}
      <Header />

      <main id="main-content" className="min-h-screen">
        {/* Hero Section */}
        <Hero />

        {/* Logo Cloud - Social Proof */}
        <LogoCloud />

        {/* Value Propositions */}
        <ValueProps />

        {/* Features - How It Works */}
        <Features />

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <FinalCTA />

        {/* FAQ */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollButton />

      {/* Cookie Consent */}
      <CookieConsent />
    </>
  );
}
