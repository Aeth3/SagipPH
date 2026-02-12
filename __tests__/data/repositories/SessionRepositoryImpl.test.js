import { SessionRepositoryImpl } from "../../../package/src/data/repositories/SessionRepositoryImpl";

jest.mock("../../../package/src/infra/storage/asyncStorageAdapter", () => ({
    asyncStorageAdapter: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
}));

const {
    asyncStorageAdapter,
} = require("../../../package/src/infra/storage/asyncStorageAdapter");

describe("SessionRepositoryImpl", () => {
    let repo;

    beforeEach(() => {
        jest.clearAllMocks();
        repo = new SessionRepositoryImpl();
    });

    describe("saveSession", () => {
        it("serializes session and saves to storage", async () => {
            asyncStorageAdapter.setItem.mockResolvedValue(undefined);
            const session = { access_token: "tok", refresh_token: "ref" };
            await repo.saveSession(session);
            expect(asyncStorageAdapter.setItem).toHaveBeenCalledWith(
                "user_session",
                JSON.stringify(session)
            );
        });
    });

    describe("getSession", () => {
        it("returns parsed session from storage", async () => {
            const stored = JSON.stringify({ access_token: "tok" });
            asyncStorageAdapter.getItem.mockResolvedValue(stored);
            const session = await repo.getSession();
            expect(session).toEqual({ access_token: "tok" });
        });

        it("returns null when storage is empty", async () => {
            asyncStorageAdapter.getItem.mockResolvedValue(null);
            const session = await repo.getSession();
            expect(session).toBeNull();
        });
    });

    describe("clearSession", () => {
        it("removes session from storage", async () => {
            asyncStorageAdapter.removeItem.mockResolvedValue(undefined);
            await repo.clearSession();
            expect(asyncStorageAdapter.removeItem).toHaveBeenCalledWith(
                "user_session"
            );
        });
    });

    describe("getAccessToken", () => {
        it("returns string access_token from session", async () => {
            asyncStorageAdapter.getItem.mockResolvedValue(
                JSON.stringify({ access_token: "abc" })
            );
            const token = await repo.getAccessToken();
            expect(token).toBe("abc");
        });

        it("returns token from accessToken camelCase key", async () => {
            asyncStorageAdapter.getItem.mockResolvedValue(
                JSON.stringify({ accessToken: "camel-tok" })
            );
            const token = await repo.getAccessToken();
            expect(token).toBe("camel-tok");
        });

        it("returns token from object with .token", async () => {
            asyncStorageAdapter.getItem.mockResolvedValue(
                JSON.stringify({ access_token: { token: "nested-tok" } })
            );
            const token = await repo.getAccessToken();
            expect(token).toBe("nested-tok");
        });

        it("returns null when no session exists", async () => {
            asyncStorageAdapter.getItem.mockResolvedValue(null);
            const token = await repo.getAccessToken();
            expect(token).toBeNull();
        });

        it("returns null when access_token is missing", async () => {
            asyncStorageAdapter.getItem.mockResolvedValue(
                JSON.stringify({ other: "data" })
            );
            const token = await repo.getAccessToken();
            expect(token).toBeNull();
        });
    });
});
