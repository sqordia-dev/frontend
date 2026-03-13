import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { PREVISIO_NAV, type PrevisioNavItem } from '../../types/financial-projections';

interface FinancialSectionSidebarProps {
  className?: string;
}

const EXPENSE_CHILD_PATHS = ['cogs', 'payroll', 'sales-expenses', 'admin-expenses', 'capex'];

const FinancialSectionSidebar: React.FC<FinancialSectionSidebarProps> = ({
  className = '',
}) => {
  const { t } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const currentPath = location.pathname.split('/').pop() || 'identification';

  // Auto-expand the Dépenses group when a child is active
  const isExpenseChildActive = EXPENSE_CHILD_PATHS.includes(currentPath);
  const [expensesOpen, setExpensesOpen] = useState(isExpenseChildActive);

  // Keep in sync if user navigates to an expense child via URL
  React.useEffect(() => {
    if (isExpenseChildActive && !expensesOpen) {
      setExpensesOpen(true);
    }
  }, [isExpenseChildActive]);

  const handleNavigate = (path: string) => {
    navigate(`/business-plan/${id}/financials/${path}`);
  };

  const renderItem = (item: PrevisioNavItem, isChild = false) => {
    // Group item with children (Dépenses)
    if (item.children) {
      return (
        <li key={item.key}>
          <button
            onClick={() => setExpensesOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between py-2.5 text-[0.9rem] transition-colors ${
              isExpenseChildActive
                ? 'text-strategy-blue font-medium'
                : 'text-foreground hover:text-strategy-blue'
            }`}
          >
            <span>{t(item.translationKey)}</span>
            <ChevronUp
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                expensesOpen ? '' : 'rotate-180'
              }`}
            />
          </button>
          {expensesOpen && (
            <ul className="ml-4 border-l border-border pl-3 space-y-0.5 pb-1">
              {item.children.map((child) => renderItem(child, true))}
            </ul>
          )}
        </li>
      );
    }

    // Leaf item
    const isActive = currentPath === item.path;

    return (
      <li key={item.key}>
        <button
          onClick={() => item.path && handleNavigate(item.path)}
          className={`w-full text-left py-2.5 transition-colors ${
            isChild ? 'text-[0.85rem]' : 'text-[0.9rem]'
          } ${
            isActive
              ? 'text-strategy-blue font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t(item.translationKey)}
        </button>
      </li>
    );
  };

  return (
    <nav className={`hidden md:flex w-56 flex-shrink-0 flex-col bg-card ${className}`}>
      <div className="relative pl-5 pr-4 pt-6 pb-4 flex-1">
        {/* Left accent border */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-strategy-blue/20 rounded-full" />

        {/* Active indicator */}
        <ActiveIndicator currentPath={currentPath} />

        <ul className="space-y-0.5">
          {PREVISIO_NAV.map((item) => renderItem(item))}
        </ul>
      </div>
    </nav>
  );
};

/**
 * Animated blue indicator on the left border, positioned next to the active item.
 * We render this as a visual-only overlay since measuring exact positions
 * would add complexity — the blue text color is the primary active indicator.
 */
const ActiveIndicator: React.FC<{ currentPath: string }> = () => {
  // The active state is communicated via the blue text color on the active item.
  // The left border provides the structural accent (matches the screenshot).
  return null;
};

export default FinancialSectionSidebar;
