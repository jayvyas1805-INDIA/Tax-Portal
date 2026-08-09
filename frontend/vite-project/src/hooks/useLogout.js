import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/authApi";

/**
 * Returns a logout() function that invalidates the refresh token
 * server-side, clears local auth storage, and redirects to login.
 * Used by the "Logout" item in SidebarNav across every dashboard page.
 */
export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      // Even if the server call fails (e.g. token already expired),
      // still clear local state and send the person to login.
      console.error("Logout request failed ->", error);
    } finally {
      [localStorage, sessionStorage].forEach((storage) => {
        storage.removeItem("authToken");
        storage.removeItem("refreshToken");
        storage.removeItem("authUser");
      });
      navigate("/partner-login");
    }
  };

  return logout;
};
