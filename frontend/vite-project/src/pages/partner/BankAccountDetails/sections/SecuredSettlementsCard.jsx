import "./SecuredSettlementsCard.css";

const SETTLEMENT_POINTS = [
  "256-bit SSL Encryption",
  "PCI-DSS Compliant Storage",
  "Instant Settlement Alerts",
];

const SecuredSettlementsCard = () => {
  return (
    <div className="secured-settlements-card">
      <p className="secured-settlements-card__title">Secured Settlements</p>
      <p className="secured-settlements-card__description">
        We use industry-standard bank-grade encryption to protect your
        financial data. Settlements are processed via automated NEFT/RTGS
        gateways twice a month.
      </p>
      <ul className="secured-settlements-card__list">
        {SETTLEMENT_POINTS.map((point) => (
          <li key={point} className="secured-settlements-card__item">
            <span aria-hidden="true">✓</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SecuredSettlementsCard;
