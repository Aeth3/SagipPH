import { createUser } from "../../package/src/domain/entities/User";

describe("createUser", () => {
    it("creates a frozen user from valid input with email", () => {
        const user = createUser({
            id: "u1",
            email: "user@example.com",
            first_name: "Jane",
            last_name: "Doe",
        });
        expect(user.id).toBe("u1");
        expect(user.email).toBe("user@example.com");
        expect(user.phone).toBeNull();
        expect(user.first_name).toBe("Jane");
        expect(user.last_name).toBe("Doe");
        expect(Object.isFrozen(user)).toBe(true);
    });

    it("creates a user with phone and no email", () => {
        const user = createUser({
            id: "u1",
            phone: "+639171234567",
            first_name: "Jane",
            last_name: "Doe",
        });
        expect(user.id).toBe("u1");
        expect(user.email).toBeNull();
        expect(user.phone).toBe("+639171234567");
    });

    it("creates a user with both email and phone", () => {
        const user = createUser({
            id: "u1",
            email: "user@example.com",
            phone: "+639171234567",
        });
        expect(user.email).toBe("user@example.com");
        expect(user.phone).toBe("+639171234567");
    });

    it("trims whitespace from string fields", () => {
        const user = createUser({
            id: "  u2  ",
            email: "user@example.com",
            phone: "  +639171234567  ",
            first_name: "  Al  ",
            last_name: "  B  ",
        });
        expect(user.id).toBe("u2");
        expect(user.phone).toBe("+639171234567");
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

    it("sets email to null when not provided", () => {
        const user = createUser({ id: "u1" });
        expect(user.email).toBeNull();
    });

    it("sets phone to null when not provided", () => {
        const user = createUser({ id: "u1", email: "user@example.com" });
        expect(user.phone).toBeNull();
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
