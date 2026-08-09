import Modal from "../../../../component/Modal/Modal";
import StatusBadge from "../../../../component/StatusBadge/StatusBadge";
import "./ViewReferralModal.css";

const STATUS_TONE = {
  "Proposal Shared": "info",
  Converted: "positive",
  "Under Review": "warning",
  Rejected: "negative",
};

const ViewReferralModal = ({ referral, onClose }) => {
  return (
    <Modal isOpen={Boolean(referral)} onClose={onClose} title="Referral Details">
      {referral && (
        <div className="view-referral-modal">
          <div className="view-referral-modal__row">
            <span>Referral ID: </span>
            <strong>{referral.referralId}</strong>
          </div>
          <div className="view-referral-modal__row">
            <span>Client Name: </span>
            <strong>{referral.clientName}</strong>
          </div>
          <div className="view-referral-modal__row">
            <span>Client Contact: </span>
            <strong>{referral.clientContact}</strong>
          </div>
          <div className="view-referral-modal__row">
            <span>Service: </span>
            <strong>{referral.service}</strong>
          </div>
          <div className="view-referral-modal__row">
            <span>Status: </span>
            <StatusBadge label={referral.status} tone={STATUS_TONE[referral.status]} />
          </div>
          <div className="view-referral-modal__row">
            <span>Estimated Value: </span>
            <strong>₹{referral.estimatedValue.toLocaleString()}</strong>
          </div>
          <div className="view-referral-modal__row">
            <span>Created On: </span>
            <strong>
              {new Date(referral.createdAt).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </strong>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ViewReferralModal;
