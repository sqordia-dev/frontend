import { Star, Quote } from 'lucide-react';
import { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../animations/ScrollReveal';

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol);
  } catch { return false; }
}

interface Testimonial {
  quoteKey: string;
  authorKey: string;
  roleKey: string;
  initials: string;
  color: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quoteKey: 'landing.testimonials.quote1',
    authorKey: 'landing.testimonials.author1',
    roleKey: 'landing.testimonials.role1',
    initials: 'SC',
    color: 'bg-teal-500',
    rating: 5,
  },
  {
    quoteKey: 'landing.testimonials.quote2',
    authorKey: 'landing.testimonials.author2',
    roleKey: 'landing.testimonials.role2',
    initials: 'MR',
    color: 'bg-blue-500',
    rating: 5,
  },
  {
    quoteKey: 'landing.testimonials.quote3',
    authorKey: 'landing.testimonials.author3',
    roleKey: 'landing.testimonials.role3',
    initials: 'ET',
    color: 'bg-momentum-orange',
    rating: 5,
  },
];

function TestimonialCard({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <article
      className={cn(
        'group relative rounded-2xl p-6 md:p-8 border backdrop-blur-sm transition-all duration-300 h-full flex flex-col hover:-translate-y-1',
        isDark
          ? 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
          : 'border-gray-200/60 bg-white/70 hover:bg-white hover:border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
      )}
    >
      {children}
      {/* Bottom accent line on hover */}
      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-momentum-orange to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"
        aria-hidden="true"
      />
    </article>
  );
}

export default function Testimonials() {
  const { theme, t } = useTheme();
  const { getBlock, getBlockContent } = usePublishedContent();
  const isDark = theme === 'dark';

  const cmsTestimonials = useMemo(() => {
    const block = getBlock('landing.testimonials.items');
    if (block?.content) {
      try {
        const parsed = JSON.parse(block.content) as {
          name: string;
          role: string;
          quote: string;
          avatar?: string;
          company?: string;
        }[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch { /* fall through to null */ }
    }
    return null;
  }, [getBlock]);

  return (
    <section
      id="testimonials"
      className={cn(
        'relative py-12 sm:py-16 md:py-24 lg:py-32',
        isDark ? 'bg-[#161714]' : 'bg-gray-50',
      )}
      aria-labelledby="testimonials-heading"
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
          <ScrollReveal>
            <p className="text-label-sm uppercase tracking-widest text-teal-500 mb-4 font-semibold">
              {getBlockContent('landing.testimonials.badge', t('landing.testimonials.badge'))}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="testimonials-heading"
              className={cn(
                'text-2xl sm:text-3xl md:text-display-md lg:text-display-lg font-heading mb-4 sm:mb-6',
                isDark ? 'text-white' : 'text-strategy-blue',
              )}
            >
              {getBlockContent('landing.testimonials.title', t('landing.testimonials.title'))}{' '}
              <span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">
                {getBlockContent('landing.testimonials.title_highlight', t('landing.testimonials.title.highlight'))}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className={cn('text-body-lg', isDark ? 'text-gray-400' : 'text-gray-500')}>
              {getBlockContent('landing.testimonials.subtitle', t('landing.testimonials.subtitle'))}
            </p>
          </ScrollReveal>
        </div>

        {/* Grid */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {cmsTestimonials
            ? cmsTestimonials.map((cmsItem, index) => (
                <StaggerItem key={index}>
                  <TestimonialCard isDark={isDark}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-momentum-orange/10 flex items-center justify-center shrink-0">
                        <Quote size={18} className="text-momentum-orange" aria-hidden="true" />
                      </div>
                      <div className="flex gap-0.5" role="img" aria-label={t('landing.testimonials.ratingLabel').replace('{rating}', '5')}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                        ))}
                      </div>
                    </div>

                    <figure className="flex-1 flex flex-col">
                      <blockquote className={cn('mb-6 leading-relaxed text-body-md flex-1', isDark ? 'text-gray-300' : 'text-gray-700')}>
                        <p>"{cmsItem.quote}"</p>
                      </blockquote>

                      <figcaption className={cn('flex items-center gap-3 pt-5 border-t', isDark ? 'border-white/[0.06]' : 'border-gray-200/50')}>
                        {cmsItem.avatar && isSafeUrl(cmsItem.avatar) ? (
                          <img
                            src={cmsItem.avatar}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-border shrink-0"
                            loading="lazy"
                            width={44}
                            height={44}
                            aria-hidden="true"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-momentum-orange to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {cmsItem.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <cite className={cn('font-semibold text-body-sm not-italic', isDark ? 'text-white' : 'text-strategy-blue')}>
                            {cmsItem.name}
                          </cite>
                          <div className={cn('text-body-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>
                            {cmsItem.role}{cmsItem.company ? `, ${cmsItem.company}` : ''}
                          </div>
                        </div>
                      </figcaption>
                    </figure>
                  </TestimonialCard>
                </StaggerItem>
              ))
            : testimonials.map((testimonial, index) => (
                <StaggerItem key={index}>
                  <TestimonialCard isDark={isDark}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-momentum-orange/10 flex items-center justify-center shrink-0">
                        <Quote size={18} className="text-momentum-orange" aria-hidden="true" />
                      </div>
                      <div
                        className="flex gap-0.5"
                        role="img"
                        aria-label={t('landing.testimonials.ratingLabel').replace('{rating}', String(testimonial.rating))}
                      >
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                        ))}
                      </div>
                    </div>

                    <figure className="flex-1 flex flex-col">
                      <blockquote className={cn('mb-6 leading-relaxed text-body-md flex-1', isDark ? 'text-gray-300' : 'text-gray-700')}>
                        <p>"{t(testimonial.quoteKey)}"</p>
                      </blockquote>

                      <figcaption className={cn('flex items-center gap-3 pt-5 border-t', isDark ? 'border-white/[0.06]' : 'border-gray-200/50')}>
                        <div
                          className={cn(
                            'w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2',
                            isDark ? 'ring-white/[0.06]' : 'ring-gray-200/50',
                            testimonial.color,
                          )}
                          aria-hidden="true"
                        >
                          {testimonial.initials}
                        </div>
                        <div>
                          <cite className={cn('font-semibold text-body-sm not-italic', isDark ? 'text-white' : 'text-strategy-blue')}>
                            {t(testimonial.authorKey)}
                          </cite>
                          <div className={cn('text-body-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>
                            {t(testimonial.roleKey)}
                          </div>
                        </div>
                      </figcaption>
                    </figure>
                  </TestimonialCard>
                </StaggerItem>
              ))
          }
        </StaggerContainer>
      </div>
    </section>
  );
}
