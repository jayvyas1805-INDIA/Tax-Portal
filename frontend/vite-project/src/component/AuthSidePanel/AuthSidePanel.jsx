import "./AuthSidePanel.css";
import logo from "../../assets/logo.png";

const AuthSidePanel = ({ logoText, heading, description, stats }) => {
  return (
    <aside className="auth-side-panel">
      <p className="auth-side-panel__logo"><img src={logo} alt={logoText} className="auth-side-panel__logo-img" /></p>

      <div className="auth-side-panel__content">
        <h2 className="auth-side-panel__heading">{heading}</h2>
        <p className="auth-side-panel__description">{description}</p>

        <div className="auth-side-panel__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="auth-side-panel__stat">
              <p className="auth-side-panel__stat-value">{stat.value}</p>
              <p className="auth-side-panel__stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-side-panel__footer">
        <span>&copy; 2024 Udyog Mantra</span>
        <div className="auth-side-panel__footer-links">
          <a href="#privacy-policy">Privacy Policy</a>
          <a href="/Udyog_Mantra_DSA_Application_and_Terms.pdf" target="_blank" rel="noopener noreferrer">Terms of Service</a>
        </div>
      </div>
    </aside>
  );
};

export default AuthSidePanel;
