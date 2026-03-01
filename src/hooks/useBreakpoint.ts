import { useState, useEffect, useMemo } from 'react';

/**
 * Tailwind CSS default breakpoints
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS | 'xs';

/**
 * Returns the current Tailwind breakpoint based on window width
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'xs';
    return getBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateBreakpoint = () => {
      const newBreakpoint = getBreakpoint(window.innerWidth);
      setBreakpoint(newBreakpoint);
    };

    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(updateBreakpoint);
    resizeObserver.observe(document.body);

    return () => resizeObserver.disconnect();
  }, []);

  return breakpoint;
}

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Returns breakpoint comparison utilities
 */
export function useBreakpointValue() {
  const breakpoint = useBreakpoint();

  const helpers = useMemo(() => {
    const order: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = order.indexOf(breakpoint);

    return {
      breakpoint,
      /** True if current breakpoint is at or above the given breakpoint */
      isAbove: (bp: Breakpoint) => currentIndex >= order.indexOf(bp),
      /** True if current breakpoint is at or below the given breakpoint */
      isBelow: (bp: Breakpoint) => currentIndex <= order.indexOf(bp),
      /** True if current breakpoint matches exactly */
      is: (bp: Breakpoint) => breakpoint === bp,
      /** True if viewport is mobile (xs or sm) */
      isMobile: currentIndex <= 1,
      /** True if viewport is tablet (md) */
      isTablet: breakpoint === 'md',
      /** True if viewport is desktop (lg or above) */
      isDesktop: currentIndex >= 3,
    };
  }, [breakpoint]);

  return helpers;
}

/**
 * Returns different values based on current breakpoint
 * Similar to Chakra UI's useBreakpointValue
 */
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const breakpoint = useBreakpoint();

  return useMemo(() => {
    const order: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = order.indexOf(breakpoint);

    // Find the closest defined value at or below current breakpoint
    for (let i = currentIndex; i >= 0; i--) {
      const bp = order[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }

    return undefined;
  }, [breakpoint, values]);
}
