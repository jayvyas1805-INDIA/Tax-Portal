import Button from "../../../../component/Button/Button";
import "./RecentPaymentCard.css";

const RecentPaymentCard = ({ recentPayment, onViewHistory }) => {
  return (
    <div className="recent-payment-card">
      <p className="recent-payment-card__title">Recent Payment</p>

      {!recentPayment ? (
        <p className="recent-payment-card__empty">No payouts yet.</p>
      ) : (
        <>
          <div className="recent-payment-card__row">
            <span className="recent-payment-card__label">Amount Paid</span>
            <span className="recent-payment-card__value">
              ₹{recentPayment.amount.toLocaleString()}
            </span>
          </div>

          <div className="recent-payment-card__row">
            <span className="recent-payment-card__label">Last Payment Date</span>
            <span className="recent-payment-card__value">
              {new Date(recentPayment.paidAt).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </span>
          </div>

          <div className="recent-payment-card__utr">
            <span className="recent-payment-card__label">UTR Number</span>
            <span className="recent-payment-card__utr-value">{recentPayment.utrNumber}</span>
          </div>
        </>
      )}

      <Button variant="primary" onClick={onViewHistory}>
        📋 View Payout History
      </Button>
    </div>
  );
};

export default RecentPaymentCard;
