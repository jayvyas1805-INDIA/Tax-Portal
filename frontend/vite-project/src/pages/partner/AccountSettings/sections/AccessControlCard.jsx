import { useState } from "react";
import ToggleSwitch from "../../../../component/ToggleSwitch/ToggleSwitch";
import "./AccessControlCard.css";

const formatLoginEntry = (entry, index) => {
  const date = entry.loginAt ? new Date(entry.loginAt) : null;
  const timeLabel = index === 0
    ? "Current Session"
    : date
      ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
      : "";

  return {
    id: `${entry.loginAt}-${index}`,
    device: entry.device || "Unknown device",
    meta: [timeLabel, entry.ipAddress].filter(Boolean).join(" · "),
  };
};

const AccessControlCard = ({ loginHistory, activeSessions, onViewAllActivity }) => {
  // Note: Two-Factor Authentication isn't backed by the API yet — no
  // field for it exists on the Partner model. This toggle is UI-only
  // for now until that's added.
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const formattedHistory = (
    showAll ? loginHistory : loginHistory.slice(0, 5)
  ).map(formatLoginEntry);

  return (
    <div className="access-control-card">
      <p className="access-control-card__title">🔑 Access Control</p>

      <div className="access-control-card__2fa">
        <div>
          <p className="access-control-card__2fa-title">
            Two Factor Authentication
          </p>
          <p className="access-control-card__2fa-subtitle">
            Recommended for high value accounts
          </p>
        </div>
        <ToggleSwitch
          id="twoFactorAuth"
          checked={twoFactorEnabled}
          onChange={(event) => setTwoFactorEnabled(event.target.checked)}
        />
      </div>

      <p className="access-control-card__history-label">
        Recent Login History ({activeSessions} active {activeSessions === 1 ? "session" : "sessions"})
      </p>

      {formattedHistory.length === 0 ? (
        <p className="access-control-card__empty">No login history yet.</p>
      ) : (
        <ul className="access-control-card__history-list">
          {formattedHistory.map((entry) => (
            <li key={entry.id} className="access-control-card__history-item">
              <span aria-hidden="true">📍</span>
              <div>
                <p className="access-control-card__history-device">
                  {entry.device}
                </p>
                <p className="access-control-card__history-meta">{entry.meta}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {loginHistory.length > 5 && (
        <button
          type="button"
          className="access-control-card__view-all"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "Show less ↑" : `View all activity (${loginHistory.length}) ↓`}
        </button>
      )}
    </div>
  );
};

export default AccessControlCard;
