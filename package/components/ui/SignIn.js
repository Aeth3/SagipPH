import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native"
import Screen from "../layout/Screen"
import config from "../../auth-components/Login/config.json"
import AlertModal from "./AlertModal"

export default function SignIn({ handleLogin = () => { }, handleSignUp = () => { }, modalInfo, handleConfirm, appName }) {
    // dynamically create state from LoginFields
    const [formData, setFormData] = useState(
        config.LoginFields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
    )

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const onLogin = () => {
        handleLogin(formData)
    }

    const onSignUp = () => {
        handleSignUp()
    }

    return (
        <Screen style={styles.container}>
            {/* Facebook-style logo */}
            <View style={styles.logoContainer}>
                <Text style={styles.logoText}>{appName}</Text>
            </View>

            {/* Dynamic Input Fields */}
            <View style={styles.form}>
                {config.LoginFields.map((field, index) => (
                    <TextInput
                        key={index}
                        style={styles.input}
                        placeholder={field.placeholder}
                        placeholderTextColor="#8a8d91"
                        secureTextEntry={field.secure}
                        value={formData[field.name]}
                        onChangeText={(text) => handleChange(field.name, text)}
                    />
                ))}

                {/* Login button */}
                <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
                    <Text style={styles.loginText}>Log In</Text>
                </TouchableOpacity>

                {/* Forgot password link */}
                <TouchableOpacity>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
            </View>

            {/* Create account button */}
            <TouchableOpacity style={styles.createButton} onPress={onSignUp}>
                <Text style={styles.createText}>Create new account</Text>
            </TouchableOpacity>
            <AlertModal
                visible={modalInfo.show}
                title={modalInfo.title}
                message={modalInfo.message}
                type="error"
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
    logoContainer: {
        alignItems: "center",
        marginBottom: 50,
    },
    logoText: {
        fontSize: 48,
        color: "#1877f2",
        fontWeight: "bold",
        fontFamily: "sans-serif-medium",
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
    loginButton: {
        backgroundColor: "#1877f2",
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 5,
    },
    loginText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    forgotText: {
        color: "#1877f2",
        textAlign: "center",
        marginTop: 15,
        fontSize: 14,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#ddd",
    },
    orText: {
        marginHorizontal: 10,
        color: "#8a8d91",
        fontSize: 14,
    },
    createButton: {
        backgroundColor: "#42b72a",
        borderRadius: 8,
        paddingVertical: 12,
    },
    createText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
})
