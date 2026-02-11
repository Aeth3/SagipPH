import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ListItem } from '@react-native-material/core';
import { COLORS, FONTS } from '@src/legacyApp';

const AnimatedDropdown = ({
    options = [],        // array of { title: string, value: any }
    selected = null,     // currently selected value
    onSelect = () => { }, // callback when an option is selected
    triggerLabel = 'Select',
    width = 150,
    top = 40,
    right = 0,
    disabled = false,
}) => {
    console.log("disabled", disabled);

    const dropdown = useSharedValue(0);
    const [selectedValue, setSelectedValue] = useState(selected);

    const toggleDropdown = () => {
        if (!disabled) dropdown.value = dropdown.value === 0 ? withTiming(1) : withTiming(0);
    };

    const dropdownStyle = useAnimatedStyle(() => ({
        transform: [{ scale: dropdown.value }],
        opacity: dropdown.value,
    }));

    const handleSelect = (option) => {
        console.log("option", option);

        setSelectedValue(option.id);
        console.log("selected value", selectedValue);

        onSelect(option.id);
        dropdown.value = withTiming(0);
    };

    const currentLabel = options.find(opt => opt.id === selectedValue)?.title || triggerLabel;

    return (
        <View style={{ position: 'relative', zIndex: 10 }}>
            {/* Trigger Button */}
            <TouchableOpacity
                onPress={toggleDropdown}
                disabled={disabled}
                style={[styles.trigger, disabled && { opacity: 0.6 }]}
            >
                <Text style={styles.triggerText}>{currentLabel}</Text>
            </TouchableOpacity>

            {/* Dropdown Menu */}
            <Animated.View
                style={[
                    dropdownStyle,
                    {
                        position: 'absolute',
                        top,
                        right,
                        width,
                        backgroundColor: COLORS.white,
                        borderRadius: 6,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                        overflow: 'hidden',
                    },
                ]}
            >
                <ScrollView style={{ maxHeight: 200 }}>
                    {options.map((opt, idx) => (
                        <ListItem
                            key={idx}
                            title={opt.title}
                            onPress={() => handleSelect(opt)}
                        />
                    ))}
                </ScrollView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    trigger: {
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: COLORS.cardBg,
    },
    triggerText: {
        ...FONTS.font,
        color: COLORS.text,
    },
});

export default AnimatedDropdown;
