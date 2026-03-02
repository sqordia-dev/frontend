import { Loader2 } from 'lucide-react';

/**
 * Full-page loading spinner for lazy-loaded routes
 * Used as Suspense fallback during code splitting
 */
export default function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
      role="status"
      aria-label="Loading page"
    >
      <div className="text-center">
        <Loader2
          size={48}
          className="animate-spin mx-auto mb-4 text-orange-500"
          aria-hidden="true"
        />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
}
