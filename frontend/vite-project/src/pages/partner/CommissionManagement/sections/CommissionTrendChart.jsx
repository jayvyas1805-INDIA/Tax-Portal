import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./CommissionTrendChart.css";

const CommissionTrendChart = ({ data, range, onRangeChange }) => {
  return (
    <div className="commission-trend-chart">
      <div className="commission-trend-chart__header">
        <p className="commission-trend-chart__title">Commission Trend</p>
        <div className="commission-trend-chart__toggle">
          <button
            type="button"
            className={`commission-trend-chart__toggle-btn${
              range === "6m" ? " commission-trend-chart__toggle-btn--active" : ""
            }`}
            onClick={() => onRangeChange("6m")}
          >
            6 Months
          </button>
          <button
            type="button"
            className={`commission-trend-chart__toggle-btn${
              range === "1y" ? " commission-trend-chart__toggle-btn--active" : ""
            }`}
            onClick={() => onRangeChange("1y")}
          >
            1 Year
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#7a8699" }}
            axisLine={{ stroke: "#e6eaf1" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#7a8699" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`₹${value.toLocaleString()}`, "Commission"]}
            contentStyle={{ borderRadius: 8, border: "1px solid #e6eaf1", fontSize: 13 }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#2f6fed"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#2f6fed" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommissionTrendChart;
