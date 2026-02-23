import { useEffect, useMemo, useState } from "react";
import { getCurrentLocation } from "../../../composition/system/location";
import useLiveLocation from "../../../presentation/hooks/useLiveLocation";
import config from "../../Chat/config.json";

export const useNearestCenterController = () => {
    const [fallbackGeotag, setFallbackGeotag] = useState(null);
    const { coords } = useLiveLocation();

    useEffect(() => {
        const fetchGeo = async () => {
            try {
                const position = await getCurrentLocation();
                setFallbackGeotag(position);
            } catch (error) {
                console.warn("Failed to fetch geolocation:", error?.message || error);
            }
        };
        fetchGeo();
    }, []);

    const geotag = useMemo(() => {
        if (coords?.latitude && coords?.longitude) {
            return {
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
            };
        }
        return fallbackGeotag;
    }, [coords, fallbackGeotag]);

    return { geotag, evacs: config.SAMPLE_EVAC_CENTERS };
};
