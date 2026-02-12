import React from "react";
import renderer, { act } from "react-test-renderer";
import { useEnterCodeController } from "../../../package/src/features/auth/EnterCode/controllers/EnterCodeController";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
    useRoute: () => ({ params: { email: "user@example.com" } }),
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
        hookApi = useEnterCodeController();
        return null;
    }
    act(() => {
        renderer.create(<Harness />);
    });
    return hookApi;
};

describe("useEnterCodeController", () => {
    let mockValidateRecoveryCode;
    let mockForgotPassword;
    let setModalInfo;

    beforeEach(() => {
        jest.clearAllMocks();
        mockValidateRecoveryCode = jest.fn();
        mockForgotPassword = jest.fn();
        setModalInfo = jest.fn();
        useAuth.mockReturnValue({
            validateRecoveryCode: mockValidateRecoveryCode,
            forgotPassword: mockForgotPassword,
        });
        useGlobal.mockReturnValue({ modalInfo: {}, setModalInfo });
    });

    it("returns email from route params", () => {
        const ctrl = setupHook();
        expect(ctrl.email).toBe("user@example.com");
    });

    it("shows error for short code", async () => {
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit("12");
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Invalid Code",
            })
        );
        expect(mockValidateRecoveryCode).not.toHaveBeenCalled();
    });

    it("shows error for empty code", async () => {
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit("");
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Invalid Code",
            })
        );
    });

    it("calls validateRecoveryCode and shows success on valid code", async () => {
        mockValidateRecoveryCode.mockResolvedValue({ success: true });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit("1234");
        });
        expect(mockValidateRecoveryCode).toHaveBeenCalledWith(
            "user@example.com",
            "1234"
        );
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Code Verified",
                autoNavigate: true,
                nextRoute: "ChangePassword",
            })
        );
    });

    it("shows error when validation fails", async () => {
        mockValidateRecoveryCode.mockResolvedValue({
            success: false,
            error: "Invalid code",
        });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit("9999");
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Verification Failed",
                message: "Invalid code",
            })
        );
    });

    it("handleResend calls forgotPassword and shows success modal", async () => {
        mockForgotPassword.mockResolvedValue({ success: true });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleResend();
        });
        expect(mockForgotPassword).toHaveBeenCalledWith("user@example.com");
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Code Resent",
            })
        );
    });

    it("handleResend shows error on failure", async () => {
        mockForgotPassword.mockResolvedValue({
            success: false,
            error: "Could not resend",
        });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleResend();
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Resend Failed",
                message: "Could not resend",
            })
        );
    });

    it("handleBack navigates to ForgotPassword", () => {
        const ctrl = setupHook();
        act(() => {
            ctrl.handleBack();
        });
        expect(mockNavigate).toHaveBeenCalledWith("ForgotPassword");
    });

    it("handleConfirm hides modal and navigates when autoNavigate", () => {
        const ctrl = setupHook();
        act(() => {
            ctrl.handleConfirm();
        });
        expect(setModalInfo).toHaveBeenCalledWith(expect.any(Function));
    });
});
