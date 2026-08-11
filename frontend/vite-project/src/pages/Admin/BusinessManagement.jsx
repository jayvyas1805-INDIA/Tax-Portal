import { useEffect, useState } from "react";
import "./BusinessManagement.css";
import {
  getBusinessStats,
  getBusinessRegister,
  getClientLifecycle,
} from "../../api/adminBusinessApi";
import "./responsive.css";

const SERVICE_OPTIONS = [
  "Tax Consulting",
  "Audit Services",
  "Compliance Audit",
  "Financial Advisory",
  "Corporate Tax",
  "Tax Prep",
];

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-US")}`;

const formatCompactCurrency = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000) return `₹${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`;
  return `₹${amount.toFixed(0)}`;
};

const formatChange = (percent, note) =>
  `${percent > 0 ? "+" : ""}${percent}% ${note}`;

export default function BusinessManagement() {
  const [service, setService] = useState("");
  const [range, setRange] = useState("30d");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [stats, setStats] = useState(null);
  const [register, setRegister] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [lifecycle, setLifecycle] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadStatsAndLifecycle = async () => {
      try {
        const [statsData, lifecycleData] = await Promise.all([
          getBusinessStats(),
          getClientLifecycle(6),
        ]);
        if (!isMounted) return;
        setStats(statsData);
        setLifecycle(lifecycleData);
      } catch {
        // Non-critical widgets fail silently — the register table is the priority
      }
    };

    loadStatsAndLifecycle();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadRegister = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getBusinessRegister({ service, range, page, limit });
        if (!isMounted) return;
        setRegister(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Failed to load the business register.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRegister();
    return () => {
      isMounted = false;
    };
  }, [service, range, page, limit]);

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPage(p);
  };

  const startIdx = (pagination.page - 1) * limit;

  return (
    <div className="bm">
      <div className="bm__topbar">
        <div>
          <h1>Business Management</h1>
          <p>Monitor and manage converted client registrations across all partners.</p>
        </div>
        <div className="bm__topbar-actions">
          <button type="button" className="bm__btn bm__btn--ghost">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v11" />
              <path d="M7.5 11.5L12 16l4.5-4.5" />
              <path d="M5 19h14" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {stats && (
        <div className="bm__stats">
          <div className="bm-card">
            <p className="bm-card__label">TOTAL VALUE</p>
            <p className="bm-card__value">{formatCompactCurrency(stats.totalValue)}</p>
            <p className={"bm-card__note" + (stats.totalValueChangePercent >= 0 ? " is-up" : "")}>
              {formatChange(stats.totalValueChangePercent, "this month")}
            </p>
          </div>
          <div className="bm-card">
            <p className="bm-card__label">NET REVENUE</p>
            <p className="bm-card__value">{formatCompactCurrency(stats.netRevenue)}</p>
            <p className={"bm-card__note" + (stats.netRevenueChangePercent >= 0 ? " is-up" : "")}>
              {formatChange(stats.netRevenueChangePercent, "vs last month")}
            </p>
          </div>
          <div className="bm-card">
            <p className="bm-card__label">ACTIVE CLIENTS</p>
            <p className="bm-card__value">{stats.activeClients.toLocaleString()}</p>
            <p className="bm-card__note is-up">{stats.newRegistrationsThisMonth} new registrations</p>
          </div>
          <div className="bm-card">
            <p className="bm-card__label">CONVERSION RATE</p>
            <p className="bm-card__value">{stats.conversionRate}%</p>
            <div className="bm-card__progress">
              <div style={{ width: `${stats.conversionRate}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="bm__grid">
        <div className="bm-card bm__register">
          <div className="bm__register-header">
            <h3>Converted Business Register</h3>
            <div className="bm__register-filters">
              <select
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  setPage(1);
                }}
                className="bm__service-select"
              >
                <option value="">All Services</option>
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={range}
                onChange={(e) => {
                  setRange(e.target.value);
                  setPage(1);
                }}
                className="bm__range-select"
              >
                {RANGE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="bm__state">Loading register...</div>
          ) : error ? (
            <div className="bm__state bm__state--error">{error}</div>
          ) : register.length === 0 ? (
            <div className="bm__state">No converted business in this range.</div>
          ) : (
            <div className="bm__table-wrap">
              <table className="bm__table">
                <thead>
                  <tr>
                    <th>BUSINESS ID</th>
                    <th>CLIENT NAME</th>
                    <th>PARTNER NAME</th>
                    <th>SERVICE PURCHASED</th>
                    <th>VALUE</th>
                  </tr>
                </thead>
                <tbody>
                  {register.map((r) => (
                    <tr key={r.id}>
                      <td className="bm__id">{r.businessId}</td>
                      <td>
                        <div className="bm__client-cell">
                          <span className="bm__avatar">{r.initials}</span>
                          <span>{r.clientName}</span>
                        </div>
                      </td>
                      <td>{r.partnerName}</td>
                      <td>{r.service}</td>
                      <td className="bm__value">{formatCurrency(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bm__footer">
            <span>
              Showing {pagination.total === 0 ? 0 : startIdx + 1}-
              {Math.min(startIdx + limit, pagination.total)} of {pagination.total} registrations
            </span>
            <div className="bm__pagination">
              <button type="button" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={p === pagination.page ? "is-active" : ""}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ))}
              <button type="button" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>›</button>
            </div>
          </div>
        </div>

        <div className="bm-card bm__lifecycle">
          <div className="bm-card__row">
            <h3>Client Lifecycle</h3>
          </div>
          {lifecycle.length === 0 ? (
            <p className="bm-card__note">No recent activity yet.</p>
          ) : (
            <ul className="bm__timeline">
              {lifecycle.map((step, index) => (
                <li key={index} className={"bm__timeline-item bm__timeline-item--" + step.status}>
                  <span className="bm__timeline-dot" />
                  <div>
                    <p className="bm__timeline-title">{step.title}</p>
                    <p className="bm__timeline-detail">{step.detail}</p>
                    {step.meta && <p className="bm__timeline-meta">📄 {step.meta}</p>}
                    <p className="bm__timeline-time">{step.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
