import React from "react";
import { View, Text, TextInput, TouchableOpacity, Picker } from "react-native";
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { FONTS, COLORS } from "@src/legacyApp";

const FilterField = ({ field, value, onChange, theme, options }) => {
    const { colors } = theme;

    switch (field.type) {
        case "text":
            return (
                <View style={{ marginBottom: 15 }}>
                    <Text style={{ ...FONTS.h6, color: colors.title }}>{field.label}{field.required && '*'}</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: "#ddd",
                            borderRadius: 8,
                            padding: 10,
                            backgroundColor: "#fafafa"
                        }}
                        placeholder={`Enter ${field.label}`}
                        value={value}
                        onChangeText={(text) => onChange(field.id, text)}
                        editable={!field.disabled}
                    />
                </View>
            );
        case "picker":
        case "select":
            return (
                <View style={{ marginBottom: 15 }}>
                    <Text style={{ ...FONTS.h6, color: colors.title }}>{field.label}{field.required && '*'}</Text>
                    <Picker
                        selectedValue={value}
                        onValueChange={(val) => onChange(field.id, val)}
                        enabled={!field.disabled}
                    >
                        {options?.map((opt) => (
                            <Picker.Item key={opt.id} label={opt.title} value={opt.value} />
                        ))}
                    </Picker>
                </View>
            );
        case "slider":
            return (
                <View style={{ marginBottom: 25 }}>
                    <Text style={{ ...FONTS.h6, color: colors.title }}>{field.label}</Text>
                    <MultiSlider
                        values={[value || field.min]}
                        min={field.min}
                        max={field.max}
                        onValuesChange={(vals) => onChange(field.id, vals[0])}
                        selectedStyle={{ backgroundColor: COLORS.primary6 }}
                        trackStyle={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(142,165,200,.3)' }}
                        markerStyle={{
                            backgroundColor: COLORS.white,
                            borderWidth: 3,
                            borderColor: COLORS.primary6,
                        }}
                        sliderLength={300}
                    />
                </View>
            );
        default:
            // Custom field type
            return (
                <View style={{ marginBottom: 15 }}>
                    <Text style={{ ...FONTS.h6, color: colors.title }}>{field.label} (unsupported type)</Text>
                </View>
            );
    }
};

export default FilterField;
