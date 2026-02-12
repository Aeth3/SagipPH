import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../../presentation/hooks/useAuth";
import { useGlobal } from "../../../../../context/context";

export const usePhoneEntryController = () => {
    const [phone, setPhone] = useState('+63');
    const { requestOtp } = useAuth();
    const { modalInfo, setModalInfo } = useGlobal();
    const navigation = useNavigation();

    const handleSendOtp = async () => {
        const result = await requestOtp(phone);
        if (result.success) {
            navigation.navigate('OtpVerification', { phone });
        } else {
            setModalInfo({ show: true, title: 'Error', message: result.error });
        }
    };

    const handleConfirm = () =>
        setModalInfo((prev) => ({ ...prev, show: false }));

    return { phone, setPhone, handleSendOtp, modalInfo, handleConfirm };
};