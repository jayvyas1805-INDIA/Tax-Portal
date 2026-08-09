import "./AuthSidePanel.css";

const AuthSidePanel = ({ logoText, heading, description, stats }) => {
  return (
    <aside className="auth-side-panel">
      <p className="auth-side-panel__logo">🏛️ {logoText}</p>

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
        <span>&copy; 2024 Global Tax Partners</span>
        <div className="auth-side-panel__footer-links">
          <a href="#privacy-policy">Privacy Policy</a>
          <a href="#terms-of-service">Terms of Service</a>
        </div>
      </div>
    </aside>
  );
};

export default AuthSidePanel;
