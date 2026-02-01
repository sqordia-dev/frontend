import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Plus,
  Settings,
  User,
  Brain
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NavigationRailProps {
  /** Current user data for avatar */
  user?: {
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
  };
  /** Additional CSS classes */
  className?: string;
}

const railItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { id: 'plans', icon: FileText, label: 'My Plans', href: '/dashboard' },
  { id: 'create', icon: Plus, label: 'Create Plan', href: '/create-plan' },
];

const bottomItems = [
  { id: 'settings', icon: Settings, label: 'Settings', href: '/profile' },
];

/**
 * NavigationRail - Compact vertical navigation bar for the preview page
 *
 * Features:
 * - Fixed 56px width with icon-only navigation
 * - Tooltips on hover showing labels
 * - Active state with orange left border indicator
 * - User avatar at bottom with profile link
 * - Strategy Blue background matching the app theme
 */
export default function NavigationRail({ user, className }: NavigationRailProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard');
    }
    return location.pathname.startsWith(href);
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <TooltipProvider delayDuration={100}>
      <nav
        className={cn(
          'fixed left-0 top-0 h-screen w-14 bg-[#1A2B47] flex flex-col z-40',
          'border-r border-white/5',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/dashboard"
                aria-label="Go to Dashboard"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Brain className="w-7 h-7 text-momentum-orange" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Sqordia
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Navigation Items */}
        <div className="flex-1 flex flex-col items-center py-4 gap-1">
          {railItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      'transition-all duration-200 relative group',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                      active
                        ? 'bg-white/15 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="rail-active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-momentum-orange rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="pb-4 flex flex-col items-center gap-2">
          <Separator className="w-8 bg-white/10 mb-2" />

          {/* Settings */}
          {bottomItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      'transition-all duration-200 relative',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                      active
                        ? 'bg-white/15 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* User Avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/profile"
                className={cn(
                  'w-10 h-10 rounded-full overflow-hidden',
                  'border-2 border-white/20 hover:border-momentum-orange',
                  'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                  'flex items-center justify-center'
                )}
              >
                {user?.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    {user?.firstName ? (
                      <span className="text-sm font-medium text-white">{getInitials()}</span>
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Profile'}
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  );
}
