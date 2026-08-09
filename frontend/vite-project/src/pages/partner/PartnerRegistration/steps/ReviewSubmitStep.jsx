import SummaryCard from "../../../../component/SummaryCard/SummaryCard";
import Checkbox from "../../../../component/Checkbox/Checkbox";
import Button from "../../../../component/Button/Button";
import "./ReviewSubmitStep.css";

const ReviewSubmitStep = ({
  formData,
  agreedToTerms,
  onAgreeChange,
  onEditStep,
  onNext,
  onPrevious,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (agreedToTerms) {
      onNext();
    }
  };

  const documents = [
    { label: formData.panCardFile?.name || "PAN_Card.pdf", key: "panCardFile" },
    {
      label: formData.aadhaarCardFile?.name || "Aadhaar_Front_Back.pdf",
      key: "aadhaarCardFile",
    },
    {
      label: formData.passportPhotoFile?.name || "Profile_Photo.jpg",
      key: "passportPhotoFile",
    },
  ];

  return (
    <form className="review-step" onSubmit={handleSubmit}>
      <h3 className="review-step__title">Application Review</h3>

      <div className="review-step__grid">
        <SummaryCard title="Personal Info" onEdit={() => onEditStep(1)}>
          <p className="summary-card__row">
            <span className="summary-card__row-label">Full Name</span>
            {formData.fullName || "—"}
          </p>
          <p className="summary-card__row">
            <span className="summary-card__row-label">Mobile</span>
            {formData.mobileNumber || "—"}
          </p>
          <p className="summary-card__row">
            <span className="summary-card__row-label">Email</span>
            {formData.emailAddress || "—"}
          </p>
          <p className="summary-card__row">
            <span className="summary-card__row-label">Date of Birth</span>
            {formData.dateOfBirth || "—"}
          </p>
        </SummaryCard>

        <SummaryCard title="Professional Info" onEdit={() => onEditStep(2)}>
          <p className="summary-card__row">
            <span className="summary-card__row-label">Occupation</span>
            {formData.occupation || "—"}
          </p>
          <p className="summary-card__row">
            <span className="summary-card__row-label">Company</span>
            {formData.companyName || "—"}
          </p>
          <p className="summary-card__row">
            <span className="summary-card__row-label">Experience</span>
            {formData.experienceYears ? `${formData.experienceYears} Years` : "—"}
          </p>
        </SummaryCard>
      </div>

      <SummaryCard title="Address Info" onEdit={() => onEditStep(3)}>
        <p className="summary-card__row">
          {formData.addressLine1}
          {formData.addressLine2 ? `, ${formData.addressLine2}` : ""}
          {formData.city ? `, ${formData.city}` : ""}
          {formData.state ? `, ${formData.state}` : ""}
          {formData.pincode ? ` ${formData.pincode}` : ""}
        </p>
      </SummaryCard>

      <div className="review-step__grid">
        <SummaryCard title="KYC Documents" onEdit={() => onEditStep(4)}>
          {documents.map((doc) => (
            <div key={doc.key} className="summary-card__doc-link">
              <span>📄 {doc.label}</span>
              <span className="summary-card__doc-view">View</span>
            </div>
          ))}
        </SummaryCard>

        <SummaryCard title="Banking Details" onEdit={() => onEditStep(5)}>
          <p className="summary-card__row">
            <span className="summary-card__row-label">Account Holder</span>
            {formData.accountHolderName || "—"}
          </p>
          <p className="summary-card__row">
            <span className="summary-card__row-label">Bank Name</span>
            {formData.bankName || "—"}
          </p>
          <p className="summary-card__row">
            <span className="summary-card__row-label">Account No.</span>
            {formData.accountNumber
              ? `**** ${formData.accountNumber.slice(-4)}`
              : "—"}
          </p>
          <p className="summary-card__row">
            <span className="summary-card__row-label">IFSC Code</span>
            {formData.ifscCode || "—"}
          </p>
        </SummaryCard>
      </div>

      <Checkbox
        id="agreeTerms"
        name="agreeTerms"
        checked={agreedToTerms}
        onChange={onAgreeChange}
      >
        I agree to the <a href="#terms">Partner Terms of Service</a> and
        verify that all provided information is accurate and legally
        binding.
      </Checkbox>

      <div className="review-step__actions">
        <Button variant="secondary" onClick={onPrevious}>
          ← Previous
        </Button>
        <Button type="submit" variant="primary" disabled={!agreedToTerms}>
          Submit Application →
        </Button>
      </div>
    </form>
  );
};

export default ReviewSubmitStep;
