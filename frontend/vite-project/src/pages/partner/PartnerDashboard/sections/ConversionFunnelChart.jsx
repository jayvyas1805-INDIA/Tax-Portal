import "./ConversionFunnelChart.css";

const ConversionFunnelChart = ({ totalReferrals = 0, proposalShared = 0, converted = 0 }) => {
  const DATA = [
    { name: "Leads", value: totalReferrals, color: "#12305c" },
    { name: "Converted", value: converted, color: "#7fd8a0" },
    { name: "Proposed", value: proposalShared, color: "#2f6fed" },
  ];

  const maxValue = DATA[0].value || 1; // avoid divide-by-zero when totalReferrals is 0

  return (
    <div className="conversion-funnel-chart">
      <p className="conversion-funnel-chart__title">Conversion Funnel</p>
      <div className="conversion-funnel-chart__bars">
        {DATA.map((stage) => (
          <div key={stage.name} className="conversion-funnel-chart__row">
            <div
              className="conversion-funnel-chart__bar"
              style={{
                width: `${(stage.value / maxValue) * 100}%`,
                backgroundColor: stage.color,
              }}
            >
              {stage.value}
            </div>
            <span className="conversion-funnel-chart__label">{stage.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionFunnelChart;