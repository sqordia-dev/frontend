import { Star, Quote, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface Testimonial {
  quoteKey: string;
  authorKey: string;
  roleKey: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quoteKey: 'testimonials.quote1',
    authorKey: 'testimonials.author1',
    roleKey: 'testimonials.role1',
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
    rating: 5
  },
  {
    quoteKey: 'testimonials.quote2',
    authorKey: 'testimonials.author2',
    roleKey: 'testimonials.role2',
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
    rating: 5
  },
  {
    quoteKey: 'testimonials.quote3',
    authorKey: 'testimonials.author3',
    roleKey: 'testimonials.role3',
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
    rating: 5
  }
];

export default function Testimonials() {
  const { t, theme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isDark = theme === 'dark';

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
    <section
      ref={sectionRef}
      id="testimonials"
      className={cn(
        "py-20 md:py-28 lg:py-32 relative overflow-hidden",
        isDark ? "bg-gray-900" : "bg-light-ai-grey"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Stats Section */}
        <div className="fade-in-up-element mb-16 md:mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "text-center p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1",
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg"
                    : "bg-white border-gray-200 hover:border-strategy-blue/20 hover:shadow-lg"
                )}
              >
                <div className={cn(
                  "text-2xl md:text-3xl lg:text-4xl font-bold mb-2",
                  isDark ? "text-white" : "text-strategy-blue"
                )}>
                  {t(stat.valueKey)}
                </div>
                <div className={cn(
                  "text-xs md:text-sm font-medium",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  {t(stat.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="fade-in-up-element inline-flex items-center gap-2 mb-6">
            <Sparkles className={cn("w-5 h-5", isDark ? "text-momentum-orange" : "text-momentum-orange")} />
            <span className={cn(
              "px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold",
              isDark
                ? "bg-momentum-orange/10 text-momentum-orange"
                : "bg-momentum-orange/10 text-momentum-orange"
            )}>
              {t('testimonials.badge') || 'Testimonials'}
            </span>
          </div>
          <h2 className={cn(
            "fade-in-up-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {t('testimonials.title')}
          </h2>
          <p className={cn(
            "fade-in-up-element text-base sm:text-lg md:text-xl max-w-2xl mx-auto",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={cn(
                "fade-in-up-element group relative rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 transition-all duration-300 hover:-translate-y-1",
                isDark
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-xl"
                  : "bg-white border-gray-200 hover:border-strategy-blue/20 hover:shadow-xl"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-strategy-blue rounded-xl flex items-center justify-center shadow-md">
                <Quote className="text-white" size={20} />
              </div>

              {/* Rating */}
              <div
                className="flex gap-1 mb-4 mt-4"
                role="img"
                aria-label={t('testimonials.rating.aria').replace('{rating}', String(testimonial.rating))}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
                ))}
              </div>

              {/* Quote */}
              <figure>
                <blockquote
                  className={cn(
                    "mb-6 leading-relaxed text-sm md:text-base",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                  cite={t(testimonial.authorKey)}
                >
                  <p>"{t(testimonial.quoteKey)}"</p>
                </blockquote>

                {/* Author */}
                <figcaption className={cn(
                  "flex items-center gap-4 pt-6 border-t",
                  isDark ? "border-gray-700" : "border-gray-100"
                )}>
                  <img
                    src={testimonial.avatar}
                    alt=""
                    className={cn(
                      "w-12 h-12 md:w-14 md:h-14 rounded-full object-cover ring-2",
                      isDark ? "ring-gray-700" : "ring-gray-200"
                    )}
                    loading="lazy"
                    width={56}
                    height={56}
                    aria-hidden="true"
                  />
                  <div>
                    <cite className={cn(
                      "font-bold text-sm md:text-base not-italic",
                      isDark ? "text-white" : "text-gray-900"
                    )}>
                      {t(testimonial.authorKey)}
                    </cite>
                    <div className={cn(
                      "text-xs md:text-sm",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                      {t(testimonial.roleKey)}
                    </div>
                  </div>
                </figcaption>
              </figure>

              {/* Bottom accent line */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-momentum-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl md:rounded-b-3xl" />
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

