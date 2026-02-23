import React from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faBell,
    faChevronRight,
    faCircleExclamation,
    faClipboardList,
    faFire,
    faLocationCrosshairs,
    faLocationDot,
    faNewspaper,
    faPaperPlane,
    faRobot,
    faShieldHalved,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import Screen from "../../../components/layout/Screen";
import Header from "../../../components/ui/HeaderV2";
import LoadingOverlay from "../../../components/layout/LoadingOverlay";
import { useDashboardController } from "./controllers/DashboardController";

function SectionTitle({ title }) {
    return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ActionTile({ icon, title, subtitle, colors, iconBg, titleLight = true, onPress }) {
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.actionTileTouchable}>
            <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionTile}>
                <View style={[styles.tileIconWrap, { backgroundColor: iconBg }]}>
                    <FontAwesomeIcon icon={icon} size={13} color="#fff" />
                </View>
                <View style={styles.tileTextWrap}>
                    <Text style={[styles.tileTitle, titleLight && styles.tileTitleLight]}>{title}</Text>
                    {!!subtitle && <Text style={styles.tileSubtitle}>{subtitle}</Text>}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

export default function DashboardScreen() {
    const {
        userName,
        activeAlert,
        riskMeta,
        isRefreshing,
        alertModal,
        lastUpdatedMinutes,
        nearestShelter,
        handleRefresh,
        handleAlertLevelPress,
        handleWarningPress,
        handleWeatherUpdates,
        handleReportEmergency,
        handleFindNearestShelter,
        handlePreparednessTips,
        handleAskAssistant,
    } = useDashboardController();

    return (
        <Screen style={styles.screen}>
            <Header mode="dashboard" notificationCount={3} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#DB1D3B" />
                }
            >
                <LinearGradient
                    colors={["#f4f7fc", "#eef3fb"]}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroBackground}
                />

                <Text style={styles.greeting}>Welcome back, John Doe</Text>
                <Text style={styles.subtitle}>Your Safety Companion</Text>

                <TouchableOpacity activeOpacity={0.9} style={styles.alertLevelCard} onPress={handleAlertLevelPress}>
                    <View style={styles.alertLevelLeft}>
                        <View style={styles.alertLevelDot}>
                            <FontAwesomeIcon icon={faCircleExclamation} size={10} color="#4cb1ff" />
                        </View>
                        <Text style={styles.alertLevelTitle}>Alert Level</Text>
                        <View style={[styles.moderatePill, { backgroundColor: riskMeta.pillBg }]}>
                            <Text style={[styles.moderatePillText, { color: riskMeta.pillText }]}>{riskMeta.label}</Text>
                        </View>
                    </View>
                    <FontAwesomeIcon icon={faChevronRight} size={12} color="#A8B0C3" />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9} onPress={handleWarningPress}>
                    <LinearGradient
                        colors={["#EE384E", "#E92E43", "#DB1D3B"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.warningCard}
                    >
                        <View style={styles.warningHeader}>
                            <FontAwesomeIcon icon={faTriangleExclamation} size={14} color="#FDE57F" />
                            <Text style={styles.warningTitle}>{activeAlert.title}</Text>
                        </View>
                        <Text style={styles.warningSub}>{activeAlert.detail}</Text>
                        <Text style={styles.warningCta}>See More {">"}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <SectionTitle title="Emergency" />
                <View style={styles.doubleCol}>
                    <ActionTile
                        icon={faBell}
                        title={"Report\nEmergency"}
                        colors={["#EE384E", "#D51E35"]}
                        iconBg="rgba(255,255,255,0.2)"
                        onPress={handleReportEmergency}
                    />
                    <ActionTile
                        icon={faLocationDot}
                        title="Find Nearest Shelter"
                        subtitle={nearestShelter ? `${nearestShelter.distance.toFixed(1)} km >` : "View map >"}
                        colors={["#4E83F5", "#2C66E5"]}
                        iconBg="rgba(255,255,255,0.2)"
                        onPress={handleFindNearestShelter}
                    />
                </View>

                <TouchableOpacity activeOpacity={0.9} style={styles.panelCard} onPress={handleWeatherUpdates}>
                    <View style={styles.panelHeader}>
                        <View style={styles.panelHeaderLeft}>
                            <FontAwesomeIcon icon={faTriangleExclamation} size={12} color="#f2a000" />
                            <Text style={styles.panelTitle}>Weather & Alerts</Text>
                        </View>
                    </View>
                    <View style={styles.updateRow}>
                        <View style={styles.updateTextWrap}>
                            <View style={styles.updateTitleRow}>
                                <FontAwesomeIcon icon={faNewspaper} size={12} color="#e56f1c" />
                                <Text style={styles.updateTitle}>Disaster Updates</Text>
                            </View>
                            <Text style={styles.updateText}>{activeAlert.title}</Text>
                            <Text style={styles.updateMeta}>Updated {lastUpdatedMinutes} minutes ago</Text>
                        </View>
                        <LinearGradient
                            colors={["#f2f6ff", "#e6eefc"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.mapThumb}
                        >
                            <View style={styles.mapBlobRed} />
                            <View style={styles.mapBlobBlue} />
                        </LinearGradient>
                    </View>
                </TouchableOpacity>

                <SectionTitle title="Preparedness" />
                <View style={styles.doubleCol}>
                    <ActionTile
                        icon={faClipboardList}
                        title={"Preparedness\nTips"}
                        colors={["#4E83F5", "#2F66E2"]}
                        iconBg="rgba(255,255,255,0.2)"
                        onPress={handlePreparednessTips}
                    />
                    <ActionTile
                        icon={faRobot}
                        title={"Ask Sagip AI\nAssistant"}
                        colors={["#4E83F5", "#2F66E2"]}
                        iconBg="rgba(255,255,255,0.2)"
                        onPress={handleAskAssistant}
                    />
                </View>
                <View style={styles.doubleColNotes}>
                    <Text style={styles.noteText}>Essential tips{'\n'}for disaster readiness</Text>
                    <Text style={styles.noteText}>Your AI-powered{'\n'}safety advisor</Text>
                </View>

                <View style={styles.panelCard}>
                    <View style={styles.aiContent}>
                        <View style={styles.aiPanelHeader}>
                            <View style={styles.aiBadge}>
                                <FontAwesomeIcon icon={faRobot} size={11} color="#2F66E2" />
                            </View>
                            <Text style={styles.aiPanelTitle}>AI Safety Assistant</Text>
                        </View>
                        <View style={styles.aiList}>
                            <View style={styles.aiListItem}>
                                <FontAwesomeIcon icon={faFire} size={11} color="#FF8A00" />
                                <Text style={styles.aiListText}>Risk prediction</Text>
                            </View>
                            <View style={styles.aiListItem}>
                                <FontAwesomeIcon icon={faLocationCrosshairs} size={11} color="#EF4E4E" />
                                <Text style={styles.aiListText}>Nearest rescue</Text>
                            </View>
                            <View style={styles.aiListItem}>
                                <FontAwesomeIcon icon={faShieldHalved} size={11} color="#2C7BE5" />
                                <Text style={styles.aiListText}>Safety advice</Text>
                            </View>
                        </View>

                        <View style={styles.assistantInput}>
                            <Text style={styles.assistantPlaceholder}>How can I assist you?...</Text>
                            <TouchableOpacity activeOpacity={0.8} style={styles.sendButton} onPress={handleAskAssistant}>
                                <FontAwesomeIcon icon={faPaperPlane} size={12} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <LinearGradient
                        colors={["#f2f6ff", "#e6eefc"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.aiMapDecor}
                    >
                        <View style={styles.mapBlobRedSmall} />
                        <View style={styles.mapBlobBlueSmall} />
                    </LinearGradient>
                </View>
            </ScrollView>
            <LoadingOverlay visible={isRefreshing} text="Refreshing dashboard..." />
            {alertModal}
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: "#F4F6FA",
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 18,
    },
    heroBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 190,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        opacity: 0.8,
    },
    greeting: {
        fontSize: 30,
        color: "#1F2A44",
        fontWeight: "700",
        lineHeight: 37,
        marginBottom: 3,
    },
    subtitle: {
        color: "#7A859A",
        fontSize: 14,
        marginBottom: 12,
        fontWeight: "500",
    },
    alertLevelCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#EEF1F6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    alertLevelLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    alertLevelDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#EAF4FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    alertLevelTitle: {
        color: "#2D3648",
        fontWeight: "700",
        marginRight: 8,
    },
    moderatePill: {
        backgroundColor: "#FFE4C7",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    moderatePillText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#BF6E2E",
        letterSpacing: 0.2,
    },
    warningCard: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 12,
        overflow: "hidden",
    },
    warningHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    warningTitle: {
        color: "#fff",
        fontWeight: "800",
        marginLeft: 7,
        letterSpacing: 0.2,
        fontSize: 14,
    },
    warningSub: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 12,
        marginBottom: 4,
    },
    warningCta: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    sectionTitle: {
        color: "#2D3648",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
    },
    doubleCol: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 8,
    },
    actionTile: {
        flex: 1,
        minHeight: 78,
        borderRadius: 13,
        padding: 10,
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "flex-start",
    },
    actionTileTouchable: {
        flex: 1,
    },
    tileIconWrap: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
        marginTop: 1,
    },
    tileTextWrap: {
        flex: 1,
    },
    tileTitle: {
        color: "#1E2A44",
        fontSize: 18,
        lineHeight: 20,
        fontWeight: "700",
    },
    tileTitleLight: {
        color: "#fff",
    },
    tileSubtitle: {
        color: "rgba(255,255,255,0.92)",
        fontSize: 11,
        marginTop: 4,
        fontWeight: "600",
    },
    panelCard: {
        backgroundColor: "#fff",
        borderRadius: 13,
        padding: 11,
        borderWidth: 1,
        borderColor: "#EDF1F7",
        marginBottom: 12,
        position: "relative",
        overflow: "hidden",
    },
    panelHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    panelHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    panelTitle: {
        color: "#2D3648",
        marginLeft: 6,
        fontSize: 18,
        fontWeight: "700",
    },
    updateRow: {
        flexDirection: "row",
        alignItems: "stretch",
    },
    updateTextWrap: {
        flex: 1,
        paddingRight: 10,
    },
    updateTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    updateTitle: {
        fontSize: 23,
        color: "#1E2A44",
        marginLeft: 5,
        fontWeight: "800",
        lineHeight: 26,
    },
    updateText: {
        color: "#58637A",
        fontSize: 18,
        marginBottom: 2,
    },
    updateMeta: {
        color: "#8A95A9",
        fontSize: 12,
    },
    mapThumb: {
        width: 90,
        borderRadius: 11,
        overflow: "hidden",
        position: "relative",
    },
    mapBlobRed: {
        position: "absolute",
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(244, 67, 54, 0.35)",
        top: 26,
        left: 28,
    },
    mapBlobBlue: {
        position: "absolute",
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(43, 115, 247, 0.25)",
        top: 10,
        right: 12,
    },
    doubleColNotes: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
    },
    noteText: {
        flex: 1,
        color: "#646E80",
        fontSize: 12,
        lineHeight: 16,
    },
    aiPanelHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    aiContent: {
        position: "relative",
        zIndex: 1,
        paddingRight: 78,
    },
    aiBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#E8F0FF",
        alignItems: "center",
        justifyContent: "center",
    },
    aiPanelTitle: {
        marginLeft: 7,
        color: "#2D3648",
        fontSize: 19,
        fontWeight: "700",
    },
    aiList: {
        gap: 6,
        marginBottom: 10,
    },
    aiListItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    aiListText: {
        color: "#2C364A",
        fontSize: 16,
    },
    assistantInput: {
        height: 35,
        borderWidth: 1,
        borderColor: "#E5EAF2",
        borderRadius: 18,
        backgroundColor: "#F5F8FC",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 10,
        paddingRight: 4,
    },
    assistantPlaceholder: {
        color: "#99A3B7",
        fontSize: 15,
    },
    sendButton: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#A9B8D2",
        alignItems: "center",
        justifyContent: "center",
    },
    aiMapDecor: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 78,
        borderTopRightRadius: 13,
        borderBottomRightRadius: 13,
        zIndex: 0,
    },
    mapBlobRedSmall: {
        position: "absolute",
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "rgba(244, 67, 54, 0.35)",
        top: 44,
        left: 18,
    },
    mapBlobBlueSmall: {
        position: "absolute",
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "rgba(43, 115, 247, 0.25)",
        top: 25,
        right: 12,
    },
});
