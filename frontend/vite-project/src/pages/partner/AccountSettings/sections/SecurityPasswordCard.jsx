import PasswordField from "../../../../component/PasswordField/PasswordField";
import "./SecurityPasswordCard.css";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const SecurityPasswordCard = ({ passwords, onChange, lastPasswordChanged }) => {
  return (
    <div className="security-password-card">
      <div className="security-password-card__header">
        <p className="security-password-card__title">🔒 Security &amp; Password</p>
        <span className="security-password-card__badge">Strong Encryption</span>
      </div>

      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="Current Password"
        value={passwords.currentPassword}
        onChange={onChange}
      />

      <div className="security-password-card__grid">
        <PasswordField
          id="newPassword"
          name="newPassword"
          label="New Password"
          value={passwords.newPassword}
          onChange={onChange}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={passwords.confirmPassword}
          onChange={onChange}
        />
      </div>

      <p className="security-password-card__tip">
        💡 Tip: Use a mix of uppercase, numbers, and special characters for
        maximum professional-grade security.
      </p>

      {lastPasswordChanged && (
        <p className="security-password-card__last-changed">
          Last changed on {formatDate(lastPasswordChanged)}
        </p>
      )}
    </div>
  );
};

export default SecurityPasswordCard;
