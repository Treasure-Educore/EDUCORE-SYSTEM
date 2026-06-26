import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const allowDevelopmentBypass = import.meta.env.DEV && location.pathname !== "/login";

  useEffect(() => {
    if (!isAuthenticated && !allowDevelopmentBypass && location.pathname !== "/") {
      navigate("/", { replace: true, state: { from: location.pathname } });
    }
  }, [isAuthenticated, allowDevelopmentBypass, location.pathname, navigate]);

  if (!isAuthenticated && !allowDevelopmentBypass) {
    return null;
  }

  return <Outlet />;
}
