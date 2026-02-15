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
} from "react-native";
import Screen from "../../../components/layout/Screen";
import ChatHeader from "../../../components/ui/ChatHeader";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faPaperPlane,
    faPhone,
    faMinus,
    faPlus,
    faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { COLORS, IMAGES } from "package/src/legacyApp";
import useChatController from "./controllers/ChatController";
import { useOfflineStatus } from "../../presentation/hooks/useOfflineStatus";
import { useAlertModal } from "package/src/presentation/hooks/useAlertModal";
import SendSMS from "react-native-sms";
import { useNavigation } from "@react-navigation/native";
import SearchableDropdown from "../../../components/ui/SearchableDropdown";
import chatConfig from "./config.json";


const SUGGESTION_CHIPS = chatConfig.SUGGESTION_CHIPS;
const RISK_LEVELS = chatConfig.RISK_LEVELS.map(risk => ({
    ...risk,
    color: typeof risk.color === 'string' && risk.color.startsWith('COLORS.')
        ? COLORS[risk.color.replace('COLORS.', '')]
        : risk.color,
}));
const PEOPLE_GROUPS = chatConfig.PEOPLE_GROUPS;
const BARANGAY_OPTIONS = chatConfig.BARANGAY_OPTIONS;

const normalizeContactInput = (value) => {
    let digits = (value ?? "").replace(/\D/g, "");
    if (digits.startsWith("63")) digits = digits.slice(2);
    if (digits.startsWith("0")) digits = digits.slice(1);
    return digits.slice(0, 10);
};

const isValidPhMobileLocal = (localNumber) => /^9\d{9}$/.test(localNumber);

function AnimatedButton({
    style,
    onPress,
    disabled,
    children,
    scaleTo = 0.96,
    activeOpacity = 1,
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const animateTo = (scale, opacity) => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: scale,
                duration: 90,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: opacity,
                duration: 90,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={activeOpacity}
            onPressIn={() => {
                if (!disabled) animateTo(scaleTo, 0.9);
            }}
            onPressOut={() => animateTo(1, 1)}
        >
            <Animated.View
                style={[
                    style,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    },
                ]}
            >
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
}

function SuggestionChip({ icon, label, onPress, disabled }) {
    return (
        <AnimatedButton
            style={[styles.chip, disabled && styles.chipDisabled]}
            onPress={onPress}
            disabled={disabled}
            scaleTo={0.97}
        >
            <Text style={styles.chipIcon}>{icon}</Text>
            <Text style={styles.chipLabel}>{label}</Text>
        </AnimatedButton>
    );
}

function MessageBubble({ message }) {
    const isUser = message.role === "user";
    const appearAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(appearAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [appearAnim]);

    const translateY = appearAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [8, 0],
    });

    return (
        <Animated.View
            style={[
                styles.bubble,
                isUser ? styles.bubbleUser : styles.bubbleAssistant,
                message.isError && styles.bubbleError,
                { opacity: appearAnim, transform: [{ translateY }] },
            ]}
        >
            {!isUser && (
                <View style={styles.bubbleHeader}>
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
        </Animated.View>
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
    }, [anim, delay]);

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
    }, [fadeAnim]);

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
                <Text style={styles.typingText}>SagipPH AI is thinking...</Text>
            </View>
        </Animated.View>
    );
}

function ChatInput({ value, onChangeText, onSend, disabled, isOnline }) {
    if (!isOnline) {
        // When offline, show a full-width send button (disabled)
        return (
            <View style={styles.inputWrapper}>
                <AnimatedButton
                    style={[styles.sendButton, { width: '100%', borderRadius: 28, justifyContent: 'center', alignItems: 'center', height: 50 }]}
                    onPress={onSend}
                    disabled={false}
                    scaleTo={0.98}
                >
                    <Text style={{ color: COLORS.white, fontSize: 16, fontFamily: 'NunitoSans-Bold' }}>
                        Send Rescue Request via SMS
                    </Text>
                </AnimatedButton>
            </View>
        );
    }
    return (
        <View style={styles.inputWrapper}>
            <View style={[styles.inputContainer, disabled && styles.inputContainerDisabled]}>
                <AnimatedButton style={styles.inputAction} disabled={disabled} scaleTo={0.9}>
                    <Text style={styles.inputActionIcon}>+</Text>
                </AnimatedButton>
                <TextInput
                    style={styles.textInput}
                    placeholder={disabled ? "Chat unavailable while offline" : "Ask SagipPH"}
                    placeholderTextColor={COLORS.placeholderColor}
                    value={value}
                    onChangeText={onChangeText}
                    multiline={false}
                    returnKeyType="send"
                    onSubmitEditing={onSend}
                    editable={!disabled}
                />
                <AnimatedButton
                    style={[
                        styles.sendButton,
                        (!value.trim() && isOnline) && styles.sendButtonDisabled,
                    ]}
                    onPress={onSend}
                    disabled={!value.trim() && isOnline}
                    scaleTo={0.9}
                >
                    <FontAwesomeIcon icon={faPaperPlane} size={16} color={COLORS.white} />
                </AnimatedButton>
            </View>
        </View>
    );
}

