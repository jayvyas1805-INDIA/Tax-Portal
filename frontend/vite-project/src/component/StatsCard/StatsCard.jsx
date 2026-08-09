import "./StatsCard.css";

const StatsCard = ({ title, value, color }) => {
  return (
    <div className="stats-card">
      <small>{title}</small>

      <h2 style={{color}}>
        {value}
      </h2>
    </div>
  );
};

export default StatsCard;