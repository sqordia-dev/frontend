import { Star, Quote, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const testimonials = [
  {
    quote: "I completed my entire business plan in under 2 hours. The AI suggestions were spot-on and the financial projections saved me weeks of work.",
    author: "Sophie Chen",
    role: "Founder, TechNova Startup",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
    rating: 5
  },
  {
    quote: "The questionnaire format made it so easy. I didn't have to stare at a blank page wondering what to write. Perfect for our grant application.",
    author: "Jean-Marc Dubois",
    role: "Director, Community Health OBNL",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
    rating: 5
  },
  {
    quote: "The professional PDF export was perfect for our investor pitch. Everything looks polished and ready to present.",
    author: "Alex Thompson",
    role: "CEO, GrowthPath Solutions",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
    rating: 5
  }
];

export default function Testimonials() {
  const { t, theme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  
  const stats = [
    { valueKey: 'testimonials.stat1.value', labelKey: 'testimonials.stat1.label' },
    { valueKey: 'testimonials.stat2.value', labelKey: 'testimonials.stat2.label' },
    { valueKey: 'testimonials.stat3.value', labelKey: 'testimonials.stat3.label' },
    { valueKey: 'testimonials.stat4.value', labelKey: 'testimonials.stat4.label' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.fade-in-up-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="testimonials" className="py-20 md:py-28 lg:py-32 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-cyan-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-cyan-950/20"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Stats Section */}
        <div className="fade-in-up-element mb-16 md:mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 md:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{
                  borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
                  {t(stat.valueKey)}
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="fade-in-up-element inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs md:text-sm font-semibold">
              {t('testimonials.badge') || 'Testimonials'}
            </span>
          </div>
          <h2 className="fade-in-up-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('testimonials.title')}
          </h2>
          <p className="fade-in-up-element text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="fade-in-up-element group relative bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              style={{
                borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                animationDelay: `${index * 100}ms`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.25)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';
              }}
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Quote className="text-white" size={20} />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm md:text-base">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
                />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{testimonial.author}</div>
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl md:rounded-b-3xl"></div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .fade-in-up-element {
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
