import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import InvitePartnerModal from "../InvitePartnerModal/InvitePartnerModal";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "grid" },
  { label: "Partner Management", path: "/admin/partner-management", icon: "users" },
  { label: "Referral Management", path: "/admin/referral-management", icon: "link" },
  { label: "Commission Management", path: "/admin/commission-management", icon: "percent" },
  { label: "Business Management", path: "/admin/business-management", icon: "briefcase" },
  { label: "Review & Feedback", path: "/admin/review-feedback", icon: "star" },
  { label: "Reports & Analytics", path: "/admin/reports-analytics", icon: "bar-chart" },
  { label: "Notification Center", path: "/admin/notification-center", icon: "bell" },
  { label: "Settings", path: "/admin/settings", icon: "settings" },
];

const ICONS = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.7-3.5 3-5.5 5.5-5.5s4.8 2 5.5 5.5" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15.5 14.6c2 .2 3.7 2 4.3 5.4" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.5 14.5l5-5" />
      <path d="M8.2 16.8l-2 2a3.6 3.6 0 01-5-5l3-3a3.6 3.6 0 015-.3" />
      <path d="M15.8 7.2l2-2a3.6 3.6 0 015 5l-3 3a3.6 3.6 0 01-5 .3" />
    </svg>
  ),
  percent: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="19" x2="19" y2="5" />
      <circle cx="7" cy="7" r="2.3" />
      <circle cx="17" cy="17" r="2.3" />
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M8 7.5V6a2 2 0 012-2h4a2 2 0 012 2v1.5" />
      <line x1="3" y1="12.5" x2="21" y2="12.5" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z" />
    </svg>
  ),
  "bar-chart": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="20" x2="5" y2="11" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="19" y1="20" x2="19" y2="14" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 10a6 6 0 1112 0c0 4 1.3 5.4 1.8 6H4.2c.5-.6 1.8-2 1.8-6z" />
      <path d="M10 19a2 2 0 004 0" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2.1-1.2L14 3h-4l-.4 2.6a7 7 0 00-2.1 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 000 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 002.1 1.2L10 21h4l.4-2.6a7 7 0 002.1-1.2l2.4 1 2-3.4-2-1.6c.07-.4.1-.8.1-1.2z" />
    </svg>
  ),
};

export default function Sidebar() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="admin-sidebar__toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      {isOpen && (
        <div
          className="admin-sidebar__backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`admin-sidebar${isOpen ? " admin-sidebar--open" : ""}`}>
        <button
          type="button"
          className="admin-sidebar__close"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">PP</span>
          <div>
            <p className="admin-sidebar__title">PartnerPortal</p>
            <p className="admin-sidebar__subtitle">Enterprise Admin</p>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                "admin-sidebar__link" + (isActive ? " admin-sidebar__link--active" : "")
              }
            >
              <span className="admin-sidebar__icon">{ICONS[item.icon]}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          className="admin-sidebar__invite"
          onClick={() => {
            setModalOpen(true);
            setIsOpen(false);
          }}
          type="button"
        >
          <span className="admin-sidebar__invite-icon">+</span>
          Invite Partner
        </button>

        <InvitePartnerModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </aside>
    </>
  );
}