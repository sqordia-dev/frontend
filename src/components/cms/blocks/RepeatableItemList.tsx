import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'select';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

export interface RepeatableItemListProps {
  items: Record<string, string>[];
  fields: FieldConfig[];
  onItemsChange: (items: Record<string, string>[]) => void;
  itemLabel?: string;
  disabled?: boolean;
  maxItems?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * RepeatableItemList
 *
 * A generic repeatable card list component for rendering JSON arrays as
 * user-friendly editable cards. Supports text, textarea, url, and select
 * field types, plus reordering and deletion with confirmation.
 */
export function RepeatableItemList({
  items,
  fields,
  onItemsChange,
  itemLabel = 'Item',
  disabled = false,
  maxItems,
}: RepeatableItemListProps) {
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  // ---- Helpers ----

  const canAdd = maxItems === undefined || items.length < maxItems;

  const createEmptyItem = (): Record<string, string> => {
    const item: Record<string, string> = {};
    for (const field of fields) {
      item[field.key] = '';
    }
    return item;
  };

  // ---- Handlers ----

  const handleAdd = () => {
    if (!canAdd) return;
    onItemsChange([...items, createEmptyItem()]);
  };

  const handleDelete = (index: number) => {
    if (confirmDeleteIndex === index) {
      const next = [...items];
      next.splice(index, 1);
      onItemsChange(next);
      setConfirmDeleteIndex(null);
    } else {
      setConfirmDeleteIndex(index);
    }
  };

  const handleFieldChange = (
    index: number,
    fieldKey: string,
    value: string
  ) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, [fieldKey]: value } : item
    );
    onItemsChange(next);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onItemsChange(next);
    // Reset delete confirmation when reordering
    setConfirmDeleteIndex(null);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onItemsChange(next);
    setConfirmDeleteIndex(null);
  };

  // ---- Render helpers ----

  const renderField = (
    field: FieldConfig,
    item: Record<string, string>,
    itemIndex: number
  ) => {
    const fieldId = `repeatable-${itemIndex}-${field.key}`;
    const value = item[field.key] ?? '';

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.key} className="space-y-1">
            <Label htmlFor={fieldId} className="text-xs">
              {field.label}
              {field.required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            <textarea
              id={fieldId}
              value={value}
              onChange={(e) =>
                handleFieldChange(itemIndex, field.key, e.target.value)
              }
              disabled={disabled}
              placeholder={field.placeholder}
              rows={3}
              className={cn(
                'flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm',
                'ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:bg-gray-900 dark:text-gray-100',
                'resize-y'
              )}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="space-y-1">
            <Label htmlFor={fieldId} className="text-xs">
              {field.label}
              {field.required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            <select
              id={fieldId}
              value={value}
              onChange={(e) =>
                handleFieldChange(itemIndex, field.key, e.target.value)
              }
              disabled={disabled}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm',
                'ring-offset-background',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'dark:bg-gray-900 dark:text-gray-100'
              )}
            >
              <option value="">
                {field.placeholder || `Select ${field.label.toLowerCase()}...`}
              </option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'url':
      case 'text':
      default:
        return (
          <div key={field.key} className="space-y-1">
            <Label htmlFor={fieldId} className="text-xs">
              {field.label}
              {field.required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            <Input
              id={fieldId}
              type={field.type === 'url' ? 'url' : 'text'}
              value={value}
              onChange={(e) =>
                handleFieldChange(itemIndex, field.key, e.target.value)
              }
              disabled={disabled}
              placeholder={field.placeholder}
              className="bg-white dark:bg-gray-900"
            />
          </div>
        );
    }
  };

  // ---- Render ----

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center dark:border-gray-600 dark:bg-gray-900">
          <p className="text-sm text-muted-foreground">No items yet.</p>
        </div>
      )}

      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'relative rounded-lg border bg-white p-4 shadow-sm transition-colors',
            'dark:border-gray-700 dark:bg-gray-800'
          )}
        >
          {/* Card header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#FF6B00]/10 px-2 text-xs font-semibold text-[#FF6B00]">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground dark:text-gray-200">
                {itemLabel} #{index + 1}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Move up */}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleMoveUp(index)}
                disabled={disabled || index === 0}
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
                <span className="sr-only">Move up</span>
              </Button>
              {/* Move down */}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleMoveDown(index)}
                disabled={disabled || index === items.length - 1}
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Move down</span>
              </Button>
              {/* Delete */}
              <Button
                type="button"
                variant={confirmDeleteIndex === index ? 'destructive' : 'ghost'}
                size="icon-sm"
                onClick={() => handleDelete(index)}
                onBlur={() => setConfirmDeleteIndex(null)}
                disabled={disabled}
                title={confirmDeleteIndex === index ? 'Confirm delete' : 'Delete'}
              >
                {confirmDeleteIndex === index ? (
                  <span className="text-[10px] font-semibold">OK?</span>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {confirmDeleteIndex === index ? 'Confirm delete' : 'Delete item'}
                </span>
              </Button>
            </div>
          </div>

          {/* Card fields */}
          <div className="space-y-3">
            {fields.map((field) => renderField(field, item, index))}
          </div>
        </div>
      ))}

      {/* Add button */}
      {canAdd && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
          className="w-full gap-1.5 border-dashed"
        >
          <Plus className="h-4 w-4" />
          Add {itemLabel}
        </Button>
      )}

      {maxItems !== undefined && (
        <p className="text-xs text-muted-foreground">
          {items.length} / {maxItems} items
        </p>
      )}
    </div>
  );
}

export default RepeatableItemList;
