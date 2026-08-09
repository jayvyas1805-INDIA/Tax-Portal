import "./Footer.css";

export default function Footer() {
  return (
    <footer className="admin-footer">
      <span>© {new Date().getFullYear()} PartnerPortal Enterprise.</span>
      <span>Security Audited v4.2.0</span>
    </footer>
  );
}
