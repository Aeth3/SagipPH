import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMagnifyingGlass, faSliders } from '@fortawesome/free-solid-svg-icons';
import { GlobalStyleSheet } from "@src/legacyApp";
import { COLORS, FONTS, IMAGES, SIZES } from "@src/legacyApp"
import RBSheet from 'react-native-raw-bottom-sheet';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { LegacyButton } from "@src/legacyApp";
import AnimatedDropdown from "../../components/ui/AnimatedDropdown"
import { useGlobal } from "../../context/context";

export default function FiltersList({ filters }) {
    console.log("filters config", filters);

    const { filtersState, setFiltersState } = useGlobal()
    const theme = useTheme();
    const filterSheet = useRef();
    const { colors } = theme;
    const [localFilters, setLocalFilters] = useState({});

    const openFilterSheet = () => {
        if (!filterSheet.current) {
            console.warn("RBSheet ref not ready yet");
            return;
        }

        const initialFilters = {};
        filters.forEach(f => {
            initialFilters[f.key] = filtersState?.[f.key] ?? f.default;
        });
        setLocalFilters(initialFilters);
        filterSheet.current.open();  // ✅
    };

    const handleChange = (name, value) => {
        setFiltersState(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const updateFilter = (key, value) => {
        setFiltersState(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSearch = (text) => {
        setFiltersState(prev => ({
            ...prev,
            search: text,
        }));
    };

    const renderItem = ({ item }) => (
        <View >
            <Text style={styles.label}>
                {item.label}
                {item.required && <Text style={styles.required}> *</Text>}
            </Text>

            <TextInput
                style={styles.input}
                placeholder={`Enter ${item.label}`}
                value={formData[item.name]}
                onChangeText={(text) => handleChange(item.name, text)}
            />

            <Text style={styles.helper}>
                {item.required ? "Required field" : "Optional"}
            </Text>
        </View>
    );
    useEffect(() => {
        console.log("local filters", localFilters);

    }, [localFilters])
    const handleClearFilters = () => {
        const cleared = getDefaultFilters(filters, filtersState);

        setLocalFilters(cleared);
        setFiltersState(cleared);

        filterSheet.current?.close();
    };
    const getDefaultFilters = (filters, currentState = {}) => {
        const defaults = {};

        filters.forEach(item => {
            // ✅ Preserve value if flagged
            if (item.preserveOnClear) {
                defaults[item.key] = currentState[item.key];
                return;
            }

            switch (item.type) {
                case "dropdown":
                    defaults[item.key] = '';
                    break;
                case "text":
                    defaults[item.key] = null;
                    break;

                case "range":
                    defaults[item.key] = [item.min, item.max];
                    break;

                default:
                    break;
            }
        });

        return defaults;
    };
    return (
        <>
            <RBSheet
                ref={filterSheet}
                closeOnDragDown
                height={510}
                customStyles={{
                    container: {
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                    },
                }}
            >
                {/* ✅ HEADER with X button */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                        paddingTop: 10,
                        paddingBottom: 6,
                        borderBottomWidth: 1,
                        borderBottomColor: "#E5E7EB",
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
                        Filters
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => filterSheet.current?.close()}
                        style={{
                            backgroundColor: "rgba(0,0,0,0.05)",
                            borderRadius: 20,
                            padding: 6,
                        }}
                    >
                        <Text style={{ fontSize: 18, color: colors.text }}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* ✅ FILTER CONTENT */}
                <View style={{ ...GlobalStyleSheet.container, paddingTop: 20 }}>
                    {filters?.map(item => {
                        switch (item.type) {
                            case "dropdown":
                                return (
                                    <View key={item.key} style={{ marginBottom: 15 }}>
                                        <Text style={{ ...FONTS.h6, color: colors.text }}>
                                            {item.label}
                                        </Text>
                                        <AnimatedDropdown
                                            options={item.options}
                                            selected={localFilters[item.key]}
                                            disabled={item.disabled}
                                            onSelect={value =>
                                                setLocalFilters(prev => ({ ...prev, [item.key]: value }))
                                            }
                                            triggerLabel="Select"
                                        />
                                    </View>
                                );
                            case "text":
                                return (
                                    <View key={item.key} style={{ marginBottom: 15 }}>
                                        <Text style={{ ...FONTS.h6, color: colors.text }}>
                                            {item.label}
                                        </Text>
                                        <TextInput
                                            style={{
                                                borderWidth: 1,
                                                borderColor: colors.borderColor,
                                                borderRadius: 6,
                                                paddingHorizontal: 10,
                                                height: 45,
                                                color: colors.text,
                                            }}
                                            placeholder={item.placeholder}
                                            placeholderTextColor={colors.text}
                                            value={localFilters[item.key]}
                                            onChangeText={text =>
                                                setLocalFilters(prev => ({
                                                    ...prev,
                                                    [item.key]: text,
                                                }))
                                            }
                                        />
                                    </View>
                                );
                            case "range":
                                const rangeValue = localFilters[item.key] ?? [item.min, item.max];
                                return (
                                    <View key={item.key} style={{ marginBottom: 25 }}>
                                        <Text style={{ ...FONTS.h6, color: COLORS.title }}>
                                            {item.label}
                                        </Text>
                                        <Text style={{ ...FONTS.body4, marginBottom: 5 }}>
                                            Max: {rangeValue[1]}
                                        </Text>
                                        <MultiSlider
                                            min={item.min}
                                            max={item.max}
                                            values={rangeValue}
                                            sliderLength={SIZES.width - 30}
                                            selectedStyle={{ backgroundColor: COLORS.primary6 }}
                                            trackStyle={{
                                                height: 4,
                                                borderRadius: 2,
                                                backgroundColor: "rgba(142,165,200,.3)",
                                            }}
                                            markerStyle={{
                                                backgroundColor: COLORS.white,
                                                height: 16,
                                                width: 16,
                                                borderWidth: 3,
                                                borderColor: COLORS.primary6,
                                            }}
                                            onValuesChange={values =>
                                                setLocalFilters(prev => ({ ...prev, [item.key]: values }))
                                            }
                                        />
                                    </View>
                                );
                            default:
                                return null;
                        }
                    })}

                    {/* ✅ Action Buttons */}
                    <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
                        <View style={{ flex: 1 }}>
                            <LegacyButton title="Clear" color={COLORS.gray} onPress={handleClearFilters} />
                        </View>

                        <View style={{ flex: 1 }}>
                            <LegacyButton
                                title="Apply"
                                color={COLORS.primary6}
                                onPress={() => {
                                    setFiltersState(localFilters);
                                    filterSheet.current?.close();
                                }}
                            />
                        </View>
                    </View>
                </View>
            </RBSheet>


            <View style={styles.container}>
                <View style={GlobalStyleSheet.container}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <TextInput
                                style={{
                                    ...FONTS.font,
                                    color: colors.title,
                                    backgroundColor: colors.cardBg,
                                    borderWidth: 1,
                                    borderColor: colors.borderColor,
                                    borderRadius: 6,
                                    height: 45,
                                    paddingHorizontal: 15,
                                    paddingLeft: 50,
                                }}
                                placeholder="Search Household..."
                                placeholderTextColor={colors.text}
                                value={filtersState?.search ?? ""}
                                onChangeText={handleSearch}
                            />
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 5,
                                    height: 45,
                                    width: 45,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    size={20}
                                    color={colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={openFilterSheet}
                            style={{
                                height: 45,
                                width: 45,
                                backgroundColor: COLORS.primary6,
                                borderRadius: 6,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 15,
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faSliders}
                                size={20}
                                color={COLORS.white}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f2f3f5",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    card: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111",
        marginBottom: 6,
    },
    required: {
        color: "#d93025",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: "#fafafa",
    },
    helper: {
        fontSize: 11,
        color: "#777",
        marginTop: 4,
    },
});
