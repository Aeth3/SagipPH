import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { getSession } from "../../../composition/auth/authSession";
import { useOfflineStatus } from "../../../presentation/hooks/useOfflineStatus";
import useLiveLocation from "../../../presentation/hooks/useLiveLocation";
import { findNearestEvacCenter } from "../../../../utils/nearestEvac";
import { useAlertModal } from "../../../presentation/hooks/useAlertModal";

const ALERT_FEED = [
    {
        id: "storm",
        title: "TROPICAL STORM WARNING",
        detail: "Heavy rainfall expected. Stay alert and updated.",
        risk: "high",
    },
    {
        id: "flood",
        title: "FLASH FLOOD ADVISORY",
        detail: "Low-lying areas may flood. Prepare to evacuate if needed.",
        risk: "moderate",
    },
    {
        id: "wind",
        title: "STRONG WIND ADVISORY",
        detail: "Secure loose outdoor items and monitor local advisories.",
        risk: "low",
    },
];

const RISK_META = {
    low: {
        label: "LOW RISK",
        pillBg: "#DDF7E6",
        pillText: "#1E7E49",
    },
    moderate: {
        label: "MODERATE RISK",
        pillBg: "#FFE4C7",
        pillText: "#BF6E2E",
    },
    high: {
        label: "HIGH RISK",
        pillBg: "#FFE1DF",
        pillText: "#C03B35",
    },
    critical: {
        label: "CRITICAL RISK",
        pillBg: "#FFD9D6",
        pillText: "#A91F1A",
    },
};

const EVAC_CENTERS = [
    {
        id: "evac-1",
        name: "Butuan City Sports Complex",
        lat: 8.951802,
        lng: 125.538029,
    },
    {
        id: "evac-2",
        name: "Ampayon Covered Court",
        lat: 8.973663,
        lng: 125.56607,
    },
    {
        id: "evac-3",
        name: "Bancasi Gymnasium",
        lat: 8.961929,
        lng: 125.487015,
    },
];

const pickNextAlert = (currentAlertId) => {
    const currentIndex = ALERT_FEED.findIndex((item) => item.id === currentAlertId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % ALERT_FEED.length : 0;
    return ALERT_FEED[nextIndex];
};

export const useDashboardController = () => {
    const navigation = useNavigation();
    const { isOnline } = useOfflineStatus();
    const { coords } = useLiveLocation();
    const { showAlert, alertModal } = useAlertModal();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [userName, setUserName] = useState("AJ");
    const [activeAlert, setActiveAlert] = useState(ALERT_FEED[0]);
    const [lastUpdatedMinutes, setLastUpdatedMinutes] = useState(5);

    useEffect(() => {
        const loadUser = async () => {
            const sessionResult = await getSession();
            if (!sessionResult?.ok) return;

            const user = sessionResult?.value?.user ?? sessionResult?.value?.data?.user;
            const fromMetadata =
                user?.user_metadata?.first_name ?? user?.raw_user_meta_data?.first_name;
            const fromName = typeof user?.name === "string" ? user.name.split(" ")[0] : null;
            const nextName = fromMetadata || fromName;

            if (typeof nextName === "string" && nextName.trim()) {
                setUserName(nextName.trim());
            }
        };

        loadUser();
    }, []);

    const nearestShelter = useMemo(() => {
        if (!coords?.latitude || !coords?.longitude) return null;
        return findNearestEvacCenter(
            { lat: coords.latitude, lng: coords.longitude },
            EVAC_CENTERS
        );
    }, [coords?.latitude, coords?.longitude]);

    const riskMeta = useMemo(() => RISK_META[activeAlert.risk] ?? RISK_META.moderate, [activeAlert.risk]);

    const navigateToChatPrompt = useCallback(
        (quickPrompt, options = {}) => {
            navigation.navigate("ChatStack", {
                screen: "Chat",
                params: {
                    newChat: true,
                    quickPrompt,
                    autoSendQuickPrompt: !!options.autoSend,
                    autoSendToken: Date.now(),
                },
            });
        },
        [navigation]
    );

    const blockOffline = useCallback(() => {
        if (isOnline) return false;
        showAlert(
            "Offline mode",
            "This feature needs internet. Please reconnect and try again.",
            [{ text: "OK" }],
            { type: "info" }
        );
        return true;
    }, [isOnline, showAlert]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        setActiveAlert((prev) => pickNextAlert(prev.id));
        setLastUpdatedMinutes(1);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 650);
    }, []);

    const handleReportEmergency = useCallback(() => {
        navigateToChatPrompt("Report emergency near my location", { autoSend: true });
    }, [navigateToChatPrompt]);

    const handleFindNearestShelter = useCallback(() => {
        navigation.navigate("ChatStack", {
            screen: "NearestCenter",
        });
    }, [navigation]);

    const handlePreparednessTips = useCallback(() => {
        if (blockOffline()) return;
        navigateToChatPrompt("Preparedness tips", { autoSend: true });
    }, [blockOffline, navigateToChatPrompt]);

    const handleAskAssistant = useCallback(() => {
        navigateToChatPrompt("How can I stay safe today?", { autoSend: true });
    }, [navigateToChatPrompt]);

    const handleWeatherUpdates = useCallback(() => {
        if (blockOffline()) return;
        navigateToChatPrompt("Weather updates", { autoSend: true });
    }, [blockOffline, navigateToChatPrompt]);

    const handleAlertLevelPress = useCallback(() => {
        showAlert(
            "Current alert level",
            `Status: ${riskMeta.label}. Continue monitoring advisories in your area.`,
            [{ text: "OK" }],
            { type: activeAlert.risk === "high" || activeAlert.risk === "critical" ? "warning" : "info" }
        );
    }, [activeAlert.risk, riskMeta.label, showAlert]);

    const handleWarningPress = useCallback(() => {
        showAlert(
            activeAlert.title,
            activeAlert.detail,
            [
                { text: "Close" },
                {
                    text: "Ask Sagip AI",
                    onPress: () =>
                        navigateToChatPrompt(`Give details about: ${activeAlert.title}`, {
                            autoSend: true,
                        }),
                },
            ],
            { type: "warning" }
        );
    }, [activeAlert.detail, activeAlert.title, navigateToChatPrompt, showAlert]);

    return {
        userName,
        activeAlert,
        riskMeta,
        isRefreshing,
        alertModal,
        lastUpdatedMinutes,
        nearestShelter,
        handleRefresh,
        handleAlertLevelPress,
        handleWarningPress,
        handleWeatherUpdates,
        handleReportEmergency,
        handleFindNearestShelter,
        handlePreparednessTips,
        handleAskAssistant,
    };
};
