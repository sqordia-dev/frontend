import { useState, useEffect, useRef, useCallback } from "react";

export interface Section {
  id: string;
  title: string;
  element?: HTMLElement | null;
}

interface UseSectionObserverOptions {
  /**
   * Root margin for the intersection observer
   * @default "-20% 0px -70% 0px"
   */
  rootMargin?: string;
  /**
   * Threshold for intersection
   * @default 0
   */
  threshold?: number | number[];
  /**
   * Offset from top when scrolling to section
   * @default 80
   */
  scrollOffset?: number;
  /**
   * Enable smooth scrolling
   * @default true
   */
  smoothScroll?: boolean;
}

interface UseSectionObserverReturn {
  /**
   * Currently active section ID
   */
  activeSection: string | null;
  /**
   * Set the active section manually
   */
  setActiveSection: (id: string | null) => void;
  /**
   * Scroll to a specific section
   */
  scrollToSection: (id: string) => void;
  /**
   * Register a section element for observation
   */
  registerSection: (id: string, element: HTMLElement | null) => void;
  /**
   * Unregister a section element
   */
  unregisterSection: (id: string) => void;
  /**
   * Check if a section is currently visible
   */
  isSectionVisible: (id: string) => boolean;
  /**
   * Map of section visibility states
   */
  visibleSections: Set<string>;
}

/**
 * Hook for observing sections and tracking the active section during scroll
 * Uses Intersection Observer API for efficient scroll tracking
 */
export function useSectionObserver(
  options: UseSectionObserverOptions = {}
): UseSectionObserverReturn {
  const {
    rootMargin = "-20% 0px -70% 0px",
    threshold = 0,
    scrollOffset = 80,
    smoothScroll = true,
  } = options;

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set()
  );
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);

  // Create intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Don't update during programmatic scroll
        if (isScrollingRef.current) return;

        const newVisibleSections = new Set(visibleSections);
        let topMostVisibleSection: string | null = null;
        let topMostPosition = Infinity;

        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute("data-section-id");
          if (!sectionId) return;

          if (entry.isIntersecting) {
            newVisibleSections.add(sectionId);
            const rect = entry.boundingClientRect;
            if (rect.top < topMostPosition && rect.top >= 0) {
              topMostPosition = rect.top;
              topMostVisibleSection = sectionId;
            }
          } else {
            newVisibleSections.delete(sectionId);
          }
        });

        setVisibleSections(newVisibleSections);

        // Set active section to topmost visible section
        if (topMostVisibleSection) {
          setActiveSection(topMostVisibleSection);
        } else if (newVisibleSections.size > 0) {
          // Fallback to first visible section
          const firstVisible = Array.from(newVisibleSections)[0];
          setActiveSection(firstVisible);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    // Observe all registered sections
    sectionsRef.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [rootMargin, threshold, visibleSections]);

  // Register a section for observation
  const registerSection = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        element.setAttribute("data-section-id", id);
        sectionsRef.current.set(id, element);
        observerRef.current?.observe(element);
      }
    },
    []
  );

  // Unregister a section
  const unregisterSection = useCallback((id: string) => {
    const element = sectionsRef.current.get(id);
    if (element) {
      observerRef.current?.unobserve(element);
      sectionsRef.current.delete(id);
    }
  }, []);

  // Scroll to a specific section
  const scrollToSection = useCallback(
    (id: string) => {
      const element = sectionsRef.current.get(id);
      if (!element) {
        // Try to find by ID in DOM
        const domElement = document.getElementById(id);
        if (domElement) {
          isScrollingRef.current = true;
          setActiveSection(id);

          const elementPosition = domElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - scrollOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: smoothScroll ? "smooth" : "auto",
          });

          // Reset scrolling flag after animation
          setTimeout(() => {
            isScrollingRef.current = false;
          }, smoothScroll ? 500 : 0);
        }
        return;
      }

      isScrollingRef.current = true;
      setActiveSection(id);

      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - scrollOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: smoothScroll ? "smooth" : "auto",
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrollingRef.current = false;
      }, smoothScroll ? 500 : 0);
    },
    [scrollOffset, smoothScroll]
  );

  // Check if a section is visible
  const isSectionVisible = useCallback(
    (id: string) => {
      return visibleSections.has(id);
    },
    [visibleSections]
  );

  return {
    activeSection,
    setActiveSection,
    scrollToSection,
    registerSection,
    unregisterSection,
    isSectionVisible,
    visibleSections,
  };
}

/**
 * Hook for creating a ref callback that registers/unregisters a section
 */
export function useSectionRef(
  sectionId: string,
  observer: Pick<UseSectionObserverReturn, "registerSection" | "unregisterSection">
) {
  const { registerSection, unregisterSection } = observer;

  return useCallback(
    (element: HTMLElement | null) => {
      if (element) {
        registerSection(sectionId, element);
      } else {
        unregisterSection(sectionId);
      }
    },
    [sectionId, registerSection, unregisterSection]
  );
}
