import Button from "../../../../component/Button/Button";
import "./QuickActionsCard.css";

const QuickActionsCard = ({ onCreateReferral, onViewReferrals, onViewCommissionHistory }) => {
  return (
    <div className="quick-actions-card">
      <p className="quick-actions-card__title">Quick Actions</p>
      <p className="quick-actions-card__subtitle">
        Streamline your workflow with one click access
      </p>

      <div className="quick-actions-card__buttons">
        <Button variant="primary" onClick={onCreateReferral}>
          + Create New Referral
        </Button>
        <Button variant="secondary" onClick={onViewReferrals}>
          View Referrals
        </Button>
      </div>

      <button
        type="button"
        className="quick-actions-card__link"
        onClick={onViewCommissionHistory}
      >
        Commission History
      </button>
    </div>
  );
};

export default QuickActionsCard;
