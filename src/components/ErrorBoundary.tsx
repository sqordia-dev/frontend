import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import * as Sentry from '@sentry/react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Localized strings (class component can't use useTheme, so read localStorage directly)
function getErrorStrings() {
  const lang = localStorage.getItem('language') || 'fr';
  if (lang === 'fr') {
    return {
      title: 'Une erreur est survenue',
      description: 'Une erreur inattendue s\u2019est produite. Veuillez rafra\u00eechir la page.',
      refresh: 'Rafra\u00eechir la page',
      dashboard: 'Aller au tableau de bord',
    };
  }
  return {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try refreshing the page.',
    refresh: 'Refresh Page',
    dashboard: 'Go to Dashboard',
  };
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      const strings = getErrorStrings();
      return (
        <main id="main-content" className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="text-center max-w-md" role="alert">
            <AlertCircle size={48} className="mx-auto mb-4 text-destructive" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {strings.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {strings.description}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
              >
                {strings.refresh}
              </Button>
              <Button
                variant="outline"
                asChild
              >
                <a href="/dashboard">
                  {strings.dashboard}
                </a>
              </Button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
