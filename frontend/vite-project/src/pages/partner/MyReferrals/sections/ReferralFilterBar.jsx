import "./ReferralFilterBar.css";

const STATUS_OPTIONS = [
  "All Statuses",
  "Proposal Shared",
  "Converted",
  "Under Review",
  "Rejected",
];

const ReferralFilterBar = ({ filters, onFilterChange, onClearFilters }) => {
  const handleChange = (event) => {
    onFilterChange(event.target.name, event.target.value);
  };

  return (
    <div className="referral-filter-bar">
      <input
        type="text"
        name="searchTerm"
        placeholder="Search Client or Mobile No."
        value={filters.searchTerm}
        onChange={handleChange}
        className="referral-filter-bar__search"
      />

      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="referral-filter-bar__select"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <input
        type="date"
        name="dateFrom"
        value={filters.dateFrom}
        onChange={handleChange}
        className="referral-filter-bar__date"
      />
      <span className="referral-filter-bar__date-separator">to</span>
      <input
        type="date"
        name="dateTo"
        value={filters.dateTo}
        onChange={handleChange}
        className="referral-filter-bar__date"
      />

      <button
        type="button"
        className="referral-filter-bar__clear"
        onClick={onClearFilters}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default ReferralFilterBar;
