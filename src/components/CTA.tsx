import { useTheme } from '../contexts/ThemeContext';

export default function CTA() {
  const { t } = useTheme();
  
  return (
    <section className="py-24 bg-blue-600 dark:bg-blue-700">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-10 leading-relaxed">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-xl hover:bg-blue-50 hover:shadow-xl hover:-translate-y-1 transition-all">
              {t('cta.primary')}
            </button>
            <button className="px-8 py-4 bg-transparent text-white border-2 border-white text-lg font-medium rounded-xl hover:bg-white hover:text-blue-600 transition-all">
              {t('cta.secondary')}
            </button>
          </div>
          <p className="mt-6 text-sm text-blue-100 dark:text-blue-200">
            {t('cta.note')}
          </p>
        </div>
      </div>
    </section>
  );
}
