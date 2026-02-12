import { createPhone } from "../../package/src/domain/entities/Phone";

describe("createPhone", () => {
    it("returns a valid PH phone number as-is", () => {
        expect(createPhone("+639171234567")).toBe("+639171234567");
    });

    it("trims whitespace", () => {
        expect(createPhone("  +639171234567  ")).toBe("+639171234567");
    });

    it("throws when phone is empty", () => {
        expect(() => createPhone("")).toThrow("Phone number is required");
    });

    it("throws when phone is null", () => {
        expect(() => createPhone(null)).toThrow("Phone number is required");
    });

    it("throws when phone is undefined", () => {
        expect(() => createPhone(undefined)).toThrow("Phone number is required");
    });

    it("throws for non-PH format (missing +63)", () => {
        expect(() => createPhone("09171234567")).toThrow("Invalid PH phone number");
    });

    it("throws for too few digits after +63", () => {
        expect(() => createPhone("+63917123456")).toThrow("Invalid PH phone number");
    });

    it("throws for too many digits after +63", () => {
        expect(() => createPhone("+6391712345678")).toThrow("Invalid PH phone number");
    });

    it("throws for non-numeric characters", () => {
        expect(() => createPhone("+63917abc4567")).toThrow("Invalid PH phone number");
    });

    it("throws for US phone format", () => {
        expect(() => createPhone("+12125551234")).toThrow("Invalid PH phone number");
    });
});
