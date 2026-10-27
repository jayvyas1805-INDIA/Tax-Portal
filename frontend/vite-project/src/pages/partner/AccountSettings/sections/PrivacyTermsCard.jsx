import "./PrivacyTermsCard.css";

const LINKS = [
  { label: "Privacy Policy", href: "#privacy-policy" },
  { label: "Terms of Service", href: "#terms-of-service" },
  { label: "Direct Sales Agent Agreement", href: "/Udyog_Mantra_DSA_Application_and_Terms.pdf" },
  { label: "DSA Application & Terms (PDF)", href: "/Udyog_Mantra_DSA_Application_and_Terms.pdf" },
];

const PrivacyTermsCard = ({ memberSince }) => {
  return (
    <div className="privacy-terms-card">
      <p className="privacy-terms-card__title">📄 Privacy &amp; Terms</p>

      <ul className="privacy-terms-card__list">
        {LINKS.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="privacy-terms-card__link" {...(link.href.endsWith(".pdf") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {link.label}
              <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="privacy-terms-card__banner">
        <p>Member Since {memberSince}</p>
      </div>
    </div>
  );
};

export default PrivacyTermsCard;
