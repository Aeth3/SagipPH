import React from "react";
import { View } from "react-native";
import Header from "../../../../components/ui/Header";
import config from "../config.json";

export default function MenuHeader({ title }) {
    return (
        <View testID="menu-header">
            <Header
                title={title}
                {...config}
            />
        </View>
    );
}
