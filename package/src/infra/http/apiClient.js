import axios from "axios";
import {
  API_BASE_URL,
  API_TIMEOUT,
  SUPABASE_URL,
  SUPABASE_KEY,
  HTTP_BASE_TARGET,
} from "@env";

let accessTokenProvider = async () => null;

export const setAccessTokenProvider = (provider) => {
  accessTokenProvider = typeof provider === "function" ? provider : async () => null;
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

export default apiClient;
