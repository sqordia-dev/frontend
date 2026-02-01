import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  /** Section title */
  title: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Section content */
  children: React.ReactNode;
  /** Whether the section is expanded by default */
  defaultOpen?: boolean;
  /** Unique identifier for the section */
  id: string;
  /** Optional description */
  description?: string;
  /** Additional class names for the section */
  className?: string;
  /** Additional class names for the content area */
  contentClassName?: string;
}

/**
 * FormSection - A collapsible section for organizing form fields
 * Uses shadcn/ui Accordion under the hood
 */
export function FormSection({
  title,
  icon,
  children,
  defaultOpen = false,
  id,
  description,
  className,
  contentClassName,
}: FormSectionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? id : undefined}
      className={cn('border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden', className)}
    >
      <AccordionItem value={id} className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 hover:no-underline [&[data-state=open]]:bg-gray-50 dark:[&[data-state=open]]:bg-gray-800">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                {icon}
              </span>
            )}
            <div className="text-left">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {title}
              </span>
              {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className={cn('px-4 py-4 bg-white dark:bg-gray-900', contentClassName)}>
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * FormSectionGroup - Container for multiple FormSections that allows only one to be open at a time
 */
interface FormSectionGroupProps {
  /** Section configurations */
  sections: Array<{
    id: string;
    title: string;
    icon?: React.ReactNode;
    description?: string;
    content: React.ReactNode;
  }>;
  /** ID of the section to open by default */
  defaultOpenId?: string;
  /** Additional class names */
  className?: string;
}

export function FormSectionGroup({
  sections,
  defaultOpenId,
  className,
}: FormSectionGroupProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpenId}
      className={cn('space-y-3', className)}
    >
      {sections.map((section) => (
        <AccordionItem
          key={section.id}
          value={section.id}
          className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 hover:no-underline [&[data-state=open]]:bg-gray-50 dark:[&[data-state=open]]:bg-gray-800">
            <div className="flex items-center gap-3">
              {section.icon && (
                <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                  {section.icon}
                </span>
              )}
              <div className="text-left">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </span>
                {section.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                    {section.description}
                  </p>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 bg-white dark:bg-gray-900">
            {section.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default FormSection;
