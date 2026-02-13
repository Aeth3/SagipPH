import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { COLORS } from "package/src/legacyApp";
import NotificationIcon from "./NotificationIcon";

export default function ChatHeader({ notificationCount = 0, onNotificationPress }) {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Text style={styles.brandText}>SagipPH</Text>
            </View>
            <View style={styles.headerRight}>
                <NotificationIcon
                    count={notificationCount}
                    onPress={onNotificationPress}
                />
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>AJ</Text>
                </View>
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
        color: COLORS.primary2,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    badge: {
        backgroundColor: COLORS.primayLight2,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.primary2,
        letterSpacing: 0.5,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary2,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: COLORS.white,
        fontWeight: "700",
        fontSize: 14,
    },
});
