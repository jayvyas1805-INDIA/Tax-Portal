import { Navigate } from "react-router-dom";

/**
 * Wraps a route so it's only reachable with a valid token in storage.
 * Optionally restrict to specific roles via allowedRoles, e.g.
 * <PrivateRoute allowedRoles={["partner"]}><PartnerDashboard /></PrivateRoute>
 */
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const rawUser = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");

  if (!token) {
    return <Navigate to="/partner-login" replace />;
  }

  if (allowedRoles && rawUser) {
    const user = JSON.parse(rawUser);
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/partner-login" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
