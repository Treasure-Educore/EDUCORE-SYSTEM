import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BellIcon, ChevronDownIcon, MenuIcon, SearchIcon, UserIcon } from "../icons";

function formatRoleLabel(role) {
  if (!role) return "Role";
  if (role === "non-teaching-staff") return "Administrator";
  return role
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PrincipalTopbar({ title, user, onMenuToggle, onSignOut }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef(null);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const displayName = user?.username || "Principal";
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
    <header className="principal-topbar">
      <div className="principal-topbar__brand">
        <button type="button" className="principal-topbar__menu" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <MenuIcon />
        </button>
        <div className="principal-topbar__identity">
          <div className="principal-topbar__logo" aria-hidden="true">
            SM
          </div>
          <div>
            <p>Summit Academy</p>
            <strong>{title}</strong>
          </div>
        </div>
      </div>

      <div className="principal-topbar__actions">
        <label className="principal-topbar__search">
          <SearchIcon />
          <input type="search" placeholder="Search students, teachers, reports..." aria-label="Global search" />
        </label>

        <button type="button" className="principal-topbar__icon" aria-label="Unread notifications">
          <BellIcon />
          <span className="principal-topbar__badge">8</span>
        </button>

        <div className="principal-profile" ref={containerRef}>
          <button
            ref={triggerRef}
            type="button"
            className="principal-profile__trigger"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            aria-controls={menuId}
            onClick={() => setProfileOpen((value) => !value)}
            onKeyDown={handleTriggerKeyDown}
          >
            <span className="principal-profile__avatar" aria-hidden="true">
              <UserIcon />
            </span>
            <span className="principal-profile__copy">
              <strong>{displayName}</strong>
              <small>{subtitle}</small>
            </span>
            <ChevronDownIcon />
          </button>

          <div
            ref={menuRef}
            id={menuId}
            className={profileOpen ? "principal-profile__menu is-open" : "principal-profile__menu"}
            role="menu"
            aria-hidden={!profileOpen}
          >
            <Link to="/profile" role="menuitem" className="principal-profile__item" onClick={() => setProfileOpen(false)}>
              Profile
            </Link>
            <Link to="/settings" role="menuitem" className="principal-profile__item" onClick={() => setProfileOpen(false)}>
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
