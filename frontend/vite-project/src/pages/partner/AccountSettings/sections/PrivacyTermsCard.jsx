import "./PrivacyTermsCard.css";

const LINKS = [
  { label: "Privacy Policy", href: "#privacy-policy" },
  { label: "Terms of Service", href: "#terms-of-service" },
  { label: "Partner Agreement", href: "#partner-agreement" },
];

const PrivacyTermsCard = ({ memberSince }) => {
  return (
    <div className="privacy-terms-card">
      <p className="privacy-terms-card__title">📄 Privacy &amp; Terms</p>

      <ul className="privacy-terms-card__list">
        {LINKS.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="privacy-terms-card__link">
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
