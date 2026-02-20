import {
  getIsOnline as getIsOnlineFromMonitor,
  subscribeToNetworkStatus as subscribeToNetworkStatusFromMonitor,
} from "../../infra/network/networkMonitor";

export const getIsOnline = () => getIsOnlineFromMonitor();

export const subscribeToNetworkStatus = (listener) =>
  subscribeToNetworkStatusFromMonitor(listener);
