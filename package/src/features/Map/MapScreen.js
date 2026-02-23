import React from "react";
import { StyleSheet, View } from "react-native";
import Screen from "../../../components/layout/Screen";
import Header from "../../../components/ui/HeaderV2";
import LeafletMap from "../../../components/ui/LeafletMap";

export default function MapScreen() {
    return (
        <Screen style={styles.screen}>
            <Header />
            <View style={styles.mapWrap}>
                <LeafletMap />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: "#F4F6FA",
    },
    mapWrap: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});
