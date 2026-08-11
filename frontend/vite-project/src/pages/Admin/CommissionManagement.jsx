import { useEffect, useState } from "react";
import "./CommissionManagement.css";
import {
  getCommissionStats,
  getCommissions,
  getPayoutVelocity,
  updateCommissionStatus,
} from "../../api/adminCommissionApi";
import "./responsive.css";

const STATUS_CLASS = {
  Pending: "cm-pill--pending",
  Paid: "cm-pill--approved",
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatChange = (percent) => `${percent > 0 ? "+" : ""}${percent}% v.s LW`;

export default function CommissionManagement() {
  const [tab, setTab] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [stats, setStats] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [velocity, setVelocity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadStatsAndVelocity = async () => {
      try {
        const [statsData, velocityData] = await Promise.all([
          getCommissionStats(),
          getPayoutVelocity(7),
        ]);
        if (!isMounted) return;
        setStats(statsData);
        setVelocity(velocityData);
      } catch {
        // Non-critical widgets fail silently — the table below is the priority
      }
    };

    loadStatsAndVelocity();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCommissions = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getCommissions({ tab, page, limit });
        if (!isMounted) return;
        setCommissions(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Failed to load commissions.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCommissions();
    return () => {
      isMounted = false;
    };
  }, [tab, page, limit]);

  const changeTab = (t) => {
    setTab(t);
    setPage(1);
  };

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPage(p);
  };

  const markAsPaid = async (commission) => {
    try {
      setUpdatingId(commission.id);
      const updated = await updateCommissionStatus(commission.id, "Paid");
      setCommissions((prev) => prev.map((c) => (c.id === commission.id ? updated : c)));
    } catch {
      // leave row as-is on failure
    } finally {
      setUpdatingId(null);
    }
  };

  const maxVelocityValue = Math.max(...velocity.flatMap((d) => [d.pending, d.paid]), 1);
  const scaleHeight = (value) => Math.max(2, Math.round((value / maxVelocityValue) * 100));

  const startIdx = (pagination.page - 1) * limit;

  return (
    <div className="cm">
      <div className="cm__topbar">
        <div>
          <h1>Commission Management</h1>
          <p>Configure rules and process partner payouts with enterprise precision.</p>
        </div>
        <div className="cm__topbar-actions">
          <button type="button" className="cm__btn cm__btn--ghost">Export Report</button>
        </div>
      </div>

      {stats && (
        <div className="cm__stats">
          <div className="cm-card">
            <p className="cm-card__label">TOTAL COMMISSION GENERATED</p>
            <p className="cm-card__value">{formatCurrency(stats.totalGenerated)}</p>
            <p className={"cm-card__note" + (stats.changePercent >= 0 ? " is-up" : "")}>
              {formatChange(stats.changePercent)}
            </p>
          </div>
          <div className="cm-card">
            <p className="cm-card__label">TOTAL PAID</p>
            <p className="cm-card__value">{formatCurrency(stats.totalPaid)}</p>
            <p className="cm-card__note">Paid to date</p>
          </div>
          <div className="cm-card">
            <p className="cm-card__label">PENDING APPROVAL</p>
            <p className="cm-card__value is-accent">{stats.pendingCount} Cases</p>
            <p className="cm-card__note">Active</p>
          </div>
          <div className="cm-card">
            <p className="cm-card__label">PENDING PAYMENT</p>
            <p className="cm-card__value is-warn" style={{ color: "orange" }}>
              {formatCurrency(stats.pendingAmount)}
            </p>
            <p className="cm-card__note">Requires action</p>
          </div>
        </div>
      )}

      <div className="cm__grid">
        <div className="cm-card cm__rules">
          <h3>Rules Configuration</h3>
          <p className="cm__rules-sub">Set global commission parameters</p>
          <p className="cm__rules-note">
            Commission rates are currently set per-transaction and aren't backed by a
            reusable rules engine yet. Wiring this panel needs a new schema (e.g. a
            CommissionRule model keyed by service + partner tier) — let me know if you'd
            like that built.
          </p>
        </div>

        <div className="cm-card cm__pending">
          <div className="cm-card__row">
            <h3>Pending Processing</h3>
            <div className="cm__tabs">
              <button type="button" className={tab === "All" ? "is-active" : ""} onClick={() => changeTab("All")}>All</button>
              <button type="button" className={tab === "Due" ? "is-active" : ""} onClick={() => changeTab("Due")}>Due</button>
            </div>
          </div>
          <p className="cm__pending-sub">Review and action recent settlements</p>

          {loading ? (
            <div className="cm__state">Loading commissions...</div>
          ) : error ? (
            <div className="cm__state cm__state--error">{error}</div>
          ) : commissions.length === 0 ? (
            <div className="cm__state">No commissions found.</div>
          ) : (
            <table className="cm__table">
              <thead>
                <tr>
                  <th>PARTNER DETAILS</th>
                  <th>SERVICE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="cm__partner-cell">
                        <span className="cm__avatar">{c.initials}</span>
                        <div>
                          <p className="cm__partner-name">{c.partnerName}</p>
                          <p className="cm__partner-tier">{c.occupation}</p>
                        </div>
                      </div>
                    </td>
                    <td>{c.service}</td>
                    <td className="cm__amount">{formatCurrency(c.amount)}</td>
                    <td>
                      {c.status === "Pending" ? (
                        <button
                          type="button"
                          className={"cm-pill cm-pill--action " + (STATUS_CLASS[c.status] || "")}
                          disabled={updatingId === c.id}
                          onClick={() => markAsPaid(c)}
                          title="Mark as Paid"
                        >
                          {updatingId === c.id ? "..." : "Pending — Mark Paid"}
                        </button>
                      ) : (
                        <span className={"cm-pill " + (STATUS_CLASS[c.status] || "")}>{c.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="cm__pending-footer">
            <span>
              Showing {pagination.total === 0 ? 0 : startIdx + 1}-
              {Math.min(startIdx + limit, pagination.total)} of {pagination.total} pending approvals
            </span>
            <div className="cm__pager">
              <button type="button" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
              <button type="button" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>›</button>
            </div>
          </div>
        </div>
      </div>

      <div className="cm-card cm__velocity">
        <h3>Payout Velocity</h3>
        <div className="cm__legend">
          <span><i className="dot dot--approved" /> Created</span>
          <span><i className="dot dot--paid" /> Paid</span>
        </div>
        <div className="cm__bars">
          {velocity.map((d) => (
            <div className="cm__bar-group" key={d.date}>
              <div className="cm__bar-pair">
                <div className="cm__bar cm__bar--approved" style={{ height: `${scaleHeight(d.pending)}px` }} />
                <div className="cm__bar cm__bar--paid" style={{ height: `${scaleHeight(d.paid)}px` }} />
              </div>
              <span className="cm__bar-label">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
