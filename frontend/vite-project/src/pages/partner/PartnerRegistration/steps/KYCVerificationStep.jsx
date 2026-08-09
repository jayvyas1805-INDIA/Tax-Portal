import FormField from "../../../../component/FormField/FormField";
import FileUploadField from "../../../../component/FileUploadField/FileUploadField";
import Button from "../../../../component/Button/Button";
import "./KYCVerificationStep.css";

const KYCVerificationStep = ({
  formData,
  onFieldChange,
  onFileChange,
  onNext,
  onPrevious,
}) => {
  const handleChange = (event) => {
    onFieldChange(event.target.name, event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form className="kyc-step" onSubmit={handleSubmit}>
      <div className="kyc-step__header">
        <h3 className="kyc-step__header-title">KYC Verification</h3>
        <p className="kyc-step__header-subtitle">
          Please upload your identity documents for verification. Ensure the
          details match your profile information.
        </p>
      </div>

      <div className="kyc-step__grid">
        <FormField
          id="panNumber"
          name="panNumber"
          label="PAN Number"
          placeholder="ABCDE1234F"
          value={formData.panNumber}
          onChange={handleChange}
          required
        />
        <FormField
          id="aadhaarNumber"
          name="aadhaarNumber"
          label="Aadhaar Number"
          placeholder="0000 0000 0000"
          value={formData.aadhaarNumber}
          onChange={handleChange}
          required
        />
      </div>

      <div className="kyc-step__uploads">
        <FileUploadField
          id="panCardFile"
          icon="🪪"
          title="Upload PAN Card"
          hint="Drag and drop or browse (PDF, PNG, JPG)"
          accept=".pdf,.png,.jpg,.jpeg"
          onFileSelect={(file) => onFileChange("panCardFile", file)}
        />
        <FileUploadField
          id="aadhaarCardFile"
          icon="📄"
          title="Upload Aadhaar Card"
          hint="Upload both front and back in a single file"
          accept=".pdf,.png,.jpg,.jpeg"
          onFileSelect={(file) => onFileChange("aadhaarCardFile", file)}
        />
        <FileUploadField
          id="passportPhotoFile"
          icon="🙂"
          title="Upload Passport Size Photo"
          hint="Clean, forward-facing photo without accessories"
          accept=".png,.jpg,.jpeg"
          onFileSelect={(file) => onFileChange("passportPhotoFile", file)}
        />
      </div>

      <div className="kyc-step__actions">
        <Button variant="secondary" onClick={onPrevious}>
          ← Previous
        </Button>
        <Button type="submit" variant="primary">
          Continue →
        </Button>
      </div>
    </form>
  );
};

export default KYCVerificationStep;
