import React, { useState, useEffect, useRef } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from "react-native";
import Screen from "../../../components/layout/Screen";
import ChatHeader from "../../../components/ui/ChatHeader";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { COLORS, FONTS, IMAGES, SIZES } from "package/src/legacyApp";
import useChatController from "./controllers/ChatController";
import CustomButton from "package/src/legacyApp/components/CustomButton";
import { sendOtp } from "../../composition/authSession";

const SUGGESTION_CHIPS = [
    { id: 1, icon: "🆘", label: "Report emergency" },
    { id: 2, icon: "📍", label: "Find nearest shelter" },
    { id: 3, icon: "📋", label: "Preparedness tips" },
    { id: 4, icon: "🌊", label: "Weather updates" },
    { id: 5, icon: "💬", label: "Ask anything" },
];

/* ── Sub-components ────────────────────────────────────── */

function SuggestionChip({ icon, label, onPress }) {
    return (
        <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.chipIcon}>{icon}</Text>
            <Text style={styles.chipLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function MessageBubble({ message }) {
    const isUser = message.role === "user";
    return (
        <View
            style={[
                styles.bubble,
                isUser ? styles.bubbleUser : styles.bubbleAssistant,
                message.isError && styles.bubbleError,
            ]}
        >
            {!isUser && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image source={IMAGES.appLogo} style={styles.bubbleImage} />
                    <Text style={styles.bubbleSender}>SagipPH AI</Text>
                </View>

            )}
            <Text
                style={[
                    styles.bubbleText,
                    isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant,
                ]}
            >
                {message.text}
            </Text>
        </View>
    );
}

function BouncingDot({ delay }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -6],
    });

    const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.25],
    });

    return (
        <Animated.View
            style={[
                styles.dot,
                { transform: [{ translateY }, { scale }] },
            ]}
        />
    );
}

function TypingIndicator() {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.bubble,
                styles.bubbleAssistant,
                styles.typingBubble,
                { opacity: fadeAnim },
            ]}
        >
            <View style={styles.typingRow}>
                <View style={styles.dotsContainer}>
                    <BouncingDot delay={0} />
                    <BouncingDot delay={150} />
                    <BouncingDot delay={300} />
                </View>
                <Text style={styles.typingText}>SagipPH AI is thinking…</Text>
            </View>
        </Animated.View>
    );
}

function ChatInput({ value, onChangeText, onSend, disabled }) {
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
                    editable={!disabled}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !value.trim() && styles.sendButtonDisabled]}
                    onPress={onSend}
                    disabled={!value.trim() || disabled}
                    activeOpacity={0.7}
                >
                    <FontAwesomeIcon icon={faPaperPlane} size={16} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ── Main Screen ───────────────────────────────────────── */

export default function ChatScreen({ route }) {
    const [message, setMessage] = useState("");
    const { messages, isLoading, isReady, send, clearChat, loadChat, scrollViewRef } = useChatController();

    // When "New Chat" is tapped in the drawer, route.params.newChat changes
    useEffect(() => {
        if (route?.params?.newChat) {
            clearChat();
        }
    }, [route?.params?.newChat]);

    // When a chat history item is tapped, load that conversation
    useEffect(() => {
        if (route?.params?.loadChatId) {
            loadChat(route.params.loadChatId);
        }
    }, [route?.params?.loadChatId]);

    const hasMessages = messages.length > 0;

    const handleChipPress = (label) => {
        send(label);
    };

    const handleSend = () => {
        if (message.trim() && !isLoading) {
            send(message);
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
                <ChatHeader />

                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollArea}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {!hasMessages && (
                        <>
                            {/* Greeting — shown only before first message */}
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
                        </>
                    )}

                    {/* Conversation */}
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}

                    {isLoading && <TypingIndicator />}
                </ScrollView>

                <ChatInput
                    value={message}
                    onChangeText={setMessage}
                    onSend={handleSend}
                    disabled={isLoading}
                />
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bubbleImage: {
        width: 24,
        height: 24,
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

    // Message bubbles
    bubble: {
        maxWidth: "85%",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 12,
    },
    bubbleUser: {
        alignSelf: "flex-end",
        backgroundColor: COLORS.primary2,
        borderBottomRightRadius: 6,
    },
    bubbleAssistant: {
        alignSelf: "flex-start",
        backgroundColor: "#F3F4F6",
        borderBottomLeftRadius: 6,
    },
    bubbleError: {
        backgroundColor: COLORS.redLight,
    },
    bubbleSender: {
        fontSize: 11,
        fontFamily: "Poppins-SemiBold",
        color: COLORS.themePrimary,
        marginBottom: 4,
    },
    bubbleText: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: "NunitoSans-Regular",
    },
    bubbleTextUser: {
        color: COLORS.white,
    },
    bubbleTextAssistant: {
        color: COLORS.title,
    },

    // Typing indicator
    typingBubble: {
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: "#EEF0F4",
        borderRadius: 20,
        borderBottomLeftRadius: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
    },
    typingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dotsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        height: 20,
        justifyContent: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary2,
        opacity: 0.7,
    },
    typingText: {
        fontSize: 13,
        color: COLORS.text,
        fontFamily: "NunitoSans-Regular",
        fontStyle: "italic",
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
    sendButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary2,
    },
    sendButtonDisabled: {
        backgroundColor: "#D1D5DB",
    },
    sendIcon: {
        fontSize: 18,
        color: COLORS.white,
        fontWeight: "bold",
    },
});
