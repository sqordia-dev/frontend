import React, { useState } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useIsMobile } from '../../hooks';
import FinancialSectionSidebar from '../../components/financial/FinancialSectionSidebar';
import FinancialPageHeader from '../../components/financial/FinancialPageHeader';
import { useFinancialPlan, useCreateFinancialPlan } from '../../hooks/usePrevisio';
import { PREVISIO_SECTIONS } from '../../types/financial-projections';
import { PageTransition } from '../../components/ui/page-transition';
import { SkeletonPage } from '../../components/ui/skeleton';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '../../components/ui/sheet';
import {
  ShoppingCart, Package, Users, TrendingUp, Building2,
  HardDrive, Calculator, Landmark, BarChart3
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  ShoppingCart, Package, Users, TrendingUp, Building2,
  HardDrive, Calculator, Landmark, BarChart3,
};

const FinancialProjectionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { data: plan, isLoading, error } = useFinancialPlan(id || '');
  const createPlan = useCreateFinancialPlan(id || '');
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentPath = location.pathname.split('/').pop() || 'sales';

  // Auto-create plan if it doesn't exist
  React.useEffect(() => {
    if (error && !createPlan.isPending) {
      const currentYear = new Date().getFullYear();
      createPlan.mutate({ startYear: currentYear });
    }
  }, [error]);

  if (isLoading || createPlan.isPending) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <FinancialPageHeader />
        <SkeletonPage />
      </div>
    );
  }

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
              <ul className="space-y-1">
                {PREVISIO_SECTIONS.map((section) => {
                  const Icon = iconMap[section.icon];
                  const isActive = currentPath === section.path;
                  return (
                    <li key={section.key}>
                      <button
                        onClick={() => {
                          navigate(`/business-plan/${id}/financials/${section.path}`);
                          setSheetOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-colors ${
                          isActive
                            ? 'bg-strategy-blue/10 text-strategy-blue font-medium'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {Icon && (
                          <span className={`flex items-center justify-center w-8 h-8 rounded-md ${
                            isActive ? 'bg-strategy-blue/15' : 'bg-muted'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </span>
                        )}
                        <span>{t(section.translationKey)}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-strategy-blue" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default FinancialProjectionsPage;
