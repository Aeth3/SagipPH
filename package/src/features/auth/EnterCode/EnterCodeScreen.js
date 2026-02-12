import React from "react";
import { LegacyEnterCodePage } from "package/src/legacyApp";
import { useEnterCodeController } from "./controllers/EnterCodeController";
import AlertModal from "../../../../components/ui/AlertModal";

export default function EnterCodeScreen() {
  const { handleSubmit, handleBack, handleResend, modalInfo, handleConfirm } = useEnterCodeController();

  return (
    <>
      <LegacyEnterCodePage
        handleSubmit={handleSubmit}
        handleBack={handleBack}
        handleResend={handleResend}
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
