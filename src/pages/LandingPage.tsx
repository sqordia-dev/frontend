import { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import About from '../components/About';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import ScrollButton from '../components/ScrollButton';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const { t } = useTheme();
  
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
  
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      {/* Features */}
      <Features />
      {/* Pricing */}
      <Pricing />
      {/* Example Plans - Show 3 cards */}
      <section id="example-plans" className="py-20 md:py-28 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('examplePlans.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('examplePlans.subtitle')}
            </p>
          </div>

          {/* 3 Example Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
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
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-2xl transition-all duration-500 block"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={plan.image}
                    alt={plan.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-semibold rounded-full">
                      {plan.category}
                    </span>
                  </div>

                  {/* Pages Count */}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-semibold rounded-full">
                      <FileText size={12} />
                      <span>{plan.pages} {t('examplePlans.pages')}</span>
                    </div>
                  </div>

                  {/* Industry Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                      {plan.industry}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {plan.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
                    {plan.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* View Link */}
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium group-hover:gap-3 transition-all">
                    <span className="text-sm">{t('examplePlans.viewPlan')}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Border Effect */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-600 dark:bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link
              to="/example-plans"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {t('examplePlans.cta.viewAll')}
              <ArrowRight size={20} />
            </Link>
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
    </div>
  );
}
