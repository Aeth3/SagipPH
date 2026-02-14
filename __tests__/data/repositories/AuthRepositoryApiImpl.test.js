const loadAuthRepositoryApiModule = () => {
    jest.resetModules();

    const mockPost = jest.fn();
    const mockGet = jest.fn();

    jest.doMock("../../../package/src/infra/http/apiClient", () => ({
        __esModule: true,
        default: {
            post: mockPost,
            get: mockGet,
        },
    }));

    jest.doMock("package/src/legacyApp", () => ({
        COLORS: { success: "#54D969", danger: "#ff4a5c" },
    }));

    let moduleUnderTest;
    jest.isolateModules(() => {
        moduleUnderTest = require("../../../package/src/data/repositories/AuthRepositoryApiImpl");
    });

    return {
        moduleUnderTest,
        mocks: { post: mockPost, get: mockGet },
    };
};

describe("AuthRepositoryApiImpl", () => {
    describe("sendOtp", () => {
        it("calls POST /auth/otp/send with phone", async () => {
            const { moduleUnderTest, mocks } = loadAuthRepositoryApiModule();
            const repo = new moduleUnderTest.AuthRepositoryApiImpl();

            mocks.post.mockResolvedValue({ success: true });

            await repo.sendOtp({ phone: "+639171234567" });

            expect(mocks.post).toHaveBeenCalledWith("/api/v1/auth/otp/send", {
                phone: "+639171234567",
            });
        });

        it("throws when response.success is false", async () => {
            const { moduleUnderTest, mocks } = loadAuthRepositoryApiModule();
            const repo = new moduleUnderTest.AuthRepositoryApiImpl();

            mocks.post.mockResolvedValue({
                success: false,
                message: "Rate limited",
            });

            await expect(repo.sendOtp({ phone: "+639171234567" })).rejects.toThrow(
                "Rate limited"
            );
        });

        it("throws default message when response has no message", async () => {
            const { moduleUnderTest, mocks } = loadAuthRepositoryApiModule();
            const repo = new moduleUnderTest.AuthRepositoryApiImpl();

            mocks.post.mockResolvedValue({ success: false });

            await expect(repo.sendOtp({ phone: "+639171234567" })).rejects.toThrow(
                "Failed to send OTP"
            );
        });
    });

    describe("verifyOtp", () => {
        it("calls POST /auth/otp/verify and returns mapped user/session", async () => {
            const { moduleUnderTest, mocks } = loadAuthRepositoryApiModule();
            const repo = new moduleUnderTest.AuthRepositoryApiImpl();

            mocks.post.mockResolvedValue({
                user: {
                    id: "u1",
                    email: "user@example.com",
                    phone: "+639171234567",
                    first_name: "Jane",
                    last_name: "Doe",
                },
                access_token: "access-tok",
                refresh_token: "refresh-tok",
            });

            const result = await repo.verifyOtp({
                phone: "+639171234567",
                code: "123456",
            });

            expect(mocks.post).toHaveBeenCalledWith("/api/v1/auth/otp/verify", {
                phone: "+639171234567",
                code: "123456",
            });
            expect(result.user).toBeDefined();
            expect(result.user.id).toBe("u1");
            expect(result.session).toBeDefined();
            expect(result.session.access_token).toBe("access-tok");
        });

        it("propagates API errors", async () => {
            const { moduleUnderTest, mocks } = loadAuthRepositoryApiModule();
            const repo = new moduleUnderTest.AuthRepositoryApiImpl();

            mocks.post.mockRejectedValue({ message: "Invalid OTP", status: 401 });

            await expect(
                repo.verifyOtp({ phone: "+639171234567", code: "000000" })
            ).rejects.toEqual(expect.objectContaining({ message: "Invalid OTP" }));
        });
    });

    describe("signOut", () => {
        it("calls POST /auth/logout", async () => {
            const { moduleUnderTest, mocks } = loadAuthRepositoryApiModule();
            const repo = new moduleUnderTest.AuthRepositoryApiImpl();

            mocks.post.mockResolvedValue({ success: true });

            await repo.signOut();

            expect(mocks.post).toHaveBeenCalledWith("/api/v1/auth/logout");
        });
    });

    describe("getCurrentUser", () => {
        it("calls GET /auth/me and returns mapped user", async () => {
            const { moduleUnderTest, mocks } = loadAuthRepositoryApiModule();
            const repo = new moduleUnderTest.AuthRepositoryApiImpl();

            mocks.get.mockResolvedValue({
                user: {
                    id: "u1",
                    email: "user@example.com",
                    phone: "+639171234567",
                    first_name: "Jane",
                    last_name: "Doe",
                },
            });

            const user = await repo.getCurrentUser();

            expect(mocks.get).toHaveBeenCalledWith("/api/v1/auth/me");
            expect(user).toBeDefined();
            expect(user.id).toBe("u1");
        });

        it("returns null when no user in response", async () => {
            const { moduleUnderTest, mocks } = loadAuthRepositoryApiModule();
            const repo = new moduleUnderTest.AuthRepositoryApiImpl();

            mocks.get.mockResolvedValue({ user: null });

            const user = await repo.getCurrentUser();
            expect(user).toBeNull();
        });
    });

    describe("unused methods throw", () => {
        it("signInWithPassword throws", async () => {
            const { moduleUnderTest } = loadAuthRepositoryApiModule();
            const repo = new moduleUnderTest.AuthRepositoryApiImpl();

            await expect(repo.signInWithPassword()).rejects.toThrow("Not used in phone auth");
        });

        it("signUp throws", async () => {
            const { moduleUnderTest } = loadAuthRepositoryApiModule();
            const repo = new moduleUnderTest.AuthRepositoryApiImpl();

            await expect(repo.signUp()).rejects.toThrow("Not used in phone auth");
        });
    });
});
