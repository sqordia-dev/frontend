import { FileText, Download, Eye, Search, Filter, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';

interface ExamplePlan {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  pages: number;
  image: string;
  color: string;
  features: string[];
  pdfUrl?: string;
}

const examplePlans: ExamplePlan[] = [
  {
    id: 'tech-startup',
    title: 'Tech Startup Business Plan',
    description: 'Complete SaaS business plan with market analysis, financial projections, and growth strategy. Perfect for technology startups seeking investment.',
    category: 'Business Plan',
    industry: 'Technology',
    pages: 42,
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-blue-500 to-cyan-500',
    features: ['Market Analysis', '5-Year Projections', 'Investor Ready', 'SWOT Analysis'],
    pdfUrl: '#'
  },
  {
    id: 'restaurant',
    title: 'Restaurant Business Plan',
    description: 'Detailed plan for opening a new restaurant with menu planning, cost analysis, and marketing strategy. Includes location analysis and operational planning.',
    category: 'Business Plan',
    industry: 'Food & Beverage',
    pages: 38,
    image: 'https://images.pexels.com/photos/941869/pexels-photo-941869.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-orange-500 to-red-500',
    features: ['Menu Strategy', 'Location Analysis', 'Cost Breakdown', 'Marketing Plan'],
    pdfUrl: '#'
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Store Plan',
    description: 'Comprehensive plan for launching an online retail business with logistics and marketing strategies. Includes digital marketing and supply chain management.',
    category: 'Business Plan',
    industry: 'Retail',
    pages: 35,
    image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-orange-500 to-amber-500',
    features: ['Digital Marketing', 'Supply Chain', 'Sales Forecast', 'Customer Acquisition'],
    pdfUrl: '#'
  },
  {
    id: 'nonprofit',
    title: 'Nonprofit Strategic Plan',
    description: 'Strategic plan for nonprofit organizations with funding strategies and impact measurement. Designed for grant applications and donor engagement.',
    category: 'Strategic Plan',
    industry: 'Nonprofit',
    pages: 40,
    image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-purple-500 to-pink-500',
    features: ['Grant Strategy', 'Impact Goals', 'Budget Planning', 'Mission Alignment'],
    pdfUrl: '#'
  },
  {
    id: 'consulting',
    title: 'Consulting Firm Plan',
    description: 'Professional services business plan with client acquisition and service delivery strategies. Includes pricing models and growth projections.',
    category: 'Business Plan',
    industry: 'Professional Services',
    pages: 36,
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-slate-500 to-gray-600',
    features: ['Service Model', 'Pricing Strategy', 'Client Pipeline', 'Revenue Projections'],
    pdfUrl: '#'
  },
  {
    id: 'mobile-app',
    title: 'Mobile App Startup',
    description: 'Complete business plan for mobile application with user acquisition and monetization strategies. Includes tech stack and development roadmap.',
    category: 'Business Plan',
    industry: 'Technology',
    pages: 44,
    image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-cyan-500 to-blue-500',
    features: ['User Growth', 'Monetization', 'Tech Stack', 'Market Entry'],
    pdfUrl: '#'
  },
  {
    id: 'healthcare',
    title: 'Healthcare Clinic Plan',
    description: 'Comprehensive business plan for healthcare facilities with regulatory compliance, staffing, and financial projections.',
    category: 'Business Plan',
    industry: 'Healthcare',
    pages: 48,
    image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-teal-500 to-orange-500',
    features: ['Regulatory Compliance', 'Staffing Plan', 'Financial Projections', 'Patient Acquisition'],
    pdfUrl: '#'
  },
  {
    id: 'fitness',
    title: 'Fitness Center Plan',
    description: 'Business plan for fitness centers and gyms with membership models, equipment planning, and marketing strategies.',
    category: 'Business Plan',
    industry: 'Fitness & Wellness',
    pages: 32,
    image: 'https://images.pexels.com/photos/416475/pexels-photo-416475.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-red-500 to-pink-500',
    features: ['Membership Model', 'Equipment Planning', 'Marketing Strategy', 'Revenue Streams'],
    pdfUrl: '#'
  },
  {
    id: 'education',
    title: 'Educational Institution Plan',
    description: 'Strategic plan for educational institutions with curriculum development, enrollment strategies, and financial sustainability.',
    category: 'Strategic Plan',
    industry: 'Education',
    pages: 46,
    image: 'https://images.pexels.com/photos/159775/library-la-trobe-study-students-159775.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-indigo-500 to-purple-500',
    features: ['Curriculum Development', 'Enrollment Strategy', 'Financial Sustainability', 'Growth Plan'],
    pdfUrl: '#'
  }
];

const categories = ['All', 'Business Plan', 'Strategic Plan'];
const industries = ['All', 'Technology', 'Food & Beverage', 'Retail', 'Nonprofit', 'Professional Services', 'Healthcare', 'Fitness & Wellness', 'Education'];

export default function ExamplePlansPage() {
  const { t, theme, language } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.fade-in-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const filteredPlans = examplePlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || plan.category === selectedCategory;
    const matchesIndustry = selectedIndustry === 'All' || plan.industry === selectedIndustry;
    return matchesSearch && matchesCategory && matchesIndustry;
  });

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": language === 'fr' ? "Accueil" : "Home",
        "item": "https://sqordia.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": language === 'fr' ? "Exemples de Plans" : "Example Plans",
        "item": getCanonicalUrl('/example-plans')
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEO
        title={language === 'fr' 
          ? "Exemples de Plans d'Affaires | Sqordia"
          : "Business Plan Examples | Sqordia"}
        description={language === 'fr'
          ? "Explorez nos exemples de plans d'affaires professionnels pour différentes industries. Obtenez de l'inspiration pour créer votre propre plan d'affaires avec Sqordia."
          : "Explore our professional business plan examples for different industries. Get inspiration to create your own business plan with Sqordia."}
        url={getCanonicalUrl('/example-plans')}
        keywords={language === 'fr'
          ? "exemples de plans d'affaires, modèles de plans d'affaires, plans d'affaires par industrie, exemples de plans stratégiques"
          : "business plan examples, business plan templates, business plans by industry, strategic plan examples"}
        structuredData={breadcrumbStructuredData}
      />
      <Header />
      <div className="pt-20 flex">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-20 bottom-0 w-64 bg-white dark:bg-gray-800 border-r-2 border-gray-300 dark:border-gray-700 overflow-y-auto z-30">
          <div className="p-6">
            <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('examplePlans.title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('examplePlans.subtitle')}</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={t('examplePlans.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Filter size={14} className="inline mr-1" />
                  {t('examplePlans.category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('examplePlans.industry')}
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
                >
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="pt-6 border-t-2 border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{filteredPlans.length}</span> {t('examplePlans.results') || 'plans found'}
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <span>{t('examplePlanDetail.cta.startFree') || 'Start Free Trial'}</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {/* Hero Section */}
          <section ref={sectionRef} className="relative bg-gray-900 dark:bg-gray-950 border-b-8 border-green-600">
            <div className="relative py-24 px-8">
              <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-green-600 text-white text-xs font-semibold uppercase tracking-wider rounded">
                    {t('examplePlans.badge') || 'Business Plan Examples'}
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {t('examplePlans.title')}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t('examplePlans.subtitle')}
                </p>
              </div>
            </div>
          </section>

          {/* Plans Grid */}
          <div className="bg-white dark:bg-gray-900">
            <div className="py-20 px-8">
              {filteredPlans.length === 0 ? (
                <div className="text-center py-20 max-w-4xl mx-auto">
                  <p className="text-xl text-gray-600 dark:text-gray-400">{t('examplePlans.noResults')}</p>
                </div>
              ) : (
                <div className="max-w-7xl mx-auto">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="fade-in-element group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-2xl transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
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

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-orange-600/90 dark:bg-orange-700/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <Link
                        to={`/example-plans/${plan.id}`}
                        className="p-3 bg-white text-orange-600 rounded-xl hover:bg-gray-100 transition-colors"
                        title={t('examplePlans.view')}
                      >
                        <Eye size={20} />
                      </Link>
                      {plan.pdfUrl && (
                        <a
                          href={plan.pdfUrl}
                          download
                          className="p-3 bg-white text-orange-600 rounded-xl hover:bg-gray-100 transition-colors"
                          title={t('examplePlans.download')}
                        >
                          <Download size={20} />
                        </a>
                      )}
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

                    {/* Action Button */}
                    <Link
                      to={`/example-plans/${plan.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 transition-all group/btn"
                    >
                      <span className="font-medium">{t('examplePlans.viewPlan')}</span>
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Border Effect */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-600 dark:bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
                </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-32 bg-gray-900 dark:bg-gray-950 border-t-8 border-green-600 mx-8 mb-16 rounded-lg overflow-hidden">
            <div className="p-12 text-center">
              <h3 className="text-3xl lg:text-4xl font-serif text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                {t('examplePlans.cta.title')}
              </h3>
              <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t('examplePlans.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('examplePlans.cta.startFree')}
                </Link>
                <Link
                  to="/"
                  className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700 font-semibold rounded-lg transition-all duration-300"
                >
                  {t('examplePlans.cta.learnMore')}
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .fade-in-element {
          opacity: 0;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

