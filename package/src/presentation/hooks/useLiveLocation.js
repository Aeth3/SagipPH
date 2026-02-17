import Geolocation from "@react-native-community/geolocation";
import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

async function requestPermission() {
  if (Platform.OS !== "android") return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export default function useLiveLocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let watchId;

    const start = async () => {
      const ok = await requestPermission();
      if (!ok) {
        setError(new Error("Location permission denied"));
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

    return () => {
      if (watchId != null) Geolocation.clearWatch(watchId);
    };
  }, []);

  return { coords, error };
}
