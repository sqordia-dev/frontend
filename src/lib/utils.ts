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
