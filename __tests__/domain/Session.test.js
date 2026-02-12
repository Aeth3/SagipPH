import { createSession } from "../../package/src/domain/entities/Session";

jest.mock("../../package/src/domain/entities/User", () => ({
    createUser: jest.fn((input) => ({
        id: input.id,
        email: input.email,
        first_name: input.first_name || "",
        last_name: input.last_name || "",
    })),
}));

describe("createSession", () => {
    it("creates a frozen session with a string access_token", () => {
        const session = createSession({ access_token: "abc123" });
        expect(session.access_token).toBe("abc123");
        expect(session.refresh_token).toBeUndefined();
        expect(session.user).toBeUndefined();
        expect(Object.isFrozen(session)).toBe(true);
    });

    it("trims whitespace from access_token", () => {
        const session = createSession({ access_token: "  tok  " });
        expect(session.access_token).toBe("tok");
    });

    it("extracts access_token from object with .token", () => {
        const session = createSession({
            access_token: { token: "tok-obj" },
        });
        expect(session.access_token).toBe("tok-obj");
    });

    it("throws when access_token is missing", () => {
        expect(() => createSession({})).toThrow(
            "Session access token is required"
        );
    });

    it("throws when access_token is empty string", () => {
        expect(() => createSession({ access_token: "   " })).toThrow(
            "Session access token is required"
        );
    });

    it("includes refresh_token when provided", () => {
        const session = createSession({
            access_token: "abc",
            refresh_token: "ref",
        });
        expect(session.refresh_token).toBe("ref");
    });

    it("creates user when user input is provided", () => {
        const session = createSession({
            access_token: "abc",
            user: { id: "u1", email: "a@b.com" },
        });
        expect(session.user).toBeDefined();
        expect(session.user.id).toBe("u1");
    });
});
