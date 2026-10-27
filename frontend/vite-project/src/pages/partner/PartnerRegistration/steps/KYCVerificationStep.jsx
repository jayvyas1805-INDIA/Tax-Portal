import FormField from "../../../../component/FormField/FormField";
import FileUploadField from "../../../../component/FileUploadField/FileUploadField";
import Button from "../../../../component/Button/Button";
import { useState } from "react";
import "./KYCVerificationStep.css";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_REGEX = /^[0-9]{12}$/;

const KYCVerificationStep = ({
  formData,
  onFieldChange,
  onFileChange,
  onNext,
  onPrevious,
}) => {
  const [errors, setErrors] = useState({ panNumber: "", aadhaarNumber: "" });

  const validatePan = (value) => {
    if (!value) return "PAN number is required.";
    if (value.length !== 10) return "PAN number must be exactly 10 characters.";
    if (!PAN_REGEX.test(value)) return "Enter a valid PAN (e.g. ABCDE1234F).";
    return "";
  };

  const validateAadhaar = (value) => {
    if (!value) return "Aadhaar number is required.";
    if (value.length !== 12) return "Aadhaar number must be exactly 12 digits.";
    if (!AADHAAR_REGEX.test(value)) return "Aadhaar number must contain digits only.";
    return "";
  };

  const handleChange = (event) => {
    const { name } = event.target;
    let value = event.target.value;

    if (name === "panNumber") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
      setErrors((previous) => ({ ...previous, panNumber: validatePan(value) }));
    } else if (name === "aadhaarNumber") {
      value = value.replace(/\D/g, "").slice(0, 12);
      setErrors((previous) => ({ ...previous, aadhaarNumber: validateAadhaar(value) }));
    }

    onFieldChange(name, value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {
      panNumber: validatePan(formData.panNumber || ""),
      aadhaarNumber: validateAadhaar(formData.aadhaarNumber || ""),
    };
    setErrors(nextErrors);
    if (nextErrors.panNumber || nextErrors.aadhaarNumber) return;
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
          maxLength={10}
          error={errors.panNumber}
          required
        />
        <FormField
          id="aadhaarNumber"
          name="aadhaarNumber"
          label="Aadhaar Number"
          placeholder="000000000000"
          value={formData.aadhaarNumber}
          onChange={handleChange}
          maxLength={12}
          inputMode="numeric"
          error={errors.aadhaarNumber}
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
