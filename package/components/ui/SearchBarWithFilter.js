import React, { useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass, faSliders } from "@fortawesome/free-solid-svg-icons";
import RBSheet from "react-native-raw-bottom-sheet";
import { COLORS, FONTS, SIZES } from "package/src/legacyApp";
import AnimatedDropdown from "./AnimatedDropdown";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

const SearchBarWithFilter = ({ value, onChangeText, onOpenFilters, colors }) => {
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
        ]}
      >
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          size={18}
          color={colors.text}
          style={styles.icon}
        />

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Search..."
          placeholderTextColor={colors.text}
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      <TouchableOpacity
        onPress={onOpenFilters}
        activeOpacity={0.85}
        style={[styles.filterButton, { backgroundColor: colors.primary }]}
      >
        <FontAwesomeIcon icon={faSliders} size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBarWithFilter;

export const FiltersSheet = ({ filters, filtersState, setFiltersState }) => {
  const ref = useRef();
  const [localFilters, setLocalFilters] = useState({});

  const safeFilters = Array.isArray(filters) ? filters : [];

  const getInitialFilters = () => {
    const initial = {};
    safeFilters.forEach((f) => {
      initial[f.key] = filtersState?.[f.key] ?? f.default;
    });
    return initial;
  };

  const open = () => {
    setLocalFilters(getInitialFilters());
    ref.current?.open();
  };

  const apply = () => {
    setFiltersState(localFilters);
    ref.current?.close();
  };

  const clear = () => {
    const cleared = {};
    safeFilters.forEach((f) => {
      if (f.preserveOnClear) {
        cleared[f.key] = filtersState?.[f.key] ?? f.default;
        return;
      }

      if (f.type === "range") {
        cleared[f.key] = Array.isArray(f.default) ? f.default : [f.min, f.max];
        return;
      }

      cleared[f.key] = f.default ?? "";
    });
    setLocalFilters(cleared);
    setFiltersState(cleared);
    ref.current?.close();
  };

  const getRangeValue = (item) => {
    const range = localFilters[item.key];
    if (Array.isArray(range) && range.length === 2) {
      return `${range[0]} - ${range[1]}`;
    }
    return `${item.min} - ${item.max}`;
  };

  return {
    open,
    Sheet: (
      <RBSheet
        ref={ref}
        height={560}
        closeOnDragDown
        customStyles={{
          container: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: "#F6F8FC",
          },
          draggableIcon: {
            backgroundColor: "#C8CFDB",
            width: 60,
          },
        }}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filters</Text>
          </View>

          {safeFilters.map((item) => {
            if (item.type === "dropdown") {
              return (
                <View key={item.key} style={styles.fieldCard}>
                  <Text style={styles.fieldLabel}>{item.label}</Text>
                  <AnimatedDropdown
                    options={item.options}
                    selected={localFilters[item.key]}
                    onSelect={(v) =>
                      setLocalFilters((p) => ({ ...p, [item.key]: v }))
                    }
                    triggerLabel={item.label || "Select"}
                    width={SIZES.width - 72}
                    top={50}
                    right={0}
                    disabled={Boolean(item.disabled)}
                  />
                </View>
              );
            }

            if (item.type === "text") {
              return (
                <View key={item.key} style={styles.fieldCard}>
                  <Text style={styles.fieldLabel}>{item.label}</Text>
                  <TextInput
                    editable={!Boolean(item.disabled)}
                    style={[
                      styles.textField,
                      Boolean(item.disabled) && { opacity: 0.6 },
                    ]}
                    placeholder={item.placeholder || ""}
                    placeholderTextColor={COLORS.textLight}
                    value={String(localFilters[item.key] ?? "")}
                    onChangeText={(text) =>
                      setLocalFilters((p) => ({ ...p, [item.key]: text }))
                    }
                  />
                </View>
              );
            }

            if (item.type === "range") {
              return (
                <View key={item.key} style={styles.fieldCard}>
                  <View style={styles.rangeHeader}>
                    <Text style={styles.fieldLabel}>{item.label}</Text>
                    <Text style={styles.rangeValue}>{getRangeValue(item)}</Text>
                  </View>
                  <MultiSlider
                    enabledOne={!Boolean(item.disabled)}
                    enabledTwo={!Boolean(item.disabled)}
                    values={
                      Array.isArray(localFilters[item.key])
                        ? localFilters[item.key]
                        : [item.min, item.max]
                    }
                    min={item.min}
                    max={item.max}
                    sliderLength={SIZES.width - 88}
                    onValuesChange={(v) =>
                      setLocalFilters((p) => ({ ...p, [item.key]: v }))
                    }
                    selectedStyle={{ backgroundColor: COLORS.primary2 }}
                    unselectedStyle={{ backgroundColor: "#D7DEEA" }}
                    markerStyle={styles.sliderMarker}
                  />
                </View>
              );
            }

            return null;
          })}

          <View style={styles.actionsRow}>
            <TouchableOpacity activeOpacity={0.9} style={styles.clearButton} onPress={clear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} style={styles.applyButton} onPress={apply}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>
    ),
  };
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  filterButton: {
    height: 48,
    width: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetContainer: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  sheetHeader: {
    marginBottom: 14,
  },
  sheetTitle: {
    ...FONTS.h4,
    color: "#1E293B",
    marginBottom: 4,
  },
  sheetSubtitle: {
    ...FONTS.body5,
    color: "#64748B",
  },
  fieldCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E9F4",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  textField: {
    borderWidth: 1,
    borderColor: "#E3E9F4",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    color: COLORS.text,
  },
  fieldLabel: {
    ...FONTS.h6,
    color: "#334155",
    marginBottom: 8,
  },
  rangeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rangeValue: {
    ...FONTS.body5,
    color: COLORS.primary2,
    fontWeight: "700",
  },
  sliderMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary2,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  clearButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  clearButtonText: {
    ...FONTS.h6,
    color: "#475569",
    textTransform: "uppercase",
  },
  applyButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary2,
  },
  applyButtonText: {
    ...FONTS.h6,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
});
