import { asyncStorageAdapter } from "../storage/asyncStorageAdapter";
import {
  OTP_DEVICE_COOLDOWN_SECONDS,
  OTP_DEVICE_MAX_ATTEMPTS,
  OTP_DEVICE_WINDOW_SECONDS,
} from "@env";

const OTP_RATE_LIMIT_KEY = "otp_device_rate_limit_v1";
const FALLBACK_MAX_ATTEMPTS = 3;
const FALLBACK_WINDOW_SECONDS = 5 * 60;
const FALLBACK_COOLDOWN_SECONDS = 5 * 60;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const DEFAULT_MAX_ATTEMPTS = toPositiveInt(
  OTP_DEVICE_MAX_ATTEMPTS,
  FALLBACK_MAX_ATTEMPTS
);
const DEFAULT_WINDOW_MS =
  toPositiveInt(OTP_DEVICE_WINDOW_SECONDS, FALLBACK_WINDOW_SECONDS) * 1000;
const DEFAULT_COOLDOWN_MS =
  toPositiveInt(OTP_DEVICE_COOLDOWN_SECONDS, FALLBACK_COOLDOWN_SECONDS) * 1000;

const safeParse = (raw) => {
  if (!raw || typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const normalizeState = (state, now, windowMs) => {
  const normalized = {
    windowStart:
      Number.isFinite(state?.windowStart) && state.windowStart > 0
        ? state.windowStart
        : now,
    attempts:
      Number.isFinite(state?.attempts) && state.attempts > 0 ? state.attempts : 0,
    lockedUntil:
      Number.isFinite(state?.lockedUntil) && state.lockedUntil > 0
        ? state.lockedUntil
        : 0,
  };

  if (normalized.windowStart + windowMs <= now) {
    normalized.windowStart = now;
    normalized.attempts = 0;
  }

  if (normalized.lockedUntil <= now) {
    normalized.lockedUntil = 0;
  }

  return normalized;
};

const saveState = async (state) => {
  await asyncStorageAdapter.setItem(OTP_RATE_LIMIT_KEY, JSON.stringify(state));
};

const loadState = async () => {
  const raw = await asyncStorageAdapter.getItem(OTP_RATE_LIMIT_KEY);
  return safeParse(raw);
};

export const consumeOtpDeviceAttempt = async ({
  now = Date.now(),
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  windowMs = DEFAULT_WINDOW_MS,
  cooldownMs = DEFAULT_COOLDOWN_MS,
} = {}) => {
  const state = normalizeState(await loadState(), now, windowMs);

  if (state.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000),
    };
  }

  if (state.attempts >= maxAttempts) {
    state.lockedUntil = now + cooldownMs;
    await saveState(state);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(cooldownMs / 1000),
    };
  }

  state.attempts += 1;
  await saveState(state);
  return {
    allowed: true,
    retryAfterSeconds: null,
  };
};

export const applyServerOtpCooldown = async (retryAfterSeconds) => {
  const seconds = Number(retryAfterSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return;

  const now = Date.now();
  const state = normalizeState(await loadState(), now, DEFAULT_WINDOW_MS);
  const lockUntil = now + Math.ceil(seconds) * 1000;
  state.lockedUntil = Math.max(state.lockedUntil || 0, lockUntil);
  await saveState(state);
};

export const clearOtpDeviceRateLimit = async () => {
  await asyncStorageAdapter.removeItem(OTP_RATE_LIMIT_KEY);
};
