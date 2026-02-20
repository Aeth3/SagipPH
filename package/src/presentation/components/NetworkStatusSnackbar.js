import { useEffect, useRef } from "react";
import Snackbar from "react-native-snackbar";
import { useOfflineStatus } from "../hooks/useOfflineStatus";

const SNACKBAR_COLORS = {
    success: "#10B981",
    danger: "#DC2626",
};

/**
 * Headless component that listens to network connectivity changes
 * and displays a Snackbar when the device goes offline or comes back online.
 *
 * Mount once near the root of the app (e.g. in Main.js).
 * Renders nothing — purely side-effect driven.
 */
export default function NetworkStatusSnackbar() {
    const { isOnline } = useOfflineStatus();
    const prevOnline = useRef(isOnline);
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip the very first render so we don't flash a snackbar on app launch.
        if (isFirstRender.current) {
            isFirstRender.current = false;
            prevOnline.current = isOnline;
            return;
        }

        // Only show when the status actually changes.
        if (isOnline === prevOnline.current) return;
        prevOnline.current = isOnline;

        if (isOnline) {
            Snackbar.show({
                text: "You are connected online",
                backgroundColor: SNACKBAR_COLORS.success,
                duration: Snackbar.LENGTH_SHORT,
            });
        } else {
            Snackbar.show({
                text: "You are offline. You will be directed to offline form submission",
                backgroundColor: SNACKBAR_COLORS.danger,
                duration: Snackbar.LENGTH_LONG,
            });
        }
    }, [isOnline]);

    return null;
}
