import React from "react";
<<<<<<< ours
import { LegacyEnterCodePage } from "@src/legacyApp";
=======
import { LegacyEnterCodePage } from "package/src/legacyApp";
>>>>>>> theirs
import { useEnterCodeController } from "./controllers/EnterCodeController";
import CustomModal from "../../../../components/ui/Modal";

export default function EnterCodeScreen() {
  const { handleSubmit, handleBack, handleResend, modalInfo, handleConfirm } = useEnterCodeController();

  return (
    <>
      <LegacyEnterCodePage
        handleSubmit={handleSubmit}
        handleBack={handleBack}
        handleResend={handleResend}
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
