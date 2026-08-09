import { useEffect, useState } from "react";
import "./ReportsAnalytics.css";
import {
  getAnalyticsOverview,
  getReferralTrend,
  getReferralSource,
  getConversionFunnel,
  getTopPartnersByRevenue,
} from "../../api/adminAnalyticsApi";
import { downloadFile } from "../../utils/downloadFile";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
];

const formatCompactCurrency = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000) return `₹${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`;
  return `₹${amount.toFixed(0)}`;
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-US")}`;

export default function ReportsAnalytics() {
  const [range, setRange] = useState("30d");
  const [exporting, setExporting] = useState(false);

  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState({ labels: [], current: [], previous: [] });
  const [source, setSource] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [topPartners, setTopPartners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      try {
        setLoading(true);
        setError("");

        const [overviewData, trendData, sourceData, funnelData, topPartnersData] = await Promise.all([
          getAnalyticsOverview(),
          getReferralTrend(8),
          getReferralSource(),
          getConversionFunnel(),
          getTopPartnersByRevenue(4),
        ]);

        if (!isMounted) return;
        setOverview(overviewData);
        setTrend(trendData);
        setSource(sourceData);
        setFunnel(funnelData);
        setTopPartners(topPartnersData);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Failed to load the analytics report.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAll();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      await downloadFile("/admin/analytics/export", { range }, `reports-analytics-${range}.csv`);
    } catch {
      // silent failure — button just re-enables
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="ra">
        <div className="ra__state">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ra">
        <div className="ra__state ra__state--error">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Referrals",
      value: overview.totalReferrals.toLocaleString(),
      change: overview.referralGrowthPercent,
      note: "vs last month",
    },
    {
      label: "Active Partners",
      value: overview.activePartners.toLocaleString(),
      change: overview.partnerGrowthPercent,
      note: "new registrations",
    },
    {
      label: "Conversion Rate",
      value: `${overview.conversionRate}%`,
      change: overview.conversionRateChangePercent,
      note: "vs last month",
    },
    {
      label: "Total Revenue (USD)",
      value: formatCompactCurrency(overview.totalRevenue),
      change: overview.revenueGrowthPercent,
      note: "growth",
      accent: true,
    },
  ];

  // Build SVG polylines for the trend chart
  const maxTrendValue = Math.max(...trend.current, ...trend.previous, 1);
  const toPoints = (values) =>
    values
      .map((v, i) => {
        const x = (i / Math.max(values.length - 1, 1)) * 400;
        const y = 120 - (v / maxTrendValue) * 100;
        return `${x.toFixed(0)},${y.toFixed(0)}`;
      })
      .join(" ");

  // Build donut segment offsets from the running total of preceding percentages
  let runningOffset = 25;
  const donutSegments = source.map((s) => {
    const segment = { ...s, offset: runningOffset };
    runningOffset -= s.pct;
    return segment;
  });

  return (
    <div className="ra">
      <div className="ra__topbar">
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p>Real-time performance metrics and partner insights.</p>
        </div>
        <div className="ra__topbar-actions">
          <select
            className="ra__btn ra__btn--ghost"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            {RANGE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button type="button" className="ra__btn ra__btn--primary" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      <div className="ra__stats">
        {statCards.map((s) => (
          <div className="ra-card" key={s.label}>
            <p className="ra-card__label">{s.label}</p>
            <p className={"ra-card__value" + (s.accent ? " is-accent" : "")}>{s.value}</p>
            <p className={"ra-card__note" + (s.change >= 0 ? " is-up" : " is-down")}>
              {s.change > 0 ? "+" : ""}{s.change}% {s.note}
            </p>
          </div>
        ))}
      </div>

      <div className="ra__grid">
        <div className="ra-card ra__trend">
          <div className="ra-card__row">
            <h3>Referral Trend Analysis</h3>
            <div className="ra__legend">
              <span><i className="dot dot--current" /> Current</span>
              <span><i className="dot dot--previous" /> Previous</span>
            </div>
          </div>
          <div className="ra__chart">
            <svg viewBox="0 0 400 130" preserveAspectRatio="none">
              <polyline points={toPoints(trend.current)} fill="none" stroke="#3b6bf0" strokeWidth="2.5" />
              <polyline
                points={toPoints(trend.previous)}
                fill="none"
                stroke="#c7d0e6"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
            </svg>
          </div>
          <div className="ra__chart-axis">
            {trend.labels.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        </div>

        <div className="ra-card">
          <h3>Referrals by Service Type</h3>
          <div className="ra__donut-wrap">
            <svg viewBox="0 0 42 42" className="ra__donut">
              <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#eceef4" strokeWidth="6" />
              {donutSegments.map((seg) => (
                <circle
                  key={seg.label}
                  cx="21" cy="21" r="15.9" fill="transparent"
                  stroke={seg.color} strokeWidth="6"
                  strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                  strokeDashoffset={seg.offset}
                />
              ))}
            </svg>
            <span className="ra__donut-label">100%</span>
          </div>
          <ul className="ra__legend-list">
            {source.map((s) => (
              <li key={s.label}>
                <span className="ra__dot" style={{ background: s.color }} />
                {s.label}
                <span className="ra__legend-pct">{s.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ra__grid">
        <div className="ra-card">
          <h3>Conversion Funnel</h3>
          <div className="ra__funnel">
            {funnel.map((f) => (
              <div className="ra__funnel-row" key={f.label}>
                <span>{f.label}</span>
                <strong>{f.value.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="ra-card">
          <h3>Revenue by Top Partners</h3>
          <p className="ra-card__note">Ranked by total converted business value</p>
          <ul className="ra__partner-list">
            {topPartners.length === 0 ? (
              <li className="ra-card__note">No commission data yet.</li>
            ) : (
              topPartners.map((p) => (
                <li key={p.partnerId}>
                  <div className="ra__partner-row">
                    <span>{p.name}</span>
                    <strong>{formatCurrency(p.value)}</strong>
                  </div>
                  <div className="ra__partner-bar">
                    <div style={{ width: `${p.pct}%` }} />
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
