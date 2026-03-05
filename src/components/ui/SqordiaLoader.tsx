import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SqordiaLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Full-page centered loader */
  fullPage?: boolean;
}

const BAR_COLORS = [
  '#FF6B00', // momentum-orange
  '#CC5500',
  '#994010',
  '#663020',
  '#1A2B47', // strategy-blue
];

const SIZES = {
  sm: { logo: 'w-8 h-8', icon: 'w-4 h-4', barH: 16, barW: 3, gap: 3, text: 'text-xs' },
  md: { logo: 'w-11 h-11', icon: 'w-5 h-5', barH: 24, barW: 4, gap: 4, text: 'text-sm' },
  lg: { logo: 'w-14 h-14', icon: 'w-7 h-7', barH: 32, barW: 5, gap: 5, text: 'text-sm' },
};

export function SqordiaLoader({
  message,
  size = 'md',
  className,
  fullPage = false,
}: SqordiaLoaderProps) {
  const s = SIZES[size];

  const loader = (
    <div
      role="status"
      aria-label={message || 'Loading'}
      className={cn('flex flex-col items-center gap-3', className)}
    >
      {/* Brain logo */}
      <div
        className={cn(
          'flex items-center justify-center rounded-xl',
          'bg-gradient-to-br from-strategy-blue to-[#0f1a2e] text-white shadow-lg',
          s.logo,
        )}
      >
        <Brain className={s.icon} />
      </div>

      {/* Wave bars */}
      <div className="flex items-end" style={{ gap: s.gap, height: s.barH }}>
        {BAR_COLORS.map((color, i) => (
          <div
            key={i}
            className="rounded-full animate-[sqordia-wave_1s_ease-in-out_infinite]"
            style={{
              width: s.barW,
              height: s.barH * 0.45,
              backgroundColor: color,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>

      {/* Message */}
      {message && (
        <p className={cn(
          'text-muted-foreground font-medium tracking-wide',
          s.text,
        )}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        {loader}
      </div>
    );
  }

  return loader;
}

export function SqordiaPageLoader({ message = 'Loading...' }: { message?: string }) {
  return <SqordiaLoader message={message} size="lg" fullPage />;
}

export function SqordiaInlineLoader({ message }: { message?: string }) {
  return <SqordiaLoader message={message} size="sm" />;
}
