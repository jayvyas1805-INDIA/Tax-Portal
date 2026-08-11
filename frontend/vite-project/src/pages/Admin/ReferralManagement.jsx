import { useEffect, useState } from "react";
import "./ReferralManagement.css";
import {
  getReferralStats,
  getReferralBoard,
  getReferrals,
  updateReferralStatus,
  getReferralById,
} from "../../api/adminReferralApi";
import ReferralDetailsModal from "../../component/Admin/ReferralDetailsModal/ReferralDetailsModal";
import "./responsive.css";

const STATUS_CLASS = {
  "Under Review": "rm-pill--new",
  "Proposal Shared": "rm-pill--contacted",
  Converted: "rm-pill--won",
  Rejected: "rm-pill--lost",
};

const STATUS_OPTIONS = ["Under Review", "Proposal Shared", "Converted", "Rejected"];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatCompactCurrency = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000) return `₹${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(0)}K`;
  return `₹${amount.toFixed(0)}`;
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

const formatChange = (percent) =>
  `${percent > 0 ? "+" : ""}${percent}% from last month`;

export default function ReferralManagement() {
  const [view, setView] = useState("kanban");

  // Kanban board
  const [board, setBoard] = useState([]);
  const [boardLoading, setBoardLoading] = useState(true);
  const [boardError, setBoardError] = useState("");

  // List view
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [referrals, setReferrals] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedReferral, setSelectedReferral] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [modalLoading, setModalLoading] = useState(false);

  // Footer stats (list view)
  const [stats, setStats] = useState(null);

  // Debounce search box
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (view !== "kanban") return;
    let isMounted = true;

    const loadBoard = async () => {
      try {
        setBoardLoading(true);
        setBoardError("");
        const data = await getReferralBoard(8);
        if (isMounted) setBoard(data);
      } catch (err) {
        if (isMounted) setBoardError(err?.response?.data?.message || "Failed to load the referral board.");
      } finally {
        if (isMounted) setBoardLoading(false);
      }
    };

    loadBoard();
    return () => {
      isMounted = false;
    };
  }, [view]);

  useEffect(() => {
    if (view !== "list") return;
    let isMounted = true;

    const loadStats = async () => {
      try {
        const data = await getReferralStats();
        if (isMounted) setStats(data);
      } catch {
        // Footer stats fail silently — the table is the priority
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [view]);

  useEffect(() => {
    if (view !== "list") return;
    let isMounted = true;

    const loadReferrals = async () => {
      try {
        setListLoading(true);
        setListError("");
        const res = await getReferrals({ status: statusFilter, search, page, limit });
        if (!isMounted) return;
        setReferrals(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (!isMounted) return;
        setListError(err?.response?.data?.message || "Failed to load referrals.");
      } finally {
        if (isMounted) setListLoading(false);
      }
    };

    loadReferrals();
    return () => {
      isMounted = false;
    };
  }, [view, statusFilter, search, page, limit]);

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPage(p);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    setPage(1);
  };

  const openReferral = async (id) => {
  console.log("Opening:", id);

  try {
    setModalLoading(true);

    const referral = await getReferralById(id);

    console.log(referral);

    setSelectedReferral(referral);
    setModalOpen(true);
  } finally {
    setModalLoading(false);
  }
};
  // const changeStatus = async (referral, nextStatus) => {
  //   if (nextStatus === referral.status) return;
  //   try {
  //     setUpdatingId(referral.id);
  //     const updated = await updateReferralStatus(referral.id, nextStatus);
  //     setReferrals((prev) => prev.map((r) => (r.id === referral.id ? updated : r)));
  //   } catch {
  //     // Leave the row as-is; select will just snap back on next render
  //   } finally {
  //     setUpdatingId(null);
  //   }
  // };

  const footerStats = stats
    ? [
      {
        label: "CONVERSION RATE",
        value: `${stats.conversionRate}%`,
        note: formatChange(stats.conversionRateChange),
      },
      {
        label: "ACTIVE PARTNERS",
        value: stats.activePartners.toLocaleString(),
        note: `Top performing: ${stats.topPerformerName}`,
      },
      {
        label: "AVG. DEAL VALUE",
        value: formatCompactCurrency(stats.avgDealValue),
        note: "Across converted referrals",
      },
      {
        label: "PIPELINE VALUE",
        value: formatCompactCurrency(stats.pipelineValue),
        note: "Estimated value still in progress",
      },
    ]
    : [];

    const loadData = async () => {
  try {
    const [statsRes, boardRes, referralsRes] = await Promise.all([
      getReferralStats(),
      getReferralBoard(),
      getReferrals(),
    ]);

    setStats(statsRes);
    setBoard(boardRes);
    setReferrals(referralsRes);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  loadData();
}, []);

  
  return (
    <div className="rm">
      <div className="rm__topbar">
        <div>
          <h1>{view === "kanban" ? "Referral Lead Pipeline" : "Referral Listing Management"}</h1>
          <p>
            {view === "kanban"
              ? "Manage and track your active referral opportunities across the sales cycle."
              : "Manage, track, and convert enterprise partner referrals."}
          </p>
        </div>
        <div className="rm__topbar-actions">
          <div className="rm__view-toggle">
            <button
              type="button"
              className={view === "kanban" ? "is-active" : ""}
              onClick={() => setView("kanban")}
            >
              Board
            </button>
            <button
              type="button"
              className={view === "list" ? "is-active" : ""}
              onClick={() => setView("list")}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {view === "kanban" ? (
        boardLoading ? (
          <div className="rm__state">Loading referral board...</div>
        ) : boardError ? (
          <div className="rm__state rm__state--error">{boardError}</div>
        ) : (
          <div className="rm__board">
            {board.map((col) => (
              <div className="rm__column" key={col.key}>
                <div className="rm__column-header">
                  <h3>{col.title} <span>{col.count}</span></h3>
                </div>
                <div className="rm__column-body">
                  {col.cards.length === 0 && (
                    <p className="rm-card__note">No referrals here yet.</p>
                  )}
                  {col.cards.map((card) => (
                    <div className="rm__lead-card" key={card.id}>
                      <span className="rm__lead-tag">{card.tag}</span>
                      <p className="rm__lead-client">{card.client}</p>
                      <p className="rm__lead-meta">👤 Ref by: {card.refBy}</p>
                      <div className="rm__lead-footer">
                        {/* <span className="rm__lead-avatar" /> */}
                        <span className="rm__lead-value">{formatCurrency(card.value)}</span>
                        <span className="rm__lead-time">{card.time}</span>
                        <button
                          className="rm-view-btn"
                          onClick={() => openReferral(card.id)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          <div className="rm-card rm__filters">
            <div className="rm__filter-field">
              <label>SEARCH</label>
              <input
                type="text"
                placeholder="ID, Client, Service..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="rm__filter-field">
              <label>STATUS</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="rm__filter-actions">
              <button type="button" className="rm__btn rm__btn--ghost" onClick={clearFilters}>Clear</button>
            </div>
          </div>

          <div className="rm-card rm__table-card">
            {listLoading ? (
              <div className="rm__state">Loading referrals...</div>
            ) : listError ? (
              <div className="rm__state rm__state--error">{listError}</div>
            ) : referrals.length === 0 ? (
              <div className="rm__state">No referrals found.</div>
            ) : (
              <div className="rm__table-wrap">
                <table className="rm__table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>CLIENT INFO</th>
                      <th>CONTACT</th>
                      <th>PARTNER</th>
                      <th>SERVICE</th>
                      <th>VALUE</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((r) => (
                      <tr key={r.id}>
                        <td className="rm__id">{r.referralId}</td>
                        <td>
                          <p className="rm__client-name">{r.clientName}</p>
                        </td>
                        <td>
                          <p className="rm__contact-phone">{r.clientContact}</p>
                        </td>
                        <td>{r.partnerName}</td>
                        <td>
                          <span className="rm-tag">{r.service}</span>
                        </td>
                        <td>{formatCurrency(r.value)}</td>
                        <td>
                          <p className="rm__date">{formatDate(r.createdAt)}</p>
                        </td>
                        <td>

                          <span className={"rm-pill " + (STATUS_CLASS[r.status] || "")}>
                            {r.status}
                          </span>

                        </td>

                        <td>

                          <button
                            className="rm-view-btn"
                            onClick={() => openReferral(r.id)}
                          >
                            👁 View
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="rm__footer">
              <span>
                Showing {pagination.total === 0 ? 0 : (pagination.page - 1) * limit + 1} to{" "}
                {Math.min(pagination.page * limit, pagination.total)} of {pagination.total} referrals
              </span>
              <div className="rm__pagination">
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

          {stats && (
            <div className="rm__stats">
              {footerStats.map((s) => (
                <div className="rm-card" key={s.label}>
                  <p className="rm-card__label">{s.label}</p>
                  <p className="rm-card__value">{s.value}</p>
                  <p className="rm-card__note">{s.note}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <ReferralDetailsModal
  isOpen={modalOpen}
  referral={selectedReferral}
  onClose={() => {
    setModalOpen(false);
    setSelectedReferral(null);
  }}
  onStatusUpdated={async () => {
    await loadData();      // Refresh everything

    setModalOpen(false);
    setSelectedReferral(null);
  }}
/>
      
    </div>

  );
}
