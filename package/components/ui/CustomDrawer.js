import { useState } from "react";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { drawerRoutes } from "../../routes/drawerRoutes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown, faChevronUp, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useNavigationState } from '@react-navigation/native';
import ProfileHeader from "./ProfileHeader";
import AlertModal from "./AlertModal";
import { COLORS } from "package/src/legacyApp"

export default function CustomDrawer({ navigation, logout }) {
    const [expanded, setExpanded] = useState({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const state = useNavigationState((state) => state);
    const currentRoute = state.routes[state.index]?.name;
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

                            {/* Children */}
                            {hasChildren && expanded[route.name] && (
                                <View style={styles.childContainer}>
                                    {route.children.map((child) => {
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
                                    })}
                                </View>
                            )}

                            {/* Top-level items (no children) */}
                            {!hasChildren && (
                                <TouchableOpacity
                                    style={[styles.parentItem, currentRoute === route.name && styles.activeItem]}
                                    onPress={() => navigation.navigate(route.name)}
                                >
                                    <Text style={[styles.parentText, currentRoute === route.name && styles.activeText]}>
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
                    onPress={() => setShowLogoutModal(true)}
                >
                    <FontAwesomeIcon icon={faRightFromBracket} size={16} color={COLORS.danger} />
                    <Text style={[styles.logoutText, { color: COLORS.danger }]}>Logout</Text>
                </TouchableOpacity>
            </View>

            <AlertModal
                visible={showLogoutModal}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                type="confirm"
                buttons={[
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Logout",
                        style: "destructive",
                        onPress: async () => {
                            setShowLogoutModal(false);
                            await logout();
                        },
                    },
                ]}
                onDismiss={() => setShowLogoutModal(false)}
            />
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
    parentText: { fontSize: 16, fontWeight: "600", color: "#aaa" },
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
});
