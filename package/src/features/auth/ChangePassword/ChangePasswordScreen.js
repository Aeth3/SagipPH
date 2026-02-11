import React from "react";
<<<<<<< ours
import { LegacyChangePasswordPage } from "@src/legacyApp";
=======
import { LegacyChangePasswordPage } from "package/src/legacyApp";
>>>>>>> theirs
import { useChangePasswordController } from "./controllers/ChangePasswordController";
import CustomModal from "../../../../components/ui/Modal";

export default function ChangePasswordScreen() {
  const { handleSubmit, handleSignIn, modalInfo, handleConfirm } = useChangePasswordController();

  return (
    <>
      <LegacyChangePasswordPage
        handleSubmit={handleSubmit}
        handleSignIn={handleSignIn}
      />
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
