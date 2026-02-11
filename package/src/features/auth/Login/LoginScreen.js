import React from "react";
import { useLoginController } from "./controllers/LoginController";
import { LegacySignInPage } from "@src/legacyApp";
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
    <LegacySignInPage
      config={config}
      handleLogin={handleLogin}
      handleSignUp={handleSignUp}
      handleForgotPassword={handleForgotPassword}
      modalInfo={modalInfo}
      handleConfirm={handleConfirm}
    />
  );
}
