import { useEffect, useState } from "react";
import "./ReviewFeedback.css";
import {
  getReviewStats,
  getReviews,
  respondToReview,
  flagReview,
} from "../../api/adminReviewApi";
import "./responsive.css";

const TABS = ["All", "Pending", "Flagged"];
const TAB_LABEL = { All: "All Reviews", Pending: "Pending Response", Flagged: "Flagged" };

const STATUS_CLASS = {
  Published: "rf-pill--published",
  Pending: "rf-pill--pending",
  Flagged: "rf-pill--flagged",
};

function Stars({ rating }) {
  return (
    <span className="rf__stars" aria-label={`${rating} out of 5 stars`}>
      {"★★★★★".split("").map((s, i) => (
        <span key={i} className={i < rating ? "is-filled" : ""}>★</span>
      ))}
    </span>
  );
}

export default function ReviewFeedback() {
  const [tab, setTab] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [respondingId, setRespondingId] = useState(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const data = await getReviewStats();
        if (isMounted) setStats(data);
      } catch {
        // Stat cards fail silently — the list below is the priority
      }
    };
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getReviews({ tab, page, limit });
        if (!isMounted) return;
        setReviews(res.data);
        setPagination(res.pagination);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Failed to load reviews.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [tab, page, limit]);

  const changeTab = (t) => {
    setTab(t);
    setPage(1);
    setRespondingId(null);
  };

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPage(p);
  };

  const openResponder = (review) => {
    setRespondingId(review.id);
    setResponseText(review.adminResponse || "");
  };

  const submitResponse = async (review) => {
    if (!responseText.trim()) return;
    try {
      setBusyId(review.id);
      const updated = await respondToReview(review.id, responseText.trim());
      setReviews((prev) => prev.map((r) => (r.id === review.id ? updated : r)));
      setRespondingId(null);
    } catch {
      // leave as-is on failure
    } finally {
      setBusyId(null);
    }
  };

  const handleFlag = async (review) => {
    try {
      setBusyId(review.id);
      const updated = await flagReview(review.id, "Flagged by admin for follow-up");
      setReviews((prev) => prev.map((r) => (r.id === review.id ? updated : r)));
    } catch {
      // leave as-is on failure
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rf">
      <div className="rf__topbar">
        <div>
          <h1>Review &amp; Feedback</h1>
          <p>Monitor client satisfaction and manage partner review responses.</p>
        </div>
      </div>

      {stats && (
        <div className="rf__stats">
          <div className="rf-card">
            <p className="rf-card__label">TOTAL REVIEWS</p>
            <p className="rf-card__value">{stats.totalReviews.toLocaleString()}</p>
            <p className={"rf-card__note" + (stats.growthPercent >= 0 ? " is-up" : "")}>
              {stats.growthPercent > 0 ? "+" : ""}{stats.growthPercent}% this month
            </p>
          </div>
          <div className="rf-card">
            <p className="rf-card__label">AVERAGE RATING</p>
            <p className="rf-card__value is-accent">{stats.averageRating || "—"}</p>
            <p className="rf-card__note">out of 5.0</p>
          </div>
          <div className="rf-card">
            <p className="rf-card__label">PENDING RESPONSE</p>
            <p className="rf-card__value is-warn">{stats.pendingCount}</p>
            <p className="rf-card__note">Requires action</p>
          </div>
          <div className="rf-card">
            <p className="rf-card__label">FLAGGED FEEDBACK</p>
            <p className="rf-card__value is-warn">{stats.flaggedCount}</p>
            <p className="rf-card__note">Needs review</p>
          </div>
        </div>
      )}

      <div className="rf-card rf__panel">
        <div className="rf__panel-header">
          <div className="rf__tabs">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                className={"rf__tab" + (tab === t ? " rf__tab--active" : "")}
                onClick={() => changeTab(t)}
              >
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>
          <span className="rf__count">{pagination.total} results</span>
        </div>

        {loading ? (
          <div className="rf__state">Loading reviews...</div>
        ) : error ? (
          <div className="rf__state rf__state--error">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="rf__state">No reviews here yet.</div>
        ) : (
          <ul className="rf__list">
            {reviews.map((r) => (
              <li className="rf__item" key={r.id}>
                <span className="rf__avatar">{r.initials}</span>
                <div className="rf__item-body">
                  <div className="rf__item-row">
                    <div>
                      <p className="rf__item-client">{r.client}</p>
                      <p className="rf__item-partner">via {r.partner} &middot; {r.service}</p>
                    </div>
                    <div className="rf__item-meta">
                      <Stars rating={r.rating} />
                      <span className={"rf-pill " + (STATUS_CLASS[r.status] || "")}>{r.status}</span>
                    </div>
                  </div>
                  <p className="rf__item-comment">{r.comment}</p>

                  {r.adminResponse && (
                    <p className="rf__admin-response">
                      <strong>Admin response:</strong> {r.adminResponse}
                    </p>
                  )}

                  {respondingId === r.id && (
                    <div className="rf__respond-box">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write a response to publish alongside this review..."
                      />
                      <button
                        type="button"
                        className="rf__action-btn rf__action-btn--primary"
                        disabled={busyId === r.id}
                        onClick={() => submitResponse(r)}
                      >
                        {busyId === r.id ? "..." : "Send"}
                      </button>
                    </div>
                  )}

                  <div className="rf__item-footer">
                    <span className="rf__item-time">{r.time}</span>
                    <div className="rf__item-actions">
                      <button
                        type="button"
                        className="rf__action-btn rf__action-btn--primary"
                        disabled={busyId === r.id}
                        onClick={() => (respondingId === r.id ? setRespondingId(null) : openResponder(r))}
                      >
                        {respondingId === r.id ? "Cancel" : "Respond"}
                      </button>
                      {r.status !== "Flagged" && (
                        <button
                          type="button"
                          className="rf__action-btn rf__action-btn--ghost"
                          disabled={busyId === r.id}
                          onClick={() => handleFlag(r)}
                        >
                          {busyId === r.id ? "..." : "Flag"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {pagination.totalPages > 1 && (
          <div className="rf__pagination">
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
        )}
      </div>
    </div>
  );
}
