import { useEffect, useState } from 'react';

/**
 * Animated ambient background for auth pages.
 * Renders gradient orbs with blob animation, matching the landing page Hero visual language.
 * Respects prefers-reduced-motion for accessibility.
 */
export default function AnimatedBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const blobAnimate = prefersReducedMotion ? '' : 'animate-blob';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Indigo orb - top right */}
      <div
        className={`absolute -top-20 -right-20 h-[350px] w-[350px] rounded-full opacity-60 blur-[100px] md:h-[500px] md:w-[500px] md:blur-[120px] ${blobAnimate}`}
        style={{
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
        }}
      />
      {/* Pink orb - top left */}
      <div
        className={`absolute -top-10 -left-20 h-[280px] w-[280px] rounded-full opacity-50 blur-[80px] md:h-[400px] md:w-[400px] md:blur-[100px] ${blobAnimate} ${prefersReducedMotion ? '' : 'animation-delay-200'}`}
        style={{
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          animationDelay: prefersReducedMotion ? undefined : '2s',
        }}
      />
      {/* Orange orb - bottom center */}
      <div
        className={`absolute -bottom-10 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full opacity-40 blur-[80px] md:h-[450px] md:w-[450px] md:blur-[100px] ${blobAnimate}`}
        style={{
          backgroundColor: 'rgba(255, 107, 0, 0.12)',
          animationDelay: prefersReducedMotion ? undefined : '4s',
        }}
      />
    </div>
  );
}
