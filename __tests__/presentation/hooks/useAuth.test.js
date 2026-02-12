import React from "react";
import renderer, { act } from "react-test-renderer";
import { useAuth } from "../../../package/src/presentation/hooks/useAuth";
import { useGlobal } from "../../../package/context/context";
import {
  clearSession,
  saveSession,
  sendOtp,
  signOut,
  verifyOtp,
} from "../../../package/src/composition/authSession";

jest.mock("../../../package/context/context", () => ({
  useGlobal: jest.fn(),
}));

jest.mock("../../../package/src/composition/authSession", () => ({
  clearSession: jest.fn(),
  saveSession: jest.fn(),
  sendOtp: jest.fn(),
  signOut: jest.fn(),
  verifyOtp: jest.fn(),
}));

const setupHook = () => {
  let hookApi;
  function HookHarness() {
    hookApi = useAuth();
    return null;
  }

  act(() => {
    renderer.create(<HookHarness />);
  });

  return hookApi;
};

describe("useAuth", () => {
  let setAuth;
  let setLoading;

  beforeEach(() => {
    jest.clearAllMocks();
    setAuth = jest.fn();
    setLoading = jest.fn();
    useGlobal.mockReturnValue({ setAuth, setLoading });
  });

  describe("requestOtp", () => {
    it("returns success when sendOtp succeeds", async () => {
      sendOtp.mockResolvedValue({ ok: true, value: null });
      const auth = setupHook();

      let result;
      await act(async () => {
        result = await auth.requestOtp("+639171234567");
      });

      expect(sendOtp).toHaveBeenCalledWith({ phone: "+639171234567" });
      expect(result).toEqual({ success: true });
      expect(setLoading).toHaveBeenNthCalledWith(1, true);
      expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it("returns failure when sendOtp fails", async () => {
      sendOtp.mockResolvedValue({
        ok: false,
        error: { message: "Rate limited" },
      });
      const auth = setupHook();

      let result;
      await act(async () => {
        result = await auth.requestOtp("+639171234567");
      });

      expect(result).toEqual({ success: false, error: "Rate limited" });
      expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it("returns failure when sendOtp throws", async () => {
      sendOtp.mockRejectedValue(new Error("Network error"));
      const auth = setupHook();

      let result;
      await act(async () => {
        result = await auth.requestOtp("+639171234567");
      });

      expect(result).toEqual({ success: false, error: "Network error" });
    });
  });

  describe("confirmOtp", () => {
    it("returns success, saves session, and sets auth", async () => {
      verifyOtp.mockResolvedValue({
        ok: true,
        value: {
          user: { id: "u1", phone: "+639171234567" },
          session: { access_token: "tok" },
        },
      });
      saveSession.mockResolvedValue(undefined);
      const auth = setupHook();

      let result;
      await act(async () => {
        result = await auth.confirmOtp("+639171234567", "123456");
      });

      expect(verifyOtp).toHaveBeenCalledWith({
        phone: "+639171234567",
        code: "123456",
      });
      expect(saveSession).toHaveBeenCalledWith({ access_token: "tok" });
      expect(setAuth).toHaveBeenCalledWith({ id: "u1", phone: "+639171234567" });
      expect(result).toEqual({
        success: true,
        user: { id: "u1", phone: "+639171234567" },
      });
      expect(setLoading).toHaveBeenNthCalledWith(1, true);
      expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it("returns failure when verifyOtp fails", async () => {
      verifyOtp.mockResolvedValue({
        ok: false,
        error: { message: "Invalid code" },
      });
      const auth = setupHook();

      let result;
      await act(async () => {
        result = await auth.confirmOtp("+639171234567", "000000");
      });

      expect(result).toEqual({ success: false, error: "Invalid code" });
      expect(saveSession).not.toHaveBeenCalled();
      expect(setAuth).not.toHaveBeenCalled();
    });

    it("returns failure when verifyOtp throws", async () => {
      verifyOtp.mockRejectedValue(new Error("Server error"));
      const auth = setupHook();

      let result;
      await act(async () => {
        result = await auth.confirmOtp("+639171234567", "123456");
      });

      expect(result).toEqual({ success: false, error: "Server error" });
    });
  });

  describe("logout", () => {
    it("clears session and resets auth on success", async () => {
      signOut.mockResolvedValue({ ok: true });
      clearSession.mockResolvedValue(undefined);
      const auth = setupHook();

      await act(async () => {
        await auth.logout();
      });

      expect(signOut).toHaveBeenCalled();
      expect(clearSession).toHaveBeenCalled();
      expect(setAuth).toHaveBeenCalledWith(null);
      expect(setLoading).toHaveBeenNthCalledWith(1, true);
      expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it("does not clear session when signOut fails", async () => {
      signOut.mockResolvedValue({
        ok: false,
        error: { message: "Sign out failed" },
      });
      const auth = setupHook();

      await act(async () => {
        await auth.logout();
      });

      expect(clearSession).not.toHaveBeenCalled();
      expect(setAuth).not.toHaveBeenCalled();
      expect(setLoading).toHaveBeenLastCalledWith(false);
    });
  });
});
