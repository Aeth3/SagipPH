import React, { useEffect, useRef } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    StyleSheet,
    Dimensions,
} from "react-native";

const { height } = Dimensions.get("window");

const ALERT_TYPES = {
    error: { icon: "!", color: "#ff4a5c", bg: "rgba(255,74,92,0.1)" },
    success: { icon: "\u2713", color: "#54D969", bg: "rgba(84,217,105,0.1)" },
    warning: { icon: "!", color: "#ffb02c", bg: "rgba(255,176,44,0.1)" },
    info: { icon: "i", color: "#4cb1ff", bg: "rgba(76,177,255,0.1)" },
    confirm: { icon: "?", color: "#577bff", bg: "rgba(87,123,255,0.1)" },
};

/**
 * A beautiful modal replacement for Alert.alert.
 *
 * Props:
 * - visible:  boolean
 * - title:    string
 * - message:  string
 * - type:     "error" | "success" | "warning" | "info" | "confirm"
 * - buttons:  Array<{ text, onPress?, style? ("cancel"|"destructive"|"default") }>
 * - onDismiss: called when the modal is dismissed
 */
export default function AlertModal({
    visible = false,
    title = "",
    message = "",
    type = "info",
    buttons = [],
    onDismiss,
}) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 80,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.85,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const typeConfig = ALERT_TYPES[type] || ALERT_TYPES.info;

    const resolvedButtons =
        buttons.length > 0 ? buttons : [{ text: "OK", style: "default" }];

    const handlePress = (btn) => {
        onDismiss?.();
        btn.onPress?.();
    };

    const getButtonStyle = (style) => {
        switch (style) {
            case "destructive":
                return { color: "#ff4a5c" };
            case "cancel":
                return { color: "#606770" };
            default:
                return { color: "#577bff" };
        }
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onDismiss}
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <TouchableWithoutFeedback onPress={onDismiss}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.centeredContainer,
                        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <View style={styles.card}>
                        {/* Icon circle */}
                        <View
                            style={[styles.iconCircle, { backgroundColor: typeConfig.bg }]}
                        >
                            <Text style={[styles.iconText, { color: typeConfig.color }]}>
                                {typeConfig.icon}
                            </Text>
                        </View>

                        {/* Title */}
                        {!!title && <Text style={styles.title}>{title}</Text>}

                        {/* Message */}
                        {!!message && <Text style={styles.message}>{message}</Text>}

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Buttons */}
                        <View
                            style={[
                                styles.buttonRow,
                                resolvedButtons.length === 1 && styles.buttonRowSingle,
                            ]}
                        >
                            {resolvedButtons.map((btn, index) => {
                                const isCancel = btn.style === "cancel";
                                const isDestructive = btn.style === "destructive";
                                const colorStyle = getButtonStyle(btn.style);

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.button,
                                            resolvedButtons.length > 1 && styles.buttonFlex,
                                            isCancel && styles.cancelButton,
                                            isDestructive && styles.destructiveButton,
                                            !isCancel && !isDestructive && styles.defaultButton,
                                            index > 0 && { marginLeft: 10 },
                                        ]}
                                        onPress={() => handlePress(btn)}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                isCancel && styles.cancelButtonText,
                                                isDestructive && styles.destructiveButtonText,
                                                !isCancel && !isDestructive && styles.defaultButtonText,
                                            ]}
                                        >
                                            {btn.text}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingTop: 28,
        paddingHorizontal: 24,
        paddingBottom: 18,
        width: "100%",
        maxWidth: 340,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
        alignItems: "center",
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    iconText: {
        fontSize: 26,
        fontWeight: "800",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a2e",
        textAlign: "center",
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 21,
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "#f0f0f0",
        width: "100%",
        marginVertical: 16,
    },
    buttonRow: {
        flexDirection: "row",
        width: "100%",
    },
    buttonRowSingle: {
        justifyContent: "center",
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 90,
    },
    buttonFlex: {
        flex: 1,
    },
    cancelButton: {
        backgroundColor: "#f3f4f6",
    },
    cancelButtonText: {
        color: "#606770",
        fontSize: 15,
        fontWeight: "600",
    },
    destructiveButton: {
        backgroundColor: "rgba(255,74,92,0.1)",
    },
    destructiveButtonText: {
        color: "#ff4a5c",
        fontSize: 15,
        fontWeight: "700",
    },
    defaultButton: {
        backgroundColor: "#577bff",
    },
    defaultButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    buttonText: {
        fontSize: 15,
        fontWeight: "600",
    },
});
