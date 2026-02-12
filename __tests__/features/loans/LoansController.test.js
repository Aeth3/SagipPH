import React from "react";
import renderer, { act } from "react-test-renderer";
import { useLoansController } from "../../../package/src/features/loans/controllers/LoansController";

const mockShowAlert = jest.fn();
const mockHideAlert = jest.fn();

jest.mock("../../../package/src/presentation/hooks/useAlertModal", () => ({
    useAlertModal: () => ({
        showAlert: mockShowAlert,
        hideAlert: mockHideAlert,
        alertModal: null,
    }),
}));

jest.mock("package/src/legacyApp", () => ({
    COLORS: {
        text: "#000",
        white: "#fff",
        borderColor: "#ccc",
        primary: "#007bff",
    },
}));

jest.mock("../../../package/components/ui/SearchBarWithFilter", () => ({
    FiltersSheet: jest.fn(() => null),
}));

jest.mock("../../../package/src/features/loans/config.json", () => ({
    filters: [],
}));

jest.mock("../../../package/src/composition/loans", () => ({
    getLoans: jest.fn(),
    createLoan: jest.fn(),
    updateLoan: jest.fn(),
    deleteLoan: jest.fn(),
}));

jest.mock("../../../package/src/domain/entities/Loan", () => ({
    Loan: {
        validateInput: jest.fn(),
    },
}));

jest.mock("../../../package/src/features/loans/components/LoanFormModal", () => "LoanFormModal");
jest.mock("../../../package/components/ui/AlertModal", () => "AlertModal");

const mockShowSnackbarError = jest.fn();
jest.mock("../../../package/lib/helpers", () => ({
    ShowSnackbarError: (...args) => mockShowSnackbarError(...args),
}));

const { getLoans, createLoan, updateLoan, deleteLoan } =
    require("../../../package/src/composition/loans");
const { Loan } = require("../../../package/src/domain/entities/Loan");

const setupHook = async () => {
    let hookApi;
    function Harness() {
        hookApi = useLoansController();
        return null;
    }
    await act(async () => {
        renderer.create(<Harness />);
    });
    return hookApi;
};

describe("useLoansController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getLoans.mockResolvedValue({ ok: true, value: [] });
    });

    it("fetches loans on mount", async () => {
        const ctrl = await setupHook();
        expect(getLoans).toHaveBeenCalled();
        expect(ctrl.builderProps.loans).toEqual([]);
        expect(ctrl.builderProps.loading).toBe(false);
    });

    it("sets error when getLoans fails", async () => {
        getLoans.mockResolvedValue({
            ok: false,
            error: { message: "Server down" },
        });
        const ctrl = await setupHook();
        expect(ctrl.builderProps.error).toBe("Server down");
        expect(mockShowSnackbarError).toHaveBeenCalledWith("Server down");
    });

    it("sets error when getLoans throws", async () => {
        getLoans.mockRejectedValue(new Error("Network fail"));
        const ctrl = await setupHook();
        expect(ctrl.builderProps.error).toBe("Network fail");
        expect(mockShowSnackbarError).toHaveBeenCalledWith("Network fail");
    });

    it("returns config in hook result", async () => {
        const ctrl = await setupHook();
        expect(ctrl.config).toBeDefined();
    });
});
