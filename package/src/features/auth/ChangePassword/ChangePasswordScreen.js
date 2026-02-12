import React from "react";
import { LegacyChangePasswordPage } from "package/src/legacyApp";
import { useChangePasswordController } from "./controllers/ChangePasswordController";
import AlertModal from "../../../../components/ui/AlertModal";

export default function ChangePasswordScreen() {
  const { handleSubmit, handleSignIn, modalInfo, handleConfirm } = useChangePasswordController();

  return (
    <>
      <LegacyChangePasswordPage
        handleSubmit={handleSubmit}
        handleSignIn={handleSignIn}
      />
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
