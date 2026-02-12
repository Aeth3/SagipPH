import React from "react";
import { LegacyForgotPasswordPage } from "package/src/legacyApp";
import { useForgotPasswordController } from "./controllers/ForgotPasswordController";
import AlertModal from "../../../../components/ui/AlertModal";

export default function ForgotPasswordScreen() {
  const { handleSubmit, handleBack, modalInfo, handleConfirm } = useForgotPasswordController();

  return (
    <>
      <LegacyForgotPasswordPage handleSubmit={handleSubmit} handleBack={handleBack} />
      <AlertModal
        visible={modalInfo.show}
        title={modalInfo.title}
        message={modalInfo.message}
        type="info"
        buttons={[{ text: "OK", onPress: handleConfirm }]}
        onDismiss={handleConfirm}
      />
    </>
  );
}
