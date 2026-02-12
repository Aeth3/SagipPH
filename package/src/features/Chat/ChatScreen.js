import React, { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import Screen from "../../../components/layout/Screen";
import { COLORS, FONTS, SIZES } from "package/src/legacyApp";

const SUGGESTION_CHIPS = [
    { id: 1, icon: "🆘", label: "Report emergency" },
    { id: 2, icon: "📍", label: "Find nearest shelter" },
    { id: 3, icon: "📋", label: "Preparedness tips" },
    { id: 4, icon: "🌊", label: "Weather updates" },
    { id: 5, icon: "💬", label: "Ask anything" },
];

function SuggestionChip({ icon, label, onPress }) {
    return (
        <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.chipIcon}>{icon}</Text>
            <Text style={styles.chipLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function Header() {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Text style={styles.brandText}>SagipPH</Text>
            </View>
            <View style={styles.headerRight}>

                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>AJ</Text>
                </View>
            </View>
        </View>
    );
}

function ChatInput({ value, onChangeText, onSend }) {
    return (
        <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.inputAction}>
                    <Text style={styles.inputActionIcon}>＋</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.textInput}
                    placeholder="Ask SagipPH"
                    placeholderTextColor={COLORS.placeholderColor}
                    value={value}
                    onChangeText={onChangeText}
                    multiline={false}
                    returnKeyType="send"
                    onSubmitEditing={onSend}
                />
                <TouchableOpacity style={styles.inputAction}>
                    <Text style={styles.inputActionIcon}>🎤</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function ChatScreen({ route }) {
    const [message, setMessage] = useState("");

    const handleChipPress = (label) => {
        setMessage(label);
    };

    const handleSend = () => {
        if (message.trim()) {
            // TODO: handle send
            setMessage("");
        }
    };

    return (
        <Screen style={{ paddingVertical: route?.params?.paddingTop }}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <Header />

                <ScrollView
                    style={styles.scrollArea}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Greeting */}
                    <View style={styles.greetingSection}>
                        <Text style={styles.greetingHi}>Hi AJ</Text>
                        <Text style={styles.greetingMain}>Where should{"\n"}we start?</Text>
                    </View>

                    {/* Suggestion chips */}
                    <View style={styles.chipsContainer}>
                        {SUGGESTION_CHIPS.map((chip) => (
                            <SuggestionChip
                                key={chip.id}
                                icon={chip.icon}
                                label={chip.label}
                                onPress={() => handleChipPress(chip.label)}
                            />
                        ))}
                    </View>
                </ScrollView>

                <ChatInput
                    value={message}
                    onChangeText={setMessage}
                    onSend={handleSend}
                />
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Header
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

    // Scroll
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
    },

    // Greeting
    greetingSection: {
        marginBottom: 36,
    },
    greetingHi: {
        fontSize: 16,
        color: COLORS.text,
        fontFamily: "NunitoSans-Regular",
        marginBottom: 4,
    },
    greetingMain: {
        fontSize: 34,
        fontFamily: "Poppins-SemiBold",
        color: COLORS.title,
        lineHeight: 42,
    },

    // Chips
    chipsContainer: {
        flexDirection: "column",
        gap: 12,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 28,
        alignSelf: "flex-start",
        gap: 10,
    },
    chipIcon: {
        fontSize: 18,
    },
    chipLabel: {
        fontSize: 15,
        color: COLORS.title,
        fontFamily: "NunitoSans-Regular",
    },

    // Input
    inputWrapper: {
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === "ios" ? 24 : 16,
        paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.borderColor,
        backgroundColor: COLORS.white,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 28,
        paddingHorizontal: 6,
        paddingVertical: 4,
        minHeight: 50,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.title,
        fontFamily: "NunitoSans-Regular",
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    inputAction: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },
    inputActionIcon: {
        fontSize: 20,
        color: COLORS.text,
    },
});
