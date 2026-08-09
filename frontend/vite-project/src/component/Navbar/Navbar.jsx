import "./Navbar.css";
import {useNavigate} from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <span className="navbar__logo">🛡️ TaxPartner Portal</span>
      <nav className="navbar__links">
        <a href="#how-it-works" className="navbar__link">How it works</a>
        <a href="#benefits" className="navbar__link">Benefits</a>
      </nav>
      <button className="navbar__login-btn" type="button" onClick={() => navigate("/partner-login")}>
        Login
      </button>
    </header>
  );
};

export default Navbar;