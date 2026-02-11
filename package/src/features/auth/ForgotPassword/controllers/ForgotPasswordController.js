import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../../presentation/hooks/useAuth";
import { useGlobal } from "../../../../../context/context";

export const useForgotPasswordController = () => {
  const navigation = useNavigation();
  const { forgotPassword } = useAuth();
  const { modalInfo, setModalInfo } = useGlobal();

  const handleSubmit = async (email) => {
    const trimmedEmail = String(email || "").trim();
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setModalInfo({
        show: true,
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        autoNavigate: false,
      });
      return;
    }

    const response = await forgotPassword(trimmedEmail);
    if (!response.success) {
      setModalInfo({
        show: true,
        title: "Request Failed",
        message: response.error || "Failed to send reset code.",
        autoNavigate: false,
      });
      return;
    }

    setModalInfo({
      show: true,
      title: "Code Sent",
      message: "We sent a recovery code to your email.",
      autoNavigate: true,
      nextRoute: "EnterCode",
      nextParams: { email: trimmedEmail },
    });
  };

  const handleBack = () => {
    navigation.navigate("Login");
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
    modalInfo,
    handleConfirm,
  };
};
