import { Check, Sparkles, Zap, Crown, Building2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Pricing() {
  const { t, theme } = useTheme();
  const isDark = theme === 'dark';

  const plans = [
    {
      id: 'starter',
      icon: Zap,
      titleKey: 'pricing.starter.title',
      priceKey: 'pricing.starter.price',
      periodKey: 'pricing.starter.period',
      descKey: 'pricing.starter.desc',
      ctaKey: 'pricing.starter.cta',
      iconBg: 'bg-gray-500',
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
      iconBg: 'bg-momentum-orange',
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
      iconBg: 'bg-strategy-blue',
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
    <section
      id="pricing"
      className={cn(
        "py-section-md lg:py-section-lg relative overflow-hidden",
        isDark ? "bg-gray-900" : "bg-white"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <Badge
            variant="secondary"
            className={cn(
              "mb-6 px-4 py-2 text-sm font-semibold",
              isDark
                ? "bg-white/10 text-white border-white/20"
                : "bg-strategy-blue/5 text-strategy-blue border-strategy-blue/15"
            )}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('pricing.badge') || 'Pricing'}
          </Badge>

          <h2 className={cn(
            "text-display-md md:text-display-lg lg:text-display-xl mb-6",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {t('pricing.title')}
          </h2>

          <p className={cn(
            "text-body-lg md:text-xl max-w-2xl mx-auto",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={cn(
                  "group relative rounded-2xl lg:rounded-3xl p-6 md:p-8 overflow-hidden",
                  "transition-all duration-300",
                  "hover:-translate-y-1",
                  isPopular
                    ? cn(
                        "bg-strategy-blue text-white shadow-2xl shadow-strategy-blue/20 scale-[1.02] z-10",
                        "border-2 border-strategy-blue"
                      )
                    : cn(
                        "border-2",
                        isDark
                          ? "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
                          : "bg-light-ai-grey border-gray-200 hover:border-strategy-blue/20",
                        "hover:shadow-xl"
                      )
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-momentum-orange text-white font-bold shadow-sm">
                      {t('pricing.pro.popular')}
                    </Badge>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm",
                      "transition-transform duration-300 group-hover:scale-105",
                      isPopular
                        ? "bg-white/20"
                        : plan.iconBg
                    )}
                  >
                    <Icon
                      className="text-white"
                      size={28}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className={cn(
                      "text-heading-xl md:text-2xl font-bold mb-3",
                      isPopular
                        ? "text-white"
                        : isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {t(plan.titleKey)}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "text-4xl md:text-5xl font-bold",
                          isPopular
                            ? "text-white"
                            : isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {t(plan.priceKey)}
                      </span>
                      <span
                        className={cn(
                          "text-lg",
                          isPopular
                            ? "text-white/70"
                            : isDark ? "text-gray-400" : "text-gray-500"
                        )}
                      >
                        {t(plan.periodKey)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    className={cn(
                      "text-body-md mb-6",
                      isPopular
                        ? "text-white/80"
                        : isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {t(plan.descKey)}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 md:space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex-shrink-0 mt-0.5 rounded-full p-0.5",
                            isPopular
                              ? "bg-white/20"
                              : isDark ? "bg-momentum-orange/20" : "bg-momentum-orange/10"
                          )}
                        >
                          <Check
                            className={cn(
                              isPopular
                                ? "text-white"
                                : "text-momentum-orange"
                            )}
                            size={16}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-body-sm",
                            isPopular
                              ? "text-white/90"
                              : isDark ? "text-gray-300" : "text-gray-700"
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    asChild
                    variant={isPopular ? "outline" : "secondary"}
                    size="lg"
                    className={cn(
                      "w-full",
                      isPopular && "bg-white text-strategy-blue hover:bg-gray-100 border-0 font-bold"
                    )}
                  >
                    <Link to="/register">
                      {plan.id === 'enterprise'
                        ? (t('pricing.enterprise.cta') || 'Contact Sales')
                        : t(plan.ctaKey)
                      }
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer text */}
        <div className="text-center mt-12 md:mt-16">
          <p className={cn(
            "text-body-md",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {t('pricing.footerText')}{' '}
            <a
              href="#contact"
              className="text-momentum-orange font-medium hover:underline transition-colors"
            >
              {t('pricing.helpLink')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
