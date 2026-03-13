// === Previsio Financial Projections Types ===

export interface FinancialPlanDto {
  id: string;
  businessPlanId: string;
  projectionYears: number;
  startYear: number;
  startMonth: number;
  salesTaxFrequency?: string;
  isAlreadyOperating: boolean;
  defaultVolumeGrowthRate: number;
  defaultPriceIndexationRate: number;
  defaultExpenseIndexationRate: number;
  defaultSocialChargeRate: number;
  defaultSalesTaxRate: number;
  salesProductCount: number;
  payrollItemCount: number;
  financingSourceCount: number;
}

export interface FinancialPlanSettings {
  projectionYears: number;
  defaultVolumeGrowthRate: number;
  defaultPriceIndexationRate: number;
  defaultExpenseIndexationRate: number;
  defaultSocialChargeRate: number;
  defaultSalesTaxRate: number;
  startMonth?: number;
  salesTaxFrequency?: string;
  isAlreadyOperating?: boolean;
}

// === Sales ===

export type PaymentDelay = 'Immediate' | 'OneMonth' | 'TwoMonths' | 'ThreeMonths' | 'SixMonths' | 'TwelveMonths';
export type SalesInputMode = 'Quantity' | 'Dollars';

export interface SalesProduct {
  id: string;
  name: string;
  unitPrice: number;
  paymentDelay: PaymentDelay;
  taxRate: number;
  inputMode: SalesInputMode;
  volumeIndexationRate: number;
  priceIndexationRate: number;
  sortOrder: number;
  hasCOGS: boolean;
}

export interface MonthlyValue {
  month: number;
  value: number;
}

export interface SalesVolumeGrid {
  salesProductId: string;
  productName: string;
  year: number;
  monthlyValues: MonthlyValue[];
  yearTotal: number;
}

export interface SalesModuleData {
  products: SalesProduct[];
  volumeGrids: SalesVolumeGrid[];
}

// === COGS ===

export type CostMode = 'FixedDollars' | 'PercentageOfPrice';

export interface COGSItem {
  id: string;
  linkedSalesProductId: string;
  linkedProductName: string;
  linkedProductPrice: number;
  costMode: CostMode;
  costValue: number;
  beginningInventory: number;
  costIndexationRate: number;
  effectiveCostPerUnit: number;
}

export interface COGSModuleData {
  items: COGSItem[];
}

// === Payroll ===

export type PayrollType = 'Owner' | 'Production' | 'Sales' | 'Admin';
export type EmploymentStatus = 'Employee' | 'Contractor';
export type SalaryFrequency = 'Hourly' | 'Monthly' | 'Annual';

export interface PayrollItem {
  id: string;
  jobTitle: string;
  payrollType: PayrollType;
  employmentStatus: EmploymentStatus;
  salaryFrequency: SalaryFrequency;
  salaryAmount: number;
  socialChargeRate: number;
  headCount: number;
  startMonth: number;
  startYear: number;
  salaryIndexationRate: number;
  sortOrder: number;
  monthlySalary: number;
  monthlyTotalCost: number;
}

export interface SalaryCalculation {
  hourly: number;
  monthly: number;
  annual: number;
}

export interface PayrollModuleData {
  items: PayrollItem[];
  totalMonthlyPayroll: number;
  totalMonthlySocialCharges: number;
}

// === Expenses ===

export type ExpenseMode = 'FixedDollars' | 'PercentageOfSales';
export type RecurrenceFrequency = 'Monthly' | 'Quarterly' | 'SemiAnnual' | 'Annual' | 'OneTime';

export interface SalesExpenseItem {
  id: string;
  name: string;
  category: string;
  expenseMode: ExpenseMode;
  amount: number;
  frequency: RecurrenceFrequency;
  startMonth: number;
  startYear: number;
  indexationRate: number;
  sortOrder: number;
}

export interface AdminExpenseItem {
  id: string;
  name: string;
  category: string;
  monthlyAmount: number;
  isTaxable: boolean;
  frequency: RecurrenceFrequency;
  startMonth: number;
  startYear: number;
  indexationRate: number;
  sortOrder: number;
}

