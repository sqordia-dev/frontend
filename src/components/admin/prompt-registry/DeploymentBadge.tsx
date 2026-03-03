import React from 'react';
import { cn } from '../../../lib/utils';
import { Rocket, FlaskConical, Code, Sparkles } from 'lucide-react';
import { PromptAlias, getPromptAliasName } from '../../../types/prompt-registry';

export type { PromptAlias };

interface DeploymentBadgeProps {
  alias: PromptAlias | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const ALIAS_CONFIG: Record<string, {
  label: string;
  labelFr: string;
  color: string;
  bgColor: string;
  borderColor: string;
  darkBgColor: string;
  darkBorderColor: string;
  icon: React.ElementType;
}> = {
  Production: {
    label: 'Production',
    labelFr: 'Production',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    darkBgColor: 'dark:bg-green-950',
    darkBorderColor: 'dark:border-green-800',
    icon: Rocket,
  },
  Staging: {
    label: 'Staging',
    labelFr: 'Staging',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    darkBgColor: 'dark:bg-amber-950',
    darkBorderColor: 'dark:border-amber-800',
    icon: FlaskConical,
  },
  Development: {
    label: 'Development',
    labelFr: 'Développement',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    darkBgColor: 'dark:bg-blue-950',
    darkBorderColor: 'dark:border-blue-800',
    icon: Code,
  },
  Experimental: {
    label: 'Experimental',
    labelFr: 'Expérimental',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    darkBgColor: 'dark:bg-purple-950',
    darkBorderColor: 'dark:border-purple-800',
    icon: Sparkles,
  },
};

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const ICON_SIZES = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function DeploymentBadge({
  alias,
  size = 'md',
  showIcon = true,
  className,
}: DeploymentBadgeProps) {
  if (alias === null || alias === undefined) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 font-medium rounded-lg border',
          'bg-warm-gray-50 dark:bg-warm-gray-800',
          'border-warm-gray-200 dark:border-warm-gray-700',
          'text-warm-gray-500 dark:text-warm-gray-400',
          SIZE_CLASSES[size],
          className
        )}
      >
        No Label
      </span>
    );
  }

  // Convert enum to string key using the helper
  const aliasName = getPromptAliasName(alias);
  const config = ALIAS_CONFIG[aliasName];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-lg border',
        config.bgColor,
        config.darkBgColor,
        config.borderColor,
        config.darkBorderColor,
        config.color,
        SIZE_CLASSES[size],
        className
      )}
    >
      {showIcon && <Icon className={ICON_SIZES[size]} />}
      {config.label}
    </span>
  );
}

export default DeploymentBadge;
