import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../../hooks/useAuth";
import { useGlobal } from "../../../../../context/context";

export const useEnterCodeController = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { validateRecoveryCode, forgotPassword } = useAuth();
  const { modalInfo, setModalInfo } = useGlobal();

  const email = route.params?.email || "";

  const handleSubmit = async (code) => {
    if (!email) {
      setModalInfo({
        show: true,
        title: "Missing Email",
        message: "Please request a new recovery code.",
        autoNavigate: true,
        nextRoute: "ForgotPassword",
      });
      return;
    }

    const value = String(code || "").trim();
    if (!value || value.length < 4) {
      setModalInfo({
        show: true,
        title: "Invalid Code",
        message: "Please enter the 4-digit code.",
        autoNavigate: false,
      });
      return;
    }

    const response = await validateRecoveryCode(email, value);
    if (!response.success) {
      setModalInfo({
        show: true,
        title: "Verification Failed",
        message: response.error || "Invalid code.",
        autoNavigate: false,
      });
      return;
    }

    setModalInfo({
      show: true,
      title: "Code Verified",
      message: "You can now set a new password.",
      autoNavigate: true,
      nextRoute: "ChangePassword",
    });
  };

  const handleBack = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleResend = async () => {
    if (!email) {
      setModalInfo({
        show: true,
        title: "Missing Email",
        message: "Please enter your email again.",
        autoNavigate: true,
        nextRoute: "ForgotPassword",
      });
      return;
    }

    const response = await forgotPassword(email);
    if (!response.success) {
      setModalInfo({
        show: true,
        title: "Resend Failed",
        message: response.error || "Could not resend code.",
        autoNavigate: false,
      });
      return;
    }

    setModalInfo({
      show: true,
      title: "Code Resent",
      message: "A new code has been sent to your email.",
      autoNavigate: false,
    });
  };

  const handleConfirm = () => {
    setModalInfo((prev) => {
      if (prev.autoNavigate && prev.nextRoute) {
        navigation.navigate(prev.nextRoute, prev.nextParams);
      }

      return {
        ...prev,
        show: false,
        autoNavigate: false,
        nextRoute: null,
        nextParams: null,
      };
    });
  };

  return {
    handleSubmit,
    handleBack,
    handleResend,
    email,
    modalInfo,
    handleConfirm,
  };
};
