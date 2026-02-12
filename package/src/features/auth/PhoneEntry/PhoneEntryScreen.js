import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { usePhoneEntryController } from "./controllers/PhoneEntryController";
import AlertModal from "../../../../components/ui/AlertModal";

export default function PhoneEntryScreen() {
    const { phone, setPhone, handleSendOtp, modalInfo, handleConfirm } =
        usePhoneEntryController();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter your phone number</Text>
            <Text style={styles.subtitle}>
                We will send you a one-time verification code
            </Text>

            <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+63XXXXXXXXXX"
                keyboardType="phone-pad"
                maxLength={13}
            />

            <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
                <Text style={styles.buttonText}>Send OTP</Text>
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
        fontSize: 18,
        textAlign: "center",
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#2563EB",
        borderRadius: 8,
        padding: 14,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
