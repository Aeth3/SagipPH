import React from "react";
import renderer, { act } from "react-test-renderer";
import NetworkStatusSnackbar from "../../../package/src/presentation/components/NetworkStatusSnackbar";

// ── Mocks ──────────────────────────────────────────────────────────────
const mockSnackbarShow = jest.fn();
jest.mock("react-native-snackbar", () => ({
    show: (...args) => mockSnackbarShow(...args),
    LENGTH_SHORT: 1,
    LENGTH_LONG: 2,
}));

let currentListener;
jest.mock("../../../package/src/presentation/hooks/useOfflineStatus", () => {
    let _isOnline = true;
    return {
        useOfflineStatus: () => ({ isOnline: _isOnline, isOffline: !_isOnline }),
        // Test helper to change the value and force a re-render.
        __setIsOnline: (val) => {
            _isOnline = val;
        },
    };
});

const {
    __setIsOnline,
} = require("../../../package/src/presentation/hooks/useOfflineStatus");

// Helper to mount / re-mount the component.
let root;
const mount = () => {
    act(() => {
        root = renderer.create(<NetworkStatusSnackbar />);
    });
};
const rerender = () => {
    act(() => {
        root.update(<NetworkStatusSnackbar />);
    });
};

describe("NetworkStatusSnackbar", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        __setIsOnline(true);
    });

    afterEach(() => {
        if (root) {
            act(() => root.unmount());
            root = null;
        }
    });

    it("renders nothing (returns null)", () => {
        mount();
        expect(root.toJSON()).toBeNull();
    });

    it("does NOT show a snackbar on first render", () => {
        mount();
        expect(mockSnackbarShow).not.toHaveBeenCalled();
    });

    it("shows offline snackbar when connectivity drops", () => {
        mount();
        expect(mockSnackbarShow).not.toHaveBeenCalled();

        // Simulate going offline
        __setIsOnline(false);
        rerender();

        expect(mockSnackbarShow).toHaveBeenCalledWith(
            expect.objectContaining({
                text: expect.stringContaining("offline"),
                backgroundColor: "#DC2626",
            })
        );
    });

    it("shows online snackbar when connectivity is restored", () => {
        // Start offline
        __setIsOnline(false);
        mount();

        mockSnackbarShow.mockClear();

        // Go back online
        __setIsOnline(true);
        rerender();

        expect(mockSnackbarShow).toHaveBeenCalledWith(
            expect.objectContaining({
                text: expect.stringContaining("You are connected online"),
                backgroundColor: "#10B981",
            })
        );
    });

    it("does not show snackbar when status stays the same", () => {
        mount();
        mockSnackbarShow.mockClear();

        // Still online — no change
        __setIsOnline(true);
        rerender();

        expect(mockSnackbarShow).not.toHaveBeenCalled();
    });
});
