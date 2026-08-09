import StatusBadge from "../../../../component/StatusBadge/StatusBadge";
import Pagination from "../../../../component/Pagination/Pagination";
import "./ReferralsTable.css";

const STATUS_TONE = {
  "Proposal Shared": "info",
  Converted: "positive",
  "Under Review": "warning",
  Rejected: "negative",
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, { dateStyle: "medium" });

const ReferralsTable = ({
  referrals,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onViewReferral,
}) => {
  return (
    <div className="referrals-table">
      <div className="referrals-table__scroll">
        <table className="referrals-table__table">
          <thead>
            <tr>
              <th>Referral ID</th>
              <th>Date</th>
              <th>Client Name</th>
              <th>Service</th>
              <th>Status</th>
              <th>Est. Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={7} className="referrals-table__empty">
                  No referrals found. Create your first one above.
                </td>
              </tr>
            ) : (
              referrals.map((referral) => (
                <tr key={referral._id}>
                  <td className="referrals-table__id">{referral.referralId}</td>
                  <td>{formatDate(referral.createdAt)}</td>
                  <td>
                    <p className="referrals-table__client-name">
                      {referral.clientName}
                    </p>
                    <p className="referrals-table__client-contact">
                      {referral.clientContact}
                    </p>
                  </td>
                  <td>{referral.service}</td>
                  <td>
                    <StatusBadge
                      label={referral.status}
                      tone={STATUS_TONE[referral.status]}
                    />
                  </td>
                  <td className="referrals-table__value">
                    ₹{referral.estimatedValue.toLocaleString()}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="referrals-table__action-btn"
                      onClick={() => onViewReferral(referral)}
                      aria-label={`View ${referral.referralId}`}
                    >
                      👁
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default ReferralsTable;
