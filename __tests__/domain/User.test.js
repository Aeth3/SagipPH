import { createUser } from "../../package/src/domain/entities/User";

describe("createUser", () => {
    it("creates a frozen user from valid input", () => {
        const user = createUser({
            id: "u1",
            email: "user@example.com",
            first_name: "Jane",
            last_name: "Doe",
        });
        expect(user.id).toBe("u1");
        expect(user.email).toBe("user@example.com");
        expect(user.first_name).toBe("Jane");
        expect(user.last_name).toBe("Doe");
        expect(Object.isFrozen(user)).toBe(true);
    });

    it("trims whitespace from string fields", () => {
        const user = createUser({
            id: "  u2  ",
            email: "user@example.com",
            first_name: "  Al  ",
            last_name: "  B  ",
        });
        expect(user.id).toBe("u2");
        expect(user.first_name).toBe("Al");
        expect(user.last_name).toBe("B");
    });

    it("throws when id is missing", () => {
        expect(() => createUser({ email: "user@example.com" })).toThrow(
            "User id is required"
        );
    });

    it("throws when id is empty string", () => {
        expect(() =>
            createUser({ id: "  ", email: "user@example.com" })
        ).toThrow("User id is required");
    });

    it("sets raw_user_meta_data with first/last name", () => {
        const user = createUser({
            id: "u1",
            email: "user@example.com",
            first_name: "A",
            last_name: "B",
            raw_user_meta_data: { extra: true },
        });
        expect(user.raw_user_meta_data).toEqual({
            extra: true,
            first_name: "A",
            last_name: "B",
        });
    });

    it("defaults strings to empty when not provided", () => {
        const user = createUser({ id: "u1", email: "user@example.com" });
        expect(user.first_name).toBe("");
        expect(user.last_name).toBe("");
    });
});
