'use client';

/**
 * ViteRouterBridge wraps Vite-era components that depend on react-router-dom
 * (useNavigate, useParams, Link) inside a MemoryRouter so the hooks resolve
 * correctly, while forwarding actual navigation to Next.js App Router.
 *
 * Usage (without route params):
 *   <ViteRouterBridge initialPath="/admin/users">
 *     <AdminUsersPage />
 *   </ViteRouterBridge>
 *
 * Usage (with route params like useParams):
 *   <ViteRouterBridge
 *     initialPath="/admin/users/123"
 *     routePattern="/admin/users/:userId"
 *   >
 *     <AdminUserDetailPage />
 *   </ViteRouterBridge>
 */

import React, { useEffect } from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useRouter } from 'next/navigation';

/**
 * Inner component that listens for react-router-dom navigation events
 * and forwards them to the Next.js router.
 */
function NavigationForwarder({ children }: { children: React.ReactNode }) {
  const rrLocation = useLocation();
  const nextRouter = useRouter();
  const initialPath = React.useRef(rrLocation.pathname);

  useEffect(() => {
    // Skip the initial render - only forward actual navigations
    if (rrLocation.pathname !== initialPath.current) {
      nextRouter.push(rrLocation.pathname);
    }
  }, [rrLocation.pathname, nextRouter]);

  return <>{children}</>;
}

interface ViteRouterBridgeProps {
  /** The initial path to set in the MemoryRouter (should match the current Next.js route) */
  initialPath: string;
  /**
   * Optional route pattern with `:param` placeholders (e.g. "/admin/users/:userId").
   * When provided, the children are rendered inside a <Route> so that useParams() works.
   */
  routePattern?: string;
  children: React.ReactNode;
}

export function ViteRouterBridge({ initialPath, routePattern, children }: ViteRouterBridgeProps) {
  if (routePattern) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <NavigationForwarder>
          <Routes>
            <Route path={routePattern} element={children} />
            {/* Fallback so the bridge does not render blank if pattern mismatch */}
            <Route path="*" element={children} />
          </Routes>
        </NavigationForwarder>
      </MemoryRouter>
    );
  }

  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <NavigationForwarder>{children}</NavigationForwarder>
    </MemoryRouter>
  );
}
