import { useState, useEffect, type FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useProjectCost, useUpdateProjectCost } from '../../hooks/usePrevisio';
import type { FinancialPlanDto } from '../../types/financial-projections';
import { SkeletonTable } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

interface OutletContext {
  plan: FinancialPlanDto;
  businessPlanId: string;
}

function fmtCell(value: number): string {
  const n = Number(value) || 0;
  if (n === 0) return '0 $';
  return `${Math.round(n).toLocaleString('fr-CA')} $`;
}

const DURATION_OPTIONS = Array.from({ length: 25 }, (_, i) => ({
  value: i,
  label: `${i} mois`,
}));

const GRID_COLS = 'minmax(180px, 1.5fr) repeat(3, 1fr) minmax(100px, auto) 1fr';

const ProjectCostSection: FC = () => {
  const { t, language } = useTheme();
  const { plan, businessPlanId } = useOutletContext<OutletContext>();
  const { data, isLoading } = useProjectCost(businessPlanId);
  const updateProjectCost = useUpdateProjectCost(businessPlanId);

  const startDateLabel = language === 'fr'
    ? `${['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][(plan.startMonth || 1) - 1]} ${plan.startYear}`
    : `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(plan.startMonth || 1) - 1]} ${plan.startYear}`;

  // Local editable state
  const [salaryAcquired, setSalaryAcquired] = useState(0);
  const [salaryBefore, setSalaryBefore] = useState(0);
  const [salaryAfter, setSalaryAfter] = useState(0);
  const [salaryDuration, setSalaryDuration] = useState(3);

  const [salesExpAcquired, setSalesExpAcquired] = useState(0);
  const [salesExpBefore, setSalesExpBefore] = useState(0);
  const [salesExpAfter, setSalesExpAfter] = useState(0);
  const [salesExpDuration, setSalesExpDuration] = useState(3);

  const [adminExpAcquired, setAdminExpAcquired] = useState(0);
  const [adminExpBefore, setAdminExpBefore] = useState(0);
  const [adminExpAfter, setAdminExpAfter] = useState(0);
  const [adminExpDuration, setAdminExpDuration] = useState(3);

  const [inventoryAcquired, setInventoryAcquired] = useState(0);
  const [inventoryBefore, setInventoryBefore] = useState(0);
  const [inventoryAfter, setInventoryAfter] = useState(0);
  const [inventoryDuration, setInventoryDuration] = useState(3);

  const [immobAcquired, setImmobAcquired] = useState(0);
  const [immobBefore, setImmobBefore] = useState(0);
  const [immobAfter, setImmobAfter] = useState(0);
  const [immobDuration, setImmobDuration] = useState(3);

  // Initialize from backend data (default to 0 for null/undefined values)
  useEffect(() => {
    if (data) {
      setSalaryAcquired(data.salaryAlreadyAcquired ?? 0);
      setSalaryBefore(data.salaryAcquireBefore ?? 0);
      setSalaryAfter(data.salaryAcquireAfter ?? 0);
      setSalaryDuration(data.salaryDurationMonths ?? 3);
      setSalesExpAcquired(data.salesExpAlreadyAcquired ?? 0);
      setSalesExpBefore(data.salesExpAcquireBefore ?? 0);
      setSalesExpAfter(data.salesExpAcquireAfter ?? 0);
      setSalesExpDuration(data.salesExpDurationMonths ?? 3);
      setAdminExpAcquired(data.adminExpAlreadyAcquired ?? 0);
      setAdminExpBefore(data.adminExpAcquireBefore ?? 0);
      setAdminExpAfter(data.adminExpAcquireAfter ?? 0);
      setAdminExpDuration(data.adminExpDurationMonths ?? 3);
      setInventoryAcquired(data.inventoryAlreadyAcquired ?? 0);
      setInventoryBefore(data.inventoryAcquireBefore ?? 0);
      setInventoryAfter(data.inventoryAcquireAfter ?? 0);
      setInventoryDuration(data.inventoryDurationMonths ?? 3);
      setImmobAcquired(data.capexAlreadyAcquired ?? 0);
      setImmobBefore(data.capexAcquireBefore ?? 0);
      setImmobAfter(data.capexAcquireAfter ?? 0);
      setImmobDuration(data.capexDurationMonths ?? 3);
    }
  }, [data]);

  // Computed totals
  const salaryTotal = salaryAcquired + salaryBefore + salaryAfter;
  const salesExpTotal = salesExpAcquired + salesExpBefore + salesExpAfter;
  const adminExpTotal = adminExpAcquired + adminExpBefore + adminExpAfter;
  const startupSubtotalAcq = salaryAcquired + salesExpAcquired + adminExpAcquired;
  const startupSubtotalBefore = salaryBefore + salesExpBefore + adminExpBefore;
  const startupSubtotalAfter = salaryAfter + salesExpAfter + adminExpAfter;
  const startupSubtotalTotal = salaryTotal + salesExpTotal + adminExpTotal;

  const inventoryTotal = inventoryAcquired + inventoryBefore + inventoryAfter;
  const immobTotal = immobAcquired + immobBefore + immobAfter;
  const projectTotal = startupSubtotalTotal + inventoryTotal + immobTotal;

  const handleSave = () => {
    updateProjectCost.mutate({
      workingCapitalMonthsCOGS: data?.workingCapitalMonthsCOGS ?? 3,
      workingCapitalMonthsPayroll: data?.workingCapitalMonthsPayroll ?? 3,
      workingCapitalMonthsSalesExpenses: data?.workingCapitalMonthsSalesExpenses ?? 3,
      workingCapitalMonthsAdminExpenses: data?.workingCapitalMonthsAdminExpenses ?? 3,
      capexInclusionMonths: data?.capexInclusionMonths ?? 12,
      salaryAlreadyAcquired: salaryAcquired,
      salaryAcquireBefore: salaryBefore,
      salaryAcquireAfter: salaryAfter,
      salaryDurationMonths: salaryDuration,
      salesExpAlreadyAcquired: salesExpAcquired,
      salesExpAcquireBefore: salesExpBefore,
      salesExpAcquireAfter: salesExpAfter,
      salesExpDurationMonths: salesExpDuration,
      adminExpAlreadyAcquired: adminExpAcquired,
      adminExpAcquireBefore: adminExpBefore,
      adminExpAcquireAfter: adminExpAfter,
      adminExpDurationMonths: adminExpDuration,
      inventoryAlreadyAcquired: inventoryAcquired,
      inventoryAcquireBefore: inventoryBefore,
      inventoryAcquireAfter: inventoryAfter,
      inventoryDurationMonths: inventoryDuration,
      capexAlreadyAcquired: immobAcquired,
      capexAcquireBefore: immobBefore,
      capexAcquireAfter: immobAfter,
      capexDurationMonths: immobDuration,
    });
  };

  const handleCancel = () => {
    if (data) {
      setSalaryAcquired(data.salaryAlreadyAcquired ?? 0);
      setSalaryBefore(data.salaryAcquireBefore ?? 0);
      setSalaryAfter(data.salaryAcquireAfter ?? 0);
      setSalaryDuration(data.salaryDurationMonths ?? 3);
      setSalesExpAcquired(data.salesExpAlreadyAcquired ?? 0);
      setSalesExpBefore(data.salesExpAcquireBefore ?? 0);
      setSalesExpAfter(data.salesExpAcquireAfter ?? 0);
      setSalesExpDuration(data.salesExpDurationMonths ?? 3);
      setAdminExpAcquired(data.adminExpAlreadyAcquired ?? 0);
      setAdminExpBefore(data.adminExpAcquireBefore ?? 0);
      setAdminExpAfter(data.adminExpAcquireAfter ?? 0);
      setAdminExpDuration(data.adminExpDurationMonths ?? 3);
      setInventoryAcquired(data.inventoryAlreadyAcquired ?? 0);
      setInventoryBefore(data.inventoryAcquireBefore ?? 0);
      setInventoryAfter(data.inventoryAcquireAfter ?? 0);
      setInventoryDuration(data.inventoryDurationMonths ?? 3);
      setImmobAcquired(data.capexAlreadyAcquired ?? 0);
      setImmobBefore(data.capexAcquireBefore ?? 0);
      setImmobAfter(data.capexAcquireAfter ?? 0);
      setImmobDuration(data.capexDurationMonths ?? 3);
    }
  };

  if (isLoading) return <SkeletonTable rows={8} columns={6} />;

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold text-strategy-blue mb-8">
        {t('fin.projectCost.title')}
      </h2>

      {/* Grid */}
      <div className="grid gap-y-1" style={{ gridTemplateColumns: GRID_COLS }}>
        {/* Header row */}
        <div />
        <div className="px-1 py-3 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
          {t('fin.projectCost.alreadyAcquired')}
        </div>
        <div className="px-1 py-3 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
          {t('fin.projectCost.acquireBefore')} {startDateLabel.toUpperCase()}
        </div>
        <div className="px-1 py-3 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
          {t('fin.projectCost.acquireAfter')} {startDateLabel.toUpperCase()}
        </div>
        <div className="px-1 py-3 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
          {t('fin.projectCost.duration')}
        </div>
        <div className="px-1 py-3 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
          TOTAL
        </div>

        {/* Section: Coûts de démarrage */}
        <div className="col-span-6 mt-4 mb-2">
          <span className="text-sm font-bold text-foreground">{t('fin.projectCost.startupCosts')}</span>
        </div>

        <CostRow label={t('fin.projectCost.salary')} acquired={salaryAcquired} onAcquiredChange={setSalaryAcquired} before={salaryBefore} onBeforeChange={setSalaryBefore} after={salaryAfter} onAfterChange={setSalaryAfter} duration={salaryDuration} onDurationChange={setSalaryDuration} total={salaryTotal} indent />
        <CostRow label={t('fin.projectCost.salesExp')} acquired={salesExpAcquired} onAcquiredChange={setSalesExpAcquired} before={salesExpBefore} onBeforeChange={setSalesExpBefore} after={salesExpAfter} onAfterChange={setSalesExpAfter} duration={salesExpDuration} onDurationChange={setSalesExpDuration} total={salesExpTotal} indent />
        <CostRow label={t('fin.projectCost.adminExp')} acquired={adminExpAcquired} onAcquiredChange={setAdminExpAcquired} before={adminExpBefore} onBeforeChange={setAdminExpBefore} after={adminExpAfter} onAfterChange={setAdminExpAfter} duration={adminExpDuration} onDurationChange={setAdminExpDuration} total={adminExpTotal} indent />

        {/* Subtotal */}
        <div className="px-2 py-2 text-sm font-semibold text-foreground self-center">
          {t('fin.projectCost.startupSubtotal')}
        </div>
        <SummaryCell value={startupSubtotalAcq} />
        <SummaryCell value={startupSubtotalBefore} />
        <SummaryCell value={startupSubtotalAfter} />
        <div />
        <SummaryCell value={startupSubtotalTotal} bold />

        <div className="col-span-6 h-4" />

        <CostRow label={t('fin.projectCost.inventoryPurchase')} acquired={inventoryAcquired} onAcquiredChange={setInventoryAcquired} before={inventoryBefore} onBeforeChange={setInventoryBefore} after={inventoryAfter} onAfterChange={setInventoryAfter} duration={inventoryDuration} onDurationChange={setInventoryDuration} total={inventoryTotal} bold />

        <div className="col-span-6 h-4" />

        <CostRow label={t('fin.projectCost.capitalAssetsRow')} acquired={immobAcquired} onAcquiredChange={setImmobAcquired} before={immobBefore} onBeforeChange={setImmobBefore} after={immobAfter} onAfterChange={setImmobAfter} duration={immobDuration} onDurationChange={setImmobDuration} total={immobTotal} bold />
      </div>

      {/* Total du projet */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <span className="text-lg font-bold text-foreground">{t('fin.projectCost.totalProjectCost')}</span>
        <span className="text-2xl font-bold text-strategy-blue">{fmtCell(projectTotal)}</span>
      </div>

      {/* Save / Cancel */}
      <div className="flex items-center gap-4 mt-10 pt-8 border-t border-border">
        <Button onClick={handleSave} disabled={updateProjectCost.isPending} className="rounded-full px-8">
          {updateProjectCost.isPending ? t('fin.ident.saving') : t('fin.common.save')}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={updateProjectCost.isPending}
          className="rounded-full px-8 text-strategy-blue border-strategy-blue hover:bg-strategy-blue/5"
        >
          {t('fin.common.cancel')}
        </Button>
      </div>
    </div>
  );
};

