import { useState } from "react";
import { createPortal } from "react-dom";
import {
  getPartnerById,
  updateKycDocumentStatus,
  updateBankingVerification,
} from "../../../api/adminPartnerApi";
import PdfPreview from "./PdfPreview";
import "./PartnerDetailModal.css";

const TABS = ["Personal", "Professional", "Address", "KYC", "Banking"];

const StatusPill = ({ status }) => (
  <span className={"pdm-pill pdm-pill--" + status}>
    {status === "verified" ? "✓ Verified" : status === "rejected" ? "✕ Rejected" : "● Pending"}
  </span>
);

const isPdf = (url = "") => {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return pathname.endsWith(".pdf");
  } catch {
    return url.toLowerCase().split("?")[0].split("#")[0].endsWith(".pdf");
  }
};

const DocumentPreview = ({ label, fileUrl }) => {
  if (!fileUrl) {
    return (
      <div className="pdm-doc-preview pdm-doc-preview--empty">
        <strong>{label}</strong>
        <p>No file uploaded.</p>
      </div>
    );
  }

  const pdf = isPdf(fileUrl);

  return (
    <div className="pdm-doc-preview">
      <div className="pdm-doc-preview__title">{label}</div>

      {pdf ? (
        <PdfPreview label={label} fileUrl={fileUrl} />
      ) : (
        <img src={fileUrl} alt={label} className="pdm-image-preview" />
      )}

      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="pdm-doc-open">
        Open full size ↗
      </a>
    </div>
  );
};

