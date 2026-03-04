/**
 * Router compatibility layer for migrating Vite (react-router-dom) components to Next.js.
 *
 * Provides drop-in replacements for react-router-dom hooks so that existing page components
 * can be re-used in the Next.js App Router with minimal changes.
 *
 * Usage in a 'use client' wrapper:
 *   import { useNavigate } from '@/lib/router-compat';
 *   // works the same as react-router-dom's useNavigate
 */

'use client';

import { useRouter } from 'next/navigation';
import { useParams as useNextParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Drop-in replacement for react-router-dom's useNavigate.
 * Supports:
 *   navigate('/path')          -> router.push('/path')
 *   navigate('/path', { replace: true }) -> router.replace('/path')
 *   navigate(-1)               -> router.back()
 */
export function useNavigate() {
  const router = useRouter();

  const navigate = useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        if (to === -1) {
          router.back();
        } else {
          // Forward navigation not natively supported; use back for negative
          router.back();
        }
      } else if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router],
  );

  return navigate;
}

/**
 * Drop-in replacement for react-router-dom's useParams.
 * Returns the Next.js route params object.
 */
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return useNextParams() as T;
}
