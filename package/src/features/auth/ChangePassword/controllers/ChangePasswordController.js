import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../../presentation/hooks/useAuth";
import { useGlobal } from "../../../../../context/context";

export const useChangePasswordController = () => {
  const navigation = useNavigation();
  const { changePassword } = useAuth();
  const { modalInfo, setModalInfo } = useGlobal();

  const handleSubmit = async ({ password, confirmPassword }) => {
    const nextPassword = String(password || "");
    const nextConfirmPassword = String(confirmPassword || "");

    if (!nextPassword || !nextConfirmPassword) {
      setModalInfo({
        show: true,
        title: "Missing Fields",
        message: "Please fill in both password fields.",
        autoNavigate: false,
      });
      return;
    }

    if (nextPassword !== nextConfirmPassword) {
      setModalInfo({
        show: true,
        title: "Password Mismatch",
        message: "Passwords do not match.",
        autoNavigate: false,
      });
      return;
    }

    if (nextPassword.length < 6) {
      setModalInfo({
        show: true,
        title: "Weak Password",
        message: "Password must be at least 6 characters.",
        autoNavigate: false,
      });
      return;
    }

    const response = await changePassword(nextPassword);
    if (!response.success) {
      setModalInfo({
        show: true,
        title: "Update Failed",
        message: response.error || "Could not change password.",
        autoNavigate: false,
      });
      return;
    }

    setModalInfo({
      show: true,
      title: "Password Updated",
      message: "Your password has been changed. Please sign in.",
      autoNavigate: true,
      nextRoute: "Login",
    });
  };

  const handleSignIn = () => {
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
    handleSignIn,
    modalInfo,
    handleConfirm,
  };
};
