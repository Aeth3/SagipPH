import RNLocation from "react-native-location";

/** Configure once when file is imported */
RNLocation.configure({
    distanceFilter: 5,
    desiredAccuracy: {
        android: "highAccuracy",
        ios: "best",
    },
    androidProvider: "auto",
    interval: 5000,
    fastestInterval: 2000,
});

/** Get current location safely */
export async function getCurrentLocation() {
    const granted = await RNLocation.requestPermission({
        ios: "whenInUse",
        android: { detail: "fine" },
    });

    if (!granted) {
        throw new Error("Location permission denied");
    }

    const location = await RNLocation.getLatestLocation({ timeout: 60000 });

    if (!location) {
        throw new Error("Unable to get GPS location. Try going outdoors.");
    }

    return {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
    };
}
