import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AuthSidePanel from "../../../component/AuthSidePanel/AuthSidePanel";
import { verifyEmail } from "../../../api/authApi";
import "./VerifyEmail.css";

const SIDE_PANEL_STATS = [
  { value: "500+", label: "Active Partners" },
  { value: "$2.4B", label: "Managed Assets" },
];

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const runVerification = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus("success");
        setMessage(response.message);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "This verification link is invalid or has expired."
        );
      }
    };

    runVerification();
  }, [token]);

  return (
    <div className="verify-email">
      <AuthSidePanel
        logoText="TaxPartner Portal"
        heading="Empowering Tax Professionals Globally"
        description="Join an elite network of partners. Access institutional-grade tools, seamless client referrals, and automated payout management."
        stats={SIDE_PANEL_STATS}
      />

      <main className="verify-email__main">
        {status === "verifying" && (
          <div className="verify-email__content">
            <span aria-hidden="true">⏳</span>
            <h1 className="verify-email__title">Verifying your email...</h1>
          </div>
        )}

        {status === "success" && (
          <div className="verify-email__content">
            <span aria-hidden="true">✅</span>
            <h1 className="verify-email__title">Email Verified</h1>
            <p className="verify-email__subtitle">{message}</p>
            <Link to="/partner-login" className="verify-email__link">
              Continue to Login →
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="verify-email__content">
            <span aria-hidden="true">⚠️</span>
            <h1 className="verify-email__title">Verification Failed</h1>
            <p className="verify-email__subtitle">{message}</p>
            <Link to="/partner-login" className="verify-email__link">
              ← Back to Login
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default VerifyEmail;
