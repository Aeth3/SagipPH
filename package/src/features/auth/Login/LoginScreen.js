import React from "react";
import { useLoginController } from "./controllers/LoginController";
import SignIn from "../../../../app/pages/Auth/SignIn";
import config from "./config.json";

export default function LoginScreen() {
  const {
    handleLogin,
    handleSignUp,
    handleForgotPassword,
    modalInfo,
    handleConfirm,
  } =
    useLoginController();

  return (
    <SignIn
      config={config}
      handleLogin={handleLogin}
      handleSignUp={handleSignUp}
      handleForgotPassword={handleForgotPassword}
      modalInfo={modalInfo}
      handleConfirm={handleConfirm}
    />
  );
}
