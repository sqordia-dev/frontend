import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function FinalCTA() {
  const { t } = useTheme();
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

  const benefits = [
    'finalCTA.benefit1',
    'finalCTA.benefit2',
    'finalCTA.benefit3',
    'finalCTA.benefit4',
  ];

  return (
    <section ref={sectionRef} className="relative py-40 overflow-hidden" style={{ backgroundColor: '#1A2B47' }}>
      {/* Background decorative elements - animated gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" style={{ backgroundColor: 'rgba(26, 43, 71, 0.5)' }}></div>
        <div className="absolute top-40 left-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" style={{ backgroundColor: 'rgba(26, 43, 71, 0.5)' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" style={{ backgroundColor: 'rgba(26, 43, 71, 0.5)' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="fade-in-element inline-block px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-sm font-medium mb-8 border border-white/20">
            {t('finalCTA.badge')}
          </div>

          {/* Main Headline */}
          <h2 className="fade-in-element font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('finalCTA.title')}
          </h2>

          {/* Sub-headline */}
          <p className="fade-in-element text-xl md:text-2xl mb-10 leading-relaxed" style={{ color: '#D1D5DB' }}>
            {t('finalCTA.subtitle')}
          </p>

          {/* Primary CTA Button */}
          <div className="fade-in-element mb-10">
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 px-12 py-6 text-white text-xl font-bold font-heading rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              style={{ backgroundColor: '#FF6B00' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55F00'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6B00'}
            >
              {t('finalCTA.button')}
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Benefit Checklist */}
          <div className="fade-in-element flex flex-wrap items-center justify-center gap-6" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {benefits.map((benefitKey, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="flex-shrink-0" size={20} style={{ color: '#FF6B00' }} />
                <span className="text-lg font-medium">{t(benefitKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
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

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
