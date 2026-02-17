import { PermissionsAndroid, Platform } from "react-native";

export async function requestLocationPermission() {
    if (Platform.OS !== "android") return true;

    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Location Permission",
                message: "This app needs access to your location.",
                buttonPositive: "Allow",
                buttonNegative: "Deny",
            }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
        return false;
    }
}
