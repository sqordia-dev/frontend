'use client';

import { useState, useMemo } from 'react';
import { FileText, Download, Eye, Search, Filter, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { examplePlans, categories, industries, type ExamplePlan } from './data';

const content = {
  en: {
    title: 'Business Plan Examples',
    subtitle:
      'Explore our professionally crafted business plan templates. Find inspiration for your industry and create your own winning plan.',
    badge: 'Business Plan Examples',
    searchPlaceholder: 'Search plans...',
    category: 'Category',
    industry: 'Industry',
    results: 'plans found',
    pages: 'pages',
    view: 'View Plan',
    download: 'Download',
    viewPlan: 'View Plan',
    noResults: 'No plans found matching your criteria.',
    cta: {
      title: 'Ready to create your own business plan?',
      subtitle:
        'Start your free trial today and create a professional business plan in under 60 minutes.',
      startFree: 'Start Free Trial',
      learnMore: 'Learn More',
    },
  },
  fr: {
    title: "Exemples de Plans d'Affaires",
    subtitle:
      "Explorez nos modèles de plans d'affaires professionnels. Trouvez l'inspiration pour votre industrie et créez votre propre plan gagnant.",
    badge: "Exemples de Plans d'Affaires",
    searchPlaceholder: 'Rechercher des plans...',
    category: 'Catégorie',
    industry: 'Industrie',
    results: 'plans trouvés',
    pages: 'pages',
    view: 'Voir le plan',
    download: 'Télécharger',
    viewPlan: 'Voir le plan',
    noResults: 'Aucun plan trouvé correspondant à vos critères.',
    cta: {
      title: "Prêt à créer votre propre plan d'affaires?",
      subtitle:
        "Commencez votre essai gratuit aujourd'hui et créez un plan d'affaires professionnel en moins de 60 minutes.",
      startFree: 'Essai Gratuit',
      learnMore: 'En savoir plus',
    },
  },
};

export default function ExamplePlansContent({ locale }: { locale: string }) {
  const t = content[locale as keyof typeof content] || content.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const filteredPlans = useMemo(() => {
    return examplePlans.filter((plan) => {
      const matchesSearch =
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || plan.category === selectedCategory;
      const matchesIndustry = selectedIndustry === 'All' || plan.industry === selectedIndustry;
      return matchesSearch && matchesCategory && matchesIndustry;
    });
  }, [searchQuery, selectedCategory, selectedIndustry]);

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:fixed lg:left-0 lg:top-20 lg:bottom-0 lg:w-64 bg-white dark:bg-gray-800 border-r-2 border-gray-200 dark:border-gray-700 lg:overflow-y-auto p-6">
        <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter size={14} className="inline mr-1" />
              {t.category}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#FF6B00]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.industry}
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#FF6B00]"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="pt-6 border-t-2 border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {filteredPlans.length}
            </span>{' '}
            {t.results}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
          <Link
            href={locale === 'fr' ? '/fr/signup' : '/signup'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <span>{t.cta.startFree}</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Hero */}
        <section className="relative bg-gray-900 dark:bg-gray-950 border-b-8 border-green-600">
          <div className="py-24 px-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-green-600 text-white text-xs font-semibold uppercase tracking-wider rounded">
                  {t.badge}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-tight">
                {t.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl leading-relaxed">
                {t.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Plans Grid */}
        <div className="bg-white dark:bg-gray-900 py-20 px-8">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-20 max-w-4xl mx-auto">
              <p className="text-xl text-gray-600 dark:text-gray-400">{t.noResults}</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} locale={locale} t={t} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 dark:bg-gray-950 border-t-8 border-green-600 mx-8 mb-16 rounded-lg overflow-hidden">
          <div className="p-12 text-center">
            <h3 className="text-3xl lg:text-4xl font-serif text-white mb-4">{t.cta.title}</h3>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={locale === 'fr' ? '/fr/signup' : '/signup'}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t.cta.startFree}
              </Link>
              <Link
                href={locale === 'fr' ? '/fr' : '/'}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700 font-semibold rounded-lg transition-all duration-300"
              >
                {t.cta.learnMore}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PlanCard({
  plan,
  locale,
  t,
}: {
  plan: ExamplePlan;
  locale: string;
  t: (typeof content)['en'];
}) {
  const detailUrl =
    locale === 'fr' ? `/fr/example-plans/${plan.id}` : `/example-plans/${plan.id}`;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] hover:shadow-2xl transition-all duration-500">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={plan.image}
          alt={plan.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

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
            <span>
              {plan.pages} {t.pages}
            </span>
          </div>
        </div>

        {/* Industry Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-[#FF6B00]/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
            {plan.industry}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[#FF6B00]/90 dark:bg-[#FF6B00]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link
            href={detailUrl}
            className="p-3 bg-white text-[#FF6B00] rounded-xl hover:bg-gray-100 transition-colors"
            title={t.view}
          >
            <Eye size={20} />
          </Link>
          {plan.pdfUrl && (
            <a
              href={plan.pdfUrl}
              download
              className="p-3 bg-white text-[#FF6B00] rounded-xl hover:bg-gray-100 transition-colors"
              title={t.download}
            >
              <Download size={20} />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#FF6B00] dark:group-hover:text-[#FF6B00] transition-colors">
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
          href={detailUrl}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-[#FF6B00] hover:text-white dark:hover:bg-[#FF6B00] transition-all group/btn"
        >
          <span className="font-medium">{t.viewPlan}</span>
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Border Effect */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
