import React from "react";
import { LegacyForgotPasswordPage } from "@src/legacyApp";
import { useForgotPasswordController } from "./controllers/ForgotPasswordController";
import CustomModal from "../../../../components/ui/Modal";

export default function ForgotPasswordScreen() {
  const { handleSubmit, handleBack, modalInfo, handleConfirm } = useForgotPasswordController();

  return (
    <>
      <LegacyForgotPasswordPage handleSubmit={handleSubmit} handleBack={handleBack} />
      <CustomModal
        visible={modalInfo.show}
        title={modalInfo.title}
        message={modalInfo.message}
        onConfirm={handleConfirm}
        onClose={handleConfirm}
        showCancel={false}
      />
    </>
  );
}
