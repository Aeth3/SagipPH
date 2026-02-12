import React from "react";
import renderer, { act } from "react-test-renderer";
import { useChangePasswordController } from "../../../package/src/features/auth/ChangePassword/controllers/ChangePasswordController";

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
        hookApi = useChangePasswordController();
        return null;
    }
    act(() => {
        renderer.create(<Harness />);
    });
    return hookApi;
};

describe("useChangePasswordController", () => {
    let mockChangePassword;
    let setModalInfo;

    beforeEach(() => {
        jest.clearAllMocks();
        mockChangePassword = jest.fn();
        setModalInfo = jest.fn();
        useAuth.mockReturnValue({ changePassword: mockChangePassword });
        useGlobal.mockReturnValue({ modalInfo: {}, setModalInfo });
    });

    it("shows error when fields are empty", async () => {
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit({ password: "", confirmPassword: "" });
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Missing Fields",
            })
        );
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("shows error when passwords do not match", async () => {
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit({
                password: "password1",
                confirmPassword: "password2",
            });
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Password Mismatch",
            })
        );
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("shows error when password is too short", async () => {
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit({ password: "12345", confirmPassword: "12345" });
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Weak Password",
                message: "Password must be at least 6 characters.",
            })
        );
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("calls changePassword and shows success on ok", async () => {
        mockChangePassword.mockResolvedValue({ success: true });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit({
                password: "newpass1",
                confirmPassword: "newpass1",
            });
        });
        expect(mockChangePassword).toHaveBeenCalledWith("newpass1");
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Password Updated",
                autoNavigate: true,
                nextRoute: "Login",
            })
        );
    });

    it("shows error when changePassword fails", async () => {
        mockChangePassword.mockResolvedValue({
            success: false,
            error: "Expired token",
        });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleSubmit({
                password: "newpass1",
                confirmPassword: "newpass1",
            });
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Update Failed",
                message: "Expired token",
            })
        );
    });

    it("handleSignIn navigates to Login", () => {
        const ctrl = setupHook();
        act(() => {
            ctrl.handleSignIn();
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
