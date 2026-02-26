import { Link } from 'react-router-dom';
import { Sparkles, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
  className?: string;
}

interface DashboardButtonProps {
  className?: string;
  showText?: boolean;
}

const SIZES = {
  sm: { container: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-lg' },
  md: { container: 'h-9 w-9', icon: 'h-4 w-4', text: 'text-xl' },
  lg: { container: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-2xl' },
};

export function Logo({ showText = true, size = 'md', linkTo, className }: LogoProps) {
  const sizeConfig = SIZES[size];

  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(
        'bg-gradient-to-br from-strategy-blue to-[#0f1a2e] rounded-xl flex items-center justify-center text-white shadow-md',
        sizeConfig.container
      )}>
        <Sparkles className={sizeConfig.icon} />
      </div>
      {showText && (
        <span className={cn(
          'font-bold tracking-tight text-foreground font-heading',
          sizeConfig.text
        )}>
          Sqordia
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center group">
        {content}
      </Link>
    );
  }

  return content;
}

export function DashboardButton({ className, showText = true }: DashboardButtonProps) {
  return (
    <Link
      to="/dashboard"
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
        className
      )}
    >
      <Home className="w-4 h-4" />
      {showText && <span className="hidden sm:inline">Dashboard</span>}
    </Link>
  );
}
