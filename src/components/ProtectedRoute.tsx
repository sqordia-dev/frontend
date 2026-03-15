import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../lib/auth-service';
import { getAccessToken } from '../lib/api-client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [state, setState] = useState<'loading' | 'authenticated' | 'unauthenticated'>(() => {
    // If we already have an in-memory token, skip the loading state
    if (getAccessToken()) return 'authenticated';
    // If we have a cookie but no in-memory token, we need to rehydrate
    const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('is_authenticated='));
    return hasCookie ? 'loading' : 'unauthenticated';
  });

  useEffect(() => {
    if (state !== 'loading') return;
    // Re-hydrate the in-memory token from refresh token on page reload
    authService.rehydrateToken().then(ok => {
      setState(ok ? 'authenticated' : 'unauthenticated');
    });
  }, [state]);

  if (state === 'loading') {
    // Brief loading while rehydrating token — prevents flash of login page
    return null;
  }

  if (state === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
