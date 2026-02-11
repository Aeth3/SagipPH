import { LegacyCreateAccountPage } from "@src/legacyApp"
import { useSignUpController } from "./controllers/SignUpController";

export default function SignUpScreen() {
  const {
    handleSignUp,
    handleHaveAccount,
    loading,
    modalInfo,
    handleConfirm,
  } = useSignUpController();

  return (
    <LegacyCreateAccountPage
      handleSignUp={handleSignUp}
      handleHaveAccount={handleHaveAccount}
      loading={loading}
      modalInfo={modalInfo}
      handleConfirm={handleConfirm}
    />
  );
}
