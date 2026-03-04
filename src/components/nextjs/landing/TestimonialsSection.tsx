'use client';

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Note: In production, these would come from i18n or CMS
const testimonialAvatars = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
];

export default function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');

  // Get testimonials from translations
  const testimonials = [0, 1, 2].map((index) => ({
    quote: t(`items.${index}.quote`),
    name: t(`items.${index}.name`),
    role: t(`items.${index}.role`),
    company: t(`items.${index}.company`),
    avatar: testimonialAvatars[index],
    rating: 5,
  }));

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-32 bg-white dark:bg-gray-900"
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 font-semibold">
            {t('badge')}
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-[#1A2B47] dark:text-white"
          >
            {t('title')}{' '}
            <span className="text-emerald-600 dark:text-emerald-400">{t('titleHighlight')}</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <article
              key={index}
              className="group relative rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center shrink-0">
                  <Quote size={18} className="text-[#FF6B00]" aria-hidden="true" />
                </div>
                <div className="flex gap-0.5" role="img" aria-label={`${testimonial.rating} star rating`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
              </div>

              <figure className="flex-1 flex flex-col">
                <blockquote className="mb-6 leading-relaxed text-base text-gray-700 dark:text-gray-300 flex-1">
                  <p>&ldquo;{testimonial.quote}&rdquo;</p>
                </blockquote>

                <figcaption className="flex items-center gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                  <Image
                    src={testimonial.avatar}
                    alt=""
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 shrink-0"
                    loading="lazy"
                  />
                  <div>
                    <cite className="font-semibold text-sm not-italic text-[#1A2B47] dark:text-white">
                      {testimonial.name}
                    </cite>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </figcaption>
              </figure>

              <div
                className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
