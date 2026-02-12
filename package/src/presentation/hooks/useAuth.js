import {
  sendOtp,
  verifyOtp,
  saveSession,
  signOut,
  clearSession,
} from "../../composition/authSession";
import { useGlobal } from "../../../context/context";

export const useAuth = () => {
  const { setAuth, setLoading } = useGlobal();

  const requestOtp = async (phone) => {
    try {
      setLoading(true);
      const result = await sendOtp({ phone });
      if (!result?.ok) {
        return { success: false, error: result?.error?.message || "Failed to send OTP" };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (phone, code) => {
    try {
      setLoading(true);
      const result = await verifyOtp({ phone, code });
      if (!result?.ok) {
        return { success: false, error: result?.error?.message || "Verification failed" };
      }

      const { user, session } = result.value;
      await saveSession(session);
      setAuth(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
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