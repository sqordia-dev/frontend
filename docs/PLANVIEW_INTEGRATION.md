# PlanViewPage Integration Guide

## Adding New Interactive Components

### 1. Add Imports

Add to the top of `PlanViewPage.tsx`:

```typescript
import EditableFinancialTable from '../components/EditableFinancialTable';
import BreakevenChart from '../components/BreakevenChart';
import StrategyMapCanvas from '../components/StrategyMapCanvas';
import ReadinessScoreDashboard from '../components/ReadinessScoreDashboard';
import SqordiaCoach from '../components/SqordiaCoach';
import { PersonaType } from '../lib/types';
```

### 2. Add State Variables

Add to the component state:

```typescript
const [activeView, setActiveView] = useState<'narrative' | 'financials' | 'strategy' | 'audit'>('narrative');
const [readinessScore, setReadinessScore] = useState<number>(0);
const [userPersona, setUserPersona] = useState<PersonaType | null>(null);
```

### 3. Add View Toggle (Optional)

Add a view switcher near the top of the plan view:

```typescript
{/* View Toggle */}
<div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
  <button
    onClick={() => setActiveView('narrative')}
    className={`px-4 py-2 font-medium transition-colors ${
      activeView === 'narrative'
        ? 'border-b-2 text-orange-600 dark:text-orange-400'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`}
    style={activeView === 'narrative' ? { borderBottomColor: '#FF6B00' } : {}}
  >
    Narrative
  </button>
  <button
    onClick={() => setActiveView('financials')}
    className={`px-4 py-2 font-medium transition-colors ${
      activeView === 'financials'
        ? 'border-b-2 text-orange-600 dark:text-orange-400'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`}
    style={activeView === 'financials' ? { borderBottomColor: '#FF6B00' } : {}}
  >
    Financials
  </button>
  <button
    onClick={() => setActiveView('strategy')}
    className={`px-4 py-2 font-medium transition-colors ${
      activeView === 'strategy'
        ? 'border-b-2 text-orange-600 dark:text-orange-400'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`}
    style={activeView === 'strategy' ? { borderBottomColor: '#FF6B00' } : {}}
  >
    Strategy Map
  </button>
  <button
    onClick={() => setActiveView('audit')}
    className={`px-4 py-2 font-medium transition-colors ${
      activeView === 'audit'
        ? 'border-b-2 text-orange-600 dark:text-orange-400'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`}
    style={activeView === 'audit' ? { borderBottomColor: '#FF6B00' } : {}}
  >
    Audit
  </button>
</div>
```

### 4. Add Conditional Rendering

Replace or wrap the existing content with:

```typescript
{activeView === 'narrative' && (
  // Existing narrative/sections view
  <div>...</div>
)}

{activeView === 'financials' && (
  <div className="space-y-6">
    {/* Existing financial tables */}
    {balanceSheetData.length > 0 && (
      <BalanceSheetTable data={balanceSheetData} />
    )}
    {cashFlowData.length > 0 && (
      <CashFlowTable data={cashFlowData} />
    )}
    
    {/* New Interactive Components */}
    <EditableFinancialTable 
      planId={id!} 
      data={financialTableData} 
      onUpdate={(updated) => {
        // Handle financial table updates
        console.log('Financials updated:', updated);
      }}
    />
    
    <BreakevenChart
      monthlyRevenue={monthlyRevenueArray}
      monthlyExpenses={monthlyExpensesArray}
      months={monthLabels}
      breakEvenMonth={calculatedBreakEvenMonth}
    />
  </div>
)}

{activeView === 'strategy' && (
  <StrategyMapCanvas 
    planId={id!}
    onUpdate={(nodes, monthlyRevenue) => {
      // Handle strategy map updates
      console.log('Strategy map updated:', nodes, monthlyRevenue);
    }}
  />
)}

{activeView === 'audit' && (
  <ReadinessScoreDashboard
    readinessScore={readinessScore}
    pivotPointMonth={pivotPointMonth}
    runwayMonths={runwayMonths}
    confidenceInterval={{
      ambition: ambitionScore,
      evidence: evidenceScore
    }}
  />
)}

{/* Sqordia Coach - Always available as floating sidebar */}
<SqordiaCoach
  planId={id!}
  currentSection={activeSection || undefined}
  persona={userPersona || undefined}
  location={{ city: 'Montreal', province: 'Quebec' }}
/>
```

### 5. Fetch Audit Data

Add function to load readiness score:

```typescript
const loadAuditData = async () => {
  if (!id) return;
  
  try {
    const response = await apiClient.post(`/api/v1/plans/${id}/audit`);
    const auditData = response.data?.value || response.data;
    
    setReadinessScore(auditData.readinessScore || 0);
    setPivotPointMonth(auditData.pivotPointMonth);
    setRunwayMonths(auditData.runwayMonths);
    // ... other audit data
  } catch (err) {
    console.error('Failed to load audit data:', err);
  }
};
```

## Component Usage Examples

### EditableFinancialTable
```typescript
const financialTableData = {
  rows: [
    {
      id: 'revenue',
      label: 'Revenue',
      cells: [
        { id: 'month1', value: 10000, isEditable: true },
        { id: 'month2', value: 12000, isEditable: true }
      ]
    }
  ],
  columns: [
    { id: 'month1', label: 'Month 1' },
    { id: 'month2', label: 'Month 2' }
  ]
};
```

### BreakevenChart
```typescript
<BreakevenChart
  monthlyRevenue={[10000, 12000, 15000, 18000]}
  monthlyExpenses={[8000, 8500, 9000, 9500]}
  months={['Jan', 'Feb', 'Mar', 'Apr']}
  breakEvenMonth={2}
/>
```

### ReadinessScoreDashboard
```typescript
<ReadinessScoreDashboard
  readinessScore={85}
  pivotPointMonth={6}
  runwayMonths={18}
  confidenceInterval={{
    ambition: 90,
    evidence: 75
  }}
/>
```

## Notes

- All components support dark mode
- Components are responsive
- Error handling is built-in
- Loading states are included
- Components will gracefully degrade if backend endpoints are not available
