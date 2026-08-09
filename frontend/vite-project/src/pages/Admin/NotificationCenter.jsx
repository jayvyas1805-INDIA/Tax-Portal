import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationCenter.css";
import {
  getNotificationStats,
  getNotifications,
  markOneAsRead,
  markAllAsRead,
  clearHistory,
} from "../../api/adminNotificationApi";

const TABS = ["All Notifications", "Critical Alerts", "Partner Updates", "Financial"];

// Contextual quick actions per category — both mark the notification read;
// the primary action also deep-links to the page that handles it.
const CATEGORY_ACTIONS = {
  critical: { primary: "Review Documents", to: "/admin/partner-management" },
  partner: { primary: "View Partner", to: "/admin/partner-management" },
  financial: { primary: "View Details", to: "/admin/commission-management" },
  system: null,
};

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All Notifications");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const loadStats = async () => {
    try {
      const data = await getNotificationStats();
      setStats(data);
    } catch {
      // Stat cards fail silently — the list below is the priority
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getNotifications({ tab, page, limit });
        if (!isMounted) return;
        setNotifications(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Failed to load notifications.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, [tab, page, limit]);

  const changeTab = (t) => {
    setTab(t);
    setPage(1);
  };

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPage(p);
  };

  const handleMarkRead = async (n) => {
    if (!n.unread) return;
    try {
      setBusyId(n.id);
      await markOneAsRead(n.id);
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item)));
      loadStats();
    } catch {
      // leave as-is on failure
    } finally {
      setBusyId(null);
    }
  };

  const handlePrimaryAction = async (n) => {
    await handleMarkRead(n);
    const action = CATEGORY_ACTIONS[n.category];
    if (action) navigate(action.to);
  };

  const handleMarkAllRead = async () => {
    try {
      setBulkBusy(true);
      await markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
      loadStats();
    } catch {
      // leave as-is on failure
    } finally {
      setBulkBusy(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      setBulkBusy(true);
      await clearHistory();
      // Read notifications are gone server-side — refresh the current page
      const res = await getNotifications({ tab, page: 1, limit });
      setNotifications(res.data);
      setPagination(res.pagination);
      setPage(1);
      loadStats();
    } catch {
      // leave as-is on failure
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="nc">
      <div className="nc__topbar">
        <div>
          <h1>Notification Center</h1>
          <p>Manage and respond to critical system events and partner actions.</p>
        </div>
        <div className="nc__topbar-actions">
          <button type="button" className="nc__btn nc__btn--ghost" disabled={bulkBusy} onClick={handleMarkAllRead}>
            Mark all as read
          </button>
          <button type="button" className="nc__btn nc__btn--primary" disabled={bulkBusy} onClick={handleClearHistory}>
            Clear History
          </button>
        </div>
      </div>

      {stats && (
        <div className="nc__stats">
          <div className="nc-card">
            <span className="nc-card__icon">👥</span>
            <div>
              <p className="nc-card__value">{stats.newPartners}</p>
              <p className="nc-card__label">New Partners</p>
            </div>
          </div>
          <div className="nc-card">
            <span className="nc-card__icon">🛡</span>
            <div>
              <p className="nc-card__value">{stats.pendingVerification}</p>
              <p className="nc-card__label">Pending Verif.</p>
            </div>
          </div>
          <div className="nc-card">
            <span className="nc-card__icon">✅</span>
            <div>
              <p className="nc-card__value">{stats.pendingApprovals}</p>
              <p className="nc-card__label">Approvals</p>
            </div>
          </div>
          <div className="nc-card">
            <span className="nc-card__icon">✉</span>
            <div>
              <p className="nc-card__value">{stats.allUnread}</p>
              <p className="nc-card__label">All Unread</p>
            </div>
          </div>
        </div>
      )}

      <div className="nc-card nc__panel">
        <div className="nc__panel-header">
          <div className="nc__tabs">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                className={"nc__tab" + (tab === t ? " nc__tab--active" : "")}
                onClick={() => changeTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="nc__sort">
            <strong>{pagination.total} total</strong>
          </div>
        </div>

        {loading ? (
          <div className="nc__state">Loading notifications...</div>
        ) : error ? (
          <div className="nc__state nc__state--error">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="nc__state">You're all caught up.</div>
        ) : (
          <ul className="nc__list">
            {notifications.map((n) => {
              const action = CATEGORY_ACTIONS[n.category];
              return (
                <li className={"nc__item" + (n.unread ? " nc__item--unread" : "")} key={n.id}>
                  <span className={"nc__item-icon" + (n.category === "critical" ? " nc__item-icon--alert" : "")}>
                    {n.icon}
                  </span>
                  <div className="nc__item-body">
                    <div className="nc__item-row">
                      <p className="nc__item-title">{n.title}</p>
                      <span className="nc__item-time">{n.time}</span>
                    </div>
                    <p className="nc__item-detail">{n.detail}</p>
                    <div className="nc__item-actions">
                      {action && (
                        <button
                          type="button"
                          className="nc__action-btn nc__action-btn--primary"
                          disabled={busyId === n.id}
                          onClick={() => handlePrimaryAction(n)}
                        >
                          {action.primary}
                        </button>
                      )}
                      {n.unread && (
                        <button
                          type="button"
                          className="nc__action-btn nc__action-btn--ghost"
                          disabled={busyId === n.id}
                          onClick={() => handleMarkRead(n)}
                        >
                          {busyId === n.id ? "..." : "Dismiss"}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {pagination.totalPages > 1 && (
          <div className="nc__pagination">
            <button type="button" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={p === pagination.page ? "is-active" : ""}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}
            <button type="button" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
