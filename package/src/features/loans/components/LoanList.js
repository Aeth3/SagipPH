import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS, FONTS, SIZES } from "package/src/legacyApp";
import EmptyState from "../../../../components/ui/EmptyState";
const STATUS_COLORS = {
  approved: COLORS.success,
  pending: COLORS.warning,
  overdue: COLORS.danger,
};

const LoanCard = ({ loan, onPress }) => {
  const statusColor = STATUS_COLORS[loan.status] || "#6B7280";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(loan)}
      style={styles.card}
    >
      <View style={styles.row}>
        <Text style={styles.amount}>₱{loan.amount.toLocaleString()}</Text>

        <View
          style={[
            styles.statusPill,
            { backgroundColor: statusColor + "1F" },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {loan.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.meta}>
        <Text style={styles.label}>Borrower</Text>
        <Text style={styles.value}>{loan.borrower}</Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.label}>Due Date</Text>
        <Text style={styles.value}>{loan.dueDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

const LoanList = ({ loans = [], onPressItem }) => {
  return (
    <FlatList
      data={loans}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <LoanCard loan={item} onPress={onPressItem} />
      )}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState />}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: SIZES.radius_md,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.dark,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  amount: {
    ...FONTS.h5,
    color: COLORS.title,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    ...FONTS.fontXs,
    fontFamily: FONTS.fontBold.fontFamily,
    letterSpacing: 0.5,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  label: {
    ...FONTS.fontSm,
    color: COLORS.textLight,
  },
  value: {
    ...FONTS.font,
    fontFamily: FONTS.fontBold.fontFamily,
    color: COLORS.title,
  },
});

export default LoanList;
