import { useState } from "react";
import { createPortal } from "react-dom";
import { sendPartnerInvite } from "../../../api/authApi";
import "./InvitePartnerModal.css";

export default function InvitePartnerModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const resetAndClose = () => {
    setName("");
    setEmail("");
    setError("");
    setSuccess("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await sendPartnerInvite({ name: name.trim(), email: email.trim() });
      setSuccess(res.message || "Invite sent successfully.");
      setName("");
      setEmail("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="ipm__overlay" onClick={resetAndClose}>
      <div className="ipm__modal" onClick={(e) => e.stopPropagation()}>
        <div className="ipm__header">
          <h2>Invite Partner</h2>
          <button type="button" className="ipm__close" onClick={resetAndClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="ipm__subtitle">
          Send a registration invite. They'll receive an email with a link to complete signup.
        </p>

        <form onSubmit={handleSubmit} className="ipm__form">
          <label className="ipm__label">
            Full Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              disabled={submitting}
            />
          </label>

          <label className="ipm__label">
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              disabled={submitting}
            />
          </label>

          {error && <p className="ipm__message ipm__message--error">{error}</p>}
          {success && <p className="ipm__message ipm__message--success">{success}</p>}

          <div className="ipm__actions">
            <button type="button" className="ipm__btn ipm__btn--ghost" onClick={resetAndClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="ipm__btn ipm__btn--primary" disabled={submitting}>
              {submitting ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}