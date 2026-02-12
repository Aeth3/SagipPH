import React, { useState } from 'react';
import {
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SvgXml } from 'react-native-svg';
import Toast from 'react-native-simple-toast';
import AlertModal from '../../../../components/ui/AlertModal';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, SIZES, IMAGES, ICONS } from '../../constants/theme';
import CustomButton from '../../components/CustomButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const SignIn = ({
    handleLogin = () => { },
    handleSignUp = () => { },
    handleForgotPassword = () => { },
    modalInfo = { show: false, title: '', message: '' },
    handleConfirm = () => { },
    config
}) => {
    const [formData, setFormData] = useState(
        config.LoginFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
    );
    const [passwordShow, setPasswordShow] = useState(true);

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePasswordShow = () => {
        setPasswordShow(!passwordShow);
    };

    const onLogin = async () => {
        try {
            if (Object.values(formData).some((v) => v === '')) {
                Toast.show('Please fill in all fields');
                return;
            }
            await handleLogin(formData);
        } catch (err) {
            console.error(err);
            Toast.show('Login failed!');
        }
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

                    <View style={{ backgroundColor: '#332A5E' }}>
                        <View style={[GlobalStyleSheet.container, { paddingTop: 5, marginBottom: "20%" }]}>
                            <View style={{ marginBottom: 30 }}>
                                <Text style={[FONTS.h1, { textAlign: 'center', color: COLORS.white, fontFamily: FONTS.fontNunito.fontFamily }]}>
                                    {config.appName}
                                </Text>
                                <Text style={[FONTS.font, { textAlign: 'center', color: COLORS.white, opacity: 0.7 }]}>
                                    Welcome back! Please log in to continue.
                                </Text>
                            </View>

                            {/* Dynamic Inputs */}
                            {config.LoginFields.map((field, index) => (
                                <View key={index} style={{ marginBottom: 15 }}>
                                    <View style={styles.inputIcon}>
                                        <SvgXml xml={field.icon || ICONS.user} />
                                    </View>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={field.placeholder}
                                        placeholderTextColor="rgba(255,255,255,.6)"
                                        secureTextEntry={field.secure && passwordShow}
                                        value={formData[field.name]}
                                        onChangeText={(text) => handleChange(field.name, text)}
                                    />
                                    {field.secure && (
                                        <TouchableOpacity
                                            onPress={togglePasswordShow}
                                            style={styles.eyeIcon}>
                                            <SvgXml
                                                xml={passwordShow ? ICONS.eyeClose : ICONS.eyeOpen}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            {/* Forgot Password */}
                            <View style={{ alignItems: 'flex-end', marginBottom: 15 }}>
                                <TouchableOpacity onPress={handleForgotPassword}>
                                    <Text style={[FONTS.fontLg, { color: COLORS.primary, textDecorationLine: 'underline' }]}>
                                        Forgot Password
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Login Button */}
                            <View style={{ paddingBottom: 10 }}>
                                <CustomButton onPress={onLogin} title="SIGN IN" />
                            </View>

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.line} />
                                <Text style={[FONTS.font, { textAlign: 'center', color: COLORS.white, opacity: 0.7, paddingHorizontal: 15 }]}>
                                    Or sign in with
                                </Text>
                                <View style={styles.line} />
                            </View>

                            {/* Social Buttons */}
                            <View style={{ flexDirection: 'row', paddingBottom: 20 }}>
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <Image style={styles.socialIcon} source={IMAGES.google} />
                                        <Text style={FONTS.fontLg}>Google</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, paddingLeft: 10 }}>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <Image style={styles.socialIcon} source={IMAGES.facebook} />
                                        <Text style={FONTS.fontLg}>Facebook</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Sign Up */}
                            <View style={styles.signupRow}>
                                <Text style={[FONTS.font, { color: COLORS.white, opacity: 0.7 }]}>
                                    Don’t have an account?
                                </Text>
                                <TouchableOpacity onPress={handleSignUp} style={{ marginLeft: 5 }}>
                                    <Text style={[FONTS.fontLg, { color: COLORS.primary, textDecorationLine: 'underline' }]}>
                                        Signup here
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>


            {/* Modal */}
            <AlertModal
                visible={modalInfo.show}
                title={modalInfo.title}
                message={modalInfo.message}
                type="error"
                buttons={[{ text: "OK", onPress: handleConfirm }]}
                onDismiss={handleConfirm}
            />
        </>
    );
};

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        zIndex: 1,
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,.3)',
    },
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
        width: 150,
        height: 150,
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
    eyeIcon: {
        position: 'absolute',
        height: 50,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
        right: 0,
        zIndex: 1,
        top: 0,
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
    socialButton: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: SIZES.radius,
        height: 45,
        alignItems: 'center',
        paddingHorizontal: 18,
    },
    socialIcon: {
        height: 20,
        width: 20,
        marginRight: 12,
        resizeMode: 'contain',
    },
    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
});

export default SignIn;
