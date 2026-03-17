import { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

/**
 * useConfirmDialog - Accessible replacement for window.confirm()
 *
 * Returns a `confirm()` function that shows an AlertDialog and resolves
 * a promise with true/false, plus a `ConfirmDialog` component to render.
 *
 * @example
 * const { confirm, ConfirmDialog } = useConfirmDialog();
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: 'Delete item?',
 *     description: 'This action cannot be undone.',
 *     variant: 'destructive',
 *   });
 *   if (ok) { ... }
 * };
 *
 * return <><ConfirmDialog />...</>;
 */
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmDialogOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: { title: '', description: '' },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, open: false, resolve: null }));
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, open: false, resolve: null }));
  }, [state.resolve]);

  function ConfirmDialog() {
    const { open, options } = state;
    return (
      <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleCancel(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {options.cancelLabel || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={options.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
            >
              {options.confirmLabel || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return { confirm, ConfirmDialog };
}
