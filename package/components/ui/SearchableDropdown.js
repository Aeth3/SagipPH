import React, { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { COLORS } from "package/src/legacyApp";

const getOptionLabel = (option) => (typeof option === "string" ? option : option?.label ?? "");
const getOptionValue = (option) => (typeof option === "string" ? option : option?.value);

export default function SearchableDropdown({
    value,
    options = [],
    onChange,
    placeholder = "Select",
    title = "Select option",
    searchPlaceholder = "Search...",
}) {
    const [visible, setVisible] = useState(false);
    const [query, setQuery] = useState("");

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return options;
        return options.filter((option) => getOptionLabel(option).toLowerCase().includes(normalizedQuery));
    }, [options, query]);

    const close = () => {
        setVisible(false);
        setQuery("");
    };

    const open = () => setVisible(true);

    return (
        <>
            <TouchableOpacity style={styles.trigger} onPress={open} activeOpacity={0.85}>
                <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]}>
                    {value || placeholder}
                </Text>
                <Text style={styles.triggerChevron}>▼</Text>
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
                    <TouchableWithoutFeedback>
                        <View style={styles.sheet}>
                            <Text style={styles.title}>{title}</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder={searchPlaceholder}
                                placeholderTextColor={COLORS.placeholderColor}
                                value={query}
                                onChangeText={setQuery}
                                autoCorrect={false}
                                autoCapitalize="none"
                            />
                            <FlatList
                                data={filteredOptions}
                                keyExtractor={(item, index) => `${getOptionValue(item)}_${index}`}
                                keyboardShouldPersistTaps="handled"
                                style={styles.list}
                                contentContainerStyle={styles.listContent}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>No matches found.</Text>
                                }
                                renderItem={({ item }) => {
                                    const optionLabel = getOptionLabel(item);
                                    const optionValue = getOptionValue(item);
                                    const isSelected = optionValue === value;

                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.option,
                                                isSelected && styles.optionSelected,
                                            ]}
                                            onPress={() => {
                                                onChange?.(optionValue);
                                                close();
                                            }}
                                            activeOpacity={0.85}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    isSelected && styles.optionTextSelected,
                                                ]}
                                            >
                                                {optionLabel}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        borderWidth: 1,
        borderColor: "transparent",
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingVertical: 11,
        backgroundColor: "#F3F4F6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    triggerText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.title,
        fontFamily: "NunitoSans-Regular",
    },
    triggerPlaceholder: {
        color: COLORS.placeholderColor,
    },
    triggerChevron: {
        fontSize: 13,
        color: COLORS.text,
        fontFamily: "NunitoSans-Bold",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.25)",
        justifyContent: "center",
        paddingHorizontal: 18,
    },
    sheet: {
        backgroundColor: COLORS.white,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 8,
        gap: 8,
    },
    title: {
        fontSize: 15,
        color: COLORS.title,
        fontFamily: "Poppins-SemiBold",
        paddingHorizontal: 6,
        marginBottom: 4,
    },
    searchInput: {
        minHeight: 44,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: "#F3F4F6",
        fontSize: 14,
        color: COLORS.title,
        fontFamily: "NunitoSans-Regular",
    },
    list: {
        maxHeight: 260,
    },
    listContent: {
        gap: 8,
        paddingBottom: 4,
    },
    option: {
        minHeight: 44,
        borderRadius: 12,
        paddingHorizontal: 14,
        justifyContent: "center",
        backgroundColor: "#F3F4F6",
    },
    optionSelected: {
        backgroundColor: COLORS.primayLight2,
        borderWidth: 1,
        borderColor: COLORS.primary2,
    },
    optionText: {
        fontSize: 15,
        color: COLORS.title,
        fontFamily: "NunitoSans-Regular",
    },
    optionTextSelected: {
        color: COLORS.primary2,
        fontFamily: "NunitoSans-Bold",
    },
    emptyText: {
        textAlign: "center",
        color: COLORS.text,
        fontFamily: "NunitoSans-Regular",
        paddingVertical: 12,
    },
});
