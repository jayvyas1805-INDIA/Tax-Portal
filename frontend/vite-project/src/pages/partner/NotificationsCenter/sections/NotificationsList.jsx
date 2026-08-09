import { formatTimeAgo } from "../../../../utils/formatTimeAgo";
import "./NotificationsList.css";

const CATEGORY_TONE = {
  referrals: "info",
  commission: "positive",
  system: "warning",
};

const NotificationsList = ({ notifications, hasMore, onLoadOlder, onNotificationClick }) => {
  return (
    <div className="notifications-list">
      <ul className="notifications-list__items">
        {notifications.length === 0 ? (
          <li className="notifications-list__empty">No notifications yet.</li>
        ) : (
          notifications.map((notification) => (
            <li
              key={notification._id}
              className={`notifications-list__item${
                !notification.isRead ? " notifications-list__item--unread" : ""
              }`}
              onClick={() => onNotificationClick(notification)}
            >
              <span
                className={`notifications-list__icon notifications-list__icon--${CATEGORY_TONE[notification.category]}`}
                aria-hidden="true"
              >
                {notification.icon}
              </span>

              <div className="notifications-list__content">
                <p className="notifications-list__title">{notification.title}</p>
                <p className="notifications-list__description">
                  {notification.description}
                </p>
                <p className="notifications-list__meta">
                  {notification.category.toUpperCase()} · {formatTimeAgo(notification.createdAt)}
                </p>
              </div>

              {!notification.isRead && (
                <span className="notifications-list__unread-dot" aria-hidden="true" />
              )}
            </li>
          ))
        )}
      </ul>

      {hasMore && (
        <button
          type="button"
          className="notifications-list__load-more"
          onClick={onLoadOlder}
        >
          Load Older Notifications
        </button>
      )}
    </div>
  );
};

export default NotificationsList;