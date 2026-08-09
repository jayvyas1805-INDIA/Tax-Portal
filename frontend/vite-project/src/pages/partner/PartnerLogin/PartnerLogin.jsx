import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthSidePanel from "../../../component/AuthSidePanel/AuthSidePanel";
import FormField from "../../../component/FormField/FormField";
import PasswordField from "../../../component/PasswordField/PasswordField";
import Button from "../../../component/Button/Button";
import { login } from "../../../api/authApi";
import "./PartnerLogin.css";

const SIDE_PANEL_STATS = [
  { value: "500+", label: "Active Partners" },
  { value: "$2.4B", label: "Managed Assets" },
];

const PartnerLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    emailOrMobile: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    try {
      // Note: backend currently matches by email only — mobile-number
      // login isn't supported yet on the API side.
      const response = await login(credentials.emailOrMobile, credentials.password);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("authToken", response.token);
      storage.setItem("refreshToken", response.refreshToken);
      storage.setItem("authUser", JSON.stringify(response.user));

      navigate(response.redirectTo);
    } catch (error) {
      setLoginError(
        error.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="partner-login">
      <AuthSidePanel
        logoText="TaxPartner Portal"
        heading="Empowering Tax Professionals Globally"
        description="Join an elite network of partners. Access institutional-grade tools, seamless client referrals, and automated payout management."
        stats={SIDE_PANEL_STATS}
      />

      <main className="partner-login__main">
        <form className="partner-login__form" onSubmit={handleSubmit}>
          <h1 className="partner-login__title">Welcome Back</h1>
          <p className="partner-login__subtitle">
            Access your partner dashboard to manage referrals and payouts.
          </p>

          <FormField
            id="emailOrMobile"
            name="emailOrMobile"
            label="Email or Mobile Number"
            placeholder="name@company.com"
            value={credentials.emailOrMobile}
            onChange={handleChange}
            required
          />

          <div className="partner-login__password-row">
            <PasswordField
              id="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
            />
            <Link to={"/forgot-password"} className="partner-login__forgot-link">
              Forgot Password?
            </Link>
          </div>

          <label className="partner-login__remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember Me on this device
          </label>

          {loginError && <p className="partner-login__error">{loginError}</p>}

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login →"}
          </Button>

          <div className="partner-login__divider">
            <span>New to the platform?</span>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/partner-registration")}
          >
            Register as Partner
          </Button>

          <p className="partner-login__footer-note">
            Secured with 256-bit encryption. Need help?{" "}
            <a href="#contact-support">Contact Support</a>
          </p>
        </form>
      </main>
    </div>
  );
};

export default PartnerLogin;
