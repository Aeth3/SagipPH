/**
 * Sets up automatic loan sync whenever the device comes back online.
 *
 * Call `startLoanSyncOnReconnect()` once at app startup (e.g. in your
 * root navigator or App.tsx).  It subscribes to the network monitor and
 * triggers a full push+pull sync as soon as connectivity is restored.
 *
 * Returns an unsubscribe function for cleanup.
 */
import { subscribeToNetworkStatus } from "../infra/network/networkMonitor";
import { syncLoans } from "./LoanSyncService";

let unsubscribe = null;

export const startLoanSyncOnReconnect = () => {
    if (unsubscribe) return unsubscribe; // already listening

    let wasOffline = false;

    unsubscribe = subscribeToNetworkStatus((isOnline) => {
        if (isOnline && wasOffline) {
            // Just came back online — sync now.
            syncLoans().catch(() => undefined);
        }
        wasOffline = !isOnline;
    });

    return unsubscribe;
};

export const stopLoanSyncOnReconnect = () => {
    if (typeof unsubscribe === "function") {
        unsubscribe();
        unsubscribe = null;
    }
};
