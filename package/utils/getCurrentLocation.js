import Geolocation from "@react-native-community/geolocation";

export const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
        let resolved = false;

        const finishSuccess = position => {
            if (resolved) return;
            resolved = true;

            const { latitude, longitude } = position.coords || {};
            if (latitude == null || longitude == null) {
                reject(new Error("Invalid location data"));
                return;
            }

            resolve({
                latitude,
                longitude,
                accuracy: position.coords.accuracy,
            });
        };

        const finishError = message => {
            if (resolved) return;
            resolved = true;
            reject(new Error(message));
        };

        /** STEP 3 — long real GPS wait (offline outdoors) */
        const longGpsAttempt = () => {
            Geolocation.getCurrentPosition(
                finishSuccess,
                () => finishError("Unable to get GPS signal. Go outdoors."),
                {
                    enableHighAccuracy: true,
                    timeout: 90000, // ⬅️ 90s cold GPS
                    maximumAge: 0,
                }
            );
        };

        /** STEP 2 — quick low-accuracy attempt */
        const quickAttempt = () => {
            Geolocation.getCurrentPosition(
                finishSuccess,
                longGpsAttempt,
                {
                    enableHighAccuracy: false,
                    timeout: 15000,
                    maximumAge: 300000, // allow 5-min cached
                }
            );
        };

        /** STEP 1 — return last known immediately if exists */
        Geolocation.getCurrentPosition(
            finishSuccess,
            quickAttempt,
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: Infinity, // ANY cached value
            }
        );
    });
};
