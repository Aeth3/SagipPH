import React from "react";
import renderer, { act } from "react-test-renderer";
import { useOfflineStatus } from "../../../package/src/presentation/hooks/useOfflineStatus";

jest.mock("../../../package/src/infra/network/networkMonitor", () => ({
    getIsOnline: jest.fn(() => true),
    subscribeToNetworkStatus: jest.fn(() => jest.fn()),
}));

const {
    getIsOnline,
    subscribeToNetworkStatus,
} = require("../../../package/src/infra/network/networkMonitor");

const setupHook = () => {
    let hookApi;
    function Harness() {
        hookApi = useOfflineStatus();
        return null;
    }
    act(() => {
        renderer.create(<Harness />);
    });
    return hookApi;
};

describe("useOfflineStatus", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getIsOnline.mockReturnValue(true);
        subscribeToNetworkStatus.mockReturnValue(jest.fn());
    });

    it("returns isOnline true when network is online", () => {
        const status = setupHook();
        expect(status.isOnline).toBe(true);
        expect(status.isOffline).toBe(false);
    });

    it("returns isOffline true when network is offline", () => {
        getIsOnline.mockReturnValue(false);
        const status = setupHook();
        expect(status.isOnline).toBe(false);
        expect(status.isOffline).toBe(true);
    });

    it("subscribes to network status on mount", () => {
        setupHook();
        expect(subscribeToNetworkStatus).toHaveBeenCalledWith(expect.any(Function));
    });

    it("unsubscribes on unmount", () => {
        const unsubscribe = jest.fn();
        subscribeToNetworkStatus.mockReturnValue(unsubscribe);

        let component;
        act(() => {
            component = renderer.create(
                React.createElement(() => {
                    useOfflineStatus();
                    return null;
                })
            );
        });
        act(() => {
            component.unmount();
        });
        expect(unsubscribe).toHaveBeenCalled();
    });
});
