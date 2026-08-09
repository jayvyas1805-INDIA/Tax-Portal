import "./ComplianceLevelCard.css";

const ComplianceLevelCard = ({ level }) => {
  return (
    <div className="compliance-level-card">
      <span className="compliance-level-card__icon" aria-hidden="true">
        ✓
      </span>
      <p className="compliance-level-card__label">
        COMPLIANCE LEVEL: <span>{level}</span>
      </p>
    </div>
  );
};

export default ComplianceLevelCard;
