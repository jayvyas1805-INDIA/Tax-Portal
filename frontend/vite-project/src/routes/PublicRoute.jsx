import { useEffect } from "react";

/**
 * Wraps public-facing routes (login, registration, password reset,
 * the landing page, etc.) and forces the light theme regardless of
 * the user's saved dark/light preference. The dark mode toggle only
 * applies inside the authenticated partner/admin app — public pages
 * always render light, no exceptions.
 */
const PublicRoute = ({ children }) => {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  return children;
};

export default PublicRoute;
