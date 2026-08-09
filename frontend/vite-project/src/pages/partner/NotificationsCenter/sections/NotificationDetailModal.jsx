import { formatTimeAgo } from "../../../../utils/formatTimeAgo";
import "./NotificationDetailModal.css";

const CATEGORY_TONE = {
  referrals: "info",
  commission: "positive",
  system: "warning",
};

const NotificationDetailModal = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="notification-detail-modal__overlay" onClick={onClose}>
      <div
        className="notification-detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="notification-detail-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <span
          className={`notification-detail-modal__icon notification-detail-modal__icon--${CATEGORY_TONE[notification.category]}`}
          aria-hidden="true"
        >
          {notification.icon}
        </span>

        <p className="notification-detail-modal__title">{notification.title}</p>
        <p className="notification-detail-modal__meta">
          {notification.category.toUpperCase()} · {formatTimeAgo(notification.createdAt)}
        </p>
        <p className="notification-detail-modal__description">
          {notification.description}
        </p>
      </div>
    </div>
  );
};

export default NotificationDetailModal;