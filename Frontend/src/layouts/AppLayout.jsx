import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { navigationItems } from "../data/navigation";
import { useAuth } from "../context/AuthContext";

const pageTitleMap = Object.fromEntries(navigationItems.map((item) => [item.path, item.label]));

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const allowDevelopmentBypass = import.meta.env.DEV;
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("educore.sidebar") === "collapsed";
    } catch {
      return false;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("educore.sidebar", collapsed ? "collapsed" : "expanded");
    } catch {
      // Ignore storage failures so the shell still renders.
    }
  }, [collapsed]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated && !allowDevelopmentBypass) {
    return null;
  }

  const currentTitle = useMemo(() => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname.startsWith("/students/")) return "Student Profile";
    return pageTitleMap[location.pathname] || "School Management";
  }, [location.pathname]);

  return (
    <div className={`${collapsed ? "app-shell is-collapsed" : "app-shell"} ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />

      <div className="app-shell__main">
        <Navbar
          title={currentTitle}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onMenuToggle={() => setSidebarOpen((value) => !value)}
          user={user}
          onSignOut={() => {
            logout();
            navigate("/", { replace: true });
          }}
        />
        <main className="content">
          <Outlet context={{ searchValue, setSearchValue, location }} />
        </main>
      </div>
    </div>
  );
}
