import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { requestLocationPermission, getCurrentPosition } from "../../lib/geolocationHelper";
import { DrawerContentScrollView, useDrawerStatus } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { drawerRoutes } from "../../routes/drawerRoutes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faChevronUp, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useNavigationState } from '@react-navigation/native';
import ProfileHeader from "./ProfileHeader";
import { useAlertModal } from "../../src/presentation/hooks/useAlertModal";
import { useOfflineStatus } from "../../src/presentation/hooks/useOfflineStatus";
import { COLORS } from "package/src/legacyApp";
import { getChats, clearChats } from "../../src/composition/chat"
import { getCurrentUser } from "../../src/composition/authSession";
import { getCurrentLocation } from "../../utils/getCurrentLocation"

const MAX_VISIBLE_HISTORY = 5;

export default function CustomDrawer({ navigation, logout }) {
    const { isOnline } = useOfflineStatus();
    const [expanded, setExpanded] = useState({});
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const { showAlert, alertModal } = useAlertModal();

    const state = useNavigationState((state) => state);
    const currentRoute = state.routes[state.index]?.name;
    const isChatHistoryExpanded = expanded.ChatHistory;
    const drawerStatus = useDrawerStatus();

    useEffect(() => {
        (async () => {
            const userResult = await getCurrentUser();
            const userId = userResult?.ok ? userResult?.value?.id || null : null;
            setCurrentUserId(userId);
        })();
    }, []);

    // Fetch chat history whenever the drawer opens
    const loadChatHistory = useCallback(async () => {
        try {
            const result = await getChats(currentUserId);
            if (result.ok) {
                // Show all persisted chats, including newly created ones with default title.
                setChatHistory(result.value || []);
            }
        } catch (err) {
            console.warn("[CustomDrawer] Failed to load chat history:", err);
        }
    }, [currentUserId]);

    useEffect(() => {
        loadChatHistory();
    }, [loadChatHistory]);

    // Refresh chat history every time the drawer becomes open.
    useEffect(() => {
        if (drawerStatus === "open") {
            loadChatHistory();
        }
    }, [drawerStatus, loadChatHistory]);

    // Refresh chat history each time the "ChatHistory" dropdown is expanded
    useEffect(() => {
        if (isChatHistoryExpanded) {
            loadChatHistory();
        }
    }, [isChatHistoryExpanded, loadChatHistory]);

    const handleClearChats = useCallback(() => {
        showAlert(
            "Clear chat history",
            "This will permanently delete all chats and messages. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await clearChats(currentUserId);
                            if (!result?.ok) {
                                throw new Error(result?.error?.message || "Failed to clear chats");
                            }
                            setShowAllHistory(false);
                            await loadChatHistory();
                            navigation.navigate("ChatStack", {
                                screen: "Chat",
                                params: { newChat: Date.now() },
                            });
                        } catch (err) {
                            console.warn("[CustomDrawer] Failed to clear chats:", err);
                            showAlert("Clear failed", "Unable to clear chats right now.");
                        }
                    },
                },
            ],
            { type: "confirm" }
        );
    }, [currentUserId, loadChatHistory, navigation, showAlert]);

    const handleLogout = useCallback(() => {
        showAlert(
            "Confirm Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                    },
                },
            ],
            { type: "confirm" }
        );
    }, [logout, showAlert]);

    return (
        <>
            <ProfileHeader propStyles={{ marginTop: 20, backgroundColor: COLORS.white }} />
            <View style={styles.menu}>

                {drawerRoutes.map((route) => {
                    const hasChildren = Array.isArray(route.children);
                    const isParentActive =
                        hasChildren && route.children.some(child => currentRoute === child.name);

                    return (
                        <View key={route.name}>
                            {/* Parent dropdown */}
                            {hasChildren && (
                                <TouchableOpacity
                                    style={[styles.parentItem, isParentActive && styles.activeItem]}
                                    onPress={() =>
                                        setExpanded(prev => ({ ...prev, [route.name]: !prev[route.name] }))
                                    }
                                >
                                    <Text style={[styles.parentText, isParentActive && [styles.activeText, { color: COLORS.primary2 }]]}>
                                        {route.label}
                                    </Text>
                                    <FontAwesomeIcon
                                        icon={expanded[route.name] ? faChevronUp : faChevronDown}
                                        size={14}
                                        color={isParentActive ? COLORS.primary2 : "#666"}
                                    />
                                </TouchableOpacity>
                            )}

                            {/* Children — dynamic (chat history) or static */}
                            {hasChildren && expanded[route.name] && (
                                <View style={styles.childContainer}>
                                    {route.dynamicChildren ? (
                                        chatHistory.length > 0 ? (
                                            <>
                                                {chatHistory.slice(0, MAX_VISIBLE_HISTORY).map((chat) => (
                                                    <TouchableOpacity
                                                        key={chat.id}
                                                        style={[styles.childItem, !isOnline && { opacity: 0.5 }]}
                                                        // disabled={!isOnline}
                                                        onPress={() => {
                                                            if (!isOnline) {
                                                                showAlert(
                                                                    "Offline mode",
                                                                    "You are offline. Chat history is disabled.",
                                                                    [{ text: "OK" }],
                                                                    { type: "info" }
                                                                );
                                                                return;
                                                            }
                                                            navigation.navigate("ChatStack", {
                                                                screen: "Chat",
                                                                params: { loadChatId: chat.id },
                                                            });
                                                        }}
                                                    >
                                                        <Text
                                                            style={[styles.childText, { color: COLORS.placeholderColor }]}
                                                            numberOfLines={1}
                                                        >
                                                            {chat.title}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                                {chatHistory.length > MAX_VISIBLE_HISTORY && (
                                                    <TouchableOpacity
                                                        style={styles.seeMoreButton}
                                                        onPress={() => setShowAllHistory(true)}
                                                    >
                                                        <Text style={styles.seeMoreText}>See more ({chatHistory.length - MAX_VISIBLE_HISTORY})</Text>
                                                    </TouchableOpacity>
                                                )}
                                                <TouchableOpacity
                                                    style={styles.clearHistoryButton}
                                                    onPress={handleClearChats}
                                                >
                                                    <Text style={styles.clearHistoryText}>Clear chats</Text>
                                                </TouchableOpacity>
                                            </>
                                        ) : (
                                            <Text style={[styles.childText, { color: COLORS.placeholderColor, paddingHorizontal: 12, paddingVertical: 8 }]}>
                                                No chat history yet
                                            </Text>
                                        )
                                    ) : (
                                        route.children.map((child) => {
                                            const isActive = currentRoute === child.name;
                                            return (
                                                <TouchableOpacity
                                                    key={child.name}
                                                    style={[styles.childItem, isActive && styles.activeChildItem]}
                                                    onPress={() => navigation.navigate(child.name)}
                                                >
                                                    <Text style={[[styles.childText, { color: COLORS.placeholderColor }], isActive && [styles.activeText, { color: COLORS.primary2 }]]}>
                                                        {child.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })
                                    )}
                                </View>
                            )}

                            {/* Top-level items (no children) */}
                            {!hasChildren && (
                                <TouchableOpacity
                                    style={[styles.parentItem, !route.disableSelected && currentRoute === route.name && styles.activeItem]}
                                    onPress={() => {
                                        if (route.disableSelected) {
                                            (async () => {
                                                try {
                                                    const chatsResult = await getChats(currentUserId);

                                                    if (chatsResult.ok && chatsResult.value.length > 0) {
                                                        const currentChat = chatsResult.value[0];

                                                        const { getMessages } = await import("../../src/composition/chat");
                                                        const messagesResult = await getMessages(currentChat.id);

                                                        // ✅ If newest chat is empty → open it instead of alerting
                                                        if (messagesResult.ok && messagesResult.value.length === 0) {
                                                            navigation.navigate("ChatStack", {
                                                                screen: "Chat",
                                                                params: { loadChatId: currentChat.id },
                                                            });
                                                            return;
                                                        }
                                                    }

                                                    // ✅ Otherwise create a brand new chat
                                                    navigation.navigate(route.name, {
                                                        screen: "Chat",
                                                        params: { newChat: Date.now() },
                                                    });

                                                } catch (err) {
                                                    showAlert(
                                                        "Error",
                                                        "Unable to check chat messages. Please try again.",
                                                        [{ text: "OK" }],
                                                        { type: "warning" }
                                                    );
                                                }
                                            })();
                                        }
                                        else {
                                            navigation.navigate(route.name);
                                        }
                                    }}
                                >
                                    <Text style={[styles.parentText, !route.disableSelected && currentRoute === route.name && styles.activeText]}>
                                        {route.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                {/* Divider */}
                <View style={styles.divider} />

                {/* 🚪 Logout Button */}
                <TouchableOpacity
                    style={styles.logoutItem}
                    onPress={handleLogout}
                >
                    <FontAwesomeIcon icon={faRightFromBracket} size={16} color={COLORS.danger} />
                    <Text style={[styles.logoutText, { color: COLORS.danger }]}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Chat History Modal */}
            <Modal
                visible={showAllHistory}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAllHistory(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chat History</Text>
                            <TouchableOpacity onPress={() => setShowAllHistory(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={chatHistory}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, !isOnline && { opacity: 0.5 }]}
                                    disabled={!isOnline}
                                    onPress={() => {
                                        if (!isOnline) {
                                            showAlert(
                                                "Offline mode",
                                                "You are offline. Chat history is disabled.",
                                                [{ text: "OK" }],
                                                { type: "info" }
                                            );
                                            return;
                                        }
                                        setShowAllHistory(false);
                                        navigation.navigate("ChatStack", {
                                            screen: "Chat",
                                            params: { loadChatId: item.id },
                                        });
                                    }}
                                >
                                    <Text style={styles.modalItemText} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                        />
                    </View>
                </View>
            </Modal>

            {alertModal}
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContent: { flex: 1 },
    menu: { padding: 10, flex: 1 },
    parentItem: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 12,
        marginBottom: 4,
    },
    parentText: { fontSize: 16, fontWeight: "600", color: COLORS.primary2 },
    childContainer: { paddingLeft: 20, marginTop: 5 },
    childItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 4,
    },
    childText: { fontSize: 14, color: "#555", fontWeight: "700" },
    activeItem: { backgroundColor: "#1e90ff33" },
    activeChildItem: { backgroundColor: "#1e90ff22" },
    activeText: { color: COLORS.primary2, fontWeight: "700" },
    divider: {
        borderTopWidth: 1,
        borderColor: "#ccc",
        marginVertical: 12,
    },
    logoutItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    logoutText: {
        color: "#d00",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    seeMoreButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 4,
    },
    seeMoreText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.primary2,
    },
    clearHistoryButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 4,
    },
    clearHistoryText: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.danger || "#d00",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        maxHeight: "70%",
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ddd",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.primary2,
    },
    modalClose: {
        fontSize: 20,
        color: "#999",
        padding: 4,
    },
    modalItem: {
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    modalItemText: {
        fontSize: 15,
        color: "#333",
    },
    modalSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#eee",
        marginHorizontal: 16,
    },
});
