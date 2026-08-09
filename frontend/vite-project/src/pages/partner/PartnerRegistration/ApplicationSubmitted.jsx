import Button from "../../../component/Button/Button";
import "./ApplicationSubmitted.css";
import { useNavigate } from "react-router-dom";

const NEXT_STEPS = [
  {
    id: 1,
    title: "Initial Review",
    description: "Our compliance team is verifying your submitted documents.",
    meta: "Estimated 2-4 hours",
    status: "active",
  },
  {
    id: 2,
    title: "Identity Validation",
    description: "Third-party verification for professional credentials and licenses.",
    status: "pending",
  },
  {
    id: 3,
    title: "Account Provisioning",
    description: "Final setup of your secure vault and professional dashboard.",
    status: "pending",
  },
];

const ApplicationSubmitted = ({ referenceNumber, email }) => {
  const navigate = useNavigate();
  return (
    <div className="application-submitted">
      <span className="application-submitted__icon" aria-hidden="true">
        ✅
      </span>
      <h2 className="application-submitted__title">Application Submitted</h2>
      <p className="application-submitted__reference">
        Reference ID: {referenceNumber}
      </p>

      <div className="application-submitted__card">
        <p className="application-submitted__card-title">Next Steps</p>
        <ul className="application-submitted__steps">
          {NEXT_STEPS.map((step) => (
            <li key={step.id} className="application-submitted__step">
              <span
                className={`application-submitted__step-icon application-submitted__step-icon--${step.status}`}
                aria-hidden="true"
              >
                {step.status === "active" ? "●" : "○"}
              </span>
              <div>
                <p className="application-submitted__step-title">
                  {step.title}
                </p>
                <p className="application-submitted__step-description">
                  {step.description}
                  {step.meta ? ` (${step.meta})` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="application-submitted__actions">
        <Button variant="primary" onClick={() => navigate("/partner-dashboard")}>
          Go to Dashboard
        </Button>
        <Button variant="secondary">⬇ Download Summary</Button>
      </div>

      <p className="application-submitted__note">
        You will receive a confirmation email at{" "}
        <strong>{email}</strong> once your credentials have been
        approved. For urgent assistance, contact our{" "}
        <a href="#compliance-desk">Compliance Desk</a>.
      </p>
    </div>
  );
};

export default ApplicationSubmitted;
