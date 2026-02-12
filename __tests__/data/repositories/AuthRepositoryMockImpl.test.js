import { AuthRepositoryMockImpl } from "../../../package/src/data/repositories/AuthRepositoryMockImpl";

describe("AuthRepositoryMockImpl", () => {
  it("signInWithPassword returns user+session and updates current user", async () => {
    const repo = new AuthRepositoryMockImpl();

    const result = await repo.signInWithPassword({
      email: "tester@example.com",
      password: "secret123",
    });

    expect(result.user).toEqual(
      expect.objectContaining({
        email: "tester@example.com",
      })
    );
    expect(result.session).toEqual(
      expect.objectContaining({
        access_token: expect.stringMatching(/^demo_access_/),
        refresh_token: expect.stringMatching(/^demo_refresh_/),
      })
    );
    await expect(repo.getCurrentUser()).resolves.toEqual(result.user);
  });

  it("signOut clears current user", async () => {
    const repo = new AuthRepositoryMockImpl();
    await repo.signInWithPassword({
      email: "tester@example.com",
      password: "secret123",
    });

    await repo.signOut();
    await expect(repo.getCurrentUser()).resolves.toBeNull();
  });

  it("recovery flow validates email+code", async () => {
    const repo = new AuthRepositoryMockImpl();

    await repo.requestPasswordReset({ email: "user@example.com" });
    await expect(
      repo.verifyRecoveryCode({ email: "user@example.com", code: "1234" })
    ).resolves.toBeUndefined();

    await expect(
      repo.verifyRecoveryCode({ email: "other@example.com", code: "1234" })
    ).rejects.toThrow("Invalid recovery code");
  });

  it("updatePassword validates required password", async () => {
    const repo = new AuthRepositoryMockImpl();

    await expect(repo.updatePassword({ password: "nextPassword" })).resolves.toBeUndefined();
    await expect(repo.updatePassword({ password: "" })).rejects.toThrow("Password is required");
  });

  describe("sendOtp / verifyOtp", () => {
    it("sendOtp stores pending phone and code", async () => {
      const repo = new AuthRepositoryMockImpl();
      await repo.sendOtp({ phone: "+639171234567" });

      expect(repo.pendingPhone).toBe("+639171234567");
      expect(repo.pendingCode).toBe("123456");
    });

    it("verifyOtp returns user and session when code matches", async () => {
      const repo = new AuthRepositoryMockImpl();
      await repo.sendOtp({ phone: "+639171234567" });

      const result = await repo.verifyOtp({
        phone: "+639171234567",
        code: "123456",
      });

      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.session.access_token).toEqual(
        expect.stringMatching(/^demo_access_/)
      );
    });

    it("verifyOtp throws when code is wrong", async () => {
      const repo = new AuthRepositoryMockImpl();
      await repo.sendOtp({ phone: "+639171234567" });

      await expect(
        repo.verifyOtp({ phone: "+639171234567", code: "000000" })
      ).rejects.toThrow("Invalid OTP code");
    });

    it("verifyOtp throws when phone is wrong", async () => {
      const repo = new AuthRepositoryMockImpl();
      await repo.sendOtp({ phone: "+639171234567" });

      await expect(
        repo.verifyOtp({ phone: "+639999999999", code: "123456" })
      ).rejects.toThrow("Invalid OTP code");
    });

    it("verifyOtp throws when no OTP was sent", async () => {
      const repo = new AuthRepositoryMockImpl();

      await expect(
        repo.verifyOtp({ phone: "+639171234567", code: "123456" })
      ).rejects.toThrow("Invalid OTP code");
    });
  });

});
