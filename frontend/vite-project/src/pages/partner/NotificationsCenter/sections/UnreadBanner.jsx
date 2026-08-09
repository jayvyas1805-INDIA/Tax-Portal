import "./UnreadBanner.css";

const UnreadBanner = ({ unreadCount, onManagePreferences }) => {
  return (
    <div className="unread-banner">
      <span aria-hidden="true">🔔</span>
      <p className="unread-banner__text">
        You have {unreadCount} unread notifications across all categories.{" "}
        <button
          type="button"
          className="unread-banner__link"
          onClick={onManagePreferences}
        >
          Manage Preferences
        </button>
      </p>
    </div>
  );
};

export default UnreadBanner;
