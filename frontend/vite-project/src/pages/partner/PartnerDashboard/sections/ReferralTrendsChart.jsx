import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getReferralTrends } from "../../../../api/dashboardApi";
import "./ReferralTrendsChart.css";



const ReferralTrendsChart = ({
  data = [],
  years = [],
  selectedYear,
  setSelectedYear,
}) => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="referral-trends-chart">
      <div className="referral-trends-chart__header">
        <p className="referral-trends-chart__title">
          Monthly Referral Trends
        </p>

        <select
          className="referral-trends-chart_dropdown"
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
      <div className="referral-trends-chart__canvas">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#eef1f6"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#7a8699" }}
              axisLine={{ stroke: "#e6eaf1" }}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              domain={[0, "auto"]}
              tickCount={6}
              tick={{ fontSize: 12, fill: "#7a8699" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Bar
              dataKey="referrals"
              fill="#12305c"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReferralTrendsChart;