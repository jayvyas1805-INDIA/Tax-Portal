import "./LoggedInNavbar.css";

const LoggedInNavbar = () => {
  return (
    <header className="logged-in-navbar">
      <span className="logged-in-navbar__logo">🛡️ TaxPartner Portal</span>
      <nav className="logged-in-navbar__links">
        <a href="#network" className="logged-in-navbar__link">Network</a>
        <a href="#resources" className="logged-in-navbar__link">Resources</a>
      </nav>
      <div className="logged-in-navbar__actions">
        <a href="#support" className="logged-in-navbar__support">Support</a>
        <button type="button" className="logged-in-navbar__refer-btn">
          Refer Client
        </button>
        <button
          type="button"
          className="logged-in-navbar__icon-btn"
          aria-label="Notifications"
        >
          🔔
        </button>
        <button
          type="button"
          className="logged-in-navbar__avatar"
          aria-label="Account"
        >
          👤
        </button>
      </div>
    </header>
  );
};

export default LoggedInNavbar;
