import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../../../presentation/hooks/useAuth";
import { useGlobal } from "../../../../../context/context";

export const useOtpVerificationController = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const phone = route.params?.phone;
    const { confirmOtp, requestOtp } = useAuth();
    const { modalInfo, setModalInfo } = useGlobal();

    const handleVerify = async (code) => {
        const result = await confirmOtp(phone, code);
        if (!result.success) {
            setModalInfo({ show: true, title: 'Error', message: result.error });
        }
        // On success, useAuth sets auth → RootNavigator auto-switches to AppNavigator
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
        setModalInfo((prev) => ({ ...prev, show: false }));

    return { phone, handleVerify, handleResend, handleBack, modalInfo, handleConfirm };
};