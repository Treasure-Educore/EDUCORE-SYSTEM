import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cx } from "../../utils/formatters";
import { principalNavigation } from "../../data/principalNavigation";

export default function PrincipalSidebar({ collapsed, mobileOpen, openGroup, onToggleGroup }) {
  const { role } = useAuth();

  return (
    <aside className={cx("principal-sidebar", collapsed && "is-collapsed", mobileOpen && "is-open")}>
      <div className="principal-sidebar__brand">
        <div className="principal-sidebar__mark" aria-hidden="true">
          SM
        </div>
        <div className="principal-sidebar__copy">
          <strong>School Management</strong>
          <span>Principal Console</span>
        </div>
      </div>

      <nav className="principal-sidebar__nav" aria-label="Principal navigation">
        {principalNavigation.map((group) => {
          const isOpen = openGroup === group.key;
          const GroupIcon = group.icon;

          return (
            <section key={group.key} className={cx("principal-sidebar__group", isOpen && "is-open")}>
              <button
                type="button"
                className={cx("principal-sidebar__group-trigger", isOpen && "is-active")}
                aria-expanded={isOpen}
                aria-controls={`group-${group.key}`}
                onClick={() => onToggleGroup(group.key)}
                title={group.label}
              >
                <GroupIcon />
                <span>{group.label}</span>
                <span className="principal-sidebar__chevron" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              <div id={`group-${group.key}`} className={cx("principal-sidebar__submenu", isOpen && "is-open")}>
                {group.items.filter((item) => !item.accessRoles || item.accessRoles.includes(role)).map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => cx("principal-sidebar__link", isActive && "is-active")}>
                      <ItemIcon />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>
    </aside>
  );
}