// === CAPEX ===

export type AssetType = 'IT' | 'Vehicle' | 'Equipment' | 'Furniture' | 'LeaseholdImprovements';
export type DepreciationMethod = 'StraightLine' | 'DecliningBalance';

export interface CapexAsset {
  id: string;
  name: string;
  assetType: AssetType;
  purchaseValue: number;
  purchaseMonth: number;
  purchaseYear: number;
  depreciationMethod: DepreciationMethod;
  usefulLifeYears: number;
  salvageValue: number;
  sortOrder: number;
  annualDepreciation: number;
}

// === Financing ===

export type FinancingType = 'BankLoan' | 'LineOfCredit' | 'PersonalInvestment' | 'PartnerInvestment' | 'AngelInvestor' | 'VentureCapital' | 'GovernmentSubsidy' | 'Grant' | 'Crowdfunding' | 'Other';

export interface FinancingSource {
  id: string;
  name: string;
  financingType: FinancingType;
  amount: number;
  interestRate: number;
  termMonths: number;
  moratoireMonths: number;
  disbursementMonth: number;
  disbursementYear: number;
  sortOrder: number;
  requiresRepayment: boolean;
  monthlyPayment: number;
  totalInterest: number;
}

export interface AmortizationEntry {
  paymentNumber: number;
  year: number;
  month: number;
  paymentAmount: number;
  principalPortion: number;
  interestPortion: number;
  remainingBalance: number;
  isMoratoire: boolean;
}

export interface FinancingModuleData {
  sources: FinancingSource[];
  totalFinancing: number;
  totalProjectCost: number;
  financingGap: number;
}

// === Project Cost ===

export interface ProjectCostData {
  id: string;
  workingCapitalMonthsCOGS: number;
  workingCapitalMonthsPayroll: number;
  workingCapitalMonthsSalesExpenses: number;
  workingCapitalMonthsAdminExpenses: number;
  capexInclusionMonths: number;
  // Per-category breakdown
  salaryAlreadyAcquired: number;
  salaryAcquireBefore: number;
  salaryAcquireAfter: number;
  salaryDurationMonths: number;
  salesExpAlreadyAcquired: number;
  salesExpAcquireBefore: number;
  salesExpAcquireAfter: number;
  salesExpDurationMonths: number;
  adminExpAlreadyAcquired: number;
  adminExpAcquireBefore: number;
  adminExpAcquireAfter: number;
  adminExpDurationMonths: number;
  inventoryAlreadyAcquired: number;
  inventoryAcquireBefore: number;
  inventoryAcquireAfter: number;
  inventoryDurationMonths: number;
  capexAlreadyAcquired: number;
  capexAcquireBefore: number;
  capexAcquireAfter: number;
  capexDurationMonths: number;
  // Computed totals
  totalStartupCosts: number;
  totalWorkingCapital: number;
  totalCapex: number;
  totalProjectCost: number;
  breakdown: ProjectCostBreakdown;
}

export interface ProjectCostBreakdown {
  workingCapitalCOGS: number;
  workingCapitalPayroll: number;
  workingCapitalSalesExpenses: number;
  workingCapitalAdminExpenses: number;
  capexItems: { name: string; amount: number }[];
}

// === Financial Statements ===

export interface StatementLineItem {
  label: string;
  monthlyValues: number[];
  annualTotal: number;
  isHeader: boolean;
  isBold: boolean;
  indentLevel: number;
}

export interface ProfitLossStatement {
  revenue: StatementLineItem[];
  costOfGoodsSold: StatementLineItem[];
  grossProfit: StatementLineItem;
  payroll: StatementLineItem[];
  salesExpenses: StatementLineItem[];
  adminExpenses: StatementLineItem[];
  depreciation: StatementLineItem;
  totalOperatingExpenses: StatementLineItem;
  ebit: StatementLineItem;
  interestExpense: StatementLineItem;
  netIncome: StatementLineItem;
}

