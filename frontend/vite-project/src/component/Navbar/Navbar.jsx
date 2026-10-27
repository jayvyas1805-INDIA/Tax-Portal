import "./Navbar.css";
import {useNavigate} from "react-router-dom";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <span className="navbar__logo"><img src={logo} alt="Udyog Mantra" className="navbar__logo-img" /></span>
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