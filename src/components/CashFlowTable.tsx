import React from 'react';
import FinancialTable, { FinancialTableColumn, FinancialTableRow } from './FinancialTable';

export interface CashFlowData {
  month: string; // e.g., "Jan-28", "Feb-28"
  year: number;
  rawMaterials: number | null;
  salesExpenses: number | null;
  administrativeExpenses: number | null;
  laborAndSocialCharges: number | null;
  fixedAssetAcquisition: number | null;
  salesTaxesPaid: number | null;
  salesTaxRemitted: number | null;
  taxPayable: number | null;
  creditLineInterest: number | null;
  debtRepaymentPrincipal: number | null;
  debtRepaymentInterest: number | null;
}

export interface CashFlowTableProps {
  data: CashFlowData[];
  currency?: string;
  className?: string;
}

const CashFlowTable: React.FC<CashFlowTableProps> = ({
  data,
  currency = '$',
  className = ''
}) => {
  // Create columns: Total column first, then monthly columns
  const columns: FinancialTableColumn[] = [
    {
      header: 'Total ' + (data[0]?.year || ''),
      key: 'total',
      align: 'right'
    },
    ...data.map((item) => ({
      header: item.month,
      key: item.month,
      align: 'right' as const
    }))
  ];

  // Calculate totals for each category
  const calculateTotal = (getValue: (item: CashFlowData) => number | null): number | null => {
    const sum = data.reduce((acc, item) => {
      const value = getValue(item);
      return acc + (value || 0);
    }, 0);
    return sum > 0 ? sum : null;
  };

  // Create rows
  const rows: FinancialTableRow[] = [];

  // Individual expense rows
  rows.push({
    label: 'ACHAT DE MATIÈRES PREMIÈRES',
    values: {
      total: calculateTotal(item => item.rawMaterials),
      ...Object.fromEntries(data.map(item => [item.month, item.rawMaterials]))
    }
  });

  rows.push({
    label: 'FRAIS DE VENTE',
    values: {
      total: calculateTotal(item => item.salesExpenses),
      ...Object.fromEntries(data.map(item => [item.month, item.salesExpenses]))
    }
  });

  rows.push({
    label: 'FRAIS D\'ADMINISTRATION',
    values: {
      total: calculateTotal(item => item.administrativeExpenses),
      ...Object.fromEntries(data.map(item => [item.month, item.administrativeExpenses]))
    }
  });

  rows.push({
    label: 'MAIN D\'OEUVRE ET CHARGES SOCIALES',
    values: {
      total: calculateTotal(item => item.laborAndSocialCharges),
      ...Object.fromEntries(data.map(item => [item.month, item.laborAndSocialCharges]))
    }
  });

  rows.push({
    label: 'ACQUISITION D\'IMMOBILISATIONS',
    values: {
      total: calculateTotal(item => item.fixedAssetAcquisition),
      ...Object.fromEntries(data.map(item => [item.month, item.fixedAssetAcquisition]))
    }
  });

  rows.push({
    label: 'TAXES DE VENTES PAYÉES',
    values: {
      total: calculateTotal(item => item.salesTaxesPaid),
      ...Object.fromEntries(data.map(item => [item.month, item.salesTaxesPaid]))
    }
  });

  rows.push({
    label: 'TAXE DE VENTE VERSÉES (REÇUES)',
    values: {
      total: calculateTotal(item => item.salesTaxRemitted),
      ...Object.fromEntries(data.map(item => [item.month, item.salesTaxRemitted]))
    }
  });

  rows.push({
    label: 'IMPÔT À PAYER',
    values: {
      total: calculateTotal(item => item.taxPayable),
      ...Object.fromEntries(data.map(item => [item.month, item.taxPayable]))
    }
  });

  rows.push({
    label: 'INTÉRÊT MARGE DE CREDIT',
    values: {
      total: calculateTotal(item => item.creditLineInterest),
      ...Object.fromEntries(data.map(item => [item.month, item.creditLineInterest]))
    }
  });

  rows.push({
    label: 'REMBOURSEMENT DETTE (CAPITAL)',
    values: {
      total: calculateTotal(item => item.debtRepaymentPrincipal),
      ...Object.fromEntries(data.map(item => [item.month, item.debtRepaymentPrincipal]))
    }
  });

  rows.push({
    label: 'REMBOURSEMENT DETTE (INTÉRÊT)',
    values: {
      total: calculateTotal(item => item.debtRepaymentInterest),
      ...Object.fromEntries(data.map(item => [item.month, item.debtRepaymentInterest]))
    }
  });

  // Calculate total disbursements for each month
  const totalDisbursements = data.map(item => {
    const sum = (item.rawMaterials || 0) +
                (item.salesExpenses || 0) +
                (item.administrativeExpenses || 0) +
                (item.laborAndSocialCharges || 0) +
                (item.fixedAssetAcquisition || 0) +
                (item.salesTaxesPaid || 0) +
                (item.salesTaxRemitted || 0) +
                (item.taxPayable || 0) +
                (item.creditLineInterest || 0) +
                (item.debtRepaymentPrincipal || 0) +
                (item.debtRepaymentInterest || 0);
    return sum > 0 ? sum : null;
  });

  const totalDisbursementsTotal = totalDisbursements.reduce((acc, val) => acc + (val || 0), 0);

  rows.push({
    label: 'TOTAL DÉBOURSÉS',
    values: {
      total: totalDisbursementsTotal > 0 ? totalDisbursementsTotal : null,
      ...Object.fromEntries(data.map((item, idx) => [item.month, totalDisbursements[idx]]))
    },
    isSubtotal: true
  });

  // Surplus/Deficit row (placeholder - would need income data to calculate)
  rows.push({
    label: 'EXCÉDANT (DÉFICIT)',
    values: {
      total: null,
      ...Object.fromEntries(data.map(item => [item.month, null]))
    },
    isSubtotal: true
  });

  // Ending cash row (placeholder - would need beginning cash and income data)
  rows.push({
    label: 'ENCAISSE DE FIN',
    values: {
      total: null,
      ...Object.fromEntries(data.map(item => [item.month, null]))
    },
    isTotal: true
  });

  return (
    <FinancialTable
      title="Déboursés"
      columns={columns}
      rows={rows}
      currency={currency}
      showNegativeInRed={true}
      className={className}
    />
  );
};

export default CashFlowTable;
