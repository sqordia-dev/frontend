'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Google OAuth callback page
 * This page receives the OAuth redirect from Google and sends the token back to the parent window
 */
export default function GoogleCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Google OAuth typically uses implicit flow with hash fragment
    // or authorization code flow depending on configuration
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Check for hash fragment (implicit flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const idToken = hashParams.get('id_token');
    const hashError = hashParams.get('error');

    // Send message to parent window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'google-oauth-callback',
          code,
          accessToken,
          idToken,
          error: error || hashError || null,
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
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF6B00]" />
        <p className="text-gray-600 dark:text-gray-400">
          Completing sign-in...
        </p>
      </div>
    </div>
  );
}
