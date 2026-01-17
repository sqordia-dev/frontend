import { Calendar, Clock, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

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

// Function to generate URL-friendly slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Import the blog posts from BlogPostPage (shared data)
// For now, we'll define them here to match the structure
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
    <section ref={sectionRef} id="blog" className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-white via-gray-50/50 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="fade-in-element inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="px-4 py-1.5 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 text-orange-700 dark:text-orange-300 rounded-full text-xs md:text-sm font-semibold">
              {t('blog.badge')}
            </span>
          </div>
          <h2 className="fade-in-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
            {t('blog.title')}
          </h2>
          <p className="fade-in-element text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* Unified Blog Posts Grid */}
        <div className="space-y-8 md:space-y-12 mb-12">
          {blogPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="fade-in-element group block"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-700">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Image Side */}
                  <div className="relative h-64 md:h-80 lg:h-[400px] overflow-hidden order-2 lg:order-1">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      width={800}
                      height={400}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent lg:bg-gradient-to-r lg:from-black/80 lg:via-black/50 lg:to-transparent"></div>
                    {index === 0 && (
                      <div className="absolute top-6 left-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-400" />
                        <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full backdrop-blur-sm shadow-lg">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Side */}
                  <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center order-1 lg:order-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                    <div className="mb-4">
                      <span className="inline-block px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-semibold rounded-full mb-4">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
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
                    <div className="text-base text-gray-700 dark:text-gray-300 mb-6">
                      {t('blog.by')} <span className="font-semibold text-gray-900 dark:text-white">{post.author}</span>
                    </div>

                    {/* Read More */}
                    <div className="inline-flex items-center gap-3 text-orange-600 dark:text-orange-400 font-semibold text-lg group-hover:gap-4 transition-all">
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
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 text-lg"
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

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  );
}

