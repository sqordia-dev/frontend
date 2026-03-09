import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from './ui/button';

const WARNING_MINUTES = 5;
const CHECK_INTERVAL_MS = 60_000; // Check every minute

/**
 * Monitors session expiry and shows a warning modal 5 minutes before expiry.
 */
export default function SessionExpiryWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const navigate = useNavigate();

  const checkExpiry = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      // Decode JWT to get exp claim
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expMs = payload.exp * 1000;
      const now = Date.now();
      const remainingMs = expMs - now;
      const remainingMin = remainingMs / 60_000;

      if (remainingMin <= 0) {
        setShowWarning(false);
        setShowExpired(true);
      } else if (remainingMin <= WARNING_MINUTES) {
        setShowWarning(true);
        setShowExpired(false);
      } else {
        setShowWarning(false);
        setShowExpired(false);
      }
    } catch {
      // Can't parse token, ignore
    }
  }, []);

  useEffect(() => {
    checkExpiry();
    const interval = setInterval(checkExpiry, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkExpiry]);

  const handleExtend = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const { apiClient } = await import('../lib/api-client');
        const response = await apiClient.post<any>('/api/v1/auth/refresh', { refreshToken });
        const data = response.data?.value || response.data;
        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          setShowWarning(false);
        }
      }
    } catch {
      setShowExpired(true);
      setShowWarning(false);
    }
  };

  const handleSignIn = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setShowExpired(false);
    navigate('/login');
  };

  if (!showWarning && !showExpired) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-foreground">
            {showExpired ? 'Session Expired' : 'Session Expiring Soon'}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          {showExpired
            ? 'Your session has expired. Please sign in again to continue.'
            : 'Your session will expire in a few minutes. Extend your session to continue working.'}
        </p>
        <div className="flex gap-3 justify-end">
          {showExpired ? (
            <Button onClick={handleSignIn} className="bg-momentum-orange hover:bg-orange-600 text-white">
              Sign In
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowWarning(false)}>
                Dismiss
              </Button>
              <Button onClick={handleExtend} className="bg-momentum-orange hover:bg-orange-600 text-white">
                Extend Session
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
