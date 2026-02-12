import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AlertModal from '../../../../components/ui/AlertModal';
import { COLORS, FONTS, SIZES, IMAGES, ICONS } from '../../constants/theme';
import CustomButton from '../../components/CustomButton';
import { GlobalStyleSheet } from '../../constants/StyleSheet';

const CreateAccount = ({
  handleSignUp = () => { },
  handleHaveAccount = () => { },
  loading = false,
  modalInfo = { show: false, title: '', message: '' },
  handleConfirm = () => { },
}) => {
  const [passwordShow, setPasswordShow] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const handleShowPassword = () => {
    setPasswordShow((prev) => !prev);
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSignUp = async () => {
    if (Object.values(formData).some((value) => value.trim() === '')) {
      Toast.show('Fill in all the fields!');
      return;
    }

    await handleSignUp(formData);
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size={'large'} color={COLORS.white} />
          </View>
        ) : null}

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
            <Image style={styles.logo} source={IMAGES.appLogo} />
            <Image style={styles.shape} source={IMAGES.loginShape} />
          </View>

          <View style={{ backgroundColor: '#332A5E' }}>
            <View style={GlobalStyleSheet.container}>
              <View style={{ marginBottom: 30 }}>
                <Text style={[FONTS.h2, { textAlign: 'center', color: COLORS.white }]}>
                  Create an Account
                </Text>
                <Text
                  style={[
                    FONTS.font,
                    { textAlign: 'center', color: COLORS.white, opacity: 0.7 },
                  ]}
                >
                  Enter your details to create your account.
                </Text>
              </View>

              <View style={{ marginBottom: 15 }}>
                <View style={styles.inputIcon}>
                  <SvgXml xml={ICONS.user} />
                </View>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="First name"
                  onChangeText={(value) => handleChange('first_name', value)}
                  value={formData.first_name}
                  placeholderTextColor={'rgba(255,255,255,.6)'}
                />
              </View>

              <View style={{ marginBottom: 15 }}>
                <View style={styles.inputIcon}>
                  <SvgXml xml={ICONS.user} />
                </View>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Last name"
                  onChangeText={(value) => handleChange('last_name', value)}
                  value={formData.last_name}
                  placeholderTextColor={'rgba(255,255,255,.6)'}
                />
              </View>

              <View style={{ marginBottom: 15 }}>
                <View style={styles.inputIcon}>
                  <SvgXml xml={ICONS.email} />
                </View>
                <TextInput
                  style={styles.inputStyle}
                  placeholder="Enter email"
                  onChangeText={(value) => handleChange('email', value)}
                  value={formData.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={'rgba(255,255,255,.6)'}
                />
              </View>

              <View style={{ marginBottom: 15 }}>
                <View style={styles.inputIcon}>
                  <SvgXml xml={ICONS.lock} />
                </View>
                <TextInput
                  secureTextEntry={passwordShow}
                  style={styles.inputStyle}
                  onChangeText={(value) => handleChange('password', value)}
                  value={formData.password}
                  placeholder="Password"
                  placeholderTextColor={'rgba(255,255,255,.6)'}
                />
                <TouchableOpacity
                  accessible={true}
                  accessibilityLabel="Password"
                  accessibilityHint="Password show and hidden"
                  onPress={handleShowPassword}
                  style={styles.eyeIcon}
                >
                  <SvgXml xml={passwordShow ? ICONS.eyeClose : ICONS.eyeOpen} />
                </TouchableOpacity>
              </View>

              <View style={{ paddingBottom: 10 }}>
                <CustomButton onPress={onSignUp} title="REGISTER" />
              </View>

              <View style={styles.signinRow}>
                <Text style={[FONTS.font, { color: COLORS.white, opacity: 0.7 }]}>
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={handleHaveAccount} style={{ marginLeft: 5 }}>
                  <Text
                    style={[
                      FONTS.fontLg,
                      { color: COLORS.primary2, textDecorationLine: 'underline' },
                    ]}
                  >
                    Sign in here
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>

      <AlertModal
        visible={modalInfo.show}
        title={modalInfo.title}
        message={modalInfo.message}
        type="info"
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
    width: 100,
    height: 100,
    marginBottom: 40,
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
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
});

export default CreateAccount;
