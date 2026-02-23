import { useEffect } from "react";
import { signUp } from "../../../../composition/authSession";
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
      const result = await signUp({ email, password, first_name, last_name });

      if (!result?.ok) {
        const message = (result?.error?.message || "").toLowerCase();
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
            message: result?.error?.message || "An unexpected error occurred.",
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
