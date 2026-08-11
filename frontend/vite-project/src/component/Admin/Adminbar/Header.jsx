import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header({ adminName = "Admin" }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  return (
    <header className="admin-header">
      <div className="admin-header__search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
        <input
          type="text"
          placeholder="Search partners, transactions, or reports..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="admin-header__actions">
        <button className="admin-header__icon-btn" type="button" aria-label="Notifications" onClick={() => navigate("/admin/notification-center")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 10a6 6 0 1112 0c0 4 1.3 5.4 1.8 6H4.2c.5-.6 1.8-2 1.8-6z" />
            <path d="M10 19a2 2 0 004 0" />
          </svg>
        </button>
        <button className="admin-header__icon-btn" type="button" aria-label="Help" onClick={() => navigate("/admin/help")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.3" />
            <circle cx="12" cy="16.7" r="0.4" fill="currentColor" />
          </svg>
        </button>
        <div className="admin-header__profile">
          <div className="admin-header__avatar">
            {adminName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="admin-header__profile-text">
            <p className="admin-header__name">{adminName}</p>
            {/* <p className="admin-header__role">Admin</p> */}
          </div>
        </div>
      </div>
    </header>
  );
}
