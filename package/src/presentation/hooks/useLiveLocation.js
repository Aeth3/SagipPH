import Geolocation from "@react-native-community/geolocation";
import { useCallback, useEffect, useState } from "react";
import { AppState, Linking, PermissionsAndroid, Platform } from "react-native";

const PERMISSION_STATUS = {
  GRANTED: "granted",
  DENIED: "denied",
  BLOCKED: "blocked",
};

async function requestPermissionStatus() {
  if (Platform.OS !== "android") return PERMISSION_STATUS.GRANTED;

  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );
  if (hasPermission) return PERMISSION_STATUS.GRANTED;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    return PERMISSION_STATUS.GRANTED;
  }

  if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    return PERMISSION_STATUS.BLOCKED;
  }

  return PERMISSION_STATUS.DENIED;
}

export default function useLiveLocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(PERMISSION_STATUS.DENIED);

  const requestPermission = useCallback(async () => {
    const nextStatus = await requestPermissionStatus();
    setPermissionStatus(nextStatus);
    if (nextStatus !== PERMISSION_STATUS.GRANTED) {
      setCoords(null);
      setError(new Error("Location permission denied"));
    } else {
      setError(null);
    }
    return nextStatus;
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  useEffect(() => {
    let watchId;
    let isMounted = true;

    const start = async () => {
      const status = await requestPermission();
      if (!isMounted || status !== PERMISSION_STATUS.GRANTED) {
        return;
      }

      watchId = Geolocation.watchPosition(
        position => setCoords(position.coords),
        err => setError(err),
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          interval: 5000,
          fastestInterval: 2000,
        }
      );
    };

    start();

    const appStateSub = AppState.addEventListener("change", state => {
      if (state === "active") {
        requestPermission();
      }
    });

    return () => {
      isMounted = false;
      appStateSub.remove();
      if (watchId != null) Geolocation.clearWatch(watchId);
    };
  }, [requestPermission]);

  return { coords, error, permissionStatus, requestPermission, openSettings };
}
