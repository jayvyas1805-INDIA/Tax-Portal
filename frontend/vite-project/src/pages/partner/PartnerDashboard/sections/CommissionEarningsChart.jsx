import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./CommissionEarningsChart.css";



const CommissionEarningsChart = ({
  data,
  cumulativeTotal,
  years,
  selectedYear,
  setSelectedYear,
}) => {
  return (
    <div className="commission-earnings-chart">
      <div className="commission-earnings-chart__header">
        <p className="commission-earnings-chart__title">Commission Earnings</p>
        <select
          className="commission-earnings-chart_dropdown"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <p className="commission-earnings-chart__total">
        ₹{cumulativeTotal.toLocaleString("en-IN")}
        <span className="commission-earnings-chart__total-label">
          Cumulative for period
        </span>
      </p>

      <div className="commission-earnings-chart__canvas">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f6fed" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2f6fed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#7a8699" }}
              axisLine={{ stroke: "#e6eaf1" }}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value) => [`$${value.toLocaleString()}`, "Earnings"]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e6eaf1",
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#2f6fed"
              strokeWidth={2}
              fill="url(#earningsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CommissionEarningsChart;
