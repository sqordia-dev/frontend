import { useState, useEffect, useCallback } from 'react';

interface UseReadingProgressOptions {
  /** Element ID to track (optional, defaults to full page) */
  targetId?: string;
  /** Throttle updates in milliseconds */
  throttleMs?: number;
}

/**
 * Custom hook to track reading/scroll progress percentage
 *
 * @param options - Configuration options
 * @returns Progress percentage (0-100)
 *
 * @example
 * // Track full page progress
 * const progress = useReadingProgress();
 *
 * @example
 * // Track specific element progress
 * const progress = useReadingProgress({ targetId: 'main-content' });
 */
export function useReadingProgress({
  targetId,
  throttleMs = 16 // ~60fps
}: UseReadingProgressOptions = {}): number {
  const [progress, setProgress] = useState(0);

  const calculateProgress = useCallback(() => {
    let scrollTop: number;
    let scrollHeight: number;
    let clientHeight: number;

    if (targetId) {
      const element = document.getElementById(targetId);
      if (!element) return;
      scrollTop = element.scrollTop;
      scrollHeight = element.scrollHeight;
      clientHeight = element.clientHeight;
    } else {
      scrollTop = window.scrollY;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    }

    const totalScrollable = scrollHeight - clientHeight;
    if (totalScrollable <= 0) {
      setProgress(100);
      return;
    }

    const percentage = Math.min(Math.round((scrollTop / totalScrollable) * 100), 100);
    setProgress(percentage);
  }, [targetId]);

  useEffect(() => {
    const target = targetId ? document.getElementById(targetId) : window;
    if (!target) return;

    // Initial calculation
    calculateProgress();

    let lastTime = 0;
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastTime >= throttleMs) {
        lastTime = now;
        requestAnimationFrame(calculateProgress);
      }
    };

    target.addEventListener('scroll', handleScroll, { passive: true });

    // Also listen to resize events
    window.addEventListener('resize', calculateProgress, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateProgress);
    };
  }, [targetId, throttleMs, calculateProgress]);

  return progress;
}

export default useReadingProgress;
