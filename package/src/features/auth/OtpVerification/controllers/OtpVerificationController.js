import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../../../presentation/hooks/useAuth";
import { useGlobal } from "../../../../../context/context";

export const useOtpVerificationController = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const phone = route.params?.phone;
    const { confirmOtp, requestOtp, register, login } = useAuth();
    const { modalInfo, setModalInfo } = useGlobal();

    // const handleVerify = async (code) => {
    //     const result = await confirmOtp(phone, code);
    //     if (!result.success) {
    //         setModalInfo({ show: true, title: 'Error', message: result.error });
    //     }
    //     // On success, useAuth sets auth → RootNavigator auto-switches to AppNavigator
    // };

    const handleVerify = async (code) => {
        try {
            const result = await register({ email: phone, password: code });

            if (!result?.success) {
                setModalInfo({ show: true, title: 'Error', message: result?.error || 'Registration failed' });
                return; // stop here, do not login
            }
            await login({ email: phone, password: code });
        } catch (err) {
            setModalInfo({ show: true, title: 'Error', message: err?.message || 'Something went wrong' });
        }
    };

    const handleResend = async () => {
        const result = await requestOtp(phone);
        setModalInfo({
            show: true,
            title: result.success ? 'Sent' : 'Error',
            message: result.success ? 'New code sent' : result.error,
        });
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleConfirm = () =>
        setModalInfo({ show: false, title: "", message: "" });

    return { phone, handleVerify, handleResend, handleBack, modalInfo, handleConfirm };
};
