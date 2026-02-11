import React from "react";
import { LegacyEnterCodePage } from "@src/legacyApp";
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
