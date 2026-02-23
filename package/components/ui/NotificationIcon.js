import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { COLORS } from "package/src/legacyApp";

export default function NotificationIcon({ count = 0, onPress, size = 25, color }) {
    const iconColor = color || COLORS.primaryRed;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
            <FontAwesomeIcon icon={faBell} size={size} color={iconColor} />
            {count > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {count > 99 ? "99+" : count}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        padding: 6,
    },
    badge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: COLORS.primaryRed,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: COLORS.white,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: "700",
        lineHeight: 12,
    },
});
