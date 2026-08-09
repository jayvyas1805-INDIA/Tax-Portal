import { useState } from "react";
import StatusBadge from "../../../../component/StatusBadge/StatusBadge";
import Pagination from "../../../../component/Pagination/Pagination";
import "./VerificationHistoryTable.css";

const STATUS_LABELS = {
  verified: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

const STATUS_TONE = {
  verified: "positive",
  pending: "warning",
  rejected: "negative",
};

const PAGE_SIZE = 5;

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const VerificationHistoryTable = ({ history, onViewDocument, onReupload }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const pageEntries = history.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="verification-history-table">
      <div className="verification-history-table__header">
        <p className="verification-history-table__title">Verification History</p>
      </div>

      <div className="verification-history-table__scroll">
        <table className="verification-history-table__table">
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Date Submitted</th>
              <th>Status</th>
              <th>Admin Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pageEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className="verification-history-table__empty">
                  No documents submitted yet.
                </td>
              </tr>
            ) : (
              pageEntries.map((entry, index) => (
                <tr key={`${entry.documentType}-${entry.submittedAt}-${index}`}>
                  <td className="verification-history-table__doc-type">
                    {entry.documentType}
                  </td>
                  <td>{formatDate(entry.submittedAt)}</td>
                  <td>
                    <StatusBadge
                      label={STATUS_LABELS[entry.status] || entry.status}
                      tone={STATUS_TONE[entry.status]}
                    />
                  </td>
                  <td className="verification-history-table__remarks">
                    {entry.adminRemarks || "—"}
                  </td>
                  <td>
                    {entry.status === "rejected" ? (
                      <button
                        type="button"
                        className="verification-history-table__action-link"
                        onClick={() => onReupload(entry.documentType)}
                      >
                        Re-upload
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="verification-history-table__action-link"
                        onClick={() => onViewDocument(entry.fileUrl)}
                        disabled={!entry.fileUrl}
                      >
                        View Doc
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {history.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={history.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default VerificationHistoryTable;
