import React, { useState, useCallback } from "react";
import AlertModal from "../../../components/ui/AlertModal";

/**
 * Hook that provides a drop-in replacement for Alert.alert using a beautiful modal.
 *
 * Usage:
 *   const { showAlert, alertModal } = useAlertModal();
 *
 *   // Simple message
 *   showAlert("Title", "Something happened");
 *
 *   // With buttons (same API as Alert.alert)
 *   showAlert("Delete?", "Cannot be undone.", [
 *     { text: "Cancel", style: "cancel" },
 *     { text: "Delete", style: "destructive", onPress: handleDelete },
 *   ]);
 *
 *   // With type for icon styling
 *   showAlert("Error", "Something went wrong", null, { type: "error" });
 *
 *   // Render the modal somewhere in your JSX:
 *   return <>{alertModal}</>
 */
export function useAlertModal() {
    const [alertState, setAlertState] = useState({
        visible: false,
        title: "",
        message: "",
        buttons: [],
        type: "info",
    });

    const showAlert = useCallback((title, message, buttons, options) => {
        const type = options?.type ?? inferType(title, buttons);
        setAlertState({
            visible: true,
            title: title ?? "",
            message: message ?? "",
            buttons: buttons ?? [{ text: "OK" }],
            type,
        });
    }, []);

    const hideAlert = useCallback(() => {
        setAlertState((prev) => ({ ...prev, visible: false }));
    }, []);

    const alertModal = (
        <AlertModal
            visible={alertState.visible}
            title={alertState.title}
            message={alertState.message}
            buttons={alertState.buttons}
            type={alertState.type}
            onDismiss={hideAlert}
        />
    );

    return { showAlert, hideAlert, alertModal };
}

/** Infer type from title or button styles */
function inferType(title, buttons) {
    const lower = (title ?? "").toLowerCase();
    if (lower.includes("error") || lower.includes("failed")) return "error";
    if (lower.includes("success")) return "success";
    if (lower.includes("warning") || lower.includes("validation")) return "warning";
    if (buttons?.some((b) => b.style === "destructive")) return "confirm";
    return "info";
}
