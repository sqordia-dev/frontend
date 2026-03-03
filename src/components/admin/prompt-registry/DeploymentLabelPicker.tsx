import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Rocket, FlaskConical, Code, Sparkles, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useTheme } from '../../../contexts/ThemeContext';
import { PromptAlias } from '../../../types/prompt-registry';

interface DeploymentLabelPickerProps {
  value: PromptAlias | null;
  onChange: (alias: PromptAlias | null) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const ALIAS_OPTIONS: Array<{
  value: PromptAlias;
  label: string;
  labelFr: string;
  description: string;
  descriptionFr: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  hoverBg: string;
}> = [
  {
    value: PromptAlias.Production,
    label: 'Production',
    labelFr: 'Production',
    description: 'Live and active for all users',
    descriptionFr: 'Actif pour tous les utilisateurs',
    icon: Rocket,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500',
    hoverBg: 'hover:bg-green-50 dark:hover:bg-green-950',
  },
  {
    value: PromptAlias.Staging,
    label: 'Staging',
    labelFr: 'Staging',
    description: 'Pre-production testing',
    descriptionFr: 'Tests pré-production',
    icon: FlaskConical,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-950',
  },
  {
    value: PromptAlias.Development,
    label: 'Development',
    labelFr: 'Développement',
    description: 'Active development',
    descriptionFr: 'En cours de développement',
    icon: Code,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950',
  },
  {
    value: PromptAlias.Experimental,
    label: 'Experimental',
    labelFr: 'Expérimental',
    description: 'Testing new ideas',
    descriptionFr: 'Test de nouvelles idées',
    icon: Sparkles,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-950',
  },
];

export function DeploymentLabelPicker({
  value,
  onChange,
  disabled = false,
  loading = false,
  className,
}: DeploymentLabelPickerProps) {
  const { language } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const selectedOption = ALIAS_OPTIONS.find(opt => opt.value === value);
  const SelectedIcon = selectedOption?.icon;

  const handleSelect = (alias: PromptAlias) => {
    onChange(alias);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
          'bg-white dark:bg-warm-gray-800',
          'border-warm-gray-200 dark:border-warm-gray-700',
          'hover:border-momentum-orange dark:hover:border-momentum-orange',
          'focus:outline-none focus:ring-2 focus:ring-momentum-orange focus:border-transparent',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-momentum-orange border-transparent'
        )}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-momentum-orange border-t-transparent rounded-full animate-spin" />
        ) : selectedOption ? (
          <>
            <div className={cn('w-2 h-2 rounded-full', selectedOption.bgColor)} />
            {SelectedIcon && <SelectedIcon className={cn('w-4 h-4', selectedOption.color)} />}
            <span className={cn('text-sm font-medium', selectedOption.color)}>
              {language === 'fr' ? selectedOption.labelFr : selectedOption.label}
            </span>
            <button
              onClick={handleClear}
              className="p-0.5 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-700 rounded transition-colors"
            >
              <X className="w-3 h-3 text-warm-gray-400" />
            </button>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-warm-gray-300 dark:bg-warm-gray-600" />
            <span className="text-sm text-warm-gray-500">
              {language === 'fr' ? 'Sélectionner un label' : 'Select label'}
            </span>
          </>
        )}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-warm-gray-400 ml-auto transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full left-0 right-0 mt-1 z-50',
              'bg-white dark:bg-warm-gray-900',
              'border border-warm-gray-200 dark:border-warm-gray-700',
              'rounded-xl shadow-lg overflow-hidden'
            )}
          >
            <div className="p-1">
              {ALIAS_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = value === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      option.hoverBg,
                      isSelected && 'bg-warm-gray-50 dark:bg-warm-gray-800'
                    )}
                  >
                    <div className={cn('w-2.5 h-2.5 rounded-full', option.bgColor)} />
                    <Icon className={cn('w-4 h-4', option.color)} />
                    <div className="flex-1 text-left">
                      <div className={cn('text-sm font-medium', option.color)}>
                        {language === 'fr' ? option.labelFr : option.label}
                      </div>
                      <div className="text-xs text-warm-gray-500">
                        {language === 'fr' ? option.descriptionFr : option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-momentum-orange" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DeploymentLabelPicker;
