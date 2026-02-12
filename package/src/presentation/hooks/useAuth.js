import {
  sendOtp,
  verifyOtp,
  saveSession,
  signOut,
  clearSession,
} from "../../composition/authSession";
import { useGlobal } from "../../../context/context";

const USER_FACING_ERRORS = [
  "Phone number is required",
  "Invalid PH phone number",
  "OTP code is required",
  "OTP code must be exactly 6 digits",
  "Failed to send OTP",
  "Verification failed",
  "Invalid OTP code",
  "Invalid code",
  "OTP code has expired",
  "Too many attempts",
  "No user returned",
  "No session returned",
  "Sign out failed",
  "Network error",
  "Rate limited",
];

const sanitizeError = (message, fallback = "Something went wrong") => {
  if (!message || typeof message !== "string") return fallback;
  const isUserFacing = USER_FACING_ERRORS.some(
    (safe) => message.toLowerCase().includes(safe.toLowerCase())
  );
  return isUserFacing ? message : fallback;
};

export const useAuth = () => {
  const { setAuth, setLoading } = useGlobal();

  const requestOtp = async (phone) => {
    try {
      setLoading(true);
      const result = await sendOtp({ phone });
      if (!result?.ok) {
        return { success: false, error: sanitizeError(result?.error?.message, "Failed to send OTP") };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: sanitizeError(error.message, "Failed to send OTP") };
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (phone, code) => {
    try {
      setLoading(true);
      const result = await verifyOtp({ phone, code });
      if (!result?.ok) {
        return { success: false, error: sanitizeError(result?.error?.message, "Verification failed") };
      }

      const { user, session } = result.value;
      await saveSession(session);
      setAuth(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: sanitizeError(error.message, "Verification failed") };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const result = await signOut();
      if (!result?.ok) {
        throw new Error(result?.error?.message || "Sign out failed");
      }
      await clearSession();
      setAuth(null);
    } catch (error) {
      console.error("Logout failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return { requestOtp, confirmOtp, logout };
};