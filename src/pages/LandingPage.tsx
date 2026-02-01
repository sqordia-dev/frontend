import { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import About from '../components/About';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import ScrollButton from '../components/ScrollButton';
import CookieConsent from '../components/CookieConsent';
import SEO from '../components/SEO';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { t, language } = useTheme();
  
  useEffect(() => {
    // Check if we need to scroll to a specific section after navigation
    const scrollToSection = sessionStorage.getItem('scrollToSection');
    if (scrollToSection) {
      // Clear the stored section
      sessionStorage.removeItem('scrollToSection');
      
      // Wait for the page to fully render, then scroll
      setTimeout(() => {
        const element = document.getElementById(scrollToSection);
        if (element) {
          const headerHeight = 80; // Approximate header height
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerHeight - 20;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, []);
  
  // Organization and SoftwareApplication structured data
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Sqordia",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1250"
      },
      "description": language === 'fr' 
        ? "Plateforme de planification d'affaires alimentée par l'IA qui crée des plans d'affaires professionnels et prêts pour les banques en moins de 60 minutes."
        : "AI-powered business planning platform that creates professional, bank-ready business plans in under 60 minutes.",
      "url": "https://sqordia.com",
      "logo": "https://sqordia.com/favicon.svg",
      "screenshot": "https://sqordia.com/screenshot.jpg",
      "featureList": [
        language === 'fr' ? "Génération de plan d'affaires alimentée par l'IA" : "AI-powered business plan generation",
        language === 'fr' ? "Projections financières automatisées" : "Automated financial projections",
        language === 'fr' ? "Analyse de marché et recherche concurrentielle" : "Market analysis and competitor research",
        language === 'fr' ? "Documentation prête pour les investisseurs" : "Investor-ready documentation",
        language === 'fr' ? "Planification stratégique pour les OBNL" : "Nonprofit strategic planning",
        language === 'fr' ? "Export multi-format (PDF, Word, Excel)" : "Multi-format export (PDF, Word, Excel)"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Sqordia",
      "url": "https://sqordia.com",
      "logo": "https://sqordia.com/favicon.svg",
      "description": language === 'fr'
        ? "Plateforme de planification d'affaires alimentée par l'IA pour les startups, les organismes sans but lucratif et les entreprises en croissance."
        : "AI-powered business planning platform for startups, nonprofits, and growing businesses.",
      "sameAs": [
        "https://twitter.com/sqordia",
        "https://linkedin.com/company/sqordia",
        "https://facebook.com/sqordia"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "support@sqordia.com"
      }
    }
  ];

  return (
    <div className="min-h-screen" id="main-content">
      <SEO
        title={language === 'fr' 
          ? "Sqordia - Planification d'affaires alimentée par l'IA en moins de 60 minutes"
          : "Sqordia - AI-Powered Business Planning in Under 60 Minutes"}
        description={language === 'fr'
          ? "Créez des plans d'affaires professionnels et prêts pour les banques en moins de 60 minutes avec la plateforme Sqordia alimentée par l'IA. Répondez à 20 questions simples et obtenez des projections financières automatisées, une analyse de marché et une documentation prête pour les investisseurs."
          : "Create professional, bank-ready business plans in under 60 minutes with Sqordia's AI-powered platform. Answer 20 simple questions and get automated financial projections, market analysis, and investor-ready documentation. Perfect for startups, nonprofits, and growing businesses."}
        keywords={language === 'fr'
          ? "plan d'affaires, plan stratégique, planification d'affaires IA, projections financières, planification startup, planification OBNL, générateur de plan d'affaires, plan d'affaires automatisé, plan d'affaires prêt pour investisseurs, demande de subvention, plan stratégique OBNL"
          : "business plan, strategic plan, AI business planning, financial projections, startup planning, nonprofit planning, business plan generator, automated business plan, investor-ready business plan, grant application, OBNL strategic plan"}
        type="website"
        structuredData={structuredData}
      />
      <Header />
      <Hero />
      {/* Features */}
      <Features />
      {/* Testimonials */}
      <Testimonials />
      {/* Pricing */}
      <Pricing />
      {/* Example Plans - Show 3 cards */}
      <section id="example-plans" className={cn(
        "py-section-md lg:py-section-lg relative overflow-hidden",
        "bg-light-ai-grey dark:bg-gray-900"
      )}>
        <div className="grid-pattern absolute inset-0" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-semibold bg-strategy-blue/5 dark:bg-white/10 text-strategy-blue dark:text-white border-strategy-blue/15 dark:border-white/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('examplePlans.badge') || 'Examples'}
            </Badge>
            <h2 className="text-display-md md:text-display-lg lg:text-display-xl text-gray-900 dark:text-white mb-6">
              {t('examplePlans.title')}
            </h2>
            <p className="text-body-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('examplePlans.subtitle')}
            </p>
          </div>

          {/* 3 Example Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {[
              {
                id: 'tech-startup',
                title: 'Tech Startup Business Plan',
                description: 'Complete SaaS business plan with market analysis, financial projections, and growth strategy.',
                category: 'Business Plan',
                industry: 'Technology',
                pages: 42,
                image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
                features: ['Market Analysis', '5-Year Projections', 'Investor Ready']
              },
              {
                id: 'restaurant',
                title: 'Restaurant Business Plan',
                description: 'Detailed plan for opening a new restaurant with menu planning, cost analysis, and marketing strategy.',
                category: 'Business Plan',
                industry: 'Food & Beverage',
                pages: 38,
                image: 'https://images.pexels.com/photos/941869/pexels-photo-941869.jpeg?auto=compress&cs=tinysrgb&w=800',
                features: ['Menu Strategy', 'Location Analysis', 'Cost Breakdown']
              },
              {
                id: 'nonprofit',
                title: 'Nonprofit Strategic Plan',
                description: 'Strategic plan for nonprofit organizations with funding strategies and impact measurement.',
                category: 'Strategic Plan',
                industry: 'Nonprofit',
                pages: 40,
                image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
                features: ['Grant Strategy', 'Impact Goals', 'Budget Planning']
              }
            ].map((plan) => (
              <Link
                key={plan.id}
                to={`/example-plans/${plan.id}`}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-momentum-orange dark:hover:border-momentum-orange transition-all duration-500 block card-hover-lift"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={plan.image}
                    alt={plan.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    width={800}
                    height={400}
                  />
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white">
                      {plan.category}
                    </Badge>
                  </div>

                  {/* Pages Count */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white">
                      <FileText size={12} className="mr-1" />
                      {plan.pages} {t('examplePlans.pages')}
                    </Badge>
                  </div>

                  {/* Industry Badge */}
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-momentum-orange/90 text-white">
                      {plan.industry}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-heading-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-momentum-orange dark:group-hover:text-momentum-orange transition-colors">
                    {plan.title}
                  </h3>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3">
                    {plan.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-gray-50 dark:bg-gray-700/50"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  {/* View Link */}
                  <div className="flex items-center gap-2 text-momentum-orange font-semibold group-hover:gap-3 transition-all">
                    <span className="text-sm">{t('examplePlans.viewPlan')}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-momentum-orange opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Button asChild variant="brand" size="lg" className="group">
              <Link to="/example-plans">
                {t('examplePlans.cta.viewAll')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* About */}
      <About />
      {/* Blog */}
      <Blog />
      {/* Contact */}
      <Contact />
      <Footer />
      <ScrollButton />
      <CookieConsent />
    </div>
  );
}
