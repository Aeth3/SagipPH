import React from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { COLORS } from "package/src/legacyApp";
import NotificationIcon from "./NotificationIcon";

const HEADER_MODE_CONFIG = {
    default: {
        showNotification: true,
        showAvatar: true,
        avatarText: "JD",
    },
    dashboard: {
        showNotification: true,
        showAvatar: true,
        avatarText: "JD",
    },
    chat: {
        showNotification: true,
        showAvatar: true,
        avatarText: "JD",
    },
};

export default function Header({
    mode = "default",
    showNotification,
    showAvatar,
    avatarText,
}) {
    const notificationCount = 0;
    const onNotificationPress = () => { };
    const modeConfig = HEADER_MODE_CONFIG[mode] ?? HEADER_MODE_CONFIG.default;
    const shouldShowNotification = showNotification ?? modeConfig.showNotification;
    const shouldShowAvatar = showAvatar ?? modeConfig.showAvatar;
    const resolvedAvatarText = avatarText ?? modeConfig.avatarText;

    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Image source={require("../../assets/header_logo.png")} style={{ width: 120, height: 40 }} />
            </View>
            <View style={styles.headerRight}>
                {shouldShowNotification && (
                    <NotificationIcon
                        count={notificationCount}
                        onPress={onNotificationPress}
                    />
                )}
                {shouldShowAvatar && (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{resolvedAvatarText}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    headerLeft: {
        marginLeft: 40,
        flexDirection: "row",
        alignItems: "center",
    },
    brandText: {
        fontSize: 22,
        fontFamily: "Poppins-SemiBold",
        color: COLORS.primaryRed,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    badge: {
        backgroundColor: COLORS.primaryRedLight,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.primaryRed,
        letterSpacing: 0.5,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.primaryRed,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: COLORS.white,
        fontWeight: "700",
        fontSize: 16,
    },
});
