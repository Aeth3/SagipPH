jest.mock("../../../package/src/infra/http/offlineHttp", () => ({
    flushQueuedRequests: jest.fn(),
}));

jest.mock("../../../package/src/infra/network/networkMonitor", () => ({
    startNetworkMonitoring: jest.fn(),
    stopNetworkMonitoring: jest.fn(),
    subscribeToNetworkStatus: jest.fn(),
}));

const { flushQueuedRequests } = require("../../../package/src/infra/http/offlineHttp");
const {
    startNetworkMonitoring,
    stopNetworkMonitoring,
    subscribeToNetworkStatus,
} = require("../../../package/src/infra/network/networkMonitor");

let offlineSync;

// Re-import to reset the `initialized` flag between tests
const loadModule = () => {
    jest.resetModules();
    jest.doMock("../../../package/src/infra/http/offlineHttp", () => ({
        flushQueuedRequests: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock("../../../package/src/infra/network/networkMonitor", () => ({
        startNetworkMonitoring: jest.fn(),
        stopNetworkMonitoring: jest.fn(),
        subscribeToNetworkStatus: jest.fn(() => jest.fn()),
    }));
    offlineSync = require("../../../package/src/infra/http/offlineSync");
    return {
        flushQueuedRequests: require("../../../package/src/infra/http/offlineHttp").flushQueuedRequests,
        startNetworkMonitoring: require("../../../package/src/infra/network/networkMonitor").startNetworkMonitoring,
        stopNetworkMonitoring: require("../../../package/src/infra/network/networkMonitor").stopNetworkMonitoring,
        subscribeToNetworkStatus: require("../../../package/src/infra/network/networkMonitor").subscribeToNetworkStatus,
    };
};

describe("offlineSync", () => {
    it("initializeOfflineSync starts monitoring and flushes queue", () => {
        const mocks = loadModule();
        offlineSync.initializeOfflineSync();

        expect(mocks.startNetworkMonitoring).toHaveBeenCalled();
        expect(mocks.flushQueuedRequests).toHaveBeenCalled();
        expect(mocks.subscribeToNetworkStatus).toHaveBeenCalledWith(
            expect.any(Function)
        );
    });

    it("initializeOfflineSync is idempotent", () => {
        const mocks = loadModule();
        offlineSync.initializeOfflineSync();
        offlineSync.initializeOfflineSync();

        expect(mocks.startNetworkMonitoring).toHaveBeenCalledTimes(1);
    });

    it("disposeOfflineSync stops monitoring and unsubscribes", () => {
        const mockUnsub = jest.fn();
        const mocks = loadModule();
        mocks.subscribeToNetworkStatus.mockReturnValue(mockUnsub);

        offlineSync.initializeOfflineSync();
        offlineSync.disposeOfflineSync();

        expect(mockUnsub).toHaveBeenCalled();
        expect(mocks.stopNetworkMonitoring).toHaveBeenCalled();
    });

    it("disposeOfflineSync is safe to call when not initialized", () => {
        loadModule();
        expect(() => offlineSync.disposeOfflineSync()).not.toThrow();
    });

    it("flushes queued requests when network comes online", () => {
        const mocks = loadModule();
        let networkCallback;
        mocks.subscribeToNetworkStatus.mockImplementation((cb) => {
            networkCallback = cb;
            return jest.fn();
        });

        offlineSync.initializeOfflineSync();
        mocks.flushQueuedRequests.mockClear();

        // Simulate coming online
        networkCallback(true);
        expect(mocks.flushQueuedRequests).toHaveBeenCalled();
    });

    it("does not flush when going offline", () => {
        const mocks = loadModule();
        let networkCallback;
        mocks.subscribeToNetworkStatus.mockImplementation((cb) => {
            networkCallback = cb;
            return jest.fn();
        });

        offlineSync.initializeOfflineSync();
        mocks.flushQueuedRequests.mockClear();

        networkCallback(false);
        expect(mocks.flushQueuedRequests).not.toHaveBeenCalled();
    });
});
