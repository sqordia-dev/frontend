import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top
 * whenever the route changes or on initial page load.
 * This ensures pages always start at the top.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Function to scroll to top immediately
    const scrollToTop = () => {
      // Use smooth scroll behavior for better UX, but ensure it completes
      try {
        // Method 1: window.scrollTo with instant behavior
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' as ScrollBehavior
        });
      } catch (e) {
        // Fallback for older browsers
        window.scrollTo(0, 0);
      }
      
      // Method 2: Direct assignment to documentElement (most reliable)
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }
      
      // Method 3: Direct assignment to body
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }
      
      // Method 4: Scroll any scrollable containers (like main content areas)
      const scrollableContainers = document.querySelectorAll(
        '[data-scroll-container], main, [role="main"], .scroll-container, .main-content'
      );
      scrollableContainers.forEach((container) => {
        if (container instanceof HTMLElement) {
          container.scrollTop = 0;
          container.scrollLeft = 0;
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
    
    // Final check after a longer delay for pages with heavy content
    const timeoutId3 = setTimeout(scrollToTop, 300);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [pathname]);

  // Also handle initial page load
  useEffect(() => {
    // Scroll to top on initial mount
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // Immediate scroll
    scrollToTop();

    // Also scroll after page load completes
    if (document.readyState === 'complete') {
      scrollToTop();
    } else {
      window.addEventListener('load', scrollToTop);
      return () => window.removeEventListener('load', scrollToTop);
    }
  }, []);

  return null;
}
