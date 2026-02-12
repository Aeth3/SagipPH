jest.mock("../../package/src/composition/authSession", () => ({
    getCurrentUser: jest.fn(),
}));

const { getCurrentUser } = require("../../package/src/composition/authSession");
const fetchUser = require("../../package/services/fetchUser").default;

describe("fetchUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "log").mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    it("returns user when getCurrentUser is ok", async () => {
        getCurrentUser.mockResolvedValue({
            ok: true,
            value: { id: "u1", email: "a@b.com" },
        });
        const user = await fetchUser();
        expect(user).toEqual({ id: "u1", email: "a@b.com" });
    });

    it("returns null when getCurrentUser is not ok", async () => {
        getCurrentUser.mockResolvedValue({
            ok: false,
            error: { message: "Not found" },
        });
        const user = await fetchUser();
        expect(user).toBeNull();
    });

    it("returns null when result is null", async () => {
        getCurrentUser.mockResolvedValue(null);
        const user = await fetchUser();
        expect(user).toBeNull();
    });
});
