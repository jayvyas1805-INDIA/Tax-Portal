import { useState } from "react";
import "./ProfileCompletionChecklist.css";

const ProfileCompletionChecklist = ({
  percentage,
  items,
}) => {
  const [expanded, setExpanded] = useState(false);
  

  const completed = items.filter(
    (i) => i.status === "done"
  );

  const visibleItems = expanded
    ? items
    : completed;

  const remaining = items.filter(
    (i) => i.status !== "done"
  ).length;


  return (
    <div className="profile-completion-checklist">
      <div className="profile-completion-checklist__header">
        <div>
          <h3>Profile Completion</h3>

          <span>{percentage}% Completed</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide ▲" : "View Details ▼"}
        </button>
      </div>

      <div className="profile-completion-checklist__bar">
        <div
          className="profile-completion-checklist__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <ul
        className={`profile-completion-checklist__list ${
          expanded ? "expanded" : ""
        }`}
      >
        {visibleItems.map((item) => (
          <li key={item.label}>
            <span
              className={`status ${item.status}`}
            >
              {item.status === "done"
                ? "✓"
                : item.status === "progress"
                ? "•"
                : "○"}
            </span>

            <div>
              <p>{item.label}</p>

              {item.note && (
                <small>{item.note}</small>
              )}
            </div>
          </li>
        ))}
      </ul>

      {expanded && (
        <div className="remaining">
          Remaining Steps :
          <strong>{remaining}</strong>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionChecklist;