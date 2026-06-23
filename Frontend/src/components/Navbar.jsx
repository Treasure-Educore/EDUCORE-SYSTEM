import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BellIcon, ChevronDownIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";

function formatRoleLabel(role) {
  if (!role) return "Role";
  if (role === "non-teaching-staff") return "Administrator";
  return role
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Navbar({ title, searchValue, onSearchChange, onMenuToggle, user, onSignOut }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef(null);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const displayName = user?.username || "Admin User";
  const subtitle = formatRoleLabel(user?.role);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (!profileOpen) {
      return undefined;
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const firstItem = menuRef.current?.querySelector('button[role="menuitem"]');
    firstItem?.focus();
  }, [profileOpen]);

  function handleTriggerKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setProfileOpen(true);
    }
  }

  return (
    <header className="topbar">
      <div>
        <p className="topbar__eyebrow">School Management Dashboard</p>
        <h1 className="topbar__title">{title}</h1>
      </div>

      <div className="topbar__actions">
        <button type="button" className="icon-button topbar__menu" aria-label="Open sidebar" onClick={onMenuToggle}>
          <MenuIcon />
        </button>

        <label className="topbar__search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search students, teachers..."
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </label>

        <button type="button" className="icon-button" aria-label="Notifications">
          <BellIcon />
          <span className="notification-badge">3</span>
        </button>

        <div className="profile-menu" ref={containerRef}>
          <button
            ref={triggerRef}
            type="button"
            className="profile-menu__trigger"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            aria-controls={menuId}
            onClick={() => setProfileOpen((value) => !value)}
            onKeyDown={handleTriggerKeyDown}
          >
            <span className="profile-avatar">
              <UserIcon />
            </span>
            <span className="profile-copy">
              <strong>{displayName}</strong>
              <small>{subtitle}</small>
            </span>
            <ChevronDownIcon />
          </button>

          <div
            ref={menuRef}
            id={menuId}
            className={profileOpen ? "profile-menu__panel is-open" : "profile-menu__panel"}
            role="menu"
            aria-hidden={!profileOpen}
          >
            <Link to="/profile" role="menuitem" className="profile-menu__item" onClick={() => setProfileOpen(false)}>
              Profile
            </Link>
            <Link to="/settings" role="menuitem" className="profile-menu__item" onClick={() => setProfileOpen(false)}>
              Account Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setProfileOpen(false);
                onSignOut?.();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
