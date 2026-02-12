import { useEffect } from "react";
import { ContextProvider } from './context/context'
import RootNavigator from "./navigators/RootNavigator"
import {
    disposeOfflineSync,
    initializeOfflineSync,
} from "./src/infra/http/offlineSync";
import {
    startLoanSyncOnReconnect,
    stopLoanSyncOnReconnect,
} from "./src/services/loanSyncOnReconnect";

export default function Main() {
    useEffect(() => {
        initializeOfflineSync();
        startLoanSyncOnReconnect();
        return () => {
            disposeOfflineSync();
            stopLoanSyncOnReconnect();
        };
    }, []);

    return <ContextProvider>
        <RootNavigator />
    </ContextProvider>
}
