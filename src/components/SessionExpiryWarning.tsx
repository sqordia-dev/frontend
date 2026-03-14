import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from './ui/button';

const CHECK_INTERVAL_MS = 60_000; // Check every minute

/**
 * Monitors session expiry via the is_authenticated cookie.
 * When the cookie expires (same lifetime as access_token), shows a warning.
 */
export default function SessionExpiryWarning() {
  const [showExpired, setShowExpired] = useState(false);
  const navigate = useNavigate();

  const checkExpiry = useCallback(() => {
    const isAuth = document.cookie.split(';').some(c => c.trim().startsWith('is_authenticated='));
    if (!isAuth && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      // Only show expired if user was previously interacting (not on public pages)
      const isProtectedRoute = window.location.pathname.startsWith('/dashboard') ||
        window.location.pathname.startsWith('/interview') ||
        window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/settings') ||
        window.location.pathname.startsWith('/plans');
      if (isProtectedRoute) {
        setShowExpired(true);
      }
    } else {
      setShowExpired(false);
    }
  }, []);

  useEffect(() => {
    checkExpiry();
    const interval = setInterval(checkExpiry, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkExpiry]);

  const handleExtend = async () => {
    try {
      const { authService } = await import('../lib/auth-service');
      // authService.refreshToken() handles cookie refresh internally
      await authService.refreshToken();
      setShowExpired(false);
    } catch {
      setShowExpired(true);
    }
  };

  const handleSignIn = () => {
    setShowExpired(false);
    navigate('/login');
  };

  if (!showExpired) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Session Expired
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Your session has expired. You can try to extend it or sign in again.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleExtend}>
            Extend Session
          </Button>
          <Button onClick={handleSignIn} className="bg-momentum-orange hover:bg-orange-600 text-white">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
