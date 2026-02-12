import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useOtpVerificationController } from "./controllers/OtpVerificationController";
import AlertModal from "../../../../components/ui/AlertModal";

export default function OtpVerificationScreen() {
    const { phone, handleVerify, handleResend, handleBack, modalInfo, handleConfirm } =
        useOtpVerificationController();
    const [code, setCode] = useState("");

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
                Enter the 6-digit code sent to {phone}
            </Text>

            <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={() => handleVerify(code)}
            >
                <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={handleResend}>
                <Text style={styles.linkText}>Resend Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={handleBack}>
                <Text style={styles.linkText}>Back</Text>
            </TouchableOpacity>

            <AlertModal
                visible={modalInfo?.show}
                title={modalInfo?.title}
                message={modalInfo?.message}
                type="info"
                buttons={[{ text: "OK", onPress: handleConfirm }]}
                onDismiss={handleConfirm}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 24 },
    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
    subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 24 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 14,
        fontSize: 24,
        textAlign: "center",
        letterSpacing: 8,
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#2563EB",
        borderRadius: 8,
        padding: 14,
        alignItems: "center",
        marginBottom: 12,
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    linkButton: { alignItems: "center", padding: 8 },
    linkText: { color: "#2563EB", fontSize: 14 },
});
