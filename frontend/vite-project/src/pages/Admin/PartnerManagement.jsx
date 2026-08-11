import { useEffect, useState } from "react";
import "./PartnerManagement.css";
import {
  getPartnerStats,
  getPartners,
  updatePartnerAccountStatus,
  getPartnerById,
} from "../../api/adminPartnerApi";
import PartnerDetailModal from "../../component/Admin/PartnerDetailModal/PartnerDetailModal";
import "./responsive.css";

const TABS = ["All", "Pending", "Suspended"];

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatChange = (percent) => `${percent > 0 ? "↑" : percent < 0 ? "↓" : ""}${Math.abs(percent)}%`;

export default function PartnerManagement() {
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [partners, setPartners] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [actionErrorId, setActionErrorId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Partner detail modal (View button)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Debounce the search box before it hits the API
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const statsData = await getPartnerStats();
        if (isMounted) setStats(statsData);
      } catch {
        // Stat cards fail silently — the directory below is the priority
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPartners = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getPartners({ tab: activeTab, search, page, limit });

        if (!isMounted) return;
        setPartners(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Failed to load partners.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPartners();
    return () => {
      isMounted = false;
    };
  }, [activeTab, search, page, limit]);

  const changeTab = (t) => {
    setActiveTab(t);
    setPage(1);
  };

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPage(p);
  };

  const toggleAccountStatus = async (partner) => {
    try {
      setUpdatingId(partner.id);
      setActionErrorId(null);
      const nextIsActive = partner.accountStatus !== "Active";
      const updated = await updatePartnerAccountStatus(partner.id, nextIsActive);
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, accountStatus: updated.accountStatus } : p))
      );
    } catch {
      setActionErrorId(partner.id);
    } finally {
      setUpdatingId(null);
    }
  };

  // Opens the detail modal and fetches the full partner profile by id.
  const openPartner = async (id) => {
    setModalOpen(true);
    setModalLoading(true);
    setSelectedPartner(null);
    try {
      const partner = await getPartnerById(id);
      setSelectedPartner(partner);
    } catch (err) {
      console.error("Failed to load partner ->", err);
    } finally {
      setModalLoading(false);
    }
  };

  const closePartnerModal = () => {
    setModalOpen(false);
    setSelectedPartner(null);
  };

  // Called by the modal after a KYC/banking approve-reject action succeeds,
  // so both the modal and the underlying directory row stay in sync.
  const handlePartnerUpdate = (updatedPartner) => {
    setSelectedPartner(updatedPartner);
    setPartners((prev) =>
      prev.map((p) =>
        p.id === updatedPartner.id
          ? { ...p, accountStatus: updatedPartner.accountStatus, kycStatus: updatedPartner.kycStatus }
          : p
      )
    );
  };

  const startIdx = (pagination.page - 1) * limit;

  const statCards = stats
    ? [
        {
          label: "TOTAL PARTNERS",
          value: stats.totalPartners.toLocaleString(),
          change: formatChange(stats.growthPercent),
          positive: stats.growthPercent >= 0,
        },
        {
          label: "PENDING KYC",
          value: stats.pendingKyc.toLocaleString(),
          change: stats.pendingKyc > 0 ? "Requires Action" : "All Clear",
          positive: stats.pendingKyc === 0,
        },
        {
          label: "ACTIVE PARTNERS",
          value: `${stats.activePartnersPercent}%`,
          change: `${stats.activePartners.toLocaleString()} Active`,
          positive: true,
        },
        {
          label: "NEW THIS MONTH",
          value: stats.newThisMonth.toLocaleString(),
          change: formatChange(stats.growthPercent),
          positive: stats.growthPercent >= 0,
        },
      ]
    : [];

  return (
    <div className="pm">
      <div className="pm__topbar">
        <div>
          <h1>Partner Management</h1>
          <p>Oversee, verify, and manage your network of tax consulting partners.</p>
        </div>
        <div className="pm__topbar-actions">
          <button type="button" className="pm__btn pm__btn--ghost">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v11" />
              <path d="M7.5 11.5L12 16l4.5-4.5" />
              <path d="M5 19h14" />
            </svg>
            Export Report
          </button>
          <button type="button" className="pm__btn pm__btn--primary">
            <span>+</span> New Partner
          </button>
        </div>
      </div>

      {stats && (
        <div className="pm__stats">
          {statCards.map((s) => (
            <div className="pm-card" key={s.label}>
              <p className="pm-card__label">{s.label}</p>
              <p className="pm-card__value">{s.value}</p>
              <p className={"pm-card__change" + (s.positive ? " is-up" : " is-warn")}>{s.change}</p>
            </div>
          ))}
        </div>
      )}

      <div className="pm-card pm__directory">
        <div className="pm__directory-header">
          <div>
            <h3>Partner Directory</h3>
            <div className="pm__tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={"pm__tab" + (activeTab === t ? " pm__tab--active" : "")}
                  onClick={() => changeTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="pm__directory-meta">
            <input
              type="text"
              placeholder="Search name, email, or PAN..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pm__search"
            />
            <span>
              Showing {pagination.total === 0 ? 0 : startIdx + 1}-
              {Math.min(startIdx + limit, pagination.total)} of {pagination.total} results
            </span>
            <div className="pm__pager">
              <button type="button" aria-label="Previous" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
              <button type="button" aria-label="Next" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>›</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="pm__state">Loading partners...</div>
        ) : error ? (
          <div className="pm__state pm__state--error">{error}</div>
        ) : partners.length === 0 ? (
          <div className="pm__state">No partners found.</div>
        ) : (
          <div className="pm__table-wrap">
            <table className="pm__table">
              <thead>
                <tr>
                  <th>PAN NUMBER</th>
                  <th>PARTNER NAME</th>
                  <th>CONTACT INFO</th>
                  <th>REG. DATE</th>
                  <th>KYC STATUS</th>
                  <th>ACCOUNT STATUS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id}>
                    <td className="pm__pan">{p.pan}</td>
                    <td>
                      <div className="pm__partner-cell">
                        <span className="pm__avatar">{p.initials}</span>
                        <div>
                          <p className="pm__partner-name">{p.name}</p>
                          <p className="pm__partner-tier">{p.occupation}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="pm__contact-email">{p.email}</p>
                      <p className="pm__contact-phone">{p.phone}</p>
                    </td>
                    <td>{formatDate(p.regDate)}</td>
                    <td>
                      <span className={"pm-pill pm-pill--" + p.kycStatus.toLowerCase()}>
                        {p.kycStatus === "Verified" ? "✓ " : "● "}
                        {p.kycStatus}
                      </span>
                    </td>
                    <td>
                      <span className={"pm-pill pm-pill--" + p.accountStatus.toLowerCase()}>
                        ● {p.accountStatus}
                      </span>
                    </td>
                    <td>
                      <button className="pm__btn" onClick={() => openPartner(p.id)}>
                        View
                      </button>

                      <button
                        className="pm__btn pm__btn--ghost"
                        disabled={updatingId === p.id}
                        onClick={() => toggleAccountStatus(p)}
                      >
                        {updatingId === p.id
                          ? "..."
                          : p.accountStatus === "Active"
                          ? "Suspend"
                          : "Activate"}
                      </button>

                      {actionErrorId === p.id && (
                        <p className="pm__row-error">Failed to update. Try again.</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pm__footer">
          <div>
            Rows per page:
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="pm__pagination">
            <button type="button" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1}>Previous</button>
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
            <button type="button" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>Next</button>
          </div>
        </div>
      </div>

      <PartnerDetailModal
        isOpen={modalOpen}
        onClose={closePartnerModal}
        partner={selectedPartner}
        loading={modalLoading}
        onPartnerUpdate={handlePartnerUpdate}
      />
    </div>
  );
}
