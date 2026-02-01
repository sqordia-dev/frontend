import { useState, useEffect, useRef } from 'react';

interface UseScrollSpyOptions {
  /** IDs of elements to observe */
  sectionIds: string[];
  /** Root margin for IntersectionObserver (adjusts trigger zone) */
  rootMargin?: string;
  /** Threshold(s) for triggering intersection */
  threshold?: number | number[];
}

/**
 * Custom hook for scroll spy functionality using IntersectionObserver
 * Tracks which section is currently in view
 *
 * @param options - Configuration options
 * @returns Currently active section ID or null
 *
 * @example
 * const activeId = useScrollSpy({
 *   sectionIds: ['section-1', 'section-2', 'section-3'],
 *   rootMargin: '-20% 0px -60% 0px'
 * });
 */
export function useScrollSpy({
  sectionIds,
  rootMargin = '-20% 0px -60% 0px',
  threshold = [0, 0.25, 0.5, 0.75, 1]
}: UseScrollSpyOptions): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const visibleSectionsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Find all elements
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    // Clear visibility tracking
    visibleSectionsRef.current.clear();

    // Create observer
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Store intersection ratio for each visible section
            visibleSectionsRef.current.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSectionsRef.current.delete(entry.target.id);
          }
        });

        // Find the section with highest visibility that's earliest in the list
        let bestMatch: string | null = null;
        let bestRatio = 0;

        for (const id of sectionIds) {
          const ratio = visibleSectionsRef.current.get(id);
          if (ratio !== undefined && ratio > 0) {
            // Prefer the first visible section, but if ratios are significantly different, prefer higher ratio
            if (bestMatch === null || ratio > bestRatio + 0.3) {
              bestMatch = id;
              bestRatio = ratio;
            }
          }
        }

        if (bestMatch !== null) {
          setActiveId(bestMatch);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    // Observe all elements
    elements.forEach((el) => observer.current?.observe(el));

    // Set initial active section (first visible or first in list)
    if (sectionIds.length > 0 && activeId === null) {
      setActiveId(sectionIds[0]);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [sectionIds, rootMargin, threshold, activeId]);

  return activeId;
}

export default useScrollSpy;
