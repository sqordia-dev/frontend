import { Check, Sparkles, Zap, Crown, Building2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const { t, theme } = useTheme();
  
  const plans = [
    {
      id: 'starter',
      icon: Zap,
      titleKey: 'pricing.starter.title',
      priceKey: 'pricing.starter.price',
      periodKey: 'pricing.starter.period',
      descKey: 'pricing.starter.desc',
      ctaKey: 'pricing.starter.cta',
      bgColor: 'bg-white dark:bg-gray-800',
      borderColor: 'border-gray-200 dark:border-gray-700',
      iconBg: 'bg-gray-100 dark:bg-gray-700',
      iconColor: 'text-gray-700 dark:text-gray-300',
      textColor: 'text-gray-900 dark:text-white',
      descColor: 'text-gray-600 dark:text-gray-400',
      checkColor: 'text-green-600 dark:text-green-400',
      buttonBg: 'bg-gray-100 dark:bg-gray-700',
      buttonText: 'text-gray-900 dark:text-white',
      buttonHover: 'hover:bg-gray-200 dark:hover:bg-gray-600',
      features: [
        'AI-powered planning assistant',
        'Financial forecasting tools',
        'Up to 3 business plans',
        'Basic templates',
        'Email support'
      ],
      popular: false
    },
    {
      id: 'professional',
      icon: Crown,
      titleKey: 'pricing.pro.title',
      priceKey: 'pricing.pro.price',
      periodKey: 'pricing.pro.period',
      descKey: 'pricing.pro.desc',
      ctaKey: 'pricing.pro.cta',
      bgColor: 'bg-blue-600 dark:bg-blue-700',
      borderColor: 'border-blue-500',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      textColor: 'text-white',
      descColor: 'text-blue-100',
      checkColor: 'text-green-300',
      buttonBg: 'bg-white',
      buttonText: 'text-blue-600',
      buttonHover: 'hover:bg-blue-50',
      features: [
        'Everything in Starter, plus:',
        'Unlimited business plans',
        'Team collaboration (up to 5 users)',
        'Advanced financial modeling',
        'Priority support',
        'Custom branding'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      icon: Building2,
      titleKey: 'pricing.enterprise.title',
      priceKey: 'pricing.enterprise.price',
      periodKey: 'pricing.enterprise.period',
      descKey: 'pricing.enterprise.desc',
      ctaKey: 'pricing.enterprise.cta',
      bgColor: 'bg-white dark:bg-gray-800',
      borderColor: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-700 dark:text-purple-300',
      textColor: 'text-gray-900 dark:text-white',
      descColor: 'text-gray-600 dark:text-gray-400',
      checkColor: 'text-green-600 dark:text-green-400',
      buttonBg: 'bg-purple-600 dark:bg-purple-700',
      buttonText: 'text-white',
      buttonHover: 'hover:bg-purple-700 dark:hover:bg-purple-600',
      features: [
        'Everything in Professional, plus:',
        'Unlimited team members',
        'Advanced API access',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'On-premise deployment option'
      ],
      popular: false
    }
  ];
  
  return (
    <section id="pricing" className="py-20 md:py-28 lg:py-32 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-gray-50/50 dark:from-gray-900/50 dark:via-transparent dark:to-gray-900/50"></div>
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: `linear-gradient(rgba(26, 43, 71, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 43, 71, 0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs md:text-sm font-semibold">
              {t('pricing.badge') || 'Pricing'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('pricing.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards - Single column on mobile, 3 columns on desktop */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            
            return (
              <div
                key={plan.id}
                className={`relative ${plan.bgColor} rounded-xl md:rounded-2xl lg:rounded-3xl p-5 sm:p-6 md:p-8 border-2 ${plan.borderColor} transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  boxShadow: plan.id === 'professional' 
                    ? '0 10px 30px rgba(59, 130, 246, 0.3)' 
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                onMouseEnter={(e) => {
                  const shadows = {
                    starter: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
                    professional: '0 25px 50px rgba(59, 130, 246, 0.4)',
                    enterprise: '0 25px 50px -12px rgba(168, 85, 247, 0.25)'
                  };
                  e.currentTarget.style.boxShadow = shadows[plan.id as keyof typeof shadows];
                  if (plan.id !== 'professional') {
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = plan.id === 'professional' 
                    ? '0 10px 30px rgba(59, 130, 246, 0.3)' 
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  if (plan.id !== 'professional') {
                    e.currentTarget.style.borderColor = '';
                  }
                }}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs md:text-sm font-semibold z-10">
                    {t('pricing.pro.popular')}
                  </div>
                )}

                {/* Decorative elements for professional card */}
                {plan.id === 'professional' && (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                  </>
                )}

                {/* Decorative corner accent for other cards */}
                {plan.id !== 'professional' && (
                  <div className={`absolute top-0 right-0 w-24 h-24 ${plan.id === 'starter' ? 'bg-gray-400' : 'bg-purple-400'} opacity-10 rounded-bl-full`}></div>
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 md:w-16 md:h-16 ${plan.iconBg} rounded-xl md:rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon 
                      className={plan.iconColor} 
                      size={28} 
                      strokeWidth={2} 
                    />
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${plan.textColor}`}>
                    {t(plan.titleKey)}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl md:text-5xl font-bold ${plan.textColor}`}>
                        {t(plan.priceKey)}
                      </span>
                      <span className={`text-lg ${plan.descColor}`}>
                        {t(plan.periodKey)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm md:text-base mb-6 ${plan.descColor}`}>
                    {t(plan.descKey)}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check 
                          className={`flex-shrink-0 mt-1 ${plan.checkColor}`} 
                          size={20} 
                        />
                        <span className={`text-sm md:text-base ${plan.textColor}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    to="/register"
                    className={`block w-full px-6 py-4 md:py-3.5 ${plan.buttonBg} ${plan.buttonText} rounded-xl font-medium text-center text-sm md:text-base transition-all duration-300 ${plan.buttonHover} hover:shadow-lg min-h-[44px] flex items-center justify-center`}
                  >
                    {plan.id === 'enterprise' 
                      ? (t('pricing.enterprise.cta') || 'Contact Sales')
                      : t(plan.ctaKey)
                    }
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer text */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            {t('pricing.footerText')}{' '}
            <a href="#contact" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              {t('pricing.helpLink')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
