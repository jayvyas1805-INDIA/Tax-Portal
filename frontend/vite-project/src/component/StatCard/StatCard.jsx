import "./StatCard.css";

const StatCard = ({ label, value, meta, metaTone = "neutral" }) => {
  return (
    <div className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {meta && (
        <p className={`stat-card__meta stat-card__meta--${metaTone}`}>{meta}</p>
      )}
    </div>
  );
};

export default StatCard;
