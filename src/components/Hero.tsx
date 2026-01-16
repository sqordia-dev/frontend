import { ArrowRight, Shield, Star, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { t } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in-up');
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll('.fade-in-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={heroRef} 
      className="relative pt-32 pb-40 overflow-hidden min-h-screen flex items-center"
      style={{ backgroundColor: '#1A2B47' }}
    >
      {/* Animated gradient background with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary orbs */}
        <div 
          className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full filter blur-[120px] opacity-30 animate-blob"
          style={{ 
            backgroundColor: 'rgba(255, 107, 0, 0.3)',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        ></div>
        <div 
          className="absolute top-40 left-10 w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-25 animate-blob animation-delay-2000"
          style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.25)',
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
          }}
        ></div>
        <div 
          className="absolute -bottom-20 left-1/2 w-[600px] h-[600px] rounded-full filter blur-[140px] opacity-20 animate-blob animation-delay-4000"
          style={{ 
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          }}
        ></div>

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        ></div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Animated Badge with glow effect */}
          <div className="fade-in-element inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full text-sm font-semibold font-heading relative group overflow-hidden">
            <div 
              className="absolute inset-0 rounded-full opacity-50 blur-xl"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }}
            ></div>
            <div 
              className="absolute inset-0 rounded-full backdrop-blur-md border"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            ></div>
            <Sparkles 
              size={16} 
              className="relative z-10 text-white animate-pulse"
              style={{ color: '#FF6B00' }}
            />
            <span className="relative z-10 text-white">{t('hero.badge')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="fade-in-element font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 relative">
            <span className="block text-white">
              {t('hero.headline.part1')}
            </span>
            <span className="block mt-2 text-white">
              {t('hero.headline.part2')} <span className="relative inline-block">
                <span className="text-white">{t('hero.headline.part3')}</span>
                <span 
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full opacity-50"
                  style={{ 
                    backgroundColor: '#FF6B00',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              </span>
            </span>
          </h1>

          {/* Sub-headline with fade-in */}
          <p className="fade-in-element text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto mb-12 font-light" style={{ color: '#D1D5DB' }}>
            {t('hero.subtitle')}
          </p>

          {/* Enhanced CTA Buttons with modern design */}
          <div className="fade-in-element flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/register"
              className="group relative px-10 py-5 text-white text-lg font-bold font-heading rounded-xl overflow-hidden transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl"
              style={{ 
                backgroundColor: '#FF6B00',
                boxShadow: '0 10px 40px rgba(255, 107, 0, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E55F00';
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(255, 107, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF6B00';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(255, 107, 0, 0.4)';
              }}
            >
              <span className="relative z-10">{t('hero.cta.businessPlan')}</span>
              <ArrowRight 
                size={20} 
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-2" 
              />
              {/* Shine effect */}
              <div 
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 opacity-30"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </Link>
            <Link
              to="/register"
              className="group relative px-10 py-5 text-lg font-bold font-heading rounded-xl overflow-hidden transition-all duration-500 flex items-center justify-center gap-3 backdrop-blur-sm border-2"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#1A2B47',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span className="relative z-10">{t('hero.cta.strategicPlan')}</span>
              <ArrowRight 
                size={20} 
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-2" 
              />
            </Link>
          </div>

          {/* Trust Signal with animated icon */}
          <div className="fade-in-element flex items-center justify-center gap-3 mb-12">
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-full blur-lg opacity-50 animate-pulse"
                style={{ backgroundColor: '#FF6B00' }}
              ></div>
              <Shield 
                className="relative text-white p-2 rounded-lg"
                size={24} 
                style={{ 
                  color: '#FF6B00',
                  backgroundColor: 'rgba(255, 107, 0, 0.1)',
                }}
              />
            </div>
            <span className="font-medium text-lg" style={{ color: '#D1D5DB' }}>
              {t('hero.trustSignal')}
            </span>
          </div>

          {/* Enhanced Social Proof Cards */}
          <div className="fade-in-element grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Plans Created Card */}
            <div 
              className="group relative p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white shadow-lg transition-transform hover:scale-110"
                      style={{ 
                        zIndex: 5 - i,
                        backgroundColor: '#3B82F6',
                      }}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">2,500+</div>
              <div className="text-sm" style={{ color: '#9CA3AF' }}>{t('hero.socialProof.plansCreated')}</div>
            </div>

            {/* Rating Card */}
            <div 
              className="group relative p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className="text-yellow-400 fill-yellow-400 transition-transform hover:scale-125"
                    size={20}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <div className="text-2xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-sm" style={{ color: '#9CA3AF' }}>{t('hero.socialProof.averageRating')}</div>
            </div>

            {/* No Credit Card Card */}
            <div 
              className="group relative p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div className="flex items-center justify-center mb-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: '#FF6B00' }}
                >
                  <Check className="text-white" size={24} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{t('hero.socialProof.free')}</div>
              <div className="text-sm" style={{ color: '#9CA3AF' }}>{t('hero.socialProof.noCreditCard')}</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
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
          animation: blob 8s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
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
