import { useEffect } from "react";
import { useAuth } from "../../../../presentation/hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import config from "../config.json";
import { useGlobal } from "../../../../../context/context";

export const useLoginController = () => {
  const { login } = useAuth();
  const { modalInfo, setModalInfo } = useGlobal();
  const navigation = useNavigation();

  const handleLogin = async (formData) => {
    const { email, password } = formData;

    if (!email || !password) {
      setModalInfo({
        show: true,
        title: "Missing Fields",
        message: "Please enter both email and password.",
      });
      return;
    }

    const response = await login(email, password);

    if (!response.success) {
      setModalInfo((prev) => ({
        ...prev,
        show: true,
        title: "Login Failed",
        message: response.error,
      }));
    }
  };

  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleConfirm = () =>
    setModalInfo((prev) => ({ ...prev, show: false }));

  useEffect(() => {
    // side-effect placeholder
  }, [modalInfo]);

  return {
    handleLogin,
    modalInfo,
    handleConfirm,
    handleSignUp,
    handleForgotPassword,
    appName: config.appName,
  };
};
