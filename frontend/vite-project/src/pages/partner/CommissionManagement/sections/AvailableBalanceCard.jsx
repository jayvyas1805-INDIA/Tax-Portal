import Button from "../../../../component/Button/Button";
import "./AvailableBalanceCard.css";

const AvailableBalanceCard = ({
  availableBalance,
  totalWithdrawn,
  pendingApproval,
  onWithdraw,
  isWithdrawing,
}) => {
  return (
    <div className="available-balance-card">
      <div className="available-balance-card__header">
        <p className="available-balance-card__label">Available Balance</p>
        <span aria-hidden="true">💳</span>
      </div>
      <p className="available-balance-card__amount">
        ₹{availableBalance.toLocaleString()}
      </p>

      <div className="available-balance-card__breakdown">
        <div>
          <span className="available-balance-card__breakdown-label">
            Total Withdrawn
          </span>
          <span className="available-balance-card__breakdown-value">
            ₹{totalWithdrawn.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="available-balance-card__breakdown-label">
            Pending Approval
          </span>
          <span className="available-balance-card__breakdown-value">
            ₹{pendingApproval.toLocaleString()}
          </span>
        </div>
      </div>

      <Button variant="primary" onClick={onWithdraw} disabled={isWithdrawing || availableBalance <= 0}>
        {isWithdrawing ? "Submitting..." : "Withdraw Now"}
      </Button>
    </div>
  );
};

export default AvailableBalanceCard;
