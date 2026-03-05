import { SqordiaLoader } from './ui/SqordiaLoader';

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
      <SqordiaLoader size="lg" message="Loading..." />
    </div>
  );
}
