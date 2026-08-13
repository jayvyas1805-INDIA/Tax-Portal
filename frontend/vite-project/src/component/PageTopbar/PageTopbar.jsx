import { useNavigate } from "react-router-dom";
import "./PageTopbar.css";
import { Bell, UserCircle } from "lucide-react";


const PageTopbar = ({
  title,
  subtitle,
  completionPercentage,
  partnerName,
  onNotificationsClick,
  photoUrl,
}) => {
  const navigate = useNavigate();

  return (
    <header className="page-topbar">
      <div>
        <h1 className="page-topbar__title">{title}</h1>
        {subtitle && <p className="page-topbar__subtitle">{subtitle}</p>}
      </div>

      <div className="page-topbar__actions">
        {typeof completionPercentage === "number" && (
          <span className="page-topbar__completion">
            Profile Completion {completionPercentage}%
          </span>
        )}
        <button
          type="button"
          className="page-topbar__icon-btn"
          aria-label="Notifications"
          onClick={() => navigate('/notifications')}
          style={{ color: "black", background: "transparent", border: "1px solid #ccc", cursor: "pointer" }}
        >
          <Bell size={20} />
        </button>
        <div className="page-topbar__profile">
          <div
            className="page-topbar__avatar"
            onClick={() => navigate("/profile-management")}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={partnerName || "Profile"}
                className="page-topbar__avatar-image"
              />
            ) : (
              <span><UserCircle size={40} /></span>
            )}
          </div>
          {partnerName && partnerName}
        </div>
      </div>
    </header>
  );
};

export default PageTopbar;
