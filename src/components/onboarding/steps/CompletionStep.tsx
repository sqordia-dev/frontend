import { useEffect, useState, useRef } from 'react';
import { CheckCircle, ArrowRight, Clock, FileEdit, Brain, BarChart3, FileOutput } from 'lucide-react';
import { StepProps } from '../../../types/onboarding';

/**
 * Completion step - Final step in onboarding flow
 * Shows celebration, summary, and what's next
 */
export default function CompletionStep({
  data,
  onComplete,
  isLastStep,
}: StepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<HTMLCanvasElement>(null);

  const userName = data.userName || 'there';
  const businessName = data.businessName || 'Your Business';

  // Trigger confetti on mount
  useEffect(() => {
    setShowConfetti(true);

    // Simple confetti animation using canvas
    const canvas = confettiRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }

    const particles: Particle[] = [];
    const colors = ['#FF6B00', '#1A2B47', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];

    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    let animationId: number;
    let startTime = Date.now();
    const duration = 4000; // 4 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setShowConfetti(false);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.rotation += p.rotationSpeed;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const handleStartBuilding = async () => {
    if (!onComplete) return;

    setIsLoading(true);
    try {
      await onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    window.location.href = '/dashboard';
  };

  const whatNextItems = [
    {
      icon: FileEdit,
      title: 'Answer guided questions',
      description: 'Simple questions to capture your business details',
    },
    {
      icon: Brain,
      title: 'AI generates your plan',
      description: 'Our AI creates professional content from your answers',
    },
    {
      icon: BarChart3,
      title: 'Review financials',
      description: 'Auto-generated projections based on your inputs',
    },
    {
      icon: FileOutput,
      title: 'Export your plan',
      description: 'Download as PDF or Word document',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4 relative">
      {/* Confetti canvas */}
      {showConfetti && (
        <canvas
          ref={confettiRef}
          className="fixed inset-0 pointer-events-none z-50"
          aria-hidden="true"
        />
      )}

      {/* Party emoji animation */}
      <div className="text-6xl mb-6 animate-bounce" aria-hidden="true">
        <span role="img" aria-label="celebration">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#10B981" fillOpacity="0.1"/>
            <path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm0 44c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20z" fill="#10B981"/>
            <path d="M32 16c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16z" fill="#10B981" fillOpacity="0.2"/>
            <path d="M44 28l-16 16-8-8" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
        <CheckCircle size={40} className="text-green-500" aria-hidden="true" />
      </div>

      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        You're all set, {userName}!
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 max-w-lg">
        Your business plan <span className="font-semibold text-gray-900 dark:text-white">"{businessName}"</span> is ready to be created.
      </p>

      {/* Estimated time */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-sm font-medium mb-8">
        <Clock size={16} aria-hidden="true" />
        <span>Estimated time: 15-20 minutes</span>
      </div>

      {/* What's Next card */}
      <div className="w-full max-w-lg bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 text-left">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What's Next
        </h2>
        <ol className="space-y-4">
          {whatNextItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon size={16} className="text-gray-500" aria-hidden="true" />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleStartBuilding}
          disabled={isLoading}
          className="
            inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
            bg-orange-500 hover:bg-orange-600 text-white font-semibold
            transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          style={{ backgroundColor: '#FF6B00' }}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              Creating your plan...
            </>
          ) : (
            <>
              Start Building My Plan
              <ArrowRight size={20} aria-hidden="true" />
            </>
          )}
        </button>

        <button
          onClick={handleSkip}
          disabled={isLoading}
          className="
            inline-flex items-center gap-2 px-6 py-3 rounded-xl
            text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          I'll do this later
        </button>
      </div>
    </div>
  );
}
