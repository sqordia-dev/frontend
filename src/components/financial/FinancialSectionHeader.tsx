import React from 'react';

interface FinancialSectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

const FinancialSectionHeader: React.FC<FinancialSectionHeaderProps> = ({
  title,
  description,
  actions,
  icon,
  badge,
}) => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-strategy-blue/10 text-strategy-blue shrink-0">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-heading font-semibold text-foreground">{title}</h2>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default FinancialSectionHeader;
