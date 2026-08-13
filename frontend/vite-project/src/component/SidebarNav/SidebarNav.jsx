import { useState } from "react";
import "./SidebarNav.css";
import { useNavigate } from "react-router-dom";
import { Menu, X, ShieldCheck } from "lucide-react";

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

    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="sidebar-nav__toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} strokeWidth={2} />
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-nav__backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar-nav${isOpen ? " sidebar-nav--open" : ""}`}>
        {/* Mobile close button */}
        <button
          type="button"
          className="sidebar-nav__close"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X size={22} strokeWidth={2} />
        </button>

        {/* Brand */}
        <div className="sidebar-nav__brand">
          <p className="sidebar-nav__brand-title">
            <ShieldCheck
              size={20}
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>{brandTitle}</span>
          </p>

          {brandSubtitle && (
            <p className="sidebar-nav__brand-subtitle">
              {brandSubtitle}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav__list">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav__item${
                  item.id === activeId
                    ? " sidebar-nav__item--active"
                    : ""
                }`}
                onClick={() => handleClick(item)}
              >
                <Icon
                  className="sidebar-nav__icon"
                  size={19}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {footerItems && (
          <div className="sidebar-nav__footer">
            {footerItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  className="sidebar-nav__item sidebar-nav__item--footer"
                  onClick={() => handleClick(item)}
                >
                  <Icon
                    className="sidebar-nav__icon"
                    size={19}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
};

export default SidebarNav;