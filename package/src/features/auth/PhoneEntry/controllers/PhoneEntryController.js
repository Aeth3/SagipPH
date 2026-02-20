import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../../presentation/hooks/useAuth";
import { useGlobal } from "../../../../../context/context";

export const usePhoneEntryController = () => {
    const [phone, setPhone] = useState('+63');
    const [sending, setSending] = useState(false);
    const { requestOtp, login, register, verifyPhone } = useAuth();
    const { modalInfo, setModalInfo } = useGlobal();
    const navigation = useNavigation();

    // const handleSendOtp = async () => {
    //     if (sending) return;
    //     setSending(true);
    //     const result = await requestOtp(phone);
    //     if (result.success) {
    //         navigation.navigate('OtpVerification', { phone });
    //     } else {
    //         setModalInfo({ show: true, title: 'Error', message: result.error });
    //     }
    //     setSending(false);
    // };

    const handleSendOtp = async () => {

        const result = await verifyPhone(phone);
        if (!result?.success) {
            setModalInfo({ show: true, title: 'Error', message: result?.error || 'Failed to verify phone number' });
            return;
        }
        console.log(result.phone);
        navigation.navigate('OtpVerification', { phone: result.phone });
    };

    const handleConfirm = () =>
        setModalInfo((prev) => ({ ...prev, show: false }));

    return { phone, setPhone, handleSendOtp, sending, modalInfo, handleConfirm };
};
