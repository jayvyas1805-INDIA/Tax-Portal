import "./NotificationTabs.css";
import { CheckCheck, Trash2 } from "lucide-react";

const TABS = [
  { id: "all", label: "All Notifications" },
  { id: "referral", label: "Referral Updates" },
  { id: "lead", label: "Lead Conversion" },
  { id: "commission", label: "Commission" },
  { id: "system", label: "System" },
  { id: "announcement", label: "Announcements" },
];

const NotificationTabs = ({
  activeTab,
  onTabChange,
  onMarkAllRead,
  onDeleteAll,
}) => {
  return (
    <div className="notification-tabs">
      <div className="notification-tabs__list">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`notification-tabs__tab ${
              activeTab === tab.id ? "active" : ""
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="notification-tabs__actions">
        <button
          className="notification-tabs__mark-read"
          onClick={onMarkAllRead}
        >
          <CheckCheck size={18} />
          <span>Mark as Read</span>
        </button>

        <button
          className="notification-tabs__delete"
          onClick={onDeleteAll}
        >
          <Trash2 size={18} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationTabs;