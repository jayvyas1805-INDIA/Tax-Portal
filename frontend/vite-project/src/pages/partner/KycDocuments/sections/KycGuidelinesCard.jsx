import "./KycGuidelinesCard.css";

const GUIDELINES = [
  "Ensure all document text is clearly legible without any glare or blurring.",
  "Documents must be valid and not expired at the time of submission.",
  "File size should be between 100KB and 5MB per document.",
];

const KycGuidelinesCard = () => {
  return (
    <div className="kyc-guidelines-card">
      <p className="kyc-guidelines-card__title">KYC Guidelines</p>

      <ul className="kyc-guidelines-card__list">
        {GUIDELINES.map((guideline) => (
          <li key={guideline} className="kyc-guidelines-card__item">
            <span aria-hidden="true">✅</span>
            {guideline}
          </li>
        ))}
      </ul>

      <div className="kyc-guidelines-card__help">
        <p className="kyc-guidelines-card__help-title">Need Help?</p>
        <p className="kyc-guidelines-card__help-text">
          Contact our support desk at 1800-UDYOG-MANTRA for manual
          verification assistance.
        </p>
      </div>
    </div>
  );
};

export default KycGuidelinesCard;
