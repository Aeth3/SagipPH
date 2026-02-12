import { Alert } from "react-native";
import { COLORS } from "package/src/legacyApp";
import { FiltersSheet } from "../../../../components/ui/SearchBarWithFilter";
import config from "../config.json"
import { useState, useEffect, useCallback } from "react";
import { getLoans, createLoan, updateLoan, deleteLoan } from "../../../composition/loans";
import { Loan } from "../../../domain/entities/Loan";
import LoanFormModal from "../components/LoanFormModal";

const emptyForm = {
    borrower: "",
    amount: "",
    dueDate: "",
    status: "pending",
    term: "",
};

export const useLoansController = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [filtersState, setFiltersState] = useState({});
    const [formValues, setFormValues] = useState(emptyForm);
    const [formMode, setFormMode] = useState("create");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLoanId, setEditingLoanId] = useState(null);

    const filterSheet = FiltersSheet({
        filters: config.filters,
        filtersState,
        setFiltersState,
    });

    const fetchLoans = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getLoans();
            if (result.ok) {
                setLoans(result.value);
            } else {
                setError(result.error?.message ?? "Failed to load loans");
            }
        } catch (err) {
            setError(err?.message ?? "Unexpected error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const openCreate = () => {
        setFormMode("create");
        setEditingLoanId(null);
        setFormValues(emptyForm);
        setIsFormOpen(true);
    };

    const openEdit = (loan) => {
        if (!loan) return;
        setFormMode("edit");
        setEditingLoanId(loan.id);
        setFormValues({
            borrower: loan.borrower ?? "",
            amount: loan.amount != null ? String(loan.amount) : "",
            dueDate: loan.dueDate ?? "",
            status: loan.status ?? "pending",
            term: loan.term != null ? String(loan.term) : "",
        });
        setIsFormOpen(true);
    };

    const closeForm = () => setIsFormOpen(false);

    const handleSave = async () => {
        const validation = Loan.validateInput(formValues);
        if (!validation.ok) {
            Alert.alert("Validation", validation.error.message);
            return;
        }
        const payload = validation.value;

        setSaving(true);
        try {
            if (formMode === "create") {
                const result = await createLoan(payload);
                if (result.ok) {
                    const created = result.value?.queued
                        ? { id: Date.now(), pending: true, ...payload }
                        : result.value;
                    setLoans((prev) => [created, ...prev]);
                    closeForm();
                } else {
                    Alert.alert("Error", result.error?.message ?? "Failed to create loan");
                }
            } else if (editingLoanId != null) {
                const result = await updateLoan(editingLoanId, payload);
                if (result.ok) {
                    const updated = result.value?.queued
                        ? { id: editingLoanId, pending: true, ...payload }
                        : result.value;
                    setLoans((prev) =>
                        prev.map((loan) => (loan.id === editingLoanId ? { ...loan, ...updated } : loan))
                    );
                    closeForm();
                } else {
                    Alert.alert("Error", result.error?.message ?? "Failed to update loan");
                }
            }
        } catch (err) {
            Alert.alert("Error", err?.message ?? "Failed to save loan");
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (loan) => {
        if (!loan?.id) return;
        Alert.alert("Delete loan", "This action cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    setSaving(true);
                    try {
                        const result = await deleteLoan(loan.id);
                        if (result.ok) {
                            setLoans((prev) => prev.filter((item) => item.id !== loan.id));
                        } else {
                            Alert.alert("Error", result.error?.message ?? "Failed to delete loan");
                        }
                    } catch (err) {
                        Alert.alert("Error", err?.message ?? "Failed to delete loan");
                    } finally {
                        setSaving(false);
                    }
                },
            },
        ]);
    };

    const handleLongPressLoan = (loan) => {
        Alert.alert("Loan actions", "Choose an action.", [
            { text: "Edit", onPress: () => openEdit(loan) },
            { text: "Delete", style: "destructive", onPress: () => confirmDelete(loan) },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    const builderProps = {
        handlePressAddButton: openCreate,
        filterSheet,
        filtersState,
        setFiltersState,
        colors: {
            text: COLORS.text,
            cardBg: COLORS.white,
            borderColor: COLORS.borderColor,
            primary: COLORS.primary,
        },
        loans,
        loading,
        error,
        onRetry: fetchLoans,
        onPressLoan: openEdit,
        onLongPressLoan: handleLongPressLoan,
        loanFormModal: (
            <LoanFormModal
                visible={isFormOpen}
                mode={formMode}
                values={formValues}
                onChange={setFormValues}
                onCancel={closeForm}
                onSubmit={handleSave}
                saving={saving}
            />
        ),
    };

    return { config, builderProps };
};
