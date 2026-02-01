import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';

export default function Contact() {
  const { t, theme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.slide-up-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Implement form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert(t('contact.form.success'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t('contact.email.label'),
      value: 'info@sqordia.app',
      link: 'mailto:info@sqordia.app',
      iconBg: 'bg-strategy-blue',
    },
    {
      icon: Phone,
      label: t('contact.phone.label'),
      value: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
      iconBg: 'bg-momentum-orange',
    },
    {
      icon: MapPin,
      label: t('contact.address.label'),
      value: t('contact.address.value'),
      link: '#',
      iconBg: 'bg-strategy-blue',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="contact"
      className={cn(
        "py-20 md:py-28 relative overflow-hidden",
        isDark ? "bg-gray-900" : "bg-white"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className={cn(
            "slide-up-element text-3xl sm:text-4xl md:text-5xl font-bold mb-4",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {t('contact.title')}
          </h2>
          <p className={cn(
            "slide-up-element text-base md:text-lg",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Info - Horizontal Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.link}
                className={cn(
                  "slide-up-element group relative rounded-xl p-6 border-2 transition-all duration-300 hover:-translate-y-1 overflow-hidden",
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg"
                    : "bg-light-ai-grey border-gray-200 hover:border-strategy-blue/20 hover:shadow-lg"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Accent line */}
                <div className={cn("absolute top-0 left-0 right-0 h-1", info.iconBg)} />

                <div className="flex flex-col items-center text-center">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm",
                    info.iconBg
                  )}>
                    <info.icon className="text-white" size={24} />
                  </div>
                  <div className={cn(
                    "text-xs font-semibold mb-1 uppercase tracking-wider",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    {info.label}
                  </div>
                  <div className={cn(
                    "text-sm font-bold break-all",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {info.value}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form - Centered Card */}
          <div className="slide-up-element">
            <div className={cn(
              "rounded-2xl shadow-lg border-2 p-8 md:p-10",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            )}>
              <div className="mb-6">
                <h3 className={cn(
                  "text-2xl font-bold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {t('contact.info.title')}
                </h3>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  {t('contact.info.description')}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className={cn(
                      "block text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      {t('contact.form.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={cn(
                        "w-full px-4 py-4 md:py-3 rounded-lg border-2 focus:outline-none transition-all text-base md:text-sm min-h-[44px]",
                        isDark
                          ? "border-gray-600 bg-gray-900 text-white focus:border-momentum-orange focus:bg-gray-800"
                          : "border-gray-200 bg-light-ai-grey text-gray-900 focus:border-momentum-orange focus:bg-white"
                      )}
                      placeholder={t('contact.form.name')}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={cn(
                      "block text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      {t('contact.form.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={cn(
                        "w-full px-4 py-4 md:py-3 rounded-lg border-2 focus:outline-none transition-all text-base md:text-sm min-h-[44px]",
                        isDark
                          ? "border-gray-600 bg-gray-900 text-white focus:border-momentum-orange focus:bg-gray-800"
                          : "border-gray-200 bg-light-ai-grey text-gray-900 focus:border-momentum-orange focus:bg-white"
                      )}
                      placeholder={t('contact.form.email')}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className={cn(
                    "block text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    {t('contact.form.subject')}
                  </label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={cn(
                        "w-full px-4 py-4 md:py-3 rounded-lg border-2 focus:outline-none transition-all text-base md:text-sm min-h-[44px]",
                        isDark
                          ? "border-gray-600 bg-gray-900 text-white focus:border-momentum-orange focus:bg-gray-800"
                          : "border-gray-200 bg-light-ai-grey text-gray-900 focus:border-momentum-orange focus:bg-white"
                      )}
                      placeholder={t('contact.form.subject')}
                    />
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className={cn(
                    "block text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={cn(
                      "w-full px-4 py-4 md:py-3 rounded-lg border-2 focus:outline-none transition-all resize-none text-base md:text-sm min-h-[120px]",
                      isDark
                        ? "border-gray-600 bg-gray-900 text-white focus:border-momentum-orange focus:bg-gray-800"
                        : "border-gray-200 bg-light-ai-grey text-gray-900 focus:border-momentum-orange focus:bg-white"
                    )}
                    placeholder={t('contact.form.message')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto sm:min-w-[200px] flex items-center justify-center gap-2 px-8 py-4 bg-momentum-orange hover:bg-[#E55F00] disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('contact.form.sending')}</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>{t('contact.form.submit')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .slide-up-element {
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
