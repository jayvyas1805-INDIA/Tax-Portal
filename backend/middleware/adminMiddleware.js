import Admin from "../models/Admin.js";

// Must run AFTER `protect` — relies on req.user being set by the JWT check.

// Super admin only (settings, commissions, business, analytics, reviews,
// notifications, CDO management, partner invites ...).
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }

  next();
};

// Super admin OR Admin CDO. Used only on the endpoints behind the three pages
// a CDO is allowed to see: Dashboard, Partner Management, Referral Management.
//
// A JWT stays valid until it expires, so for CDOs we also check the database:
// deactivating a CDO takes effect on their very next request instead of
// whenever their token happens to expire.
export const adminPanelAccess = async (req, res, next) => {
  const role = req.user?.role;

  if (role === "admin") return next();

  if (role !== "admin_cdo") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }

  try {
    const cdo = await Admin.findById(req.user.id).select("role isActive");

    // 401 (not 403) so the frontend's interceptor clears the session and
    // sends the person back to the login page.
    if (!cdo || cdo.role !== "admin_cdo" || cdo.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Your account is no longer active. Please contact the administrator.",
      });
    }

    next();
  } catch (error) {
    console.error("adminPanelAccess error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while checking your access.",
    });
  }
};
