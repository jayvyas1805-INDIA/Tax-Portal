import { useState } from "react";
import "./SidebarNav.css";
import { useNavigate } from "react-router-dom";

const SidebarNav = ({
  brandTitle,
  brandSubtitle,
  items,
  activeId,
  footerItems,
  onItemSelect,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (item) => {
    onItemSelect(item.id);

    if (item.path) {
      navigate(item.path);
    }

    setIsOpen(false); // close drawer on mobile after selecting
  };

  return (
    <>
      <button
        type="button"
        className="sidebar-nav__toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <span aria-hidden="true">☰</span>
      </button>

      {isOpen && (
        <div
          className="sidebar-nav__backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar-nav${isOpen ? " sidebar-nav--open" : ""}`}>
        <button
          type="button"
          className="sidebar-nav__close"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="sidebar-nav__brand">
          <p className="sidebar-nav__brand-title">🛡️ {brandTitle}</p>
          {brandSubtitle && (
            <p className="sidebar-nav__brand-subtitle">{brandSubtitle}</p>
          )}
        </div>

        <nav className="sidebar-nav__list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav__item${item.id === activeId ? " sidebar-nav__item--active" : ""
                }`}
              onClick={() => handleClick(item)}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {footerItems && (
          <div className="sidebar-nav__footer">
            {footerItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="sidebar-nav__item sidebar-nav__item--footer"
                onClick={() => handleClick(item)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </aside>
    </>
  );
};

export default SidebarNav;