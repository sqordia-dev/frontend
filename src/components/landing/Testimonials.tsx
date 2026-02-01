import { Star, Quote, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface Testimonial {
  quoteKey: string;
  authorKey: string;
  roleKey: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quoteKey: 'landing.testimonials.quote1',
    authorKey: 'landing.testimonials.author1',
    roleKey: 'landing.testimonials.role1',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    rating: 5,
  },
  {
    quoteKey: 'landing.testimonials.quote2',
    authorKey: 'landing.testimonials.author2',
    roleKey: 'landing.testimonials.role2',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    rating: 5,
  },
  {
    quoteKey: 'landing.testimonials.quote3',
    authorKey: 'landing.testimonials.author3',
    roleKey: 'landing.testimonials.role3',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    rating: 5,
  },
];

export default function Testimonials() {
  const { theme, t } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);

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

  const isDark = theme === 'dark';

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="py-20 md:py-28 lg:py-32 relative overflow-hidden"
      style={{ backgroundColor: isDark ? '#111827' : '#FFFFFF' }}
      aria-labelledby="testimonials-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full filter blur-[120px] opacity-30"
          style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full filter blur-[120px] opacity-30"
          style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)' }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="fade-in-up-element inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-green-500" aria-hidden="true" />
            <span
              className="px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold"
              style={{
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                color: isDark ? '#6EE7B7' : '#059669',
              }}
            >
              {t('landing.testimonials.badge')}
            </span>
          </div>
          <h2
            id="testimonials-heading"
            className="fade-in-up-element text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
            style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
          >
            {t('landing.testimonials.title')}{' '}
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              {t('landing.testimonials.title.highlight')}
            </span>
          </h2>
          <p
            className="fade-in-up-element text-lg md:text-xl"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            {t('landing.testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <article
              key={index}
              className="fade-in-up-element group relative rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              style={{
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                animationDelay: `${index * 100}ms`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(99, 102, 241, 0.25)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';
              }}
            >
              {/* Quote icon */}
              <div
                className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#E55F00] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                aria-hidden="true"
              >
                <Quote className="text-white" size={20} />
              </div>

              {/* Rating */}
              <div
                className="flex gap-1 mb-4 mt-4"
                role="img"
                aria-label={t('landing.testimonials.ratingLabel').replace('{rating}', String(testimonial.rating))}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Quote */}
              <figure>
                <blockquote
                  className="mb-6 leading-relaxed text-sm md:text-base"
                  style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                >
                  <p>"{t(testimonial.quoteKey)}"</p>
                </blockquote>

                {/* Author */}
                <figcaption
                  className="flex items-center gap-4 pt-6 border-t"
                  style={{ borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)' }}
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0"
                    style={{
                      boxShadow: `0 0 0 2px ${isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
                    }}
                  >
                    <img
                      src={testimonial.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={56}
                      height={56}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <cite
                      className="font-bold text-sm md:text-base not-italic"
                      style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
                    >
                      {t(testimonial.authorKey)}
                    </cite>
                    <div
                      className="text-xs md:text-sm"
                      style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                    >
                      {t(testimonial.roleKey)}
                    </div>
                  </div>
                </figcaption>
              </figure>

              {/* Decorative gradient on hover */}
              <div
                className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#FF6B00] to-[#E55F00] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl md:rounded-b-3xl"
                aria-hidden="true"
              />
            </article>
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

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none !important;
          }
          .fade-in-up-element {
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
