import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p className="footer__copyright">
        &copy; 2024 Udyog Mantra | Global Tax Partners Elite Tier
      </p>
      <nav className="footer__links">
        <a href="#privacy-policy" className="footer__link">Privacy Policy</a>
        <a href="#terms-of-service" className="footer__link">Terms of Service</a>
        <a href="#contact-support" className="footer__link">Contact Support</a>
      </nav>
    </footer>
  );
};

export default Footer;