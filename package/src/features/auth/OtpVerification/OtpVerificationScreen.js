import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SvgXml } from "react-native-svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useOtpVerificationController } from "./controllers/OtpVerificationController";
import AlertModal from "../../../../components/ui/AlertModal";
import { GlobalStyleSheet } from "../../../legacyApp/constants/StyleSheet";
import { COLORS, FONTS, SIZES, IMAGES, ICONS } from "../../../legacyApp/constants/theme";
import CustomButton from "../../../legacyApp/components/CustomButton";

export default function OtpVerificationScreen() {
    const { phone, handleVerify, handleResend, handleBack, modalInfo, handleConfirm } =
        useOtpVerificationController();
    const [code, setCode] = useState("");
    const [timer, setTimer] = useState(60);
    const intervalRef = useRef(null);

    const startTimer = useCallback(() => {
        setTimer(60);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        startTimer();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startTimer]);

    const onResend = () => {
        handleResend();
        startTimer();
    };

    return (
        <>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    enableOnAndroid={true}
                    extraScrollHeight={Platform.OS === 'ios' ? 40 : 80}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header with logo */}
                    <View style={styles.headerContainer}>
                        <LinearGradient
                            colors={['#F7F5FF', 'rgba(255,255,255,0)']}
                            style={styles.topGradient}
                        />
                        <LinearGradient
                            colors={['#F7F5FF', 'rgba(255,255,255,0)']}
                            style={styles.bottomGradient}
                        />
                        <Image
                            style={styles.logo}
                            source={IMAGES.appLogo}
                        />
                        <Image
                            style={styles.shape}
                            source={IMAGES.loginShape}
                        />
                    </View>

                    {/* Dark body */}
                    <View style={{ backgroundColor: '#332A5E' }}>
                        <View style={[GlobalStyleSheet.container, { paddingTop: 5, marginBottom: '20%' }]}>
                            {/* Title */}
                            <View style={{ marginBottom: 30 }}>
                                <Text style={[FONTS.h1, { textAlign: 'center', color: COLORS.white, fontFamily: FONTS.fontNunito.fontFamily }]}>
                                    Verify Your Number
                                </Text>
                                <Text style={[FONTS.font, { textAlign: 'center', color: COLORS.white, opacity: 0.7 }]}>
                                    Enter the 6-digit code sent to {phone}
                                </Text>
                            </View>

                            {/* OTP Input */}
                            <View style={{ marginBottom: 15 }}>
                                <View style={styles.inputIcon}>
                                    <SvgXml xml={ICONS.lock || ICONS.user} />
                                </View>
                                <TextInput
                                    style={styles.inputStyle}
                                    value={code}
                                    onChangeText={setCode}
                                    placeholder="Enter 6-digit code"
                                    placeholderTextColor="rgba(255,255,255,.6)"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>

                            {/* Verify Button */}
                            <View style={{ paddingBottom: 10 }}>
                                <CustomButton onPress={() => handleVerify(code)} title="VERIFY" />
                            </View>

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.line} />
                                <Text style={[FONTS.font, { textAlign: 'center', color: COLORS.white, opacity: 0.7, paddingHorizontal: 15 }]}>
                                    Didn't receive the code?
                                </Text>
                                <View style={styles.line} />
                            </View>

                            {/* Resend Code */}
                            <View style={{ alignItems: 'center', paddingBottom: 20 }}>
                                {timer > 0 ? (
                                    <Text style={[FONTS.fontLg, { color: 'rgba(255,255,255,0.5)' }]}>
                                        Resend Code in {timer}s
                                    </Text>
                                ) : (
                                    <TouchableOpacity onPress={onResend}>
                                        <Text style={[FONTS.fontLg, { color: COLORS.primary2, textDecorationLine: 'underline' }]}>
                                            Resend Code
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Back */}
                            <View style={styles.backRow}>
                                <TouchableOpacity onPress={handleBack} style={{ marginLeft: 5 }}>
                                    <Text style={[FONTS.fontLg, { color: COLORS.primary2, textDecorationLine: 'underline' }]}>
                                        Go Back
                                    </Text>
                                </TouchableOpacity>
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
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    topGradient: {
        height: 135,
        width: 135,
        borderRadius: 135,
        position: 'absolute',
        top: 20,
        right: -50,
        transform: [{ rotate: '-120deg' }],
    },
    bottomGradient: {
        height: 135,
        width: 135,
        borderRadius: 135,
        position: 'absolute',
        bottom: 0,
        left: -50,
        transform: [{ rotate: '120deg' }],
    },
    logo: {
        width: 300,
        height: 300,
        marginBottom: 50,
        resizeMode: 'contain',
    },
    shape: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        resizeMode: 'stretch',
        height: 65,
    },
    inputStyle: {
        ...FONTS.fontLg,
        height: 50,
        paddingLeft: 60,
        borderWidth: 1,
        borderRadius: SIZES.radius,
        color: COLORS.white,
        backgroundColor: 'rgba(255,255,255,.05)',
        borderColor: 'rgba(255,255,255,.3)',
    },
    inputIcon: {
        height: 40,
        width: 40,
        borderRadius: 10,
        position: 'absolute',
        left: 10,
        top: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    line: {
        height: 1,
        flex: 1,
        backgroundColor: 'rgba(255,255,255,.15)',
    },
    backRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
});
