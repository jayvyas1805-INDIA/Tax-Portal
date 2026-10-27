import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const menus = [
    "Dashboard",
    "My Referrals",
    "Commission Management",
    "Notifications",
    "Profile Management",
    "KYC Documents",
    "Bank Details",
    "Settings",
    "Logout",
  ];
  const urls = [
    "/partner-dashboard",
    "/my-referrals",
    "/commission-management",
    "/notifications",
    "/profile",
    "/kyc",
    "/banking",
    "/settings",
    "/logout"
  ];

  return (
    <aside className="sidebar">
      <h2><img src={logo} alt="Udyog Mantra" style={{ height: 44, width: "auto", background: "#fff", borderRadius: 8, padding: 4 }} /></h2>

      <ul>
        {menus.map((item) => (
          <li key={item}>
            <a href={urls[menus.indexOf(item)]}>{item}</a>
          </li>
        ))}
      </ul>

      <button>View Performance</button>
    </aside>
  );
};

export default Sidebar;