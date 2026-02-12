import { COLORS } from "package/src/legacyApp";
import { FiltersSheet } from "../../../../components/ui/SearchBarWithFilter";
import config from "../config.json"
import { useState } from "react";
const loans = [
    {
        id: 1,
        amount: 2500,
        borrower: "John Doe",
        dueDate: "2026-03-10",
        status: "approved",
    },
    {
        id: 2,
        amount: 1800,
        borrower: "Jane Smith",
        dueDate: "2026-02-01",
        status: "pending",
    },
    {
        id: 3,
        amount: 950,
        borrower: "Alex Brown",
        dueDate: "2026-01-15",
        status: "overdue",
    },
];
export const useLoansController = () => {
    const [filtersState, setFiltersState] = useState({})
    const filterSheet = FiltersSheet({
        filters: config.filters,
        filtersState,
        setFiltersState,
    });
    const handlePressAddButton = () => {
        console.log("test");

    }
    const builderProps = {
        handlePressAddButton,
        filterSheet,
        filtersState,
        setFiltersState,
        colors: {
            text: COLORS.text,
            cardBg: COLORS.white,
            borderColor: COLORS.borderColor,
            primary: COLORS.primary
        },
        loans
    }
    return { config, builderProps }
}
