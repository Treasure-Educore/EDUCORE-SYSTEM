import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import AuthEntry from "../components/AuthEntry";
import { clearSelectedRole, loadSelectedRole, roles } from "../data/roles";

const roleLabels = Object.fromEntries(roles.map((role) => [role.key, role.label]));

function getPostLoginPath(role) {
  if (["principal", "head-teacher", "dos", "non-teaching-staff"].includes(role)) {
    return "/principal/overview";
  }

  return "/dashboard";
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [fieldError, setFieldError] = useState("");
  const role = new URLSearchParams(location.search).get("role") || loadSelectedRole();
  const roleLabel = roleLabels[role] || "School role";
  const selectedRole = role && roleLabels[role] ? role : null;

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (_data, variables) => {
      navigate(getPostLoginPath(variables?.role), { replace: true });
    },
  });

  if (isAuthenticated) {
    return <Navigate to={getPostLoginPath(role)} replace />;
  }

  if (!selectedRole) {
    return <AuthEntry />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFieldError("");

    if (!form.username.trim() || !form.password.trim()) {
      setFieldError("Both username and password are required.");
      return;
    }

    mutation.mutate({ ...form, role: selectedRole });
  }

  function handleChangeRole() {
    clearSelectedRole();
    setForm({ username: "", password: "" });
    setFieldError("");
    navigate("/", { replace: true });
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-card__badge">SM</div>
        <p className="auth-eyebrow">SUMMIT ACADEMY</p>
        <h1>{roleLabel} Sign In</h1>
        <p className="auth-copy">
          Sign in with your credentials to access the {roleLabel.toLowerCase()} workspace.
        </p>
        <p className="auth-role-pill">{roleLabel}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Username</span>
            <input
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </label>

          {fieldError ? <p className="auth-error">{fieldError}</p> : null}
          {mutation.isError ? <p className="auth-error">{mutation.error.message}</p> : null}

          <button type="submit" className="auth-button" disabled={mutation.isPending}>
            {mutation.isPending ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            className="auth-button auth-button--secondary"
            onClick={handleChangeRole}
            aria-label="Change role and return to role selection"
          >
            Change Role
          </button>
        </form>
      </section>
    </main>
  );
}
