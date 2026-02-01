import { Calendar, Clock, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface BlogPostContent {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
}

interface BlogPost {
  id: string;
  slug: string;
  author: string;
  date: string;
  image: string;
  en: BlogPostContent;
  fr: BlogPostContent;
}

// Blog post data for the landing page
const blogPostsData: BlogPost[] = [
  {
    id: '1',
    slug: 'how-to-write-a-business-plan-that-gets-funded',
    author: 'Sarah Johnson',
    date: '2024-01-14',
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    en: {
      title: 'How to Write a Business Plan That Gets Funded',
      excerpt: 'Learn the key elements that investors look for in a business plan and how to structure your document for maximum impact.',
      category: 'Business Planning',
      readTime: '5 min read',
    },
    fr: {
      title: 'Comment Rédiger un Plan d\'Affaires Qui Obtient du Financement',
      excerpt: 'Découvrez les éléments clés que les investisseurs recherchent dans un plan d\'affaires et comment structurer votre document pour un impact maximum.',
      category: 'Planification d\'Affaires',
      readTime: '5 min de lecture',
    },
  },
  {
    id: '2',
    slug: 'financial-projections-a-complete-guide',
    author: 'Michael Chen',
    date: '2024-01-09',
    image: 'https://images.pexels.com/photos/5905442/pexels-photo-5905442.jpeg?auto=compress&cs=tinysrgb&w=800',
    en: {
      title: 'Financial Projections: A Complete Guide',
      excerpt: 'Master the art of creating accurate financial forecasts that demonstrate your business\'s growth potential to stakeholders.',
      category: 'Finance',
      readTime: '8 min read',
    },
    fr: {
      title: 'Projections Financières : Un Guide Complet',
      excerpt: 'Maîtrisez l\'art de créer des prévisions financières précises qui démontrent le potentiel de croissance de votre entreprise aux parties prenantes.',
      category: 'Finance',
      readTime: '8 min de lecture',
    },
  },
  {
    id: '3',
    slug: 'strategic-planning-for-nonprofits',
    author: 'Emily Rodriguez',
    date: '2024-01-04',
    image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
    en: {
      title: 'Strategic Planning for Nonprofits',
      excerpt: 'Discover how nonprofit organizations can create effective strategic plans that align with their mission and attract funding.',
      category: 'Nonprofit',
      readTime: '6 min read',
    },
    fr: {
      title: 'Planification Stratégique pour les Organismes Sans But Lucratif',
      excerpt: 'Découvrez comment les organismes sans but lucratif peuvent créer des plans stratégiques efficaces qui s\'alignent avec leur mission et attirent le financement.',
      category: 'Sans But Lucratif',
      readTime: '6 min de lecture',
    },
  },
];

export default function Blog() {
  const { t, theme, language } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isDark = theme === 'dark';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get localized blog posts
  const blogPosts = blogPostsData.map(post => ({
    ...post,
    ...post[language],
  }));

  return (
    <section
      ref={sectionRef}
      id="blog"
      className={cn(
        "py-20 md:py-28 lg:py-32 relative overflow-hidden",
        isDark ? "bg-gray-900" : "bg-light-ai-grey"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="fade-in-element inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-momentum-orange" />
            <span className={cn(
              "px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold",
              isDark
                ? "bg-momentum-orange/10 text-momentum-orange"
                : "bg-momentum-orange/10 text-momentum-orange"
            )}>
              {t('blog.badge')}
            </span>
          </div>
          <h2 className={cn(
            "fade-in-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {t('blog.title')}
          </h2>
          <p className={cn(
            "fade-in-element text-base sm:text-lg md:text-xl max-w-2xl mx-auto",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {t('blog.subtitle')}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="space-y-8 md:space-y-12 mb-12">
          {blogPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="fade-in-element group block"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={cn(
                "relative rounded-3xl md:rounded-[2rem] overflow-hidden border-2 transition-all duration-300 hover:shadow-xl",
                isDark
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-200 hover:border-strategy-blue/20"
              )}>
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Image Side */}
                  <div className="relative h-64 md:h-80 lg:h-[400px] overflow-hidden order-2 lg:order-1">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      width={800}
                      height={400}
                    />
                    <div className="absolute inset-0 bg-black/40 lg:bg-black/30" />
                    {index === 0 && (
                      <div className="absolute top-6 left-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-white" />
                        <span className="px-4 py-2 bg-momentum-orange text-white text-xs font-bold rounded-full shadow-sm">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Side */}
                  <div className={cn(
                    "p-8 md:p-12 lg:p-16 flex flex-col justify-center order-1 lg:order-2",
                    isDark ? "bg-gray-800" : "bg-white"
                  )}>
                    <div className="mb-4">
                      <span className={cn(
                        "inline-block px-4 py-2 text-xs font-semibold rounded-full mb-4",
                        isDark
                          ? "bg-momentum-orange/10 text-momentum-orange"
                          : "bg-momentum-orange/10 text-momentum-orange"
                      )}>
                        {post.category}
                      </span>
                    </div>
                    <h3 className={cn(
                      "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 group-hover:text-momentum-orange transition-colors leading-tight",
                      isDark ? "text-white" : "text-gray-900"
                    )}>
                      {post.title}
                    </h3>
                    <p className={cn(
                      "text-lg md:text-xl mb-6 leading-relaxed line-clamp-3",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className={cn(
                      "flex flex-wrap items-center gap-6 text-sm mb-6",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{formatDate(post.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Author */}
                    <div className={cn(
                      "text-base mb-6",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      {t('blog.by')} <span className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>{post.author}</span>
                    </div>

                    {/* Read More */}
                    <div className="inline-flex items-center gap-3 text-momentum-orange font-semibold text-lg group-hover:gap-4 transition-all">
                      <span>{t('blog.readMore')}</span>
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-3 px-10 py-5 bg-momentum-orange hover:bg-[#E55F00] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-lg"
          >
            <span>{t('blog.viewAll')}</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .fade-in-element {
          opacity: 0;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
