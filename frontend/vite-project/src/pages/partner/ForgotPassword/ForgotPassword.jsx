import { useState } from "react";
import { Link } from "react-router-dom";
import AuthSidePanel from "../../../component/AuthSidePanel/AuthSidePanel";
import FormField from "../../../component/FormField/FormField";
import Button from "../../../component/Button/Button";
import { forgotPassword } from "../../../api/authApi";
// import { ROUTE_PATHS } from "../../../routes/routePaths";
import "./ForgotPassword.css";

const SIDE_PANEL_STATS = [
  { value: "500+", label: "Active Partners" },
  { value: "$2.4B", label: "Managed Assets" },
];

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password">
      <AuthSidePanel
        logoText="TaxPartner Portal"
        heading="Empowering Tax Professionals Globally"
        description="Join an elite network of partners. Access institutional-grade tools, seamless client referrals, and automated payout management."
        stats={SIDE_PANEL_STATS}
      />

      <main className="forgot-password__main">
        {isSubmitted ? (
          <div className="forgot-password__confirmation">
            <span aria-hidden="true">✅</span>
            <h1 className="forgot-password__title">Check your email</h1>
            <p className="forgot-password__subtitle">
              If an account exists for <strong>{email}</strong>, we've sent a
              link to reset your password. It expires in 30 minutes.
            </p>
            <Link to="/partner-login" className="forgot-password__back-link">
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form className="forgot-password__form" onSubmit={handleSubmit}>
            <h1 className="forgot-password__title">Forgot Password?</h1>
            <p className="forgot-password__subtitle">
              Enter the email linked to your account and we'll send you a
              link to reset your password.
            </p>

            <FormField
              id="email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            {error && <p className="forgot-password__error">{error}</p>}

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Reset Link →"}
            </Button>

            <Link to="/partner-login" className="forgot-password__back-link">
              ← Back to Login
            </Link>
          </form>
        )}
      </main>
    </div>
  );
};

export default ForgotPassword;
