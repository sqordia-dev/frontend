import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top
 * whenever the route changes. This ensures pages always start at the top.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Function to scroll to top immediately
    const scrollToTop = () => {
      // Direct assignment is the fastest and most reliable way
      if (window.scrollTo) {
        window.scrollTo(0, 0);
      }
      
      // Also ensure document and body are scrolled to top
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }
      
      // Also try scrolling any scrollable containers
      const scrollableContainers = document.querySelectorAll('[data-scroll-container]');
      scrollableContainers.forEach((container) => {
        if (container instanceof HTMLElement) {
          container.scrollTop = 0;
        }
      });
    };

    // Scroll immediately when pathname changes
    scrollToTop();

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      scrollToTop();
    });

    // Also scroll after a small delay to catch any late DOM updates
    const timeoutId = setTimeout(scrollToTop, 0);
    
    // And once more after render to ensure we catch everything
    const timeoutId2 = setTimeout(scrollToTop, 100);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, [pathname]);

  return null;
}
