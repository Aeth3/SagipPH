/**
 * Tests for loanSyncOnReconnect — triggers sync when device comes back online.
 */

let capturedListener;
let mockSyncLoans;

beforeEach(() => {
    jest.resetModules();
    capturedListener = null;

    jest.doMock(
        "../../package/src/infra/network/networkMonitor",
        () => ({
            subscribeToNetworkStatus: jest.fn((listener) => {
                capturedListener = listener;
                // Immediately call with current state (online)
                listener(true);
                return jest.fn(); // unsubscribe
            }),
        })
    );

    mockSyncLoans = jest.fn().mockResolvedValue({});
    jest.doMock(
        "../../package/src/services/LoanSyncService",
        () => ({ syncLoans: mockSyncLoans })
    );
});

const loadModule = () => {
    let mod;
    jest.isolateModules(() => {
        mod = require("../../package/src/services/loanSyncOnReconnect");
    });
    return mod;
};

describe("startLoanSyncOnReconnect", () => {
    it("subscribes to network status changes", () => {
        const mod = loadModule();
        mod.startLoanSyncOnReconnect();

        expect(capturedListener).toBeInstanceOf(Function);
    });

    it("triggers sync when transitioning from offline to online", () => {
        const mod = loadModule();
        mod.startLoanSyncOnReconnect();

        // Simulate going offline then back online
        capturedListener(false); // offline
        capturedListener(true);  // back online

        expect(mockSyncLoans).toHaveBeenCalled();
    });

    it("does NOT sync when already online (no transition)", () => {
        const mod = loadModule();
        mod.startLoanSyncOnReconnect();

        // Initial call was online=true, so wasOffline is still false
        capturedListener(true); // still online — no transition

        expect(mockSyncLoans).not.toHaveBeenCalled();
    });
});

describe("stopLoanSyncOnReconnect", () => {
    it("calls the unsubscribe function", () => {
        const mod = loadModule();
        mod.startLoanSyncOnReconnect();
        // Should not throw
        mod.stopLoanSyncOnReconnect();
    });
});
