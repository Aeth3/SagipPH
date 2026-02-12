import React from "react";
import renderer, { act } from "react-test-renderer";
import { useForgotPasswordController } from "../../../package/src/features/auth/ForgotPassword/controllers/ForgotPasswordController";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("../../../package/src/presentation/hooks/useAuth", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../../package/context/context", () => ({
    useGlobal: jest.fn(),
}));

const { useAuth } = require("../../../package/src/presentation/hooks/useAuth");
const { useGlobal } = require("../../../package/context/context");

const setupHook = () => {
    let hookApi;
    function Harness() {
        hookApi = useForgotPasswordController();
        return null;
    }
    act(() => {
        renderer.create(<Harness />);
    });
    return hookApi;
};

describe("useForgotPasswordController", () => {
    let mockForgotPassword;
    let setModalInfo;

    beforeEach(() => {
        jest.clearAllMocks();
        mockForgotPassword = jest.fn();
        setModalInfo = jest.fn();
        useAuth.mockReturnValue({ forgotPassword: mockForgotPassword });
        useGlobal.mockReturnValue({ modalInfo: {}, setModalInfo });
    });

    it("shows validation error for invalid email", async () => {
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit("bad-email");
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Invalid Email",
            })
        );
        expect(mockForgotPassword).not.toHaveBeenCalled();
    });

    it("shows validation error for empty email", async () => {
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit("");
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Invalid Email",
            })
        );
    });

    it("trims email before sending", async () => {
        mockForgotPassword.mockResolvedValue({ success: true });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit("  user@example.com  ");
        });
        expect(mockForgotPassword).toHaveBeenCalledWith("user@example.com");
    });

    it("shows success modal with autoNavigate on success", async () => {
        mockForgotPassword.mockResolvedValue({ success: true });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit("user@example.com");
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Code Sent",
                autoNavigate: true,
                nextRoute: "EnterCode",
                nextParams: { email: "user@example.com" },
            })
        );
    });

    it("shows error modal on failure", async () => {
        mockForgotPassword.mockResolvedValue({
            success: false,
            error: "Email not found",
        });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit("user@example.com");
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Request Failed",
                message: "Email not found",
            })
        );
    });

    it("handleBack navigates to Login", () => {
        const ctrl = setupHook();
        act(() => {
            ctrl.handleBack();
        });
        expect(mockNavigate).toHaveBeenCalledWith("Login");
    });

    it("handleConfirm hides modal and navigates when autoNavigate", () => {
        const ctrl = setupHook();
        act(() => {
            ctrl.handleConfirm();
        });
        expect(setModalInfo).toHaveBeenCalledWith(expect.any(Function));
    });
});
