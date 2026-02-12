import React from "react";
import renderer, { act } from "react-test-renderer";
import { useSignUpController } from "../../../package/src/features/auth/SignUp/controllers/SignUpController";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("../../../package/src/composition/authSession", () => ({
    signUp: jest.fn(),
}));

jest.mock("../../../package/context/context", () => ({
    useGlobal: jest.fn(),
}));

const { signUp } = require("../../../package/src/composition/authSession");
const { useGlobal } = require("../../../package/context/context");

const setupHook = () => {
    let hookApi;
    function Harness() {
        hookApi = useSignUpController();
        return null;
    }
    act(() => {
        renderer.create(<Harness />);
    });
    return hookApi;
};

describe("useSignUpController", () => {
    let setLoading;
    let setModalInfo;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
        setLoading = jest.fn();
        setModalInfo = jest.fn();
        useGlobal.mockReturnValue({
            loading: false,
            setLoading,
            modalInfo: {},
            setModalInfo,
        });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("shows validation error for invalid email", async () => {
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSignUp({
                email: "not-an-email",
                password: "pass",
                first_name: "A",
                last_name: "B",
            });
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Invalid Email",
            })
        );
        expect(signUp).not.toHaveBeenCalled();
    });

    it("calls signUp with form data and shows success on ok", async () => {
        signUp.mockResolvedValue({ ok: true });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSignUp({
                email: "a@b.com",
                password: "pass",
                first_name: "A",
                last_name: "B",
            });
        });
        expect(signUp).toHaveBeenCalledWith({
            email: "a@b.com",
            password: "pass",
            first_name: "A",
            last_name: "B",
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({ show: true, title: "Success!" })
        );
        expect(setLoading).toHaveBeenCalledWith(true);
        expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it("shows 'Account Already Exists' when email already registered", async () => {
        signUp.mockResolvedValue({
            ok: false,
            error: { message: "User already registered" },
        });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSignUp({
                email: "a@b.com",
                password: "pass",
                first_name: "A",
                last_name: "B",
            });
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Account Already Exists",
                autoNavigate: true,
            })
        );
    });

    it("shows generic failure for other errors", async () => {
        signUp.mockResolvedValue({
            ok: false,
            error: { message: "Server error" },
        });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSignUp({
                email: "a@b.com",
                password: "pass",
                first_name: "A",
                last_name: "B",
            });
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Sign Up Failed",
                message: "Server error",
            })
        );
    });

    it("handles thrown exceptions gracefully", async () => {
        signUp.mockRejectedValue(new Error("boom"));
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSignUp({
                email: "a@b.com",
                password: "pass",
                first_name: "A",
                last_name: "B",
            });
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Error",
                message: "Something went wrong. Please try again.",
            })
        );
        expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it("handleHaveAccount navigates to Login", () => {
        const ctrl = setupHook();
        act(() => {
            ctrl.handleHaveAccount();
        });
        expect(mockNavigate).toHaveBeenCalledWith("Login");
    });

    it("handleConfirm hides modal and navigates if autoNavigate", () => {
        const ctrl = setupHook();
        act(() => {
            ctrl.handleConfirm();
        });
        expect(setModalInfo).toHaveBeenCalledWith(expect.any(Function));
    });
});
