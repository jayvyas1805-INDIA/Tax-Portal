export const ROLES = {
  ADMIN: "admin",
  ADMIN_CDO: "admin_cdo",
  PARTNER: "partner",
};

/** The logged-in user saved by the login page (localStorage or sessionStorage). */
export const getAuthUser = () => {
  try {
    const raw = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getAuthRole = () => getAuthUser()?.role ?? null;
