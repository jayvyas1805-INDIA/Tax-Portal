import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AuthSidePanel from "../../../component/AuthSidePanel/AuthSidePanel";
import PasswordField from "../../../component/PasswordField/PasswordField";
import Button from "../../../component/Button/Button";
import { resetPassword } from "../../../api/authApi";
// import { ROUTE_PATHS } from "../../../routes/routePaths";
import "./ResetPassword.css";

const SIDE_PANEL_STATS = [
  { value: "500+", label: "Active Partners" },
  { value: "$2.4B", label: "Managed Assets" },
];

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPasswords((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, passwords.newPassword, passwords.confirmPassword);
      setIsSuccess(true);
      setTimeout(() => navigate("/partner-login"), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "This reset link is invalid or has expired. Please request a new one."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password">
      <AuthSidePanel
        logoText="TaxPartner Portal"
        heading="Empowering Tax Professionals Globally"
        description="Join an elite network of partners. Access institutional-grade tools, seamless client referrals, and automated payout management."
        stats={SIDE_PANEL_STATS}
      />

      <main className="reset-password__main">
        {isSuccess ? (
          <div className="reset-password__confirmation">
            <span aria-hidden="true">✅</span>
            <h1 className="reset-password__title">Password Reset</h1>
            <p className="reset-password__subtitle">
              Your password has been updated. Redirecting you to login...
            </p>
          </div>
        ) : (
          <form className="reset-password__form" onSubmit={handleSubmit}>
            <h1 className="reset-password__title">Set a New Password</h1>
            <p className="reset-password__subtitle">
              Choose a new password for your account.
            </p>

            <PasswordField
              id="newPassword"
              name="newPassword"
              label="New Password"
              placeholder="At least 8 characters"
              value={passwords.newPassword}
              onChange={handleChange}
            />
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              value={passwords.confirmPassword}
              onChange={handleChange}
            />

            {error && <p className="reset-password__error">{error}</p>}

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password →"}
            </Button>

            <Link to="/partner-login" className="reset-password__back-link">
              ← Back to Login
            </Link>
          </form>
        )}
      </main>
    </div>
  );
};

export default ResetPassword;
