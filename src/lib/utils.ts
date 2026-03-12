import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper precedence.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @example
 * cn("px-2 py-1", "px-4") // => "py-1 px-4" (px-4 wins)
 * cn("text-red-500", condition && "text-blue-500") // conditional classes
 * cn({ "bg-red-500": isError }, "p-4") // object syntax
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Unwraps a Result<T> response from the backend API.
 * If the response is a Result envelope ({ isSuccess, value, error }),
 * extracts the value or throws. Otherwise returns data as-is.
 */
export function unwrap<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'isSuccess' in data) {
    const result = data as { isSuccess: boolean; value?: T; error?: { message: string } };
    if (result.isSuccess && result.value !== undefined) {
      return result.value;
    }
    if (!result.isSuccess) {
      throw new Error(result.error?.message || 'Operation failed');
    }
  }
  return data as T;
}

/**
 * Group notifications into date buckets (today, yesterday, this week, this month, older).
 */
export function groupNotificationsByDate<T extends { createdAt: string }>(
  notifications: T[],
  _lang: string,
  options?: { includeMonth?: boolean },
): { label: string; labelFr: string; notifications: T[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const monthAgo = new Date(today.getTime() - 30 * 86400000);
  const includeMonth = options?.includeMonth ?? false;

  const groups: Record<string, { label: string; labelFr: string; notifications: T[] }> = {};

  for (const n of notifications) {
    const date = new Date(n.createdAt);
    let key: string, label: string, labelFr: string;

    if (date >= today) {
      key = 'today'; label = 'Today'; labelFr = "Aujourd'hui";
    } else if (date >= yesterday) {
      key = 'yesterday'; label = 'Yesterday'; labelFr = 'Hier';
    } else if (date >= weekAgo) {
      key = 'this-week'; label = 'This week'; labelFr = 'Cette semaine';
    } else if (includeMonth && date >= monthAgo) {
      key = 'this-month'; label = 'This month'; labelFr = 'Ce mois';
    } else {
      key = 'older'; label = 'Older'; labelFr = 'Plus ancien';
    }

    if (!groups[key]) groups[key] = { label, labelFr, notifications: [] };
    groups[key].notifications.push(n);
  }

  const order = ['today', 'yesterday', 'this-week', ...(includeMonth ? ['this-month'] : []), 'older'];
  return order.filter(k => groups[k]).map(k => groups[k]);
}
