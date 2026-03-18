import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 0ms timeout ensures this runs after any browser-driven scroll behavior
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      
      // Fallback for some browsers or specific layouts
      document.documentElement.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTo({ top: 0, behavior: 'auto' });
    }, 0);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
