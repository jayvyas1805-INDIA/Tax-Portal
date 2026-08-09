import "./ReportingToolsCard.css";

const ReportingToolsCard = ({ onDownloadStatement, onDownloadInvoice }) => {
  return (
    <div className="reporting-tools-card">
      <p className="reporting-tools-card__title">Reporting Tools</p>

      <button
        type="button"
        className="reporting-tools-card__item"
        onClick={onDownloadStatement}
      >
        <span aria-hidden="true">📄</span>
        <span>
          <span className="reporting-tools-card__item-title">
            Download Statement
          </span>
          <span className="reporting-tools-card__item-subtitle">
            YTD commission summary
          </span>
        </span>
        <span className="reporting-tools-card__item-icon" aria-hidden="true">
          ⬇
        </span>
      </button>

      <button
        type="button"
        className="reporting-tools-card__item"
        onClick={onDownloadInvoice}
      >
        <span aria-hidden="true">🧾</span>
        <span>
          <span className="reporting-tools-card__item-title">
            Download Invoice
          </span>
          <span className="reporting-tools-card__item-subtitle">
            Latest settlement invoice
          </span>
        </span>
        <span className="reporting-tools-card__item-icon" aria-hidden="true">
          ⬇
        </span>
      </button>
    </div>
  );
};

export default ReportingToolsCard;
