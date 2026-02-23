import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { COLORS } from "package/src/legacyApp";

const EmptyState = ({
    icon = "folder-open-outline",
    title = "No Data Found",
    message = "There’s nothing to show here yet.",
    buttonLabel = "Retry",
    onPressButton,
    showButton = true, // ✅ NEW PROP (default true)
    height = 400,
}) => {
    return (
        <View style={[styles.container, { minHeight: height }]}>
            <View style={styles.card}>
                <FontAwesomeIcon icon={faBoxOpen} size={50} style={styles.icon} />
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{message}</Text>

                {/* ✅ Only render button if showButton = true */}
                {showButton && (
                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.85}
                        onPress={onPressButton}
                        disabled={!onPressButton}
                    >
                        <Text style={styles.buttonText}>{buttonLabel}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default EmptyState;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    card: {
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 40,
        paddingHorizontal: 24,
        borderRadius: 16,
        elevation: 3, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
    },
    button: {
        backgroundColor: COLORS.primaryRed,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    buttonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
});
