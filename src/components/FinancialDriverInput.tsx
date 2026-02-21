import { useState, useEffect } from 'react';
import { DollarSign, Percent, Users, MapPin, Calculator, TrendingUp } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { getUserFriendlyError } from '../utils/error-messages';

interface FinancialDriverInputProps {
  persona: 'Consultant' | 'Entrepreneur' | 'OBNL';
  onCalculate?: (projections: any) => void;
}

interface FinancialProjections {
  monthlyRevenue: number;
  yearlyRevenue: number;
  monthlyExpenses: number;
  yearlyExpenses: number;
  netIncome: number;
  breakdown: {
    revenue: {
      billableHours: number;
      hourlyRate: number;
      utilizationPercent: number;
    };
    expenses: {
      overhead: number;
      clientAcquisition: number;
      insurance: number;
      software: number;
      taxes: number;
      office: number;
    };
  };
}

export default function FinancialDriverInput({ persona, onCalculate }: FinancialDriverInputProps) {
  const [hourlyRate, setHourlyRate] = useState<number>(100);
  const [utilizationPercent, setUtilizationPercent] = useState<number>(75);
  const [clientAcquisitionCost, setClientAcquisitionCost] = useState<number>(500);
  const [city, setCity] = useState<string>('Montreal');
  const [province, setProvince] = useState<string>('Quebec');
  const [loading, setLoading] = useState(false);
  const [projections, setProjections] = useState<FinancialProjections | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (persona === 'Consultant') {
      calculateProjections();
    }
  }, [hourlyRate, utilizationPercent, clientAcquisitionCost, city, province, persona]);

  const calculateProjections = async () => {
    if (persona !== 'Consultant') return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/v1/financials/calculate-consultant', {
        hourlyRate,
        utilizationPercent,
        clientAcquisitionCost,
        city,
        province
      });

      const data = response.data?.value || response.data;
      setProjections(data);
      if (onCalculate) {
        onCalculate(data);
      }
    } catch (err: any) {
      console.error('Failed to calculate projections:', err);
      setError(getUserFriendlyError(err, 'load'));

      // Fallback: Calculate locally
      const fallbackProjections = calculateLocalProjections();
      setProjections(fallbackProjections);
      if (onCalculate) {
        onCalculate(fallbackProjections);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalProjections = (): FinancialProjections => {
    // Local calculation as fallback
    const billableHoursPerMonth = (utilizationPercent / 100) * 160; // 160 working hours/month
    const monthlyRevenue = billableHoursPerMonth * hourlyRate;
    const yearlyRevenue = monthlyRevenue * 12;
    
    // Estimate expenses (simplified)
    const monthlyOverhead = monthlyRevenue * 0.15; // 15% overhead
    const monthlyClientAcquisition = clientAcquisitionCost / 12; // Average per month
    const monthlyInsurance = 200;
    const monthlySoftware = 150;
    const monthlyTaxes = monthlyRevenue * 0.25; // 25% tax estimate
    const monthlyOffice = 500;
    
    const monthlyExpenses = monthlyOverhead + monthlyClientAcquisition + monthlyInsurance + 
                           monthlySoftware + monthlyTaxes + monthlyOffice;
    const yearlyExpenses = monthlyExpenses * 12;
    const netIncome = yearlyRevenue - yearlyExpenses;

    return {
      monthlyRevenue,
      yearlyRevenue,
      monthlyExpenses,
      yearlyExpenses,
      netIncome,
      breakdown: {
        revenue: {
          billableHours: billableHoursPerMonth,
          hourlyRate,
          utilizationPercent
        },
        expenses: {
          overhead: monthlyOverhead,
          clientAcquisition: monthlyClientAcquisition,
          insurance: monthlyInsurance,
          software: monthlySoftware,
          taxes: monthlyTaxes,
          office: monthlyOffice
        }
      }
    };
  };

  if (persona !== 'Consultant') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={20} style={{ color: '#FF6B00' }} />
        <h3 className="text-lg font-semibold">Financial Drivers</h3>
      </div>

      {/* The Big 3 Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hourly Rate */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign size={16} />
            Hourly Rate (CAD)
          </label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            min="0"
            step="1"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Utilization % */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Percent size={16} />
            Utilization %
          </label>
          <div className="space-y-2">
            <input
              type="range"
              value={utilizationPercent}
              onChange={(e) => setUtilizationPercent(Number(e.target.value))}
              min="0"
              max="100"
              step="5"
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0%</span>
              <span className="font-bold">{utilizationPercent}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Client Acquisition Cost */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users size={16} />
            Client Acquisition Cost (CAD)
          </label>
          <input
            type="number"
            value={clientAcquisitionCost}
            onChange={(e) => setClientAcquisitionCost(Number(e.target.value))}
            min="0"
            step="50"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Location Selector */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin size={16} />
            City
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="Montreal">Montreal</option>
            <option value="Toronto">Toronto</option>
            <option value="Vancouver">Vancouver</option>
            <option value="Calgary">Calgary</option>
            <option value="Ottawa">Ottawa</option>
            <option value="Quebec City">Quebec City</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Province</label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="Quebec">Quebec</option>
            <option value="Ontario">Ontario</option>
            <option value="British Columbia">British Columbia</option>
            <option value="Alberta">Alberta</option>
            <option value="Manitoba">Manitoba</option>
            <option value="Saskatchewan">Saskatchewan</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {error} Using local calculations.
          </p>
        </div>
      )}

      {/* Auto-Calculation Preview */}
      {projections && (
        <div className="mt-6 p-4 rounded-lg border-2" style={{ 
          backgroundColor: 'rgba(255, 107, 0, 0.05)',
          borderColor: '#FF6B00'
        }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} style={{ color: '#FF6B00' }} />
            <h4 className="font-semibold">Projected Financials</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Revenue</p>
              <p className="text-lg font-bold">
                ${projections.monthlyRevenue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yearly Revenue</p>
              <p className="text-lg font-bold">
                ${projections.yearlyRevenue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Expenses</p>
              <p className="text-lg font-bold">
                ${projections.monthlyExpenses.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Income (Yearly)</p>
              <p className={`text-lg font-bold ${projections.netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${projections.netIncome.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {loading && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Calculating...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
