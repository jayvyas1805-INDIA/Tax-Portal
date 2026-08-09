import "./SummaryCard.css";

const SummaryCard = ({ title, onEdit, children }) => {
  return (
    <div className="summary-card">
      <div className="summary-card__header">
        <p className="summary-card__title">{title}</p>
        <button
          type="button"
          className="summary-card__edit"
          onClick={onEdit}
        >
          ✎ Edit
        </button>
      </div>
      <div className="summary-card__body">{children}</div>
    </div>
  );
};

export default SummaryCard;
