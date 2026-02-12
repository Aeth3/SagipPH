const loadAuthRepositoryImplModule = () => {
  jest.resetModules();

  const signInWithPassword = jest.fn();
  const signUp = jest.fn();
  const signOut = jest.fn();
  const getUser = jest.fn();
  const resetPasswordForEmail = jest.fn();
  const verifyOtp = jest.fn();
  const updateUser = jest.fn();

  jest.doMock("../../../package/src/infra/supabase/supabaseClient", () => ({
    supabase: {
      auth: {
        signInWithPassword,
        signUp,
        signOut,
        getUser,
        resetPasswordForEmail,
        verifyOtp,
        updateUser,
      },
    },
  }));

  let moduleUnderTest;
  jest.isolateModules(() => {
    moduleUnderTest = require("../../../package/src/data/repositories/AuthRepositoryImpl");
  });

  return {
    moduleUnderTest,
    mocks: {
      signInWithPassword,
      signUp,
      signOut,
      getUser,
      resetPasswordForEmail,
      verifyOtp,
      updateUser,
    },
  };
};

describe("AuthRepositoryImpl", () => {
  it("maps signInWithPassword response to domain user/session", async () => {
    const { moduleUnderTest, mocks } = loadAuthRepositoryImplModule();
    const repo = new moduleUnderTest.AuthRepositoryImpl();

    mocks.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "user@example.com",
          user_metadata: { first_name: "Jane", last_name: "Doe" },
        },
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
        },
      },
      error: null,
    });

    const result = await repo.signInWithPassword({
      email: "user@example.com",
      password: "secret123",
    });

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.user).toEqual({
      id: "u1",
      email: "user@example.com",
      phone: null,
      first_name: "Jane",
      last_name: "Doe",
      raw_user_meta_data: { first_name: "Jane", last_name: "Doe" },
    });
    expect(result.session).toEqual({
      access_token: "access-token",
      refresh_token: "refresh-token",
      user: result.user,
    });
  });

  it("normalizes network-like errors", async () => {
    const { moduleUnderTest, mocks } = loadAuthRepositoryImplModule();
    const repo = new moduleUnderTest.AuthRepositoryImpl();

    mocks.signInWithPassword.mockRejectedValue(new Error("Network request failed"));

    await expect(
      repo.signInWithPassword({ email: "user@example.com", password: "secret123" })
    ).rejects.toThrow(
      "Unable to reach Supabase. Check emulator internet, SUPABASE_URL/SUPABASE_KEY in .env, then rebuild with Metro cache reset."
    );
  });

  it("calls recovery/update methods with expected payloads", async () => {
    const { moduleUnderTest, mocks } = loadAuthRepositoryImplModule();
    const repo = new moduleUnderTest.AuthRepositoryImpl();

    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
    mocks.verifyOtp.mockResolvedValue({ error: null });
    mocks.updateUser.mockResolvedValue({ error: null });

    await repo.requestPasswordReset({ email: "user@example.com" });
    await repo.verifyRecoveryCode({ email: "user@example.com", code: "1234" });
    await repo.updatePassword({ password: "secret123" });

    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith("user@example.com");
    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      email: "user@example.com",
      token: "1234",
      type: "recovery",
    });
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: "secret123" });
  });

  it("getCurrentUser returns null when supabase user is null", async () => {
    const { moduleUnderTest, mocks } = loadAuthRepositoryImplModule();
    const repo = new moduleUnderTest.AuthRepositoryImpl();

    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await repo.getCurrentUser();
    expect(result).toBeNull();
  });
});
