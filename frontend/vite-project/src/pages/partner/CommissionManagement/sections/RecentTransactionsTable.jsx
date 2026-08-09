import StatusBadge from "../../../../component/StatusBadge/StatusBadge";
import Pagination from "../../../../component/Pagination/Pagination";
import "./RecentTransactionsTable.css";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, { dateStyle: "medium" });

const RecentTransactionsTable = ({
  transactions,
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  return (
    <div className="recent-transactions-table">
      <div className="recent-transactions-table__header">
        <p className="recent-transactions-table__title">Recent Transactions</p>
        <div className="recent-transactions-table__controls">
          <input
            type="text"
            placeholder="Search by ID or Name"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="recent-transactions-table__search"
          />
        </div>
      </div>

      <div className="recent-transactions-table__scroll">
        <table className="recent-transactions-table__table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Referral ID</th>
              <th>Client Name</th>
              <th>Business Value</th>
              <th>Comm. Rate</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="recent-transactions-table__empty">
                  No transactions yet.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="recent-transactions-table__id">
                    {transaction.transactionId}
                  </td>
                  <td>{transaction.referralDisplayId || "—"}</td>
                  <td>{transaction.clientName}</td>
                  <td>₹{transaction.businessValue.toLocaleString()}</td>
                  <td>{transaction.commissionRate}%</td>
                  <td className="recent-transactions-table__amount">
                    ₹{transaction.amount.toLocaleString()}
                  </td>
                  <td>
                    <StatusBadge label={transaction.status} />
                  </td>
                  <td>{formatDate(transaction.createdAt)}</td>
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

export default RecentTransactionsTable;
