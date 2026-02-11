import { COLORS } from "@src/legacyApp";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HeaderTitle({
    title = "Header",
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        paddingBottom: 12,
        backgroundColor: "#FFFFFF",
    },
    title: {
        fontSize: 40,
        fontWeight: "500",
        color: COLORS.dark, // near-black

    },
});