export default function PartnerDetailModal({ isOpen, onClose, partner, loading, onPartnerUpdate }) {
  const [tab, setTab] = useState("Personal");
  const [remarksDraft, setRemarksDraft] = useState({});
  const [busyKey, setBusyKey] = useState(null);
  const [actionError, setActionError] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setTab("Personal");
    setRemarksDraft({});
    setActionError("");
    onClose();
  };

  const refreshPartner = async () => {
    const fresh = await getPartnerById(partner.id);
    onPartnerUpdate(fresh);
  };

  const handleKycAction = async (docType, status) => {
    try {
      setBusyKey(docType + status);
      setActionError("");
      await updateKycDocumentStatus(partner.id, docType, {
        status,
        adminRemarks: remarksDraft[docType] || "",
      });
      await refreshPartner();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to update document status.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleBankingAction = async (verificationStatus) => {
    try {
      setBusyKey("banking" + verificationStatus);
      setActionError("");
      await updateBankingVerification(partner.id, {
        verificationStatus,
        adminRemarks: remarksDraft.banking || "",
      });
      await refreshPartner();
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to update banking status.");
    } finally {
      setBusyKey(null);
    }
  };

  const modalContent = (
    <div className="pdm__overlay" onClick={handleClose}>
      <div className="pdm__modal" onClick={(e) => e.stopPropagation()}>
        <div className="pdm__header">
          <div>
            <h2>{loading ? "Loading..." : partner?.personalInfo?.fullName || partner?.name || "Partner Details"}</h2>
            {!loading && partner && <p className="pdm__subtitle">{partner.email}</p>}
          </div>
          <button type="button" className="pdm__close" onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading || !partner ? (
          <div className="pdm__state">Loading partner details...</div>
        ) : (
          <>
            <div className="pdm__tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={"pdm__tab" + (tab === t ? " pdm__tab--active" : "")}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {actionError && <p className="pdm__error">{actionError}</p>}

            <div className="pdm__body">
              {tab === "Personal" && (
                <div className="pdm-grid">
                  <div><span>Full Name</span><p>{partner.personalInfo.fullName}</p></div>
                  <div><span>Mobile Number</span><p>{partner.personalInfo.mobileNumber}</p></div>
                  <div><span>Date of Birth</span><p>{new Date(partner.personalInfo.dateOfBirth).toLocaleDateString()}</p></div>
                  <div><span>Gender</span><p>{partner.personalInfo.gender}</p></div>
                  <div><span>Tier</span><p>{partner.tier || "—"}</p></div>
                  <div><span>Account Status</span><p>{partner.accountStatus}</p></div>
                </div>
              )}

              {tab === "Professional" && (
                <div className="pdm-grid">
                  <div><span>Occupation</span><p>{partner.professionalInfo.occupation}</p></div>
                  <div><span>Company Name</span><p>{partner.professionalInfo.companyName || "—"}</p></div>
                  <div><span>Experience</span><p>{partner.professionalInfo.experienceYears} years</p></div>
                </div>
              )}

              {tab === "Address" && (
                <div className="pdm-grid">
                  <div><span>Address Line 1</span><p>{partner.addressInfo.addressLine1}</p></div>
                  <div><span>Address Line 2</span><p>{partner.addressInfo.addressLine2 || "—"}</p></div>
                  <div><span>City</span><p>{partner.addressInfo.city}</p></div>
                  <div><span>State</span><p>{partner.addressInfo.state}</p></div>
                  <div><span>Pincode</span><p>{partner.addressInfo.pincode}</p></div>
                </div>
              )}

              {tab === "KYC" && (
                <div className="pdm-kyc">
                  <div className="pdm-grid" style={{ marginBottom: 16 }}>
                    <div><span>PAN Number</span><p>{partner.kycInfo.panNumber}</p></div>
                    <div><span>Aadhaar Number</span><p>{partner.kycInfo.aadhaarNumber}</p></div>
                    <div><span>Overall KYC</span><p><StatusPill status={partner.kycInfo.status === "complete" ? "verified" : "pending"} /></p></div>
                  </div>

                  {[
                    { key: "panCard", label: "PAN Card Copy" },
                    { key: "aadhaarCard", label: "Aadhaar Front & Back" },
                    { key: "photo", label: "Live Photograph" },
                  ].map(({ key, label }) => {
                    const doc = partner.kycInfo[key];
                    return (
                      <div className="pdm-doc-block" key={key}>
                        <div className="pdm-doc-block__header">
                          <h4>{label}</h4>
                          <StatusPill status={doc.status} />
                        </div>

                        <DocumentPreview label={label} fileUrl={doc.fileUrl} />

                        {doc.adminRemarks && (
                          <p className="pdm-doc__remarks">Previous remark: {doc.adminRemarks}</p>
                        )}

                        <textarea
                          className="pdm-remarks-input"
                          placeholder="Add a remark (optional)"
                          value={remarksDraft[key] || ""}
                          onChange={(e) => setRemarksDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                        />

                        <div className="pdm-doc-actions">
                          <button
                            type="button"
                            className="pdm-btn pdm-btn--approve"
                            disabled={busyKey === key + "verified" || doc.status === "verified"}
                            onClick={() => handleKycAction(key, "verified")}
                          >
                            {busyKey === key + "verified" ? "..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            className="pdm-btn pdm-btn--reject"
                            disabled={busyKey === key + "rejected" || doc.status === "rejected"}
                            onClick={() => handleKycAction(key, "rejected")}
                          >
                            {busyKey === key + "rejected" ? "..." : "Reject"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "Banking" && (
                <div className="pdm-kyc">
                  <div className="pdm-grid" style={{ marginBottom: 16 }}>
                    <div><span>Account Holder</span><p>{partner.bankingInfo.accountHolderName}</p></div>
                    <div><span>Bank Name</span><p>{partner.bankingInfo.bankName}</p></div>
                    <div><span>Branch</span><p>{partner.bankingInfo.branch || "—"}</p></div>
                    <div><span>Account Number</span><p>{partner.bankingInfo.accountNumber || "—"}</p></div>
                    <div><span>IFSC Code</span><p>{partner.bankingInfo.ifscCode}</p></div>
                    <div><span>Account Type</span><p>{partner.bankingInfo.accountType}</p></div>
                  </div>

                  <div className="pdm-doc-block">
                    <div className="pdm-doc-block__header">
                      <h4>Cancelled Cheque</h4>
                      <StatusPill status={partner.bankingInfo.verificationStatus} />
                    </div>

                    <DocumentPreview label="Cancelled Cheque" fileUrl={partner.bankingInfo.cancelledChequeFileUrl} />

                    {partner.bankingInfo.adminRemarks && (
                      <p className="pdm-doc__remarks">Previous remark: {partner.bankingInfo.adminRemarks}</p>
                    )}

                    <textarea
                      className="pdm-remarks-input"
                      placeholder="Add a remark (optional)"
                      value={remarksDraft.banking || ""}
                      onChange={(e) => setRemarksDraft((prev) => ({ ...prev, banking: e.target.value }))}
                    />

                    <div className="pdm-doc-actions">
                      <button
                        type="button"
                        className="pdm-btn pdm-btn--approve"
                        disabled={busyKey === "bankingverified" || partner.bankingInfo.verificationStatus === "verified"}
                        onClick={() => handleBankingAction("verified")}
                      >
                        {busyKey === "bankingverified" ? "..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        className="pdm-btn pdm-btn--reject"
                        disabled={busyKey === "bankingrejected" || partner.bankingInfo.verificationStatus === "rejected"}
                        onClick={() => handleBankingAction("rejected")}
                      >
                        {busyKey === "bankingrejected" ? "..." : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
