import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import PrincipalSidebar from "../components/principal/PrincipalSidebar";
import PrincipalTopbar from "../components/principal/PrincipalTopbar";
import { useAuth } from "../context/AuthContext";
import { principalNavigation } from "../data/principalNavigation";

const pageTitleMap = principalNavigation.reduce((accumulator, group) => {
  accumulator[`/principal/${group.key}`] = group.label;
  group.items.forEach((item) => {
    accumulator[item.path] = item.label;
  });
  return accumulator;
}, { "/principal/overview": "Overview", "/principal/staff": "Staff Management", "/principal/departments": "Departments" });

export default function PrincipalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout, isAuthenticated } = useAuth();
  const allowDevelopmentBypass = import.meta.env.DEV;
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("educore.principal.sidebar") === "collapsed";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState("dashboard");

  useEffect(() => {
    try {
      localStorage.setItem("educore.principal.sidebar", collapsed ? "collapsed" : "expanded");
    } catch {
      // Ignore storage failures so the principal shell still renders.
    }
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const activeGroup = principalNavigation.find((group) =>
      group.items.some((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)),
    );

    if (activeGroup) {
      setOpenGroup(activeGroup.key);
    }
  }, [location.pathname]);

  const title = useMemo(() => {
    if (location.pathname === "/principal/staff/new") return "Register Staff";
    if (/^\/principal\/staff\/[^/]+\/edit$/.test(location.pathname)) return "Edit Staff";
    if (/^\/principal\/staff\/[^/]+\/roles$/.test(location.pathname)) return "Assign Roles";
    if (/^\/principal\/staff\/[^/]+$/.test(location.pathname)) return "Staff Profile";
    if (location.pathname === "/principal/students/registration") return "Student Registration";
    if (/^\/principal\/students\/registration\/[^/]+\/edit$/.test(location.pathname)) return "Edit Student Registration";
    return pageTitleMap[location.pathname] || "Principal Dashboard";
  }, [location.pathname]);
  const hasPrincipalAccess = role === "principal" || role === "head-teacher" || role === "dos" || role === "non-teaching-staff";

  if (!isAuthenticated && !allowDevelopmentBypass) {
    return <Navigate to="/" replace />;
  }

  if (!hasPrincipalAccess && !allowDevelopmentBypass) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={`${collapsed ? "principal-shell is-collapsed" : "principal-shell"} ${mobileOpen ? "is-mobile-open" : ""}`}>
      <div className={mobileOpen ? "principal-shell__overlay is-open" : "principal-shell__overlay"} onClick={() => setMobileOpen(false)} />
      <PrincipalSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        openGroup={openGroup}
        onToggleGroup={(groupKey) => setOpenGroup((current) => (current === groupKey ? "" : groupKey))}
      />

      <div className="principal-shell__main">
        <PrincipalTopbar
          title={title}
          user={user}
          onMenuToggle={() => {
            if (window.innerWidth < 960) {
              setMobileOpen((value) => !value);
            } else {
              setCollapsed((value) => !value);
            }
          }}
          onSignOut={() => {
            logout();
            navigate("/", { replace: true });
          }}
        />
        <main className="principal-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
