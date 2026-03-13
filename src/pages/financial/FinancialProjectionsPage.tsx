import React, { useState } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useIsMobile } from '../../hooks';
import FinancialSectionSidebar from '../../components/financial/FinancialSectionSidebar';
import FinancialPageHeader from '../../components/financial/FinancialPageHeader';
import { useFinancialPlan, useCreateFinancialPlan } from '../../hooks/usePrevisio';
import { PREVISIO_NAV, type PrevisioNavItem } from '../../types/financial-projections';
import { PageTransition } from '../../components/ui/page-transition';
import { SkeletonPage } from '../../components/ui/skeleton';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '../../components/ui/sheet';

const EXPENSE_CHILD_PATHS = ['cogs', 'payroll', 'sales-expenses', 'admin-expenses', 'capex'];

const FinancialProjectionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { data: plan, isLoading, error } = useFinancialPlan(id || '');
  const createPlan = useCreateFinancialPlan(id || '');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileExpensesOpen, setMobileExpensesOpen] = useState(false);

  const currentPath = location.pathname.split('/').pop() || 'identification';

  // Auto-create plan if it doesn't exist
  React.useEffect(() => {
    if (error && !createPlan.isPending) {
      const currentYear = new Date().getFullYear();
      createPlan.mutate({ startYear: currentYear });
    }
  }, [error]);

  // Auto-expand expenses group on mobile when a child is active
  React.useEffect(() => {
    if (EXPENSE_CHILD_PATHS.includes(currentPath)) {
      setMobileExpensesOpen(true);
    }
  }, [currentPath]);

  if (isLoading || createPlan.isPending) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <FinancialPageHeader />
        <SkeletonPage />
      </div>
    );
  }

  const handleMobileNavigate = (path: string) => {
    navigate(`/business-plan/${id}/financials/${path}`);
    setSheetOpen(false);
  };

  const renderMobileItem = (item: PrevisioNavItem) => {
    if (item.children) {
      const isChildActive = item.children.some((c) => c.path === currentPath);
      return (
        <li key={item.key}>
          <button
            onClick={() => setMobileExpensesOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3 py-3 text-sm rounded-lg transition-colors ${
              isChildActive
                ? 'text-strategy-blue font-medium'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <span>{t(item.translationKey)}</span>
            <ChevronUp
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                mobileExpensesOpen ? '' : 'rotate-180'
              }`}
            />
          </button>
          {mobileExpensesOpen && (
            <ul className="ml-4 border-l border-border pl-2 space-y-0.5">
              {item.children.map((child) => renderMobileItem(child))}
            </ul>
          )}
        </li>
      );
    }

    const isActive = currentPath === item.path;
    return (
      <li key={item.key}>
        <button
          onClick={() => item.path && handleMobileNavigate(item.path)}
          className={`w-full text-left px-3 py-3 text-sm rounded-lg transition-colors ${
            isActive
              ? 'bg-strategy-blue/10 text-strategy-blue font-medium'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          {t(item.translationKey)}
        </button>
      </li>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <FinancialPageHeader onOpenSheet={() => setSheetOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <FinancialSectionSidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-24 md:pb-8">
            <PageTransition pageKey={currentPath} variant="slideUp">
              <Outlet context={{ plan, businessPlanId: id }} />
            </PageTransition>
          </div>
        </main>
      </div>

      {/* Mobile bottom sheet nav */}
      {isMobile && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom">
            <SheetHeader className="text-left mb-4">
              <SheetTitle>{t('fin.nav.title')}</SheetTitle>
              <SheetDescription>{t('fin.header.sections')}</SheetDescription>
            </SheetHeader>
            <nav>
              <ul className="space-y-0.5">
                {PREVISIO_NAV.map((item) => renderMobileItem(item))}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default FinancialProjectionsPage;
