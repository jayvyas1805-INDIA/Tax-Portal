import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import "./AdminLayout.css";

export default function AdminLayout() {
  const handleInvitePartner = () => {
    // Hook up to your invite-partner modal / route here
    console.log("Invite Partner clicked");
  };

  return (
    <div className="admin-layout">
      <Sidebar onInvitePartner={handleInvitePartner} />
      <div className="admin-layout__main">
        <Header />
        <div className="admin-layout__content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}
