import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Plus,
  List,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomTabBarProps {
  /** Callback when sections drawer should open */
  onSectionsClick: () => void;
  /** Whether the sections drawer is open */
  isSectionsOpen?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface TabItem {
  id: string;
  icon: typeof LayoutDashboard;
  label: string;
  href?: string;
  action?: () => void;
  isPrimary?: boolean;
}

/**
 * BottomTabBar - Mobile navigation bar fixed at the bottom
 *
 * Features:
 * - 5 tabs: Dashboard, Plans, Create (primary), Sections, Profile
 * - Create button elevated with Momentum Orange accent
 * - Sections tab opens the document drawer
 * - Safe area padding for notched devices (iPhone X+)
 * - Strategy Blue background matching the app theme
 */
export default function BottomTabBar({
  onSectionsClick,
  isSectionsOpen,
  className
}: BottomTabBarProps) {
  const location = useLocation();

  const tabs: TabItem[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { id: 'plans', icon: FileText, label: 'Plans', href: '/dashboard' },
    { id: 'create', icon: Plus, label: 'Create', href: '/create-plan', isPrimary: true },
    { id: 'sections', icon: List, label: 'Sections', action: onSectionsClick },
    { id: 'profile', icon: User, label: 'Profile', href: '/profile' },
  ];

  const isActive = (tab: TabItem) => {
    if (tab.id === 'sections') return isSectionsOpen;
    if (tab.href) {
      if (tab.href === '/dashboard' && tab.id === 'dashboard') {
        return location.pathname === '/dashboard';
      }
      return location.pathname.startsWith(tab.href);
    }
    return false;
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-[#1A2B47] z-40',
        'border-t border-white/10',
        className
      )}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
      role="navigation"
      aria-label="Tab navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;

          // Primary "Create" button with special styling (elevated FAB style)
          if (tab.isPrimary) {
            return (
              <Link
                key={tab.id}
                to={tab.href!}
                className="flex flex-col items-center justify-center -mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange/50 rounded-full"
                aria-label={tab.label}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center',
                    'bg-momentum-orange shadow-lg shadow-momentum-orange/30',
                    'transition-shadow hover:shadow-xl hover:shadow-momentum-orange/40'
                  )}
                >
                  <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                </motion.div>
                <span className="text-[10px] text-gray-400 mt-1">{tab.label}</span>
              </Link>
            );
          }

          // Tab content (shared between link and button)
          const TabContent = (
            <div
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg',
                'transition-colors duration-200',
                active ? 'text-white' : 'text-gray-400'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" aria-hidden="true" />
                {active && (
                  <motion.div
                    layoutId="tab-active-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-momentum-orange rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
              <span className="text-[10px] mt-1">{tab.label}</span>
            </div>
          );

          // Action button (Sections tab)
          if (tab.action) {
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
                aria-expanded={active}
                aria-label={`Open ${tab.label}`}
              >
                {TabContent}
              </button>
            );
          }

          // Link tab
          return (
            <Link
              key={tab.id}
              to={tab.href!}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
              aria-current={active ? 'page' : undefined}
            >
              {TabContent}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
