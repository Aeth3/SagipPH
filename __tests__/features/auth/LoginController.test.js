import React from "react";
import renderer, { act } from "react-test-renderer";
import { useLoginController } from "../../../package/src/features/auth/Login/controllers/LoginController";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("../../../package/src/presentation/hooks/useAuth", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../../package/src/features/auth/Login/config.json", () => ({
    appName: "TestApp",
}));

jest.mock("../../../package/context/context", () => ({
    useGlobal: jest.fn(),
}));

const { useAuth } = require("../../../package/src/presentation/hooks/useAuth");
const { useGlobal } = require("../../../package/context/context");

const setupHook = () => {
    let hookApi;
    function Harness() {
        hookApi = useLoginController();
        return null;
    }
    act(() => {
        renderer.create(<Harness />);
    });
    return hookApi;
};

describe("useLoginController", () => {
    let mockLogin;
    let setModalInfo;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogin = jest.fn();
        setModalInfo = jest.fn();
        useAuth.mockReturnValue({ login: mockLogin });
        useGlobal.mockReturnValue({ modalInfo: {}, setModalInfo });
    });

    it("returns appName from config", () => {
        const ctrl = setupHook();
        expect(ctrl.appName).toBe("TestApp");
    });

    it("handleLogin shows modal when email is missing", async () => {
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleLogin({ email: "", password: "pass" });
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Missing Fields",
            })
        );
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it("handleLogin shows modal when password is missing", async () => {
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleLogin({ email: "a@b.com", password: "" });
        });
        expect(setModalInfo).toHaveBeenCalledWith(
            expect.objectContaining({
                show: true,
                title: "Missing Fields",
            })
        );
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it("handleLogin calls login and does not show modal on success", async () => {
        mockLogin.mockResolvedValue({ success: true });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleLogin({ email: "a@b.com", password: "pass" });
        });
        expect(mockLogin).toHaveBeenCalledWith("a@b.com", "pass");
        // setModalInfo should not be called for success
        expect(setModalInfo).not.toHaveBeenCalled();
    });

    it("handleLogin shows modal on login failure", async () => {
        mockLogin.mockResolvedValue({ success: false, error: "Bad creds" });
        const ctrl = setupHook();
        await act(async () => {
            await ctrl.handleLogin({ email: "a@b.com", password: "wrong" });
        });
        expect(setModalInfo).toHaveBeenCalledWith(expect.any(Function));
    });

    it("handleSignUp navigates to SignUp", () => {
        const ctrl = setupHook();
        act(() => {
            ctrl.handleSignUp();
        });
        expect(mockNavigate).toHaveBeenCalledWith("SignUp");
    });

    it("handleForgotPassword navigates to ForgotPassword", () => {
        const ctrl = setupHook();
        act(() => {
            ctrl.handleForgotPassword();
        });
        expect(mockNavigate).toHaveBeenCalledWith("ForgotPassword");
    });

    it("handleConfirm hides modal", () => {
        const ctrl = setupHook();
        act(() => {
            ctrl.handleConfirm();
        });
        expect(setModalInfo).toHaveBeenCalledWith(expect.any(Function));
    });
});
