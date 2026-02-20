import {
  sendOtp,
  verifyOtp,
  saveSession,
  signOut,
  clearSession,
  registerUser,
  loginUser,
} from "../../composition/auth/authSession";
import { useGlobal } from "../../../context/context";

const sanitizeError = (message, fallback = "Something went wrong") => {
  if (typeof message !== "string") return fallback;
  const normalized = message.trim();
  return normalized || fallback;
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
      const result = await clearSession();
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

  const register = async (payload) => {
    try {
      setLoading(true);
      const result = await registerUser(payload);
      console.log("register result", result);
      if (!result?.ok) {
        return { success: false, error: sanitizeError(result?.error?.message, "Registration failed") };
      }
      return { success: true, result };
    } catch (error) {
      return { success: false, error: sanitizeError(error.message, "Registration failed") };
    } finally {
      setLoading(false);
    }
  }

  const login = async (payload) => {
    try {
      setLoading(true);
      const result = await loginUser(payload);
      console.log("login result", result);

      if (!result?.ok) {
        return { success: false, error: sanitizeError(result?.error?.message, "Login failed") };
      }
      const { data } = result.value;
      await saveSession(data);
      setAuth(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: sanitizeError(error.message, "Login failed") };
    } finally {
      setLoading(false);
    }
  }
  return { requestOtp, confirmOtp, logout, register, login };
};
