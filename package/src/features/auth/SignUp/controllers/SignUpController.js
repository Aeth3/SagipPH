import { useEffect } from "react";
import { postSignUp } from "../models/SignUpModel";
import { useNavigation } from "@react-navigation/native";
import { useGlobal } from "../../../../../context/context";

export const useSignUpController = () => {
  const navigation = useNavigation();
  const { loading, setLoading, modalInfo, setModalInfo } = useGlobal();

  useEffect(() => {
    // side-effect placeholder
  }, [modalInfo]);

  const handleSignUp = async (formData) => {
    try {
      setLoading(true);

      const { email, password, first_name, last_name } = formData;
      if (!/\S+@\S+\.\S+/.test(email)) {
        setModalInfo({
          show: true,
          title: "Invalid Email",
          message: "Please enter a valid email address.",
        });
        return;
      }
      const response = await postSignUp({ email, password, first_name, last_name });

      if (!response.success) {
        const message = response.error?.toLowerCase?.() || "";
        if (message.includes("already registered")) {
          setModalInfo({
            show: true,
            title: "Account Already Exists",
            message: "This email is already registered. Please log in instead.",
            autoNavigate: true,
          });
        } else {
          setModalInfo({
            show: true,
            title: "Sign Up Failed",
            message: response.error || "An unexpected error occurred.",
            autoNavigate: false,
          });
        }
        return;
      }

      setModalInfo({
        show: true,
        title: "Success!",
        message: "Check your email to confirm your account before logging in.",
        autoNavigate: true,
      });
    } catch (error) {
      console.error("Signup error:", error);
      setModalInfo({
        show: true,
        title: "Error",
        message: "Something went wrong. Please try again.",
        autoNavigate: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHaveAccount = () => {
    navigation.navigate("Login");
  };

  const handleConfirm = () => {
    setModalInfo((prev) => {
      if (prev.autoNavigate) navigation.navigate("Login");
      return { ...prev, show: false };
    });
  };

  return {
    handleSignUp,
    handleHaveAccount,
    loading,
    modalInfo,
    handleConfirm,
  };
};
