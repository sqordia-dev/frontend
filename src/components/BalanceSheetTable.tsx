import React from 'react';
import FinancialTable, { FinancialTableColumn, FinancialTableRow } from './FinancialTable';

export interface BalanceSheetData {
  year: number;
  shortTermAssets: {
    cash: number | null;
    accountsReceivable: number | null;
    inventory: number | null;
    otherShortTermAssets: number | null;
  };
  fixedAssets: {
    total: number | null;
  };
  otherAssets: number | null;
}

export interface BalanceSheetTableProps {
  data: BalanceSheetData[];
  currency?: string;
  className?: string;
}

const BalanceSheetTable: React.FC<BalanceSheetTableProps> = ({
  data,
  currency = '$',
  className = ''
}) => {
  // Create columns for each year
  const columns: FinancialTableColumn[] = data.map((item) => ({
    header: item.year.toString(),
    key: item.year.toString(),
    align: 'right' as const
  }));

  // Create rows from data
  const rows: FinancialTableRow[] = [];

  // Short-term assets section
  rows.push({
    label: 'ACTIF COURT TERME',
    values: {},
    isCategoryHeader: true
  });

  rows.push({
    label: 'Encaisse',
    values: Object.fromEntries(data.map(item => [item.year.toString(), item.shortTermAssets.cash])),
    indentLevel: 1
  });

  rows.push({
    label: 'Compte à recevoir',
    values: Object.fromEntries(data.map(item => [item.year.toString(), item.shortTermAssets.accountsReceivable])),
    indentLevel: 1
  });

  rows.push({
    label: 'Inventaire',
    values: Object.fromEntries(data.map(item => [item.year.toString(), item.shortTermAssets.inventory])),
    indentLevel: 1
  });

  rows.push({
    label: 'Autre Actifs à courte terme',
    values: Object.fromEntries(data.map(item => [item.year.toString(), item.shortTermAssets.otherShortTermAssets])),
    indentLevel: 1
  });

  // Calculate and add total short-term assets
  const totalShortTerm = data.map(item => {
    const sum = (item.shortTermAssets.cash || 0) +
                (item.shortTermAssets.accountsReceivable || 0) +
                (item.shortTermAssets.inventory || 0) +
                (item.shortTermAssets.otherShortTermAssets || 0);
    return sum > 0 ? sum : null;
  });

  rows.push({
    label: 'TOTAL ACTIF COURT TERME',
    values: Object.fromEntries(data.map((item, idx) => [item.year.toString(), totalShortTerm[idx]])),
    isSubtotal: true
  });

  // Fixed assets section
  rows.push({
    label: 'IMMOBILISATION',
    values: Object.fromEntries(data.map(item => [item.year.toString(), item.fixedAssets.total])),
    isCategoryHeader: true
  });

  // Other assets
  rows.push({
    label: 'AUTRES ACTIFS',
    values: Object.fromEntries(data.map(item => [item.year.toString(), item.otherAssets])),
    isCategoryHeader: false
  });

  // Calculate and add total assets
  const totalAssets = data.map((item, idx) => {
    const sum = (totalShortTerm[idx] || 0) +
                (item.fixedAssets.total || 0) +
                (item.otherAssets || 0);
    return sum > 0 ? sum : null;
  });

  rows.push({
    label: 'ACTIF TOTAL',
    values: Object.fromEntries(data.map((item, idx) => [item.year.toString(), totalAssets[idx]])),
    isTotal: true
  });

  return (
    <FinancialTable
      title="Bilan Prévisionnel"
      columns={columns}
      rows={rows}
      currency={currency}
      showNegativeInRed={false}
      className={className}
    />
  );
};

export default BalanceSheetTable;
