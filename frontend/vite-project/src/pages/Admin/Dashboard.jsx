import { useEffect, useState } from "react";
import "./Dashboard.css";
import {
  getDashboardStats,
  getRevenueOverview,
  getRevenueChart,
  getConversionFunnel,
  getElitePerformers,
  getReferralStream,
} from "../../api/adminDashboardApi";
import { getSystemConfig } from "../../api/adminSettingsApi";
import "./responsive.css";

const formatCompactCurrency = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`;
  return `₹${amount.toFixed(0)}`;
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatChange = (percent) =>
  `${percent > 0 ? "+" : ""}${percent}%`;

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [revenueChart, setRevenueChart] = useState({ data: [] });
  const [funnel, setFunnel] = useState([]);
  const [elitePerformers, setElitePerformers] = useState([]);
  const [referralStream, setReferralStream] = useState({ data: [], totalReferrals: 0 });
  const [systemConfig, setSystemConfig] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          statsData,
          revenueData,
          revenueChartData,
          funnelData,
          elitePerformersData,
          referralStreamData,
          systemConfigData,
        ] = await Promise.all([
          getDashboardStats(),
          getRevenueOverview(),
          getRevenueChart(new Date().getFullYear()),
          getConversionFunnel(),
          getElitePerformers(4),
          getReferralStream(4),
          getSystemConfig(),
        ]);

        if (!isMounted) return;

        setStats(statsData);
        setRevenue(revenueData);
        setRevenueChart(revenueChartData);
        setFunnel(funnelData);
        setElitePerformers(elitePerformersData);
        setReferralStream(referralStreamData);
        setSystemConfig(systemConfigData);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message || "Failed to load dashboard data."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const quarterlyGoal = Number(
    systemConfig?.quarterlyRevenueGoal || 0
  );

  const revenueGenerated = Number(
    revenue?.revenueGenerated || 0
  );

  const goalProgress =
    quarterlyGoal > 0
      ? Math.min(
        (revenueGenerated / quarterlyGoal) * 100,
        100
      )
      : 0;

  if (loading) {
    return (
      <div className="dash">
        <div className="dash__state">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash">
        <div className="dash__state dash__state--error">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      label: "TOTAL PARTNERS",
      value: stats.totalPartners.toLocaleString(),
      change: formatChange(stats.partnerGrowthPercent),
      note: "Active recruitment campaign live",
      positive: stats.partnerGrowthPercent >= 0,
    },
    {
      label: "ACTIVE PARTNERS",
      value: `${stats.activePartnersPercent}%`,
      change: `${stats.activePartners.toLocaleString()} Active`,
      note: "Last active login within 24 hours",
      positive: true,
    },
    {
      label: "TOTAL REFERRALS",
      value: stats.totalReferrals.toLocaleString(),
      change: formatChange(stats.referralGrowthPercent),
      note: "Accumulated total to date",
      positive: stats.referralGrowthPercent >= 0,
    },
    {
      label: "CONVERTED LEADS",
      value: stats.convertedLeads.toLocaleString(),
      change: `${stats.conversionRate}% Conv.`,
      note: "Direct clients established",
      positive: true,
    },
  ];

  // Build an SVG polyline for the revenue chart out of the monthly totals
  const chartValues = revenueChart.data.map((d) => d.revenue);
  const maxValue = Math.max(...chartValues, 1);
  const chartPoints = chartValues
    .map((value, index) => {
      const x = (index / Math.max(chartValues.length - 1, 1)) * 320;
      const y = 110 - (value / maxValue) * 100;
      return `${x.toFixed(0)},${y.toFixed(0)}`;
    })
    .join(" ");

  return (
    <div className="dash">
      <div className="dash__topbar">
        <div>
          <h1>Global Partner Overview</h1>
          <p>Real-time financial and operational tracking for your tax consultancy partnership network.</p>
        </div>
        <div className="dash__topbar-actions">
          <button type="button" className="dash__range-btn">Last 30 Days</button>
          <button type="button" className="dash__export-btn">Export Report</button>
        </div>
      </div>

      <div className="dash__stats">
        {statCards.map((s) => (
          <div className="dash-card" key={s.label}>
            <div className="dash-card__row">
              <span className="dash-card__label">{s.label}</span>
              <span className={"dash-card__change" + (s.positive ? " is-up" : "")}>{s.change}</span>
            </div>
            <p className="dash-card__value">{s.value}</p>
            <p className="dash-card__note">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="dash__revenue">
        <div className="dash__revenue-main">
          <span className="dash__revenue-icon">$</span>
          <div>
            <p className="dash__revenue-label">REVENUE GENERATED</p>
            <p className="dash__revenue-value">{formatCompactCurrency(revenue.revenueGenerated)}</p>
            <div className="dash__revenue-progress">
              <div
                className="dash__revenue-progress-bar"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <p className="dash__revenue-goal">
              Quarterly Goal Progress{" "}
              <strong>{goalProgress.toFixed(1)}%</strong>
              {" · "}
              Goal: {formatCompactCurrency(quarterlyGoal)}
            </p>
          </div>
        </div>
        <div className="dash__revenue-split">
          <div>
            <p className="dash__revenue-split-label">TOTAL PAYABLE</p>
            <p className="dash__revenue-split-value">{formatCompactCurrency(revenue.totalPayable)}</p>
            <p className="dash__revenue-split-note">Calculated for current cycle</p>
          </div>
          <div>
            <p className="dash__revenue-split-label">PAID</p>
            <p className="dash__revenue-split-value">{formatCompactCurrency(revenue.paid)}</p>
            <div className="dash__revenue-mini-bar">
              <div style={{ width: `${revenue.paidPercent}%` }} />
            </div>
          </div>
          <div>
            <p className="dash__revenue-split-label">PENDING</p>
            <p className="dash__revenue-split-value is-warn">{formatCompactCurrency(revenue.pending)}</p>
            <p className="dash__revenue-split-note">{revenue.pendingApprovalsCount} approvals required</p>
          </div>
        </div>
      </div>
      <div className="dash-card dash__system-card">
        <div className="dash-card__row">
          <h3>System Configuration</h3>
          <span>⚙️</span>
        </div>

        <div className="dash__system-config">
          <div>
            <span>Quarterly Goal </span>
            <strong style={{ color: quarterlyGoal > 0 && goalProgress >= 100 ? "#3b6bf0" : "inherit" }}>
              {formatCompactCurrency(
                systemConfig?.quarterlyRevenueGoal
              )}
            </strong>
          </div>

          <div>
            <span>Payout Day </span>
            <strong style={{color: "#3b6bf0"}}>
              {systemConfig?.payoutScheduleDay
                ? `${systemConfig.payoutScheduleDay}th`
                : "—"}
            </strong>
          </div>

          <div>
            <span>W-9 Auto Verify </span>
            <strong style={{ color: systemConfig?.w9AutoVerify ? "#4caf50" : "#f44336" }}>
              {systemConfig?.w9AutoVerify ? "Enabled" : "Disabled"}
            </strong>
          </div>

          <div>
            <span>1099-NEC </span>
            <strong style={{ color: systemConfig?.nec1099Generation ? "#4caf50" : "#f44336" }}>
              {systemConfig?.nec1099Generation ? "Enabled" : "Disabled"}
            </strong>
          </div>
        </div>
      </div>

      <div className="dash__grid-2">
        <div className="dash-card dash__chart-card">
          <div className="dash-card__row">
            <h3>Monthly Revenue Dynamics</h3>
            <div className="dash__legend">
              <span><i className="dot dot--actual" /> Actual</span>
            </div>
          </div>
          <div className="dash__chart-placeholder" aria-hidden="true">
            <svg viewBox="0 0 320 120" preserveAspectRatio="none">
              <polyline
                points={chartPoints}
                fill="none"
                stroke="#3b6bf0"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>

        <div className="dash-card">
          <h3>Lead Conversion Funnel</h3>
          <div className="dash__funnel">
            {funnel.map((f) => (
              <div className="dash__funnel-row" key={f.label}>
                <div className="dash__funnel-bar" style={{ width: `${f.pct}%` }} />
                <span className="dash__funnel-label">
                  {f.value.toLocaleString()} ({f.label})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash__grid-2">
        <div className="dash-card">
          <div className="dash-card__row">
            <h3>Elite Performers</h3>
            <button type="button" className="dash__link-btn">View All</button>
          </div>
          {elitePerformers.length === 0 ? (
            <p className="dash-card__note">No commission data yet.</p>
          ) : (
            <ul className="dash__performer-list">
              {elitePerformers.map((p) => (
                <li key={p.partnerId}>
                  <span className="dash__avatar">{p.initials || getInitials(p.name)}</span>
                  <span className="dash__performer-name">{p.name}</span>
                  <span className="dash__performer-value">{formatCompactCurrency(p.totalEarnings)}</span>
                  <span className="dash__performer-change">{formatChange(p.changePercent)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card__row">
            <h3>Live Referral Stream</h3>
            <span className="dash__live-tag">● {referralStream.data.length} recent</span>
          </div>
          {referralStream.data.length === 0 ? (
            <p className="dash-card__note">No referrals yet.</p>
          ) : (
            <table className="dash__stream-table">
              <thead>
                <tr>
                  <th>Lead Name</th>
                  <th>Source Partner</th>
                  <th>Service Type</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {referralStream.data.map((r) => (
                  <tr key={r.id}>
                    <td>{r.clientName}</td>
                    <td>{r.partnerName}</td>
                    <td>{r.service}</td>
                    <td>{formatCurrency(r.value)}</td>
                    <td>
                      <span className={"status-pill status-pill--" + r.status.replace(/\s+/g, "-").toLowerCase()}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="dash__stream-footer">
            Showing {referralStream.data.length} of {referralStream.totalReferrals.toLocaleString()} total referrals
          </p>
        </div>
      </div>
    </div>
  );
}
