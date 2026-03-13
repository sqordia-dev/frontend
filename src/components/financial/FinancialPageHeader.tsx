import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Menu, Sun, Moon, LogOut, Settings, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useIsMobile } from '../../hooks';
import { PREVISIO_SECTIONS } from '../../types/financial-projections';
import { authService } from '../../lib/auth-service';
import type { User as UserType } from '../../lib/types';
import { Button } from '../ui/button';
import LanguageDropdown from '../layout/LanguageDropdown';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from '../ui/breadcrumb';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface FinancialPageHeaderProps {
  onOpenSheet?: () => void;
}

const FinancialPageHeader: React.FC<FinancialPageHeaderProps> = ({ onOpenSheet }) => {
  const { theme, toggleTheme, t } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [user, setUser] = useState<UserType | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    authService.getCurrentUser()
      .then((u) => { setUser(u); setImgError(false); })
      .catch(() => {});
  }, []);

  const currentPath = location.pathname.split('/').pop() || 'identification';
  const currentSection = PREVISIO_SECTIONS.find(s => s.path === currentPath);
  const sectionName = currentSection ? t(currentSection.translationKey) : '';

  const initials = user
    ? `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`
    : '';

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border h-14 flex items-center px-4 gap-3">
      {/* Back button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigate(`/business-plan/${id}/preview`)}
        aria-label={t('fin.header.back')}
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>

      {/* Center: breadcrumb or section name */}
      {isMobile ? (
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className="text-sm font-semibold truncate">{sectionName}</span>
          <Button variant="ghost" size="sm" onClick={onOpenSheet} className="shrink-0">
            <Menu className="w-4 h-4 mr-1.5" />
            {t('fin.header.sections')}
          </Button>
        </div>
      ) : (
        <Breadcrumb className="flex-1">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">{t('nav.dashboard')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/business-plan/${id}/preview`}>{t('fin.breadcrumb.businessPlan')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{sectionName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Language toggle */}
        <LanguageDropdown variant="toggle" className="hidden sm:flex" />

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-border hover:ring-primary/50 transition-all overflow-hidden shrink-0"
              aria-label="User menu"
            >
              {user?.profilePictureUrl && !imgError ? (
                <img
                  src={user.profilePictureUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center bg-strategy-blue text-white text-xs font-semibold">
                  {initials || <User className="w-4 h-4" />}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
            {user && (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                {t('nav.settings')}
              </Link>
            </DropdownMenuItem>

            {/* Language toggle inside dropdown on mobile */}
            <div className="sm:hidden px-2 py-1.5">
              <LanguageDropdown variant="toggle" className="w-full justify-center" />
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4" />
              {t('nav.logout') || 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default FinancialPageHeader;
