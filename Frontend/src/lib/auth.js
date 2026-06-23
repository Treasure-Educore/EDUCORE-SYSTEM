import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_URL = import.meta.env.VITE_JWT_TOKEN_URL || "/token/";
const REFRESH_URL = import.meta.env.VITE_JWT_REFRESH_URL || "/token/refresh/";
const STORAGE_KEY = "educore.auth";

export const authHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let sessionHandlers = {
  getSession: () => null,
  setSession: () => {},
  clearSession: () => {},
};

export function configureSessionHandlers(handlers) {
  sessionHandlers = {
    ...sessionHandlers,
    ...handlers,
  };
}

export function loadStoredSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistSession(session) {
  if (typeof window === "undefined") return;

  try {
    if (!session) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    const serialized = JSON.stringify(session);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    window.sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignore storage failures so logout/login never blanks the UI.
  }
}

export function clearStoredSession() {
  persistSession(null);
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

export function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
}

export function deriveUser(accessToken, fallbackUsername) {
  const payload = accessToken ? decodeJwt(accessToken) : null;
  if (!payload) {
    return fallbackUsername ? { username: fallbackUsername, displayName: fallbackUsername } : null;
  }

  const displayName =
    payload.name ||
    [payload.first_name, payload.last_name].filter(Boolean).join(" ").trim() ||
    payload.username ||
    payload.email ||
    fallbackUsername ||
    "User";

  return {
    id: payload.user_id || payload.sub || payload.id || null,
    username: payload.username || payload.email || fallbackUsername || displayName,
    email: payload.email || null,
    displayName,
    raw: payload,
  };
}

function extractAccessToken(data) {
  return data?.access || data?.access_token || null;
}

function extractRefreshToken(data) {
  return data?.refresh || data?.refresh_token || null;
}

export async function requestToken(credentials) {
  return authHttp.post(TOKEN_URL, credentials, {
    skipAuthRefresh: true,
  });
}

export async function requestRefresh(refreshToken) {
  return authHttp.post(
    REFRESH_URL,
    { refresh: refreshToken },
    {
      skipAuthRefresh: true,
    },
  );
}

apiHttp.interceptors.request.use((config) => {
  const session = sessionHandlers.getSession();
  if (session?.accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

apiHttp.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (!originalRequest || status !== 401 || originalRequest.skipAuthRefresh || originalRequest._retry) {
      return Promise.reject(error);
    }

    const session = sessionHandlers.getSession();
    if (!session?.refreshToken) {
      sessionHandlers.clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await requestRefresh(session.refreshToken);
      const nextAccessToken = extractAccessToken(data);
      const nextRefreshToken = extractRefreshToken(data) || session.refreshToken;

      if (!nextAccessToken) {
        throw new Error("Refresh response did not include an access token.");
      }

      const nextSession = {
        ...session,
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      };

      sessionHandlers.setSession(nextSession);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

      return apiHttp(originalRequest);
    } catch (refreshError) {
      sessionHandlers.clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export async function loginWithCredentials(credentials) {
  const { data } = await requestToken(credentials);
  const accessToken = extractAccessToken(data);
  const refreshToken = extractRefreshToken(data);

  if (!accessToken || !refreshToken) {
    throw new Error("Login response must include access and refresh tokens.");
  }

  return {
    accessToken,
    refreshToken,
    user: data.user || deriveUser(accessToken, credentials.username),
  };
}
