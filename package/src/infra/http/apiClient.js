import axios from "axios";
import {
  API_BASE_URL,
  API_TIMEOUT,
  SUPABASE_URL,
  SUPABASE_KEY,
  HTTP_BASE_TARGET,
} from "@env";

let accessTokenProvider = async () => null;
let refreshSessionProvider = null;
let onRefreshFailed = null;

export const setAccessTokenProvider = (provider) => {
  accessTokenProvider = typeof provider === "function" ? provider : async () => null;
};

/**
 * Register a function that refreshes the session and returns a Result.
 * Expected shape: async () => { ok: true, value: { access_token } } | { ok: false, error }
 */
export const setRefreshSessionProvider = (provider) => {
  refreshSessionProvider = typeof provider === "function" ? provider : null;
};

/**
 * Register a callback invoked when token refresh fails (e.g. force logout).
 */
export const setOnRefreshFailed = (callback) => {
  onRefreshFailed = typeof callback === "function" ? callback : null;
};

const normalizeBaseTarget = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "supabase" ? "supabase" : "api";
};

const resolveBaseUrl = () => {
  const target = normalizeBaseTarget(HTTP_BASE_TARGET);

  if (target === "supabase" && SUPABASE_URL) {
    // Supabase JS client adds /rest/v1 automatically for DB queries, but our
    // custom axios client needs it explicitly so table endpoints resolve
    // correctly (e.g. /loans → SUPABASE_URL/rest/v1/loans).
    const base = SUPABASE_URL.replace(/\/+$/, "");
    return base.endsWith("/rest/v1") ? base : `${base}/rest/v1`;
  }

  if (target === "api" && API_BASE_URL) {
    return API_BASE_URL;
  }

  return SUPABASE_URL || API_BASE_URL || "";
};

export const ACTIVE_HTTP_BASE_TARGET = normalizeBaseTarget(HTTP_BASE_TARGET);
export const ACTIVE_HTTP_BASE_URL = resolveBaseUrl();

if (!ACTIVE_HTTP_BASE_URL) {
  // Keep app running but make misconfiguration visible in logs.
  console.warn(
    "[apiClient] Missing base URL. Set HTTP_BASE_TARGET and matching API_BASE_URL/SUPABASE_URL in .env."
  );
}

const apiClient = axios.create({
  baseURL: ACTIVE_HTTP_BASE_URL,
  timeout: Number(API_TIMEOUT),
  headers: {
    "Content-Type": "application/json",
    ...(ACTIVE_HTTP_BASE_TARGET === "supabase" && SUPABASE_KEY
      ? { apikey: SUPABASE_KEY }
      : {}),
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await accessTokenProvider();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Supabase PostgREST needs this header to return the created/updated row.
    if (ACTIVE_HTTP_BASE_TARGET === "supabase") {
      const method = (config.method || "").toUpperCase();
      if (["POST", "PUT", "PATCH"].includes(method)) {
        config.headers.Prefer = "return=representation";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalizedError = {
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        "Network error",
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  }
);

// --- 401 Token Refresh Interceptor ---

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(null, async (error) => {
  const originalRequest = error.config;

  // Only attempt refresh on 401, and not for refresh/auth endpoints themselves
  const isAuthEndpoint =
    originalRequest?.url?.includes("/auth/refresh") ||
    originalRequest?.url?.includes("/auth/otp/") ||
    originalRequest?.url?.includes("/auth/logout");

  if (error.status !== 401 || originalRequest._retry || isAuthEndpoint || !refreshSessionProvider) {
    return Promise.reject(error);
  }

  // If already refreshing, queue this request to retry after refresh completes
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const result = await refreshSessionProvider();

    if (!result?.ok) {
      processQueue(new Error("Refresh failed"));
      if (typeof onRefreshFailed === "function") {
        onRefreshFailed();
      }
      return Promise.reject(error);
    }

    const newToken = result.value?.access_token;
    processQueue(null, newToken);

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError);
    if (typeof onRefreshFailed === "function") {
      onRefreshFailed();
    }
    return Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
});

export default apiClient;
