import "./StatusBadge.css";

const TONE_BY_STATUS = {
  paid: "positive",
  pending: "warning",
  converted: "positive",
  proposal: "info",
  "under review": "warning",
  rejected: "negative",
};

const StatusBadge = ({ label, tone }) => {
  const resolvedTone = tone || TONE_BY_STATUS[label.toLowerCase()] || "neutral";

  return (
    <span className={`status-badge status-badge--${resolvedTone}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