export default ProjectCostSection;

// -- Summary cell (blue read-only) --

function SummaryCell({ value, bold }: { value: number; bold?: boolean }) {
  return (
    <div className="px-1 py-1">
      <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg h-10 flex items-center justify-center text-sm text-foreground ${bold ? 'font-bold' : ''}`}>
        {fmtCell(value)}
      </div>
    </div>
  );
}

// -- Editable cost row --

function CostRow({
  label, acquired, onAcquiredChange, before, onBeforeChange, after, onAfterChange,
  duration, onDurationChange, total, indent, bold,
}: {
  label: string;
  acquired: number; onAcquiredChange: (v: number) => void;
  before: number; onBeforeChange: (v: number) => void;
  after: number; onAfterChange: (v: number) => void;
  duration: number; onDurationChange: (v: number) => void;
  total: number;
  indent?: boolean;
  bold?: boolean;
}) {
  return (
    <>
      <div className={`px-2 py-2 text-sm self-center truncate ${indent ? 'pl-6' : ''} ${bold ? 'font-bold text-foreground' : 'text-foreground'}`}>
        {label}
      </div>
      <EditableCell value={acquired} onChange={onAcquiredChange} />
      <EditableCell value={before} onChange={onBeforeChange} />
      <EditableCell value={after} onChange={onAfterChange} />
      <div className="px-1 py-1">
        <select
          value={duration}
          onChange={(e) => onDurationChange(parseInt(e.target.value, 10))}
          className="w-full h-10 px-2 text-center border border-border rounded-lg text-sm font-medium bg-card focus:outline-none focus:border-strategy-blue focus:ring-2 focus:ring-strategy-blue/20"
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="px-1 py-1">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg h-10 flex items-center justify-center text-sm font-medium text-foreground">
          {fmtCell(total)}
        </div>
      </div>
    </>
  );
}

function EditableCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const startEdit = () => {
    setEditing(true);
    setEditValue(value === 0 ? '' : String(value));
  };

  const commit = () => {
    onChange(parseFloat(editValue) || 0);
    setEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { setEditing(false); setEditValue(''); }
  };

  return (
    <div className="px-1 py-1">
      {editing ? (
        <input
          type="number" value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commit} onKeyDown={handleKeyDown} autoFocus
          className="w-full h-10 text-center border-2 border-strategy-blue rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-strategy-blue/20"
        />
      ) : (
        <div
          className="border border-border rounded-lg h-10 flex items-center justify-center text-sm font-medium text-foreground cursor-pointer bg-card hover:border-strategy-blue/40 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
          onClick={startEdit}
        >{fmtCell(value)}</div>
      )}
    </div>
  );
}
