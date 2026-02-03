import { Star, Quote } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

import { ScrollReveal, StaggerContainer, StaggerItem } from '../animations/ScrollReveal';

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
  const { t } = useTheme();

  return (
    <section
      id="testimonials"
      className="py-section-lg bg-white dark:bg-gray-900"
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — simple left-aligned overline, no Sparkles or gradient text */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <ScrollReveal>
            <p className="text-label-sm uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 font-semibold">
              {t('landing.testimonials.badge')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="testimonials-heading"
              className="text-display-md sm:text-display-lg font-heading mb-6 text-strategy-blue dark:text-white"
            >
              {t('landing.testimonials.title')}{' '}
              <span className="text-emerald-600 dark:text-emerald-400">
                {t('landing.testimonials.title.highlight')}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-body-lg text-gray-500 dark:text-gray-400">
              {t('landing.testimonials.subtitle')}
            </p>
          </ScrollReveal>
        </div>

        {/* Grid */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={index}>
              <article className="group rounded-2xl p-6 md:p-8 border border-border bg-white dark:bg-gray-800 shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
                {/* Quote icon — inline, not floating */}
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

                {/* Quote text */}
                <figure className="flex-1 flex flex-col">
                  <blockquote className="mb-6 leading-relaxed text-body-md text-gray-700 dark:text-gray-300 flex-1">
                    <p>"{t(testimonial.quoteKey)}"</p>
                  </blockquote>

                  {/* Author */}
                  <figcaption className="flex items-center gap-3 pt-5 border-t border-border">
                    <img
                      src={testimonial.avatar}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-border shrink-0"
                      loading="lazy"
                      width={44}
                      height={44}
                      aria-hidden="true"
                    />
                    <div>
                      <cite className="font-semibold text-body-sm not-italic text-strategy-blue dark:text-white">
                        {t(testimonial.authorKey)}
                      </cite>
                      <div className="text-body-xs text-gray-500 dark:text-gray-400">
                        {t(testimonial.roleKey)}
                      </div>
                    </div>
                  </figcaption>
                </figure>

                {/* Bottom accent line on hover */}
                <div
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-momentum-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"
                  aria-hidden="true"
                />
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
