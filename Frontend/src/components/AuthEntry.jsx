import { useEffect } from "react";
import { Link } from "react-router-dom";
import { persistSelectedRole, roles } from "../data/roles";
import { DashboardIcon, TeachersIcon, StudentsIcon, LibraryIcon, SettingsIcon, ExamsIcon } from "./icons";

const roleIcons = {
  principal: DashboardIcon,
  "head-teacher": TeachersIcon,
  dos: ExamsIcon,
  teacher: StudentsIcon,
  "non-teaching-staff": SettingsIcon,
  librarian: LibraryIcon,
};

export default function AuthEntry() {
  useEffect(() => {
    document.title = "School Management System | EDUCORE";
  }, []);

  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <div className="landing-brand">
          <div className="landing-logo" aria-hidden="true">
            SM
          </div>
          <div className="landing-brand-copy">
            <p className="landing-eyebrow">SUMMIT ACADEMY</p>
            <h1>School Management System</h1>
            <p className="landing-subtitle">
              Choose your role to continue into the modern school management dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="role-grid" aria-label="Choose your role">
        {roles.map((role, index) => {
          const Icon = roleIcons[role.key] || DashboardIcon;
          const titleId = `role-${role.key}-title`;
          const descId = `role-${role.key}-desc`;

          return (
            <Link
              key={role.key}
              to={role.href}
              className="role-card"
              aria-labelledby={titleId}
              aria-describedby={descId}
              onClick={() => persistSelectedRole(role.key)}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="role-card__icon" aria-hidden="true">
                <Icon />
              </span>
              <h2 id={titleId}>{role.label}</h2>
              <p id={descId}>{role.description}</p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
