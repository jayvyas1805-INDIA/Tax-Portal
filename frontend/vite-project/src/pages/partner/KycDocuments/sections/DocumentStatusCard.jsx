import StatusBadge from "../../../../component/StatusBadge/StatusBadge";
import "./DocumentStatusCard.css";

const DocumentStatusCard = ({ label, value, status, tone, meta, accentColor }) => {
  return (
    <div
      className="document-status-card"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="document-status-card__header">
        <p className="document-status-card__label">{label}</p>
        <StatusBadge label={status} tone={tone} />
      </div>
      <p className="document-status-card__value">{value}</p>
      <p className="document-status-card__meta">{meta}</p>
    </div>
  );
};

export default DocumentStatusCard;
