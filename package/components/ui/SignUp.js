import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native"
import config from "../../config.json"
import Screen from "../layout/Screen"
import AlertModal from "./AlertModal"

export default function SignUp({ handleSignUp = () => { }, handleHaveAccount, loading, modalInfo, handleConfirm }) {
    const [formData, setFormData] = useState(
        config.signUpConfig.SignUpFields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
    )
    const [errors, setErrors] = useState({}) // track which fields are missing

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: false })) // clear error when typing
    }

    const onSignUp = () => {
        const newErrors = {}
        config.signUpConfig.SignUpFields.forEach(field => {
            if (field.required && !formData[field.name]?.trim()) {
                newErrors[field.name] = true
            }
        })

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        handleSignUp(formData)
    }

    return (
        <Screen style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Create a new account</Text>
                <Text style={styles.subtitle}>It’s quick and easy.</Text>
            </View>

            {/* Dynamic form */}
            <View style={styles.form}>
                {config.signUpConfig.SignUpFields.map((field, index) => (
                    <View key={index}>
                        <TextInput
                            style={[
                                styles.input,
                                errors[field.name] && styles.inputError // highlight missing fields
                            ]}
                            placeholder={field.placeholder + (field.required ? " *" : "")}
                            placeholderTextColor={errors[field.name] ? "#ff6b6b" : "#8a8d91"}
                            secureTextEntry={field.secure}
                            value={formData[field.name]}
                            onChangeText={text => handleChange(field.name, text)}
                        />
                        {errors[field.name] && (
                            <Text style={styles.errorText}>This field is required</Text>
                        )}
                    </View>
                ))}

                {/* Sign Up button */}
                <TouchableOpacity
                    style={[styles.signupButton, loading && { opacity: 0.6 }]}
                    onPress={onSignUp}
                    disabled={loading}
                >
                    <Text style={styles.signupText}>
                        {loading ? "Signing up..." : "Sign Up"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleHaveAccount} disabled={loading}>
                    <Text style={styles.loginLink}>Already have an account?</Text>
                </TouchableOpacity>
            </View>
            <AlertModal
                visible={modalInfo.show}
                title={modalInfo.title}
                message={modalInfo.message}
                type="info"
                buttons={[{ text: "OK", onPress: handleConfirm }]}
                onDismiss={handleConfirm}
            />
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#000",
    },
    subtitle: {
        fontSize: 16,
        color: "#606770",
        marginTop: 5,
    },
    form: {
        width: "100%",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 10,
        backgroundColor: "#f5f6f7",
    },
    inputError: {
        borderColor: "#ff6b6b",
        backgroundColor: "#ffecec",
    },
    errorText: {
        color: "#ff6b6b",
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 4,
    },
    signupButton: {
        backgroundColor: "#42b72a",
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 10,
    },
    signupText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    footer: {
        alignItems: "center",
        marginTop: 20,
    },
    loginLink: {
        color: "#1877f2",
        fontSize: 16,
    },
})