function CounterRow({ label, value, onDecrement, onIncrement, isLast }) {
    return (
        <View style={[styles.counterRow, isLast && styles.counterRowLast]}>
            <Text style={styles.counterLabel}>{label}</Text>
            <View style={styles.counterActions}>
                <AnimatedButton style={styles.counterBtn} onPress={onDecrement} scaleTo={0.88}>
                    <FontAwesomeIcon icon={faMinus} size={10} color={COLORS.title} />
                </AnimatedButton>
                <Text style={styles.counterValue}>{value}</Text>
                <AnimatedButton style={styles.counterBtn} onPress={onIncrement} scaleTo={0.88}>
                    <FontAwesomeIcon icon={faPlus} size={10} color={COLORS.title} />
                </AnimatedButton>
            </View>
        </View>
    );
}

function AnimatedContactItem({ children }) {
    const enterAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(enterAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
        }).start();
    }, [enterAnim]);

    const translateY = enterAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-12, 0],
    });

    return (
        <Animated.View style={{ opacity: enterAnim, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
}

function ContactInputRow({
    contactId,
    displayIndex,
    contact,
    errorMessage,
    onChangeAdditionalContact,
    onBlurAdditionalContact,
    onRemoveAdditionalContact,
}) {
    const exitOpacity = useRef(new Animated.Value(1)).current;
    const exitTranslateY = useRef(new Animated.Value(0)).current;
    const exitScaleY = useRef(new Animated.Value(1)).current;
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemovePress = () => {
        if (isRemoving) return;
        setIsRemoving(true);
        Animated.parallel([
            Animated.timing(exitOpacity, {
                toValue: 0,
                duration: 170,
                useNativeDriver: true,
            }),
            Animated.timing(exitTranslateY, {
                toValue: -8,
                duration: 170,
                useNativeDriver: true,
            }),
            Animated.timing(exitScaleY, {
                toValue: 0.92,
                duration: 170,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) onRemoveAdditionalContact(contactId);
        });
    };

    return (
        <Animated.View
            style={{
                opacity: exitOpacity,
                transform: [{ translateY: exitTranslateY }, { scaleY: exitScaleY }],
            }}
        >
            <AnimatedContactItem>
                <View style={styles.contactItemWrap}>
                    <View style={styles.contactFieldWrap}>
                        <FontAwesomeIcon icon={faPhone} size={14} color={COLORS.title} />
                        <Text style={styles.countryCode}>+63</Text>
                        <TextInput
                            style={styles.altInput}
                            placeholder={`9XXXXXXXXX (Contact ${displayIndex + 1})`}
                            placeholderTextColor={COLORS.placeholderColor}
                            value={contact}
                            onChangeText={(value) => onChangeAdditionalContact(contactId, value)}
                            onBlur={() => onBlurAdditionalContact(contactId)}
                            keyboardType="phone-pad"
                        />
                        <AnimatedButton
                            style={styles.removeContactBtn}
                            onPress={handleRemovePress}
                            scaleTo={0.9}
                            disabled={isRemoving}
                        >
                            <Text style={styles.removeContactBtnText}>Remove</Text>
                        </AnimatedButton>
                    </View>
                    {!!errorMessage && <Text style={styles.contactErrorText}>{errorMessage}</Text>}
                </View>
            </AnimatedContactItem>
        </Animated.View>
    );
}

function OfflineRescueFields({
    barangay,
    onChangeBarangay,
    onBlurBarangay,
    barangayError,
    additionalContacts,
    onAddContact,
    onChangeAdditionalContact,
    onRemoveAdditionalContact,
    onBlurAdditionalContact,
    getAdditionalContactError,
    selectedRisk,
    onSelectRisk,
    peopleCounts,
    onChangePeopleCount,
}) {
    const belowFieldsTranslateY = useRef(new Animated.Value(0)).current;
    const prevContactsCountRef = useRef(additionalContacts.length);

    useEffect(() => {
        const prevCount = prevContactsCountRef.current;
        const isAdding = additionalContacts.length > prevCount;
        const startTranslate = isAdding ? -14 : 14;

        belowFieldsTranslateY.setValue(startTranslate);

        Animated.timing(belowFieldsTranslateY, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
        }).start();

        prevContactsCountRef.current = additionalContacts.length;
    }, [additionalContacts.length, belowFieldsTranslateY]);

    return (
        <View style={styles.offlineCard}>
            <Text style={styles.sectionTitle}>Rescue Request ⛑️</Text>

            <View style={styles.verifiedWrap}>
                <View style={styles.verifiedHeader}>
                    <FontAwesomeIcon icon={faCircleCheck} size={12} color={COLORS.red} />
                    <Text style={styles.verifiedLabel}>Barangay:</Text>
                </View>
                <View style={!!barangayError && styles.dropdownErrorWrap}>
                    <SearchableDropdown
                        value={barangay}
                        options={BARANGAY_OPTIONS}
                        onChange={(nextValue) => {
                            onChangeBarangay(nextValue);
                            onBlurBarangay();
                        }}
                        placeholder="Select barangay"
                        title="Choose Barangay"
                        searchPlaceholder="Search barangay"
                    />
                </View>
                {!!barangayError && <Text style={styles.barangayErrorText}>{barangayError}</Text>}
            </View>

            <AnimatedButton style={styles.altContactWrap} onPress={onAddContact} scaleTo={0.97}>
                <Text style={styles.altPrefix}>+</Text>
                <Text style={styles.addContactLabel}>Add Another Contact (Optional)</Text>
            </AnimatedButton>

            {additionalContacts.map((contact, index) => {
                const errorMessage = getAdditionalContactError(contact.id);
                return (
                    <ContactInputRow
                        key={contact.id}
                        contactId={contact.id}
                        displayIndex={index}
                        contact={contact.value}
                        errorMessage={errorMessage}
                        onChangeAdditionalContact={onChangeAdditionalContact}
                        onBlurAdditionalContact={onBlurAdditionalContact}
                        onRemoveAdditionalContact={onRemoveAdditionalContact}
                    />
                );
            })}

            <Animated.View
                style={{
                    transform: [{ translateY: belowFieldsTranslateY }],
                    gap: 12,
                }}
            >
                <Text style={styles.sectionLabel}>Select Current Risk Level</Text>
                <View style={styles.riskRow}>
                    {RISK_LEVELS.map((risk) => {
                        const isSelected = selectedRisk === risk.id;
                        return (
                            <AnimatedButton
                                key={risk.id}
                                style={[
                                    styles.riskChip,
                                    { backgroundColor: isSelected ? risk.color : risk.lightColor },
                                    isSelected && styles.riskChipSelected,
                                ]}
                                onPress={() => onSelectRisk(risk.id)}
                                scaleTo={0.95}
                            >
                                <Text style={[styles.riskTitle, !isSelected && styles.riskTitleLight]}>
                                    {risk.label}
                                </Text>
                                <Text style={[styles.riskSub, !isSelected && styles.riskSubLight]}>
                                    {risk.subLabel}
                                </Text>
                            </AnimatedButton>
                        );
                    })}
                </View>

                <Text style={styles.sectionLabel}>People Involved</Text>
                <View style={styles.peopleCard}>
                    {PEOPLE_GROUPS.map((group, index) => (
                        <CounterRow
                            key={group.id}
                            label={group.label}
                            value={peopleCounts[group.id] ?? 0}
                            onDecrement={() => onChangePeopleCount(group.id, -1)}
                            onIncrement={() => onChangePeopleCount(group.id, 1)}
                            isLast={index === PEOPLE_GROUPS.length - 1}
                        />
                    ))}
                </View>
            </Animated.View>
        </View>
    );
}

export default function ChatScreen({ route }) {
    const navigation = useNavigation();
    const [message, setMessage] = useState("");
    const [barangay, setBarangay] = useState("");
    const [barangayTouched, setBarangayTouched] = useState(false);
    const [additionalContacts, setAdditionalContacts] = useState([]);
    const nextContactIdRef = useRef(1);
    const [selectedRisk, setSelectedRisk] = useState("moderate");
    const [peopleCounts, setPeopleCounts] = useState({
        seniors: 0,
        kids: 0,
        pregnant: 0,
        adults: 0,
    });
    const { showAlert, alertModal } = useAlertModal();
    const { messages, isLoading, send, clearChat, loadChat, scrollViewRef } = useChatController();
    const { isOnline } = useOfflineStatus();
    const hasAutoClearedOfflineRef = useRef(false);

    useEffect(() => {
        if (route?.params?.newChat) {
            clearChat();
        }
    }, [clearChat, route?.params?.newChat]);

    useEffect(() => {
        if (route?.params?.loadChatId) {
            if (!isOnline) {
                // If offline and trying to load a chat from history, reset to new chat and show alert
                clearChat();
                navigation.setParams({ loadChatId: undefined, newChat: true });
                showAlert(
                    "Offline mode",
                    "You are offline. Cannot load chat history. Starting a new chat instead.",
                    [{ text: "OK" }],
                    { type: "info" }
                );
            } else {
                loadChat(route.params.loadChatId);
            }
        }
    }, [loadChat, route?.params?.loadChatId, route?.params, isOnline, clearChat, navigation, showAlert]);

    useEffect(() => {
        if (isOnline) {
            hasAutoClearedOfflineRef.current = false;
            return;
        }

        if (messages.length > 0 && !hasAutoClearedOfflineRef.current) {
            hasAutoClearedOfflineRef.current = true;
            clearChat();
            showAlert(
                "Started new chat",
                "Connection is down. A new chat was created so you can submit an offline rescue request.",
                [{ text: "OK" }],
                { type: "info" }
            );
        }
    }, [clearChat, isOnline, messages.length, showAlert]);

    const hasMessages = messages.length > 0;
    const interactionsDisabled = isLoading || !isOnline;
    const barangayError = barangayTouched && !barangay.trim() ? "Barangay is required." : null;

    const showOfflineAlert = () => {
        showAlert(
            "No internet connection",
            "Chat is unavailable while offline.",
            [{ text: "OK" }],
            { type: "info" }
        );
    };

    const handleChipPress = (label) => {
        if (!isOnline) {
            showOfflineAlert();
            return;
        }
        send(label);
    };

    const handleSend = () => {
        if (!isOnline) {
            handleOfflineSend();
            return;
        }
        if (message.trim() && !isLoading) {
            send(message);
            setMessage("");
        }
    };

    const handleOfflineSend = () => {
        if (!barangay.trim()) {
            setBarangayTouched(true);
            showAlert(
                "Missing barangay",
                "Please enter your barangay before sending an offline SMS request.",
                [{ text: "OK" }],
                { type: "warning" }
            );
            return;
        }

        // Validate all additional contacts
        const invalidContacts = additionalContacts.filter(
            (item) => item.value && !isValidPhMobileLocal(item.value)
        );
        if (invalidContacts.length > 0) {
            showAlert(
                "Invalid contact(s)",
                "Please enter valid mobile numbers for all additional contacts (format: 9XXXXXXXXX).",
                [{ text: "OK" }],
                { type: "warning" }
            );
            return;
        }

        const validContacts = additionalContacts
            .map((item) => item.value)
            .filter((value) => isValidPhMobileLocal(value))
            .map((value) => `+63${value}`);

        // Require at least one valid contact number
        if (validContacts.length === 0) {
            showAlert(
                "Contact required",
                "Please add at least one valid contact number (format: 9XXXXXXXXX) before sending your request.",
                [{ text: "OK" }],
                { type: "warning" }
            );
            return;
        }

        const peopleSummary = PEOPLE_GROUPS
            .map((group) => `${group.label}: ${peopleCounts[group.id] ?? 0}`)
            .join("|");

        const smsBody = [
            "SAGIPPH OFFLINE RESCUE REQUEST",
            `Barangay: ${barangay.trim()}`,
            `Risk Level: ${selectedRisk}`,
            "People Involved:",
            peopleSummary,
            `Additional Contacts: ${validContacts.length > 0 ? validContacts.join(", ") : "None"}`,
            `Notes: ${message.trim() || "N/A"}`,
        ].join("|");

        SendSMS.send(
            {
                body: smsBody,
                recipients: validContacts,
                successTypes: ["sent", "queued"],
                allowAndroidSendWithoutReadPermission: true,
            },
            (completed, cancelled, error) => {
                if (error) {
                    showAlert(
                        "Failed to open SMS",
                        "Unable to open the default messaging app right now.",
                        [{ text: "OK" }],
                        { type: "error" }
                    );
                    return;
                }

                if (cancelled) return;

                if (completed) {
                    setMessage("");
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    } else {
                        navigation.navigate("ChatStack", { screen: "Chat" });
                    }
                }
            }
        );
    };

    const handlePeopleCount = (groupId, delta) => {
        setPeopleCounts((prev) => ({
            ...prev,
            [groupId]: Math.max(0, (prev[groupId] ?? 0) + delta),
        }));
    };

    const handleAddContact = () => {
        const nextId = nextContactIdRef.current;
        nextContactIdRef.current += 1;
        setAdditionalContacts((prev) => [...prev, { id: nextId, value: "", touched: false }]);
    };

    const handleChangeAdditionalContact = (contactId, value) => {
        const normalizedValue = normalizeContactInput(value);
        setAdditionalContacts((prev) =>
            prev.map((item) => (
                item.id === contactId ? { ...item, value: normalizedValue } : item
            ))
        );
    };

    const handleBlurAdditionalContact = (contactId) => {
        setAdditionalContacts((prev) =>
            prev.map((item) => (
                item.id === contactId ? { ...item, touched: true } : item
            ))
        );
    };

    const handleRemoveAdditionalContact = (contactId) => {
        setAdditionalContacts((prev) => prev.filter((item) => item.id !== contactId));
    };

    const getAdditionalContactError = (contactId) => {
        const current = additionalContacts.find((item) => item.id === contactId);
        const value = current?.value ?? "";
        const touched = current?.touched;
        if (!value) return null;
        if (!isValidPhMobileLocal(value) && touched) {
            return "Enter a valid mobile number (9XXXXXXXXX).";
        }
        return null;
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
                            {isOnline ? (
                                <>
                                    <View style={styles.greetingSection}>
                                        <Text style={styles.greetingHi}>Hi AJ</Text>
                                        <Text style={styles.greetingMain}>Where should{"\n"}we start?</Text>
                                    </View>

                                    <View style={styles.chipsContainer}>
                                        {SUGGESTION_CHIPS.map((chip) => (
                                            <SuggestionChip
                                                key={chip.id}
                                                icon={chip.icon}
                                                label={chip.label}
                                                onPress={() => handleChipPress(chip.label)}
                                                disabled={interactionsDisabled}
                                            />
                                        ))}
                                    </View>
                                </>
                            ) : (
                                <OfflineRescueFields
                                    barangay={barangay}
                                    onChangeBarangay={setBarangay}
                                    onBlurBarangay={() => setBarangayTouched(true)}
                                    barangayError={barangayError}
                                    additionalContacts={additionalContacts}
                                    onAddContact={handleAddContact}
                                    onChangeAdditionalContact={handleChangeAdditionalContact}
                                    onRemoveAdditionalContact={handleRemoveAdditionalContact}
                                    onBlurAdditionalContact={handleBlurAdditionalContact}
                                    getAdditionalContactError={getAdditionalContactError}
                                    selectedRisk={selectedRisk}
                                    onSelectRisk={setSelectedRisk}
                                    peopleCounts={peopleCounts}
                                    onChangePeopleCount={handlePeopleCount}
                                />
                            )}
                        </>
                    )}

                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}

                    {isLoading && <TypingIndicator />}
                </ScrollView>

                <ChatInput
                    value={message}
                    onChangeText={setMessage}
                    onSend={handleSend}
                    disabled={interactionsDisabled}
                    isOnline={isOnline}
                />
            </KeyboardAvoidingView>
            {alertModal}
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
    bubbleHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
    },

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
    chipDisabled: {
        opacity: 0.55,
    },
    chipIcon: {
        fontSize: 18,
    },
    chipLabel: {
        fontSize: 15,
        color: COLORS.title,
        fontFamily: "NunitoSans-Regular",
    },

    offlineCard: {
        backgroundColor: "transparent",
        borderRadius: 0,
        padding: 0,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 22,
        color: COLORS.title,
        fontFamily: "Poppins-SemiBold",
    },
    verifiedWrap: {
        gap: 8,
    },
    verifiedHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    verifiedLabel: {
        fontSize: 14,
        color: COLORS.title,
        fontFamily: "NunitoSans-SemiBold",
    },
    phoneField: {
        borderWidth: 1,
        borderColor: "transparent",
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingVertical: 11,
        backgroundColor: "#F3F4F6",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dropdownErrorWrap: {
        borderWidth: 1,
        borderColor: COLORS.red,
        borderRadius: 28,
        padding: 1,
    },
    phoneValue: {
        flex: 1,
        fontSize: 16,
        color: COLORS.title,
        fontFamily: "NunitoSans-Regular",
        paddingVertical: 0,
    },
    barangayErrorText: {
        marginLeft: 18,
        fontSize: 12,
        color: COLORS.red,
        fontFamily: "NunitoSans-Regular",
    },
    altContactWrap: {
        borderWidth: 1,
        borderColor: COLORS.primary2,
        borderRadius: 28,
        paddingHorizontal: 18,
        minHeight: 48,
        backgroundColor: "#EAF7F2",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    contactFieldWrap: {
        borderWidth: 0,
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: "#F3F4F6",
        flexDirection: "row",
        alignItems: "center",
    },
    removeContactBtn: {
        marginLeft: 8,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#FEE2E2",
    },
    removeContactBtnText: {
        fontSize: 12,
        color: COLORS.red,
        fontFamily: "NunitoSans-Bold",
    },
    contactItemWrap: {
        gap: 4,
    },
    addContactLabel: {
        flex: 0,
        fontSize: 15,
        color: COLORS.primary2,
        fontFamily: "NunitoSans-Bold",
    },
    altPrefix: {
        fontSize: 20,
        color: COLORS.primary2,
        lineHeight: 24,
        marginRight: 8,
        fontFamily: "NunitoSans-Bold",
    },
    altInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.title,
        fontFamily: "NunitoSans-Regular",
        paddingVertical: 0,
    },
    countryCode: {
        marginLeft: 8,
        marginRight: 6,
        fontSize: 15,
        color: COLORS.title,
        fontFamily: "NunitoSans-SemiBold",
    },
    contactErrorText: {
        marginLeft: 18,
        fontSize: 12,
        color: COLORS.red,
        fontFamily: "NunitoSans-Regular",
    },
    sectionLabel: {
        fontSize: 16,
        color: COLORS.title,
        fontFamily: "NunitoSans-SemiBold",
    },
    riskRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    riskChip: {
        borderRadius: 28,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        minWidth: "48%",
    },
    riskChipSelected: {
        borderColor: COLORS.title,
    },
    riskTitle: {
        fontSize: 15,
        color: COLORS.white,
        fontFamily: "Poppins-SemiBold",
    },
    riskSub: {
        fontSize: 11,
        color: COLORS.white,
        fontFamily: "NunitoSans-Regular",
    },
    riskTitleLight: {
        color: COLORS.title,
    },
    riskSubLight: {
        color: COLORS.text,
    },
    peopleCard: {
        backgroundColor: "transparent",
        gap: 8,
    },
    counterRow: {
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        backgroundColor: "#F3F4F6",
        borderRadius: 28,
    },
    counterRowLast: {
        borderBottomWidth: 0,
    },
    counterLabel: {
        flex: 1,
        fontSize: 15,
        color: COLORS.title,
        fontFamily: "NunitoSans-Regular",
    },
    counterActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    counterBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.white,
    },
    counterValue: {
        width: 24,
        textAlign: "center",
        fontSize: 16,
        color: COLORS.title,
        fontFamily: "NunitoSans-Bold",
    },

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
        color: COLORS.primary2,
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
    inputContainerDisabled: {
        opacity: 0.7,
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
});
