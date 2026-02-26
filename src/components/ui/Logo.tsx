import { Link } from 'react-router-dom';
import { Brain, Home } from 'lucide-react';
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
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-lg' },
  md: { container: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-xl' },
  lg: { container: 'w-10 h-10', icon: 'w-6 h-6', text: 'text-2xl' },
};

export function Logo({ showText = true, size = 'md', linkTo, className }: LogoProps) {
  const sizeConfig = SIZES[size];

  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(
        'bg-[#1e3a5f] rounded-lg flex items-center justify-center',
        sizeConfig.container
      )}>
        <Brain className={cn('text-white', sizeConfig.icon)} />
      </div>
      {showText && (
        <span className={cn(
          'font-bold tracking-tight text-gray-900 dark:text-white',
          sizeConfig.text
        )}>
          Sqordia
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center">
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
