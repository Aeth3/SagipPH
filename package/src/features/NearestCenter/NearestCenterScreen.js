import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Screen from "../../../components/layout/Screen";
import Header from "../../../components/ui/HeaderV2";
import LeafletMap from "../../../components/ui/LeafletMap";
import { useNearestCenterController } from "./controllers/NearestCenterController";

const STATUS_META = {
    open: { label: "Open", color: "#16A34A" },
    near_full: { label: "Near Full", color: "#F59E0B" },
    full: { label: "Full", color: "#DC2626" },
    maintenance: { label: "Under Maintenance", color: "#6B7280" },
};

const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";

const normalizeStatus = (value) => String(value || "").trim().toLowerCase();

const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const haversineDistanceKm = (a, b) => {
    if (!a || !b) return 0;
    const toRadians = (deg) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);
    const lat1 = toRadians(a.lat);
    const lat2 = toRadians(b.lat);
    const x =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return earthRadiusKm * y;
};

const formatDistanceLabel = (distanceKm) => {
    if (!Number.isFinite(distanceKm)) return "N/A";
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
    return `${distanceKm.toFixed(2)} km`;
};

const hexToRgba = (hex, alpha) => {
    const safeHex = String(hex || "").replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(safeHex)) return `rgba(22,163,74,${alpha})`;
    const r = parseInt(safeHex.slice(0, 2), 16);
    const g = parseInt(safeHex.slice(2, 4), 16);
    const b = parseInt(safeHex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getEvacIndication = (center) => {
    const maxCapacity = toNumber(center?.max_capacity);
    const occupancy = toNumber(center?.current_occupancy);
    const utilization = maxCapacity > 0 ? occupancy / maxCapacity : null;
    const status = normalizeStatus(center?.status);

    if (status.includes("maintenance")) {
        return { ...STATUS_META.maintenance, maxCapacity, occupancy, utilization };
    }
    if (status === "full" || (utilization !== null && utilization >= 1)) {
        return { ...STATUS_META.full, maxCapacity, occupancy, utilization };
    }
    if (utilization !== null && utilization >= 0.8) {
        return { ...STATUS_META.near_full, maxCapacity, occupancy, utilization };
    }
    return { ...STATUS_META.open, maxCapacity, occupancy, utilization };
};

const toLatLngFromCoords = (coords) => {
    const lat = coords?.latitude ?? coords?.lat;
    const lng = coords?.longitude ?? coords?.lng;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
};

export default function NearestCenterScreen() {
    const { evacs, geotag } = useNearestCenterController();
    const currentLocation = toLatLngFromCoords(geotag);
    const hasCurrentLocation = !!currentLocation;

    const [selectedCenterId, setSelectedCenterId] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [routePolyline, setRoutePolyline] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);
    const [routeError, setRouteError] = useState("");
    const lastRerouteOriginRef = useRef(null);
    const routeCardAnim = useRef(new Animated.Value(0)).current;
    const [isRouteCardMounted, setIsRouteCardMounted] = useState(false);

    const selectedCenter = useMemo(
        () => (evacs || []).find((center) => center.id === selectedCenterId) || null,
        [evacs, selectedCenterId]
    );
    const selectedCenterIndication = useMemo(
        () => (selectedCenter ? getEvacIndication(selectedCenter) : null),
        [selectedCenter]
    );
    const routeAccentColor = selectedCenterIndication?.color || STATUS_META.open.color;
    const routeCardBackground = hexToRgba(routeAccentColor, 0.12);
    const shouldShowRouteCard = isNavigating && !!routeInfo;
    const routeCardAnimatedStyle = useMemo(
        () => ({
            opacity: routeCardAnim,
            transform: [
                {
                    translateY: routeCardAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-14, 0],
                    }),
                },
            ],
        }),
        [routeCardAnim]
    );


    const fetchRoute = useCallback(async (origin, destination) => {
        if (!origin || !destination) return false;
        setRouteError("");

        try {
            const url =
                `${OSRM_BASE_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
                "?overview=full&geometries=geojson";
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Routing request failed (${response.status})`);
            }
            const payload = await response.json();
            const route = payload?.routes?.[0];
            if (!route?.geometry?.coordinates?.length) {
                throw new Error("No route found for the selected destination.");
            }

            const line = route.geometry.coordinates.map((point) => ({
                lat: point[1],
                lng: point[0],
            }));

            setRoutePolyline(line);
            setRouteInfo({
                distanceKm: route.distance / 1000,
                durationMin: route.duration / 60,
            });
            lastRerouteOriginRef.current = origin;
            return true;
        } catch (error) {
            setRoutePolyline([]);
            setRouteInfo(null);
            setRouteError(error?.message || "Unable to load route right now.");
            return false;
        }
    }, []);

    const startRoutingToCenter = useCallback(
        async (center) => {
            if (!center) return;
            setSelectedCenterId(center.id);
            if (!currentLocation) {
                setRouteError("Current location is not available yet.");
                return;
            }
            const ok = await fetchRoute(currentLocation, {
                lat: center.lat,
                lng: center.lng,
            });
            if (ok) setIsNavigating(true);
        },
        [currentLocation, fetchRoute]
    );

    const handleEvacMarkerPress = useCallback(
        (payload) => {
            if (payload?.iconType !== "evac_center") return;
            const center = (evacs || []).find((item) => item.id === payload.markerId);
            if (!center) return;
            startRoutingToCenter(center);
        },
        [evacs, startRoutingToCenter]
    );

    useEffect(() => {
        if (!isNavigating || !currentLocation || !selectedCenter) return;

        const destination = { lat: selectedCenter.lat, lng: selectedCenter.lng };
        const lastOrigin = lastRerouteOriginRef.current;
        const movedKm = haversineDistanceKm(lastOrigin, currentLocation);

        if (!lastOrigin || movedKm >= 0.05) {
            fetchRoute(currentLocation, destination);
        }
    }, [currentLocation, fetchRoute, isNavigating, selectedCenter]);

    useEffect(() => {
        routeCardAnim.stopAnimation();

        if (shouldShowRouteCard) {
            setIsRouteCardMounted(true);
            Animated.timing(routeCardAnim, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }).start();
            return;
        }

        if (!isRouteCardMounted) return;
        Animated.timing(routeCardAnim, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setIsRouteCardMounted(false);
            }
        });
    }, [isRouteCardMounted, routeCardAnim, shouldShowRouteCard]);

    const markers = useMemo(() => {
        const evacMarkers = (evacs || []).map((center) => {
            const indication = getEvacIndication(center);
            const capacityText = indication.maxCapacity > 0
                ? `${indication.occupancy}/${indication.maxCapacity}`
                : "N/A";
            const utilizationText = indication.utilization !== null
                ? `${Math.round(indication.utilization * 100)}%`
                : "N/A";
            const availableSlots = indication.maxCapacity > 0
                ? Math.max(indication.maxCapacity - indication.occupancy, 0)
                : null;
            const isSelected = center.id === selectedCenterId;

            return {
                lat: center.lat,
                lng: center.lng,
                title: `${isSelected ? "[Selected] " : ""}${center.name}`,
                color: isSelected ? "#1D4ED8" : indication.color,
                iconType: "evac_center",
                description: [
                    center.address || "Evacuation Center",
                    `Status: ${indication.label}`,
                    `Occupancy: ${capacityText} (${utilizationText})`,
                    availableSlots !== null ? `Available Slots: ${availableSlots}` : "Available Slots: N/A",
                ].join(" | "),
                id: center.id,
            };
        });

        if (!hasCurrentLocation) return evacMarkers;

        return [
            {
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                title: "Your Current Location",
                description: "Live GPS",
                color: "#2563EB",
                iconType: "current_location",
            },
            ...evacMarkers,
        ];
    }, [currentLocation, evacs, hasCurrentLocation, selectedCenterId]);

    return (
        <Screen style={styles.screen}>
            <Header />
            <View style={styles.content}>
                <Text style={styles.title}>Evacuation Centers</Text>
                <Text style={styles.subtitle}>
                    Showing {evacs?.length || 0} centers on map
                </Text>
                <Text style={styles.helperText}>
                    Tap an evacuation center icon on the map to start wayfinding automatically.
                </Text>

                {isRouteCardMounted && (
                    <Animated.View
                        style={[
                            styles.routeInfoCard,
                            {
                                borderColor: routeAccentColor,
                                backgroundColor: routeCardBackground,
                            },
                            routeCardAnimatedStyle,
                        ]}
                    >
                        <Text style={[styles.routeInfoTitle, { color: routeAccentColor }]}>Active Navigation</Text>
                        {!!selectedCenter?.name && (
                            <Text style={[styles.routeInfoText, { color: routeAccentColor }]}>
                                Destination: {selectedCenter.name}
                            </Text>
                        )}
                        <Text style={[styles.routeInfoText, { color: routeAccentColor }]}>
                            Remaining: {formatDistanceLabel(routeInfo.distanceKm)}
                        </Text>
                        <Text style={[styles.routeInfoText, { color: routeAccentColor }]}>
                            ETA: {Math.max(Math.round(routeInfo.durationMin), 1)} min
                        </Text>
                        {!!selectedCenterIndication && (
                            <>
                                <Text style={[styles.routeInfoText, { color: routeAccentColor }]}>
                                    Status: {selectedCenterIndication.label}
                                </Text>
                                <Text style={[styles.routeInfoText, { color: routeAccentColor }]}>
                                    Capacity: {selectedCenterIndication.maxCapacity || 0}
                                </Text>
                                <Text style={[styles.routeInfoText, { color: routeAccentColor }]}>
                                    Occupancy: {selectedCenterIndication.occupancy || 0}
                                </Text>
                                <Text style={[styles.routeInfoText, { color: routeAccentColor }]}>
                                    Available: {Math.max(
                                        (selectedCenterIndication.maxCapacity || 0) -
                                        (selectedCenterIndication.occupancy || 0),
                                        0
                                    )}
                                </Text>
                            </>
                        )}
                    </Animated.View>
                )}

                {!!routeError && (
                    <Text style={styles.routeErrorText}>{routeError}</Text>
                )}

                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: STATUS_META.open.color }]} />
                        <Text style={styles.legendText}>Open</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: STATUS_META.near_full.color }]} />
                        <Text style={styles.legendText}>Near Full</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: STATUS_META.full.color }]} />
                        <Text style={styles.legendText}>Full</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: STATUS_META.maintenance.color }]} />
                        <Text style={styles.legendText}>Maintenance</Text>
                    </View>
                </View>

                <View style={styles.mapWrap}>
                    <LeafletMap
                        lat={currentLocation?.lat ?? 8.9486}
                        long={currentLocation?.lng ?? 125.5406}
                        zoom={13}
                        markers={markers}
                        routePolyline={routePolyline}
                        onMarkerPress={handleEvacMarkerPress}
                        type="archive"
                    />
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: "#F4F6FA",
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
    },
    title: {
        fontSize: 22,
        color: "#1F2A44",
        fontWeight: "700",
    },
    subtitle: {
        marginTop: 4,
        marginBottom: 4,
        fontSize: 13,
        color: "#5F6C80",
    },
    helperText: {
        marginBottom: 8,
        fontSize: 12,
        color: "#334155",
        fontWeight: "600",
    },
    routeInfoCard: {
        backgroundColor: "#EAF7F2",
        borderColor: "#16A34A",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    routeInfoTitle: {
        color: "#166534",
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 2,
    },
    routeInfoText: {
        color: "#166534",
        fontSize: 12,
        fontWeight: "600",
    },
    routeErrorText: {
        color: "#B91C1C",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
    },
    legendRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 10,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        color: "#4B5563",
        fontWeight: "600",
    },
    mapWrap: {
        flex: 1,
        borderRadius: 14,
        overflow: "hidden",
    },
});
