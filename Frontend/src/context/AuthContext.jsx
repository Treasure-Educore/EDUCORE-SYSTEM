import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearStoredSession, loadStoredSession, persistSession } from "../lib/auth";
import { clearSelectedRole, loadSelectedRole } from "../data/roles";

const AuthContext = createContext(null);

function normalizeStoredUser(storedValue) {
  if (!storedValue || typeof storedValue !== "object") {
    return null;
  }

  const source = storedValue.user && typeof storedValue.user === "object" ? storedValue.user : storedValue;
  const username = source.username || storedValue.username || null;
  const role = source.role || storedValue.role || null;

  if (!username || !role) {
    return storedValue.accessToken ? { username: username || "user", role, isAuthenticated: true } : null;
  }

  return {
    ...source,
    username,
    role,
    isAuthenticated: Boolean(source.isAuthenticated ?? storedValue.isAuthenticated ?? storedValue.accessToken ?? true),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => normalizeStoredUser(loadStoredSession()));

  useEffect(() => {
    persistSession(user);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.isAuthenticated),
      role: user?.role || null,
      async login(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password?.trim();
        const selectedRole = credentials?.role || loadSelectedRole();

        // TEMPORARY MOCK AUTHENTICATION FOR DEVELOPMENT
        // Replace this block with the real backend login request later.
        if (!username || !password) {
          throw new Error("Both username and password are required.");
        }

        if (!selectedRole) {
          throw new Error("Please select a role before signing in.");
        }

        // TEMPORARY MOCK AUTHENTICATION FOR DEVELOPMENT
        // This local session is intentionally simple so a real API can replace it later.
        const nextUser = {
          username,
          role: selectedRole,
          isAuthenticated: true,
        };

        setUser(nextUser);
        persistSession(nextUser);
        return nextUser;
      },
      logout() {
        // TEMPORARY MOCK AUTHENTICATION FOR DEVELOPMENT
        // Clearing both browser storage locations prevents stale sessions from restoring.
        clearStoredSession();
        clearSelectedRole();
        setUser(null);
      },
      updateUser(updates) {
        setUser((current) => {
          if (!current) {
            return current;
          }

          const nextUser = typeof updates === "function" ? updates(current) : { ...current, ...updates };
          const normalized = {
            ...current,
            ...nextUser,
            isAuthenticated: true,
          };

          persistSession(normalized);
          return normalized;
        });
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
