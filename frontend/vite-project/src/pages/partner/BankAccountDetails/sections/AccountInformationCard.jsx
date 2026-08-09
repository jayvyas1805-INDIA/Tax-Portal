import FormField from "../../../../component/FormField/FormField";
import PasswordField from "../../../../component/PasswordField/PasswordField";
import FileUploadField from "../../../../component/FileUploadField/FileUploadField";
import Button from "../../../../component/Button/Button";
import "./AccountInformationCard.css";

const AccountInformationCard = ({
  formData,
  onFieldChange,
  onFileSelect,
  cancelledChequeFileUrl,
  onSaveChanges,
  onCancel,
  isSaving,
}) => {
  const handleChange = (event) => {
    onFieldChange(event.target.name, event.target.value);
  };

  return (
    <div className="account-information-card">
      <p className="account-information-card__title">Account Information</p>

      <div className="account-information-card__grid">
        <FormField
          id="accountHolderName"
          name="accountHolderName"
          label="Holder Name"
          value={formData.accountHolderName}
          onChange={handleChange}
          required
        />
        <FormField
          id="bankName"
          name="bankName"
          label="Bank Name"
          value={formData.bankName}
          onChange={handleChange}
          required
        />
        <FormField
          id="branch"
          name="branch"
          label="Branch"
          value={formData.branch}
          onChange={handleChange}
        />
        <FormField
          id="ifscCode"
          name="ifscCode"
          label="IFSC Code"
          value={formData.ifscCode}
          onChange={handleChange}
          required
        />
      </div>

      <PasswordField
        id="accountNumber"
        name="accountNumber"
        label="Account Number"
        value={formData.accountNumber}
        onChange={handleChange}
      />

      <div className="account-information-card__section">
        <p className="account-information-card__section-label">
          Cancelled Cheque
        </p>
        <FileUploadField
          id="cancelledCheque"
          icon="📤"
          title="Click to upload or drag and drop"
          hint={
            cancelledChequeFileUrl
              ? "A cancelled cheque is already on file — upload a new one to replace it."
              : "Upload a clear image or PDF of your cancelled cheque for bank verification. Supported formats: JPG, PNG, PDF (Max 5MB)"
          }
          accept=".jpg,.jpeg,.png,.pdf"
          onFileSelect={onFileSelect}
        />
        {cancelledChequeFileUrl && (
          <a
            href={cancelledChequeFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="account-information-card__cheque-link"
          >
            View current cancelled cheque →
          </a>
        )}
      </div>

      <div className="account-information-card__alert">
        <span aria-hidden="true">⚠</span>
        <div>
          <p className="account-information-card__alert-title">
            Security Alert
          </p>
          <p className="account-information-card__alert-text">
            Changes to bank details require admin approval. A representative
            may contact you for verification before new details are
            activated.
          </p>
        </div>
      </div>

      <div className="account-information-card__actions">
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSaveChanges} disabled={isSaving}>
          {isSaving ? "💾 Saving..." : "💾 Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default AccountInformationCard;
