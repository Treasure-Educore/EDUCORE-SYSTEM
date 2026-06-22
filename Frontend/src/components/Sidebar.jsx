import { NavLink } from "react-router-dom";
import { navigationItems } from "../data/navigation";
import {
  AttendanceIcon,
  ClassesIcon,
  DashboardIcon,
  ExamsIcon,
  LibraryIcon,
  MenuIcon,
  ReportsIcon,
  SettingsIcon,
  StudentsIcon,
  TeachersIcon,
} from "./icons";
import { cx } from "../utils/formatters";

const iconMap = {
  dashboard: DashboardIcon,
  students: StudentsIcon,
  teachers: TeachersIcon,
  classes: ClassesIcon,
  attendance: AttendanceIcon,
  exams: ExamsIcon,
  library: LibraryIcon,
  reports: ReportsIcon,
  settings: SettingsIcon,
};

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={cx("sidebar", collapsed && "is-collapsed")}>
      <div className="sidebar__brand">
        <div className="brand-mark">E</div>
        <div className="sidebar__brand-text">
          <strong>Educore</strong>
          <span>School Management</span>
        </div>
      </div>

      <button type="button" className="sidebar__collapse" onClick={onToggle} aria-label="Toggle sidebar">
        <MenuIcon />
      </button>

      <nav className="sidebar__nav">
        {navigationItems.map((item) => {
          const Icon = iconMap[item.icon] || DashboardIcon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cx("sidebar__link", isActive && "is-active")}
            >
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__status">
          <span className="status-dot" />
          <div>
            <strong>Live sync</strong>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
