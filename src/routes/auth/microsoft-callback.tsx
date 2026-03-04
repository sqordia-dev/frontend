import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Microsoft OAuth callback page
 * This page receives the OAuth redirect from Microsoft and sends the code back to the parent window
 */
export default function MicrosoftCallbackPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Send message to parent window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'microsoft-oauth-callback',
          code,
          state,
          error: error ? errorDescription || error : null,
        },
        window.location.origin
      );

      // Close the popup
      window.close();
    } else {
      // If no opener, redirect to login with error
      window.location.href = '/login?error=oauth_failed';
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
        <p className="text-gray-600 dark:text-gray-400">
          Completing sign-in...
        </p>
      </div>
    </div>
  );
}
