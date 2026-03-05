import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { PREVISIO_SECTIONS } from '../../types/financial-projections';
import {
  ShoppingCart, Package, Users, TrendingUp, Building2,
  HardDrive, Calculator, Landmark, BarChart3
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  ShoppingCart, Package, Users, TrendingUp, Building2,
  HardDrive, Calculator, Landmark, BarChart3,
};

interface FinancialSectionSidebarProps {
  className?: string;
}

const FinancialSectionSidebar: React.FC<FinancialSectionSidebarProps> = ({
  className = '',
}) => {
  const { t } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const currentPath = location.pathname.split('/').pop() || 'sales';

  return (
    <nav className={`hidden md:flex w-60 flex-shrink-0 flex-col border-r border-border bg-card ${className}`}>
      <div className="px-4 pt-5 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('fin.nav.title')}
        </h3>
      </div>
      <div className="px-3 pb-4 flex-1">
        <ul className="space-y-1">
          {PREVISIO_SECTIONS.map((section) => {
            const Icon = iconMap[section.icon];
            const isActive = currentPath === section.path;

            return (
              <li key={section.key}>
                <button
                  onClick={() => navigate(`/business-plan/${id}/financials/${section.path}`)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-strategy-blue/10 text-strategy-blue font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {Icon && (
                    <span className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 ${
                      isActive ? 'bg-strategy-blue/15' : ''
                    }`}>
                      <Icon className="w-4 h-4" />
                    </span>
                  )}
                  <span className="truncate flex-1 text-left">{t(section.translationKey)}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-strategy-blue shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default FinancialSectionSidebar;
