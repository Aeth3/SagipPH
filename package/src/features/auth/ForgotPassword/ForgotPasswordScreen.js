import React from "react";
import ForgotPassword from "../../../../app/pages/Auth/ForgotPassword";
import { useForgotPasswordController } from "./controllers/ForgotPasswordController";
import CustomModal from "../../../../components/ui/Modal";

export default function ForgotPasswordScreen() {
  const { handleSubmit, handleBack, modalInfo, handleConfirm } = useForgotPasswordController();

  return (
    <>
      <ForgotPassword handleSubmit={handleSubmit} handleBack={handleBack} />
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
