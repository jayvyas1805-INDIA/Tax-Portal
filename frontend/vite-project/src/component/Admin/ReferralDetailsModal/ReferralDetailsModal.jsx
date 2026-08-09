import { useEffect, useState } from "react";
import "./ReferralDetailsModal.css";
import { updateReferralStatus } from "../../../api/adminReferralApi";

const STATUS_OPTIONS = [
  "Under Review",
  "Proposal Shared",
  "Converted",
  "Rejected",
];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ReferralDetailsModal({
  isOpen,
  onClose,
  referral,
  onStatusUpdated,
}) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (referral) {
      setStatus(referral.status);
    }
  }, [referral]);

  if (!isOpen || !referral) return null;

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const updatedReferral = await updateReferralStatus(
        referral.id,
        status
      );

      onStatusUpdated(updatedReferral);

      onClose();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Failed to update referral."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="referral-modal-overlay">

      <div className="referral-modal">

        <div className="referral-modal-header">
          <h2>Referral Details</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="referral-body">

          <div className="detail-row">
            <span>Referral ID</span>
            <strong>{referral.referralId}</strong>
          </div>

          <div className="detail-row">
            <span>Partner</span>
            <strong>{referral.partner.name}</strong>
          </div>

          <div className="detail-row">
            <span>Partner Email</span>
            <strong>{referral.partner.email}</strong>
          </div>

          <div className="detail-row">
            <span>Client</span>
            <strong>{referral.clientName}</strong>
          </div>

          <div className="detail-row">
            <span>Contact</span>
            <strong>{referral.clientContact}</strong>
          </div>

          <div className="detail-row">
            <span>Service</span>
            <strong>{referral.service}</strong>
          </div>

          <div className="detail-row">
            <span>Estimated Value</span>
            <strong>
              {formatCurrency(referral.estimatedValue)}
            </strong>
          </div>

          <div className="detail-row">
            <span>Created</span>
            <strong>
              {formatDate(referral.createdAt)}
            </strong>
          </div>

          <div className="detail-row">
            <span>Updated</span>
            <strong>
              {formatDate(referral.updatedAt)}
            </strong>
          </div>

          <div className="detail-row notes-row">
            <span>Partner Notes</span>

            <p>
              {referral.notes || "No notes available."}
            </p>
          </div>

          <div className="detail-row">
            <span>Status</span>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              {STATUS_OPTIONS.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="referral-footer">

          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Status"}
          </button>

        </div>

      </div>

    </div>
  );
}