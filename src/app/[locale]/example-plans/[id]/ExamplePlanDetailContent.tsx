'use client';

import { ArrowLeft, Download, FileText, Eye, Target, TrendingUp, DollarSign, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { ExamplePlan } from '../data';

const content = {
  en: {
    back: 'Back to Examples',
    viewPlan: 'View Full Plan',
    downloadPDF: 'Download PDF',
    pages: 'pages',
    sections: {
      executiveSummary: 'Executive Summary',
      business: 'The Business',
      market: 'Market Analysis',
      strategy: 'Strategy',
      financials: 'Financials',
    },
    features: 'Key Features',
    cta: {
      title: 'Create your own business plan',
      subtitle:
        'Use this template as inspiration and create your personalized business plan with Sqordia.',
      startFree: 'Start Free Trial',
      viewMore: 'View More Examples',
    },
  },
  fr: {
    back: 'Retour aux exemples',
    viewPlan: 'Voir le plan complet',
    downloadPDF: 'Télécharger PDF',
    pages: 'pages',
    sections: {
      executiveSummary: 'Résumé Exécutif',
      business: "L'Entreprise",
      market: 'Analyse de Marché',
      strategy: 'Stratégie',
      financials: 'Finances',
    },
    features: 'Caractéristiques clés',
    cta: {
      title: "Créez votre propre plan d'affaires",
      subtitle:
        "Utilisez ce modèle comme inspiration et créez votre plan d'affaires personnalisé avec Sqordia.",
      startFree: 'Essai Gratuit',
      viewMore: "Voir plus d'exemples",
    },
  },
};

const sectionIcons = {
  executiveSummary: FileText,
  business: Target,
  market: TrendingUp,
  strategy: BarChart3,
  financials: DollarSign,
};

export default function ExamplePlanDetailContent({
  plan,
  locale,
}: {
  plan: ExamplePlan;
  locale: string;
}) {
  const t = content[locale as keyof typeof content] || content.en;
  const backUrl = locale === 'fr' ? '/fr/example-plans' : '/example-plans';
  const signupUrl = locale === 'fr' ? '/fr/signup' : '/signup';

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="lg:fixed lg:left-0 lg:top-20 lg:bottom-0 lg:w-64 bg-white dark:bg-gray-800 border-r-2 border-gray-200 dark:border-gray-700 lg:overflow-y-auto">
        <div className="p-6">
          <Link
            href={backUrl}
            className="flex items-center gap-2 text-gray-900 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-8 transition-colors pb-6 border-b-2 border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-semibold uppercase tracking-wide">{t.back}</span>
          </Link>

          {/* Section Links */}
          <div className="space-y-2 mb-8">
            {Object.entries(t.sections).map(([key, title]) => {
              const Icon = sectionIcons[key as keyof typeof sectionIcons];
              return (
                <a
                  key={key}
                  href={`#${key}`}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all text-left"
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium">{title}</span>
                </a>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="pt-8 border-t-2 border-gray-200 dark:border-gray-700">
            <Link
              href={signupUrl}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <span>{t.cta.startFree}</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Cover Section */}
        <section className="relative bg-gray-900 dark:bg-gray-950 border-b-8 border-green-600">
          <div className="relative py-24 px-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-green-600 text-white text-xs font-semibold uppercase tracking-wider rounded">
                  {plan.category}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-tight">
                {plan.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl leading-relaxed">
                {plan.description}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-10">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <FileText size={18} className="text-green-400" />
                  <span className="text-white">
                    {plan.pages} {t.pages}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <Settings size={18} className="text-green-400" />
                  <span className="text-white">{plan.industry}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg">
                  <Eye size={20} />
                  <span>{t.viewPlan}</span>
                </button>
                {plan.pdfUrl && (
                  <a
                    href={plan.pdfUrl}
                    download
                    className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    <span>{t.downloadPDF}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Plan Image */}
        <section className="bg-white dark:bg-gray-900 py-16 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={plan.image}
                alt={plan.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 dark:bg-gray-800 py-16 px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif text-gray-900 dark:text-white mb-8">
              {t.features}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plan.features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Sections */}
        {Object.entries(t.sections).map(([key, title], index) => {
          const Icon = sectionIcons[key as keyof typeof sectionIcons];
          return (
            <section
              key={key}
              id={key}
              className="py-20 px-8 max-w-4xl mx-auto border-b border-gray-200 dark:border-gray-800 last:border-b-0"
            >
              <div className="mb-12 pb-8 border-b-2 border-gray-300 dark:border-gray-700">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-900 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                      <span className="text-2xl font-serif text-white font-bold">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                      Chapter {index + 1}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white leading-tight flex items-center gap-3">
                      <Icon className="text-green-600" size={28} />
                      {title}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {getSectionContent(key, plan.industry)}
                </p>
              </div>
            </section>
          );
        })}

        {/* CTA Section */}
        <div className="mt-32 bg-gray-900 dark:bg-gray-950 border-t-8 border-green-600 mx-8 mb-16 rounded-lg overflow-hidden">
          <div className="p-12 text-center">
            <h3 className="text-3xl lg:text-4xl font-serif text-white mb-4">{t.cta.title}</h3>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={signupUrl}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t.cta.startFree}
              </Link>
              <Link
                href={backUrl}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700 font-semibold rounded-lg transition-all duration-300"
              >
                {t.cta.viewMore}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Generate placeholder content based on section and industry
function getSectionContent(section: string, industry: string): string {
  const contentMap: Record<string, Record<string, string>> = {
    executiveSummary: {
      default: `This ${industry} business plan provides a comprehensive overview of the company's mission, vision, and strategic objectives. It outlines the key value propositions, target market, and competitive advantages that position the business for success. The executive summary highlights the management team's expertise and the company's potential for growth and profitability.`,
    },
    business: {
      default: `The business model section details the core operations, products, and services offered. It explains the unique approach to serving customers in the ${industry} sector, including the value chain, operational processes, and key partnerships that enable efficient delivery of services. This section also covers the organizational structure and key resources required for success.`,
    },
    market: {
      default: `The market analysis provides an in-depth look at the ${industry} industry landscape, including market size, growth trends, and key drivers. It identifies target customer segments and their needs, analyzes the competitive landscape, and highlights market opportunities. The analysis includes both quantitative data and qualitative insights to support strategic decision-making.`,
    },
    strategy: {
      default: `The strategic plan outlines the go-to-market approach, growth strategies, and competitive positioning. It details marketing and sales initiatives, customer acquisition strategies, and partnership opportunities. The section includes short-term and long-term goals, key milestones, and the tactical plans to achieve them within the ${industry} market.`,
    },
    financials: {
      default: `The financial projections include detailed revenue forecasts, cost structures, and profitability analysis for the next 3-5 years. It covers startup costs, operating expenses, break-even analysis, and cash flow projections. The section also outlines funding requirements, use of funds, and expected return on investment for stakeholders in the ${industry} sector.`,
    },
  };

  return contentMap[section]?.default || '';
}
