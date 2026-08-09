import Checkbox from "../../../../component/Checkbox/Checkbox";
import Button from "../../../../component/Button/Button";
import "./FinalAcceptanceStep.css";

const FinalAcceptanceStep = ({
  agreedToTermsConditions,
  agreedToPrivacyPolicy,
  onAgreementChange,
  onNext,
  onPrevious,
  isSubmitting,
  submitError,
}) => {
  const canRegister = agreedToTermsConditions && agreedToPrivacyPolicy && !isSubmitting;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canRegister) {
      onNext();
    }
  };

  return (
    <form className="final-acceptance-step" onSubmit={handleSubmit}>
      <h3 className="final-acceptance-step__title">Final Acceptance</h3>
      <p className="final-acceptance-step__subtitle">
        Please confirm you agree to our policies to complete your partner
        registration.
      </p>

      <div className="final-acceptance-step__agreements">
        <Checkbox
          id="agreeTermsConditions"
          name="agreeTermsConditions"
          checked={agreedToTermsConditions}
          onChange={onAgreementChange}
        >
          I agree to the <a href="#terms-conditions">Terms &amp; Conditions</a>
        </Checkbox>
        <Checkbox
          id="agreePrivacyPolicy"
          name="agreePrivacyPolicy"
          checked={agreedToPrivacyPolicy}
          onChange={onAgreementChange}
        >
          I agree to the <a href="#privacy-policy">Privacy Policy</a>
        </Checkbox>
      </div>

      {submitError && (
        <p className="final-acceptance-step__error">{submitError}</p>
      )}

      <div className="final-acceptance-step__actions">
        <Button variant="secondary" onClick={onPrevious} disabled={isSubmitting}>
          ← Previous
        </Button>
        <Button type="submit" variant="primary" disabled={!canRegister}>
          {isSubmitting ? "Submitting..." : "Register as Partner →"}
        </Button>
      </div>

      <p className="final-acceptance-step__login">
        Already have an account? <a href="/partner/login">Login</a>
      </p>
    </form>
  );
};

export default FinalAcceptanceStep;
