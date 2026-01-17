import { FileText, ArrowRight, Download, Eye } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const templates = [
  {
    id: 'tech-startup',
    title: 'Tech Startup Business Plan',
    description: 'Complete SaaS business plan with market analysis, financial projections, and growth strategy.',
    category: 'Technology',
    pages: 42,
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-blue-500 to-cyan-500',
    features: ['Market Analysis', '5-Year Projections', 'Investor Ready']
  },
  {
    id: 'restaurant',
    title: 'Restaurant Business Plan',
    description: 'Detailed plan for opening a new restaurant with menu planning, cost analysis, and marketing strategy.',
    category: 'Food & Beverage',
    pages: 38,
    image: 'https://images.pexels.com/photos/941869/pexels-photo-941869.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-green-500 to-red-500',
    features: ['Menu Strategy', 'Location Analysis', 'Cost Breakdown']
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Store Plan',
    description: 'Comprehensive plan for launching an online retail business with logistics and marketing strategies.',
    category: 'Retail',
    pages: 35,
    image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-green-500 to-emerald-500',
    features: ['Digital Marketing', 'Supply Chain', 'Sales Forecast']
  },
  {
    id: 'nonprofit',
    title: 'Nonprofit Strategic Plan',
    description: 'Strategic plan for nonprofit organizations with funding strategies and impact measurement.',
    category: 'Nonprofit',
    pages: 40,
    image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-purple-500 to-pink-500',
    features: ['Grant Strategy', 'Impact Goals', 'Budget Planning']
  },
  {
    id: 'consulting',
    title: 'Consulting Firm Plan',
    description: 'Professional services business plan with client acquisition and service delivery strategies.',
    category: 'Professional Services',
    pages: 36,
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-slate-500 to-gray-600',
    features: ['Service Model', 'Pricing Strategy', 'Client Pipeline']
  },
  {
    id: 'mobile-app',
    title: 'Mobile App Startup',
    description: 'Complete business plan for mobile application with user acquisition and monetization strategies.',
    category: 'Technology',
    pages: 44,
    image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-cyan-500 to-blue-500',
    features: ['User Growth', 'Monetization', 'Tech Stack']
  },
  {
    id: 'strategic-plan',
    title: 'Strategic Plan (Nonprofit)',
    description: 'Professional strategic plan for nonprofit organizations in Quebec/Canada with SWOT analysis and governance.',
    category: 'Nonprofit',
    pages: 52,
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    color: 'from-indigo-500 to-purple-500',
    features: ['SWOT Analysis', 'Action Plan', 'Governance']
  }
];

export default function Templates() {
  const { t } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-scale-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.scale-in-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200 dark:bg-cyan-900 rounded-full blur-3xl opacity-20"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="scale-in-element inline-block px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm font-semibold mb-4">
            Templates & Examples
          </div>
          <h2 className="scale-in-element text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('templates.title')}
          </h2>
          <p className="scale-in-element text-xl text-gray-600 dark:text-gray-300">
            {t('templates.subtitle')}
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {templates.map((template, index) => (
            <Link
              key={index}
              to={`/template/${template.id}`}
              className="scale-in-element group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-2xl transition-all duration-500 block"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={template.image}
                  alt={template.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  width={800}
                  height={400}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-semibold rounded-full">
                    {template.category}
                  </span>
                </div>

                {/* Pages Count */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-semibold rounded-full">
                    <FileText size={12} />
                    <span>{template.pages} {t('templates.pages')}</span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-blue-600/90 dark:bg-blue-700/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button className="p-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors">
                    <Eye size={20} />
                  </button>
                  <button className="p-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors">
                    <Download size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {template.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                  {template.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all group/btn">
                  <span className="font-medium">Use This Template</span>
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Border Effect */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-600 dark:bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="scale-in-element max-w-4xl mx-auto">
          <div className="relative bg-blue-600 dark:bg-blue-700 rounded-3xl p-12 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center text-white">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to create your own?
              </h3>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Start with a template or answer our guided questionnaire to create a custom business plan tailored to your specific needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  Browse All Templates
                </button>
                <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 font-semibold rounded-xl hover:bg-white/30 transition-all duration-300">
                  Start from Scratch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
        }

        .scale-in-element {
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
