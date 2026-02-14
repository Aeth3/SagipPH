import React from "react";
import {
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SvgXml } from "react-native-svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { usePhoneEntryController } from "./controllers/PhoneEntryController";
import AlertModal from "../../../../components/ui/AlertModal";
import { GlobalStyleSheet } from "../../../legacyApp/constants/StyleSheet";
import { COLORS, FONTS, SIZES, IMAGES } from "../../../legacyApp/constants/theme";
import CustomButton from "../../../legacyApp/components/CustomButton";

const PHONE_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92V19.92C22 20.48 21.78 21.01 21.39 21.4C21 21.79 20.47 22.01 19.92 22.02C16.56 22.33 13.32 21.72 10.42 20.27C7.72 18.95 5.43 17.04 3.72 14.73C2.27 11.82 1.66 8.57 1.98 5.22C1.99 4.68 2.21 4.16 2.59 3.77C2.98 3.38 3.51 3.16 4.05 3.15H7.05C8.02 3.14 8.86 3.83 9.04 4.79C9.2 5.65 9.45 6.49 9.79 7.3C10.08 7.95 9.91 8.72 9.37 9.18L8.09 10.46C9.69 13.19 11.88 15.38 14.61 16.98L15.89 15.7C16.35 15.16 17.11 14.99 17.77 15.28C18.58 15.62 19.42 15.87 20.28 16.03C21.25 16.22 21.94 17.07 21.93 18.04L22 16.92Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export default function PhoneEntryScreen() {
    const { phone, setPhone, handleSendOtp, sending, modalInfo, handleConfirm } =
        usePhoneEntryController();
    const handlePhoneChange = (text) => {
        const digitsOnly = text.replace(/\D/g, "");
        const localNumber = digitsOnly.startsWith("63")
            ? digitsOnly.slice(2)
            : digitsOnly;
        setPhone(`+63${localNumber.slice(0, 10)}`);
    };

    return (
        <>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.OS === "ios" ? 40 : 80}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerContainer}>
                        <LinearGradient
                            colors={["#F7F5FF", "rgba(255,255,255,0)"]}
                            style={styles.topGradient}
                        />
                        <LinearGradient
                            colors={["#F7F5FF", "rgba(255,255,255,0)"]}
                            style={styles.bottomGradient}
                        />
                        <Image style={styles.logo} source={IMAGES.appLogo} />
                        <Image style={styles.shape} source={IMAGES.loginShape} />
                    </View>

                    <View style={{ backgroundColor: "#332A5E" }}>
                        <View
                            style={[
                                GlobalStyleSheet.container,
                                { paddingTop: 5, marginBottom: "20%" },
                            ]}
                        >
                            <View style={{ marginBottom: 30 }}>
                                <Text
                                    style={[
                                        FONTS.h1,
                                        {
                                            textAlign: "center",
                                            color: COLORS.white,
                                            fontFamily: FONTS.fontNunito.fontFamily,
                                        },
                                    ]}
                                >
                                    Phone Verification
                                </Text>
                                <Text
                                    style={[
                                        FONTS.font,
                                        {
                                            textAlign: "center",
                                            color: COLORS.white,
                                            opacity: 0.7,
                                        },
                                    ]}
                                >
                                    We will send you a one-time verification code
                                </Text>
                            </View>

                            {/* Phone Input */}
                            <View style={{ marginBottom: 15 }}>
                                <View style={styles.inputIcon}>
                                    <SvgXml xml={PHONE_ICON} />
                                </View>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder="XXXXXXXXXX"
                                    placeholderTextColor="rgba(255,255,255,.6)"
                                    value={phone}
                                    onChangeText={handlePhoneChange}
                                    keyboardType="phone-pad"
                                    maxLength={13}
                                />
                            </View>

                            {/* Send OTP Button */}
                            <View style={{ paddingBottom: 10, marginTop: 15 }}>
                                <CustomButton
                                    onPress={handleSendOtp}
                                    title={sending ? "SENDING..." : "SEND OTP"}
                                    disabled={sending}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>

            {/* Modal */}
            <AlertModal
                visible={modalInfo?.show}
                title={modalInfo?.title}
                message={modalInfo?.message}
                type="info"
                buttons={[{ text: "OK", onPress: handleConfirm }]}
                onDismiss={handleConfirm}
            />
        </>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
    },
    topGradient: {
        height: 135,
        width: 135,
        borderRadius: 135,
        position: "absolute",
        top: 20,
        right: -50,
        transform: [{ rotate: "-120deg" }],
    },
    bottomGradient: {
        height: 135,
        width: 135,
        borderRadius: 135,
        position: "absolute",
        bottom: 0,
        left: -50,
        transform: [{ rotate: "120deg" }],
    },
    logo: {
        width: 300,
        height: 300,
        marginBottom: 50,
        resizeMode: "contain",
    },
    shape: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        resizeMode: "stretch",
        height: 65,
    },
    inputStyle: {
        ...FONTS.fontLg,
        height: 50,
        paddingLeft: 60,
        borderWidth: 1,
        borderRadius: SIZES.radius,
        color: COLORS.white,
        backgroundColor: "rgba(255,255,255,.05)",
        borderColor: "rgba(255,255,255,.3)",
    },
    inputIcon: {
        height: 40,
        width: 40,
        borderRadius: 10,
        position: "absolute",
        left: 10,
        top: 5,
        alignItems: "center",
        justifyContent: "center",
    },
});
