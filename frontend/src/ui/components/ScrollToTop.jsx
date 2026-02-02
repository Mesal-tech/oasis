import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that resets scroll position on route change.
 * Accepts a containerRef prop to scroll a specific element (for overflow-y-scroll containers).
 * If no containerRef is provided, it attempts to scroll the window.
 */
export const ScrollToTop = ({ containerRef }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the referenced container if provided
    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Instant jump to top, prefer 'smooth' if animation desired
      });
    } else {
      // Fallback to window scroll
      window.scrollTo(0, 0);
    }
  }, [pathname, containerRef]);

  return null;
};
