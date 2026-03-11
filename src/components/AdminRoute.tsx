import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../lib/auth-service';
import PageLoader from './PageLoader';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!authService.isAuthenticated()) {
          if (!cancelled) { setChecking(false); }
          return;
        }
        const user = await authService.getCurrentUser();
        if (!cancelled) {
          setIsAdmin((user as any)?.roles?.includes('Admin') === true);
        }
      } catch {
        // Not admin or fetch failed
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (checking) return <PageLoader />;

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
