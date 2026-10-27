import { Navigate, Outlet } from "react-router-dom";
import { getAuthRole } from "../utils/authUser";

/**
 * Nested guard for pages inside /admin that only some admin roles may open.
 * PrivateRoute already makes sure the person is logged in as an admin; this
 * narrows it further. Anyone who is not allowed is sent back to the dashboard
 * (which every admin role can see) instead of the login page.
 *
 * Usage:
 *   <Route element={<RoleRoute allowedRoles={["admin"]} />}>
 *     <Route path="settings" element={<Settings />} />
 *   </Route>
 */
const RoleRoute = ({ allowedRoles }) => {
  const role = getAuthRole();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