export interface CashFlowStatement {
  cashInflows: StatementLineItem[];
  cashOutflows: StatementLineItem[];
  netCashFlow: StatementLineItem;
  cumulativeCashFlow: StatementLineItem;
}

export interface BalanceSheetStatement {
  assets: StatementLineItem[];
  totalAssets: StatementLineItem;
  liabilities: StatementLineItem[];
  totalLiabilities: StatementLineItem;
  equity: StatementLineItem[];
  totalEquity: StatementLineItem;
  totalLiabilitiesAndEquity: StatementLineItem;
  isBalanced: boolean;
}

export interface FinancialRatios {
  debtRatio: number;
  liquidityRatio: number;
  grossMargin: number;
  netMargin: number;
  breakEvenMonth: number | null;
  workingCapitalRatio: number;
}

// === Section Navigation ===

export type PrevisioSection =
  | 'identification'
  | 'opening-balance'
  | 'sales'
  | 'cogs'
  | 'payroll'
  | 'sales-expenses'
  | 'admin-expenses'
  | 'capex'
  | 'project-cost'
  | 'financing'
  | 'reports';

export interface PrevisioSectionConfig {
  key: PrevisioSection;
  translationKey: string;
  icon: string;
  path: string;
}

export interface PrevisioNavItem {
  key: string;
  translationKey: string;
  path?: string;
  children?: PrevisioNavItem[];
}

export const PREVISIO_NAV: PrevisioNavItem[] = [
  { key: 'identification', translationKey: 'fin.nav.identification', path: 'identification' },
  { key: 'opening-balance', translationKey: 'fin.nav.openingBalance', path: 'opening-balance' },
  { key: 'sales', translationKey: 'fin.nav.sales', path: 'sales' },
  {
    key: 'expenses',
    translationKey: 'fin.nav.expenses',
    children: [
      { key: 'cogs', translationKey: 'fin.nav.cogs', path: 'cogs' },
      { key: 'payroll', translationKey: 'fin.nav.payroll', path: 'payroll' },
      { key: 'sales-expenses', translationKey: 'fin.nav.salesExpenses', path: 'sales-expenses' },
      { key: 'admin-expenses', translationKey: 'fin.nav.adminExpenses', path: 'admin-expenses' },
      { key: 'capex', translationKey: 'fin.nav.capex', path: 'capex' },
    ],
  },
  { key: 'project-cost', translationKey: 'fin.nav.projectCost', path: 'project-cost' },
  { key: 'financing', translationKey: 'fin.nav.financing', path: 'financing' },
  { key: 'reports', translationKey: 'fin.nav.reports', path: 'reports' },
];

// Flat list for backward compatibility (used by mobile sheet, breadcrumbs, etc.)
export const PREVISIO_SECTIONS: PrevisioSectionConfig[] = [
  { key: 'identification', translationKey: 'fin.nav.identification', icon: 'FileText', path: 'identification' },
  { key: 'opening-balance', translationKey: 'fin.nav.openingBalance', icon: 'Scale', path: 'opening-balance' },
  { key: 'sales', translationKey: 'fin.nav.sales', icon: 'ShoppingCart', path: 'sales' },
  { key: 'cogs', translationKey: 'fin.nav.cogs', icon: 'Package', path: 'cogs' },
  { key: 'payroll', translationKey: 'fin.nav.payroll', icon: 'Users', path: 'payroll' },
  { key: 'sales-expenses', translationKey: 'fin.nav.salesExpenses', icon: 'TrendingUp', path: 'sales-expenses' },
  { key: 'admin-expenses', translationKey: 'fin.nav.adminExpenses', icon: 'Building2', path: 'admin-expenses' },
  { key: 'capex', translationKey: 'fin.nav.capex', icon: 'HardDrive', path: 'capex' },
  { key: 'project-cost', translationKey: 'fin.nav.projectCost', icon: 'Calculator', path: 'project-cost' },
  { key: 'financing', translationKey: 'fin.nav.financing', icon: 'Landmark', path: 'financing' },
  { key: 'reports', translationKey: 'fin.nav.reports', icon: 'BarChart3', path: 'reports' },
];
