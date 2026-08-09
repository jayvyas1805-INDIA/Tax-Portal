import { useState } from "react";
import "./ProfileCompletionChecklist.css";

const STATUS_ICON = {
  done: "✓",
  pending: "⏳",
};

const ProfileCompletionChecklist = ({
    percentage = 0,
    items = [],
}) => {
  const [expanded, setExpanded] = useState(false);

  const completedItems = items.filter((item) => item.status === "done");

  const visibleItems = expanded ? items : completedItems;

  const remaining = items.filter((item) => item.status !== "done").length;

  return (
    <div className="profile-completion-checklist">
      <div className="profile-completion-checklist__header">
        <div>
          <h3 className="profile-completion-checklist__title">
            Profile Completion
          </h3>
          <span className="profile-completion-checklist__percentage">
            {percentage}% Completed
          </span>
        </div>

        <button
          type="button"
          className="profile-completion-checklist__toggle"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Hide ▲" : "View Details ▼"}
        </button>
      </div>

      <div className="profile-completion-checklist__bar">
        <div
          className="profile-completion-checklist__bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <ul
        className={`profile-completion-checklist__list ${
          expanded ? "expanded" : ""
        }`}
      >
        {visibleItems.map((item) => (
          <li
            key={item.label}
            className="profile-completion-checklist__item"
          >
            <span
              className={`profile-completion-checklist__status profile-completion-checklist__status--${item.status}`}
            >
              {STATUS_ICON[item.status] ?? "○"}
            </span>

            <div>
              <p
                className={`profile-completion-checklist__item-label ${
                  item.status === "pending"
                    ? "profile-completion-checklist__item-label--missing"
                    : ""
                }`}
              >
                {item.label}
              </p>

              {item.note && (
                <p className="profile-completion-checklist__item-note">
                  {item.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {expanded && (
        <div className="profile-completion-checklist__remaining">
          Remaining Steps: <strong>{remaining}</strong>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionChecklist;