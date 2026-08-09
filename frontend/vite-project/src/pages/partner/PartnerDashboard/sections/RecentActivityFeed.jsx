import { useState } from "react";
import "./RecentActivityFeed.css";

const RecentActivityFeed = ({ activities = [] }) => {
  const [expanded, setExpanded] = useState(false);

  const visibleActivities = expanded
    ? activities
    : activities.slice(0, 3);

  return (
    <div className="recent-activity-feed">
      <div className="recent-activity-feed__header">
        <p className="recent-activity-feed__title">
          Recent Activities
        </p>

        {activities.length > 3 && (
          <button
            className="recent-activity-feed__view-all"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide ▲" : "View All ▼"}
          </button>
        )}
      </div>

      <ul
        className={`recent-activity-feed__list ${
          expanded ? "expanded" : ""
        }`}
      >
        {visibleActivities.map((activity) => (
          <li
            key={activity.id}
            className="recent-activity-feed__item"
          >
            <span className="recent-activity-feed__icon">
              {activity.icon}
            </span>

            <div className="recent-activity-feed__content">
              <p className="recent-activity-feed__item-title">
                {activity.title}
              </p>

              <p className="recent-activity-feed__item-meta">
                {activity.meta}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivityFeed;